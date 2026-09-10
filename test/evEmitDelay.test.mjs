import assert from 'assert'
import evem from '../src/evem.mjs'
import evEmitDelay from '../src/evEmitDelay.mjs'
import cst from '../src/_const.mjs'


let delay = (ms) => {
    return new Promise((resolve) => {
        setTimeout(resolve, ms)
    })
}


//silence, 靜音console.error並回報其被呼叫次數
function silence() {
    let n = 0
    let orig = console.error
    console.error = () => {
        n += 1
    }
    return {
        restore: () => {
            console.error = orig
            return n
        },
    }
}


//mkPm, 可觀察狀態之pm, bThrow為true時其reject自身會拋錯
function mkPm(bThrow) {
    let st = 'pending'
    let rej = null
    let p = new Promise((resolve, reject) => {
        rej = reject
    })
    p.catch(() => {})
    p.reject = (e) => {
        if (bThrow) {
            throw new Error('pm.reject boom')
        }
        st = 'rejected'
        rej(e)
    }
    Object.defineProperty(p, 'st', {
        get() {
            return st
        },
    })
    return p
}


describe(`evEmitDelay`, function() {

    this.timeout(20000)

    //--- 脫勾語意 ---

    it(`should not dispatch synchronously`, function() {
        let got = []
        let ev = evem()
        ev.on('ev', (v) => {
            got.push(v)
        })
        evEmitDelay(ev, 'ev', [{ a: 1 }])
        assert.strict.deepStrictEqual(got, []) //同步當下尚未派發
    })

    it(`should dispatch after the current stack unwinds`, async function() {
        let got = []
        let ev = evem()
        ev.on('ev', (v) => {
            got.push(v)
        })
        evEmitDelay(ev, 'ev', [{ a: 1 }])
        await delay(40)
        assert.strict.deepStrictEqual(got, [{ a: 1 }])
    })

    it(`should let the caller mutate state before the listener observes it`, async function() {
        //脫勾之用途: 監聽器須看到更新後之狀態
        let q = {}
        let seen = null
        let ev = evem()
        ev.on('ev', () => {
            seen = Object.keys(q).length
        })
        evEmitDelay(ev, 'ev', [{}])
        q.a = 1 //派發後才更新, 但因已脫勾故監聽器看得到
        await delay(40)
        assert.strict.deepStrictEqual(seen, 1)
    })

    it(`should pass every element of args as a separate listener argument`, async function() {
        let got = null
        let ev = evem()
        ev.on('ev', (...v) => {
            got = v
        })
        evEmitDelay(ev, 'ev', [1, 'b', { c: 3 }])
        await delay(40)
        assert.strict.deepStrictEqual(got, [1, 'b', { c: 3 }])
    })

    it(`should default args to an empty array`, async function() {
        let got = null
        let ev = evem()
        ev.on('ev', (...v) => {
            got = v
        })
        evEmitDelay(ev, 'ev')
        await delay(40)
        assert.strict.deepStrictEqual(got, [])
    })

    it(`should keep listener order across two delayed dispatches`, async function() {
        let seq = []
        let ev = evem()
        ev.on('ev', (v) => {
            seq.push(v)
        })
        evEmitDelay(ev, 'ev', ['a'])
        evEmitDelay(ev, 'ev', ['b'])
        await delay(60)
        assert.strict.deepStrictEqual(seq, ['a', 'b'])
    })

    //--- 回傳之timer ---

    it(`should return a timer that can be cancelled by clearTimeout`, async function() {
        let got = []
        let ev = evem()
        ev.on('ev', (v) => {
            got.push(v)
        })
        let t = evEmitDelay(ev, 'ev', [{ a: 1 }], { ms: 30 })
        clearTimeout(t)
        await delay(80)
        assert.strict.deepStrictEqual(got, [])
    })

    //--- opt.ms ---

    it(`should honour opt.ms`, async function() {
        let t0 = Date.now()
        let fired = 0
        let ev = evem()
        ev.on('ev', () => {
            fired = Date.now() - t0
        })
        evEmitDelay(ev, 'ev', [], { ms: 120 })
        await delay(60)
        assert.strict.deepStrictEqual(fired, 0) //60ms時尚未觸發
        await delay(140)
        assert.strict.deepStrictEqual(fired >= 100, true)
    })

    it(`should fall back to the default when opt.ms is not a positive integer`, async function() {
        let got = []
        let ev = evem()
        ev.on('ev', () => {
            got.push(1)
        })
        evEmitDelay(ev, 'ev', [], { ms: 0 })
        evEmitDelay(ev, 'ev', [], { ms: -5 })
        evEmitDelay(ev, 'ev', [], { ms: 'x' })
        evEmitDelay(ev, 'ev', [], { ms: 1.5 })
        await delay(60)
        assert.strict.deepStrictEqual(got.length, 4)
    })

    it(`should accept a numeric string for opt.ms`, async function() {
        let got = []
        let ev = evem()
        ev.on('ev', () => {
            got.push(1)
        })
        evEmitDelay(ev, 'ev', [], { ms: '20' })
        await delay(80)
        assert.strict.deepStrictEqual(got.length, 1)
    })

    it(`should clamp opt.ms to the timer upper bound instead of firing immediately`, async function() {
        //超過2^31-1者, nodejs會夾為1ms立即觸發、瀏覽器會環繞, 夾制後應為正常排程
        let got = []
        let ev = evem()
        ev.on('ev', () => {
            got.push(1)
        })
        let t = evEmitDelay(ev, 'ev', [], { ms: cst.TIMER_TIME_MAX + 1 })
        await delay(120)
        clearTimeout(t) //避免24.8天之計時器吊住行程
        assert.strict.deepStrictEqual(got, [])
    })

    it(`should clamp Infinity for opt.ms`, async function() {
        let got = []
        let ev = evem()
        ev.on('ev', () => {
            got.push(1)
        })
        let t = evEmitDelay(ev, 'ev', [], { ms: Infinity })
        await delay(120)
        clearTimeout(t)
        assert.strict.deepStrictEqual(got, [])
    })

    //--- 錯誤處置, 與evEmit一致 ---

    it(`should catch a listener sync throw inside the detached stack`, async function() {
        let uncaught = []
        let h = (e) => {
            uncaught.push(e.message)
        }
        process.on('uncaughtException', h)
        let ev = evem()
        ev.on('error', () => {})
        ev.on('ev', () => {
            throw new Error('boom')
        })
        evEmitDelay(ev, 'ev', [{}])
        await delay(60)
        process.removeListener('uncaughtException', h)
        assert.strict.deepStrictEqual(uncaught, [])
    })

    it(`should report a listener throw as an error event carrying fun, name, msg and args`, async function() {
        let got = null
        let ev = evem()
        ev.on('error', (m) => {
            got = m
        })
        ev.on('ev', () => {
            throw new Error('boom')
        })
        evEmitDelay(ev, 'ev', [{ a: 1 }])
        await delay(60)
        assert.strict.deepStrictEqual(got.fun, 'listener')
        assert.strict.deepStrictEqual(got.name, 'ev')
        assert.strict.deepStrictEqual(got.msg.message, 'boom')
        assert.strict.deepStrictEqual(got.args, [{ a: 1 }])
    })

    it(`should console.error when no error listener is registered`, async function() {
        let ev = evem()
        ev.on('ev', () => {
            throw new Error('boom')
        })
        let s = silence()
        evEmitDelay(ev, 'ev', [])
        await delay(60)
        let n = s.restore()
        assert.strict.deepStrictEqual(n, 1)
    })

    it(`should call funSettle before reporting`, async function() {
        let seq = []
        let ev = evem()
        ev.on('error', () => {
            seq.push('report')
        })
        ev.on('ev', () => {
            throw new Error('boom')
        })
        evEmitDelay(ev, 'ev', [{}], {
            funSettle: () => {
                seq.push('settle')
            },
        })
        await delay(60)
        assert.strict.deepStrictEqual(seq, ['settle', 'report'])
    })

    it(`should settle the pm supplied via funSettle`, async function() {
        let pm = mkPm(false)
        let ev = evem()
        ev.on('error', () => {})
        ev.on('ev', () => {
            throw new Error('boom')
        })
        evEmitDelay(ev, 'ev', [{ pm }], {
            funSettle: (err) => {
                pm.reject(err)
            },
        })
        await delay(60)
        assert.strict.deepStrictEqual(pm.st, 'rejected')
    })

    it(`should not crash when funSettle itself throws inside the detached stack`, async function() {
        let uncaught = []
        let h = (e) => {
            uncaught.push(e.message)
        }
        process.on('uncaughtException', h)
        let pm = mkPm(true)
        let got = null
        let ev = evem()
        ev.on('error', (m) => {
            got = m
        })
        ev.on('ev', () => {
            throw new Error('boom')
        })
        evEmitDelay(ev, 'ev', [{ pm }], {
            funSettle: (err) => {
                pm.reject(err)
            },
        })
        await delay(60)
        process.removeListener('uncaughtException', h)
        assert.strict.deepStrictEqual(uncaught, [])
        assert.strict.deepStrictEqual(got.msg.message, 'boom')
    })

    it(`should not touch any promise-like argument when funSettle is not supplied`, async function() {
        let pm = mkPm(false)
        let ev = evem()
        ev.on('error', () => {})
        ev.on('ev', () => {
            throw new Error('boom')
        })
        evEmitDelay(ev, 'ev', [pm])
        await delay(60)
        assert.strict.deepStrictEqual(pm.st, 'pending')
    })

    it(`should dispatch and report through opt.funEmit when supplied`, async function() {
        let calls = []
        let ev = evem()
        ev.on('error', () => {})
        ev.on('ev', () => {
            throw new Error('boom')
        })
        let raw = ev.emit
        evEmitDelay(ev, 'ev', [{}], {
            funEmit: (nm, ...a) => {
                calls.push(nm)
                return raw.call(ev, nm, ...a)
            },
        })
        await delay(60)
        assert.strict.deepStrictEqual(calls, ['ev', 'error'])
    })

    it(`should use opt.tag as the console.error prefix`, async function() {
        let msg = ''
        let orig = console.error
        console.error = (m) => {
            msg = String(m)
        }
        let ev = evem()
        ev.on('ev', () => {
            throw new Error('boom')
        })
        evEmitDelay(ev, 'ev', [], { tag: 'myMod' })
        await delay(60)
        console.error = orig
        assert.strict.deepStrictEqual(msg.includes('[wsemi myMod]'), true)
    })

    it(`should not catch an async listener rejection, as emit does not observe return values`, async function() {
        let unhandled = []
        let h = (r) => {
            unhandled.push((r && r.message) || String(r))
        }
        process.on('unhandledRejection', h)
        let got = []
        let ev = evem()
        ev.on('error', (m) => {
            got.push(m)
        })
        ev.on('ev', async() => {
            throw new Error('async boom')
        })
        evEmitDelay(ev, 'ev', [{}])
        await delay(80)
        process.removeListener('unhandledRejection', h)
        //次數屬mocha之unhandledRejection管線細節(獨立執行為1次), 規範陳述僅為「未被攔截而外露」
        assert.strict.deepStrictEqual(unhandled.includes('async boom'), true)
        assert.strict.deepStrictEqual(got, [])
    })

    it(`should not call remaining listeners after one throws, per EventEmitter semantics`, async function() {
        let seq = []
        let ev = evem()
        ev.on('error', () => {})
        ev.on('ev', () => {
            seq.push('L1')
        })
        ev.on('ev', () => {
            throw new Error('boom')
        })
        ev.on('ev', () => {
            seq.push('L3')
        })
        evEmitDelay(ev, 'ev', [{}])
        await delay(60)
        assert.strict.deepStrictEqual(seq, ['L1'])
    })

})
