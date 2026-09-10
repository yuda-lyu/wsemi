import assert from 'assert'
import evem from '../src/evem.mjs'
import evEmit from '../src/evEmit.mjs'


//silence, 靜音console.error並回報其被呼叫次數
function silence(fn) {
    let n = 0
    let orig = console.error
    console.error = () => {
        n += 1
    }
    let r = null
    try {
        r = fn()
    }
    finally {
        console.error = orig
    }
    return { r, n }
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


describe(`evEmit`, function() {

    it(`should dispatch normally and return emit's boolean`, function() {
        let got = []
        let ev = evem()
        ev.on('ev', (v) => {
            got.push(v)
        })
        let r1 = evEmit(ev, 'ev', [{ a: 1 }])
        let r2 = evEmit(ev, 'none', [1])
        assert.strict.deepStrictEqual(got, [{ a: 1 }])
        assert.strict.deepStrictEqual([r1, r2], [true, false])
    })

    it(`should pass every element of args as a separate listener argument`, function() {
        let got = null
        let ev = evem()
        ev.on('ev', (...v) => {
            got = v
        })
        evEmit(ev, 'ev', [1, 'b', { c: 3 }])
        assert.strict.deepStrictEqual(got, [1, 'b', { c: 3 }])
    })

    it(`should default args to an empty array`, function() {
        let got = null
        let ev = evem()
        ev.on('ev', (...v) => {
            got = v
        })
        evEmit(ev, 'ev')
        assert.strict.deepStrictEqual(got, [])
    })

    it(`should catch a listener sync throw and return false`, function() {
        let ev = evem()
        ev.on('error', () => {})
        ev.on('ev', () => {
            throw new Error('boom')
        })
        let { r } = silence(() => {
            return evEmit(ev, 'ev', [{}])
        })
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should report a listener throw as an error event carrying fun, name, msg and args`, function() {
        let got = null
        let ev = evem()
        ev.on('error', (m) => {
            got = m
        })
        ev.on('ev', () => {
            throw new Error('boom')
        })
        evEmit(ev, 'ev', [{ a: 1 }])
        assert.strict.deepStrictEqual(got.fun, 'listener')
        assert.strict.deepStrictEqual(got.name, 'ev')
        assert.strict.deepStrictEqual(got.msg.message, 'boom')
        assert.strict.deepStrictEqual(got.args, [{ a: 1 }])
    })

    it(`should console.error when no error listener is registered`, function() {
        let ev = evem()
        ev.on('ev', () => {
            throw new Error('boom')
        })
        let { n } = silence(() => {
            return evEmit(ev, 'ev', [])
        })
        assert.strict.deepStrictEqual(n, 1)
    })

    it(`should not console.error when an error listener is registered`, function() {
        let ev = evem()
        ev.on('error', () => {})
        ev.on('ev', () => {
            throw new Error('boom')
        })
        let { n } = silence(() => {
            return evEmit(ev, 'ev', [])
        })
        assert.strict.deepStrictEqual(n, 0)
    })

    it(`should not re-emit error when the error listener itself throws`, function() {
        let ev = evem()
        ev.on('error', () => {
            throw new Error('err listener boom')
        })
        let r = () => {
            return silence(() => {
                return evEmit(ev, 'error', [{}])
            })
        }
        assert.doesNotThrow(r)
        assert.strict.deepStrictEqual(r().n, 1)
    })

    it(`should call funSettle before reporting`, function() {
        let seq = []
        let ev = evem()
        ev.on('error', () => {
            seq.push('report')
        })
        ev.on('ev', () => {
            throw new Error('boom')
        })
        evEmit(ev, 'ev', [{}], {
            funSettle: () => {
                seq.push('settle')
            },
        })
        assert.strict.deepStrictEqual(seq, ['settle', 'report'])
    })

    it(`should settle the pm supplied via funSettle`, function() {
        let pm = mkPm(false)
        let ev = evem()
        ev.on('error', () => {})
        ev.on('ev', () => {
            throw new Error('boom')
        })
        evEmit(ev, 'ev', [{ pm }], {
            funSettle: (err) => {
                pm.reject(err)
            },
        })
        assert.strict.deepStrictEqual(pm.st, 'rejected')
    })

    it(`should not throw when funSettle itself throws, and still report`, function() {
        let pm = mkPm(true)
        let got = null
        let ev = evem()
        ev.on('error', (m) => {
            got = m
        })
        ev.on('ev', () => {
            throw new Error('boom')
        })
        let r = () => {
            return evEmit(ev, 'ev', [{ pm }], {
                funSettle: (err) => {
                    pm.reject(err)
                },
            })
        }
        assert.doesNotThrow(r)
        assert.strict.deepStrictEqual(got.msg.message, 'boom')
    })

    it(`should not touch any promise-like argument when funSettle is not supplied`, function() {
        let pm = mkPm(false)
        let ev = evem()
        ev.on('error', () => {})
        ev.on('ev', () => {
            throw new Error('boom')
        })
        evEmit(ev, 'ev', [pm])
        assert.strict.deepStrictEqual(pm.st, 'pending')
    })

    it(`should dispatch and report through opt.funEmit when supplied`, function() {
        let calls = []
        let ev = evem()
        ev.on('error', () => {})
        ev.on('ev', () => {
            throw new Error('boom')
        })
        let raw = ev.emit
        evEmit(ev, 'ev', [{}], {
            funEmit: (nm, ...a) => {
                calls.push(nm)
                return raw.call(ev, nm, ...a)
            },
        })
        assert.strict.deepStrictEqual(calls, ['ev', 'error'])
    })

    it(`should use opt.tag as the console.error prefix`, function() {
        let msg = ''
        let orig = console.error
        console.error = (m) => {
            msg = String(m)
        }
        let ev = evem()
        ev.on('ev', () => {
            throw new Error('boom')
        })
        evEmit(ev, 'ev', [], { tag: 'myMod' })
        console.error = orig
        assert.strict.deepStrictEqual(msg.includes('[wsemi myMod]'), true)
    })

    it(`should not stop the process when dispatched inside a timer callback`, async function() {
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
        setTimeout(() => {
            evEmit(ev, 'ev', [{}])
        }, 1)
        await new Promise((resolve) => {
            setTimeout(resolve, 40)
        })
        process.removeListener('uncaughtException', h)
        assert.strict.deepStrictEqual(uncaught, [])
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
        evEmit(ev, 'ev', [{}])
        await new Promise((resolve) => {
            setTimeout(resolve, 40)
        })
        process.removeListener('unhandledRejection', h)
        //次數屬mocha之unhandledRejection管線細節(獨立執行為1次), 規範陳述僅為「未被攔截而外露」
        assert.strict.deepStrictEqual(unhandled.includes('async boom'), true)
        assert.strict.deepStrictEqual(got, [])
    })

})
