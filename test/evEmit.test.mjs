import assert from 'assert'
import evem from '../src/evem.mjs'
import evEmit from '../src/evEmit.mjs'
import { SENT, EVNAME, mkRec, captureOut, mkFunLog, dump, defineDiagSiteCases } from './tools/diagSiteKit.mjs'


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


//通報經getDiag出口(R-DIAG-01規則14; 建議書W1、W2: 無error監聽者或error監聽器自身拋錯時, 原樣console.error拋出值即洩漏權杖、使用者識別與資料值)
describe(`evEmit 通報經getDiag出口(R-DIAG-01規則14)`, function() {

    //三態與形態表(站點W1、W1'、W2)
    defineDiagSiteCases(['W1', 'W1b', 'W2'])

    //規則14: 事件名不入label(通用函數之事件名可能帶識別), 只入細節; tag為呼叫端程式設定之固定詞彙, 留於label
    it(`label為固定詞彙, 事件名(字串、Symbol、物件)不入label與預設輸出, 只入logDetail之細節`, function() {
        for (let name of [EVNAME, Symbol(EVNAME), `user-${SENT}`, { toString: () => `obj-${SENT}` }]) {
            let rec = mkRec()
            let cap = captureOut(rec)
            try {
                let ev = evem()
                ev.on(name, () => {
                    throw new Error('x')
                })
                let r = evEmit(ev, name, [], { tag: 'demo' })
                assert.strict.deepStrictEqual(r, false)
            }
            finally {
                cap.restore()
            }
            assert.strict.deepStrictEqual(rec.calls, [{ via: 'console.error', args: ['[wsemi demo] listener threw', { errType: 'Error' }] }])
        }
        //細節含事件名
        let rec = mkRec()
        let ev = evem()
        let sym = Symbol(EVNAME)
        ev.on(sym, () => {
            throw new Error('x')
        })
        evEmit(ev, sym, [], { tag: 'demo', funLog: mkFunLog(rec) })
        assert.strict.deepStrictEqual(rec.calls[0].args[2].event, sym)
    })

    it(`opt.tag只讀一次(讀取時之值即用之值)且至多取前64字元(固定詞彙後綴不被label之200字元上限擠掉)`, function() {
        let reads = 0
        let opt = {
            get tag() {
                reads++
                //第一次為字串, 其後為帶toString之物件(若被多讀, 其toString會執行且值進label)
                return reads === 1 ? 'once' : { toString: () => `LEAK-${SENT}` }
            },
        }
        let rec = mkRec()
        let cap = captureOut(rec)
        try {
            let ev = evem()
            ev.on('ev', () => {
                throw new Error('x')
            })
            evEmit(ev, 'ev', [], opt)
            evEmit(ev, 'ev', [], { tag: 't'.repeat(300) })
        }
        finally {
            cap.restore()
        }
        assert.strict.deepStrictEqual(rec.calls.map((c) => c.args[0]), ['[wsemi once] listener threw', `[wsemi ${'t'.repeat(64)}] listener threw`])
        assert.strict.deepStrictEqual([reads, dump(rec.calls).includes(SENT)], [1, false])
    })

    it(`opt.tag留於label; 非字串或空字串之tag視為'evem'; tag內控制字元換?(不使log偽造換行)`, function() {
        let run = (tag) => {
            let rec = mkRec()
            let cap = captureOut(rec)
            try {
                let ev = evem()
                ev.on('ev', () => {
                    throw new Error('x')
                })
                evEmit(ev, 'ev', [], { tag })
            }
            finally {
                cap.restore()
            }
            return rec.calls[0].args[0]
        }
        assert.strict.deepStrictEqual(run('myMod'), '[wsemi myMod] listener threw')
        assert.strict.deepStrictEqual(run(undefined), '[wsemi evem] listener threw')
        assert.strict.deepStrictEqual(run(''), '[wsemi evem] listener threw')
        assert.strict.deepStrictEqual(run(5), '[wsemi evem] listener threw')
        assert.strict.deepStrictEqual(run(Symbol('s')), '[wsemi evem] listener threw')
        assert.strict.deepStrictEqual(run({ toString: () => SENT }), '[wsemi evem] listener threw')
        assert.strict.deepStrictEqual(run('a\nb\u001b[31m'), '[wsemi a?b?[31m] listener threw')
    })

    it(`W2之安全摘要含error監聽器拋錯之類型與代碼(errType、errCode)及原拋出值之類型與代碼(origErrType、origErrCode), 不在白名單之代碼不列`, function() {
        let run = (c2, c1) => {
            let rec = mkRec()
            let cap = captureOut(rec)
            try {
                let ev = evem()
                ev.on('ev', () => {
                    throw Object.assign(new Error('x'), c1)
                })
                ev.on('error', () => {
                    throw Object.assign(new TypeError('y'), c2)
                })
                evEmit(ev, 'ev', [], { tag: 'demo' })
            }
            finally {
                cap.restore()
            }
            return rec.calls[0].args[1]
        }
        assert.strict.deepStrictEqual(run({ code: 'ECONNREFUSED' }, { code: 'ENOENT' }), { errType: 'TypeError', errCode: 'ECONNREFUSED', origErrType: 'Error', origErrCode: 'ENOENT' })
        assert.strict.deepStrictEqual(run({}, { code: 'ENOENT' }), { errType: 'TypeError', origErrType: 'Error', origErrCode: 'ENOENT' })
        assert.strict.deepStrictEqual(run({ code: 'ECONNREFUSED' }, { code: `E_${SENT}` }), { errType: 'TypeError', errCode: 'ECONNREFUSED', origErrType: 'Error' })
    })

    //W2之輸入空間: error監聽器之拋出值形態(字串、null、Symbol、含使用端程式之物件)與其他觸發方式(listenerCount拋錯、funEmit拋錯)
    it(`W2: error監聽器拋出之值為字串、null、Symbol、含使用端程式之物件時, 預設只出類型摘要, 不含哨兵且不執行使用端程式`, function() {
        let hit = 0
        let hostile = {
            get message() {
                hit++
                return SENT
            },
            toString() {
                hit++
                return SENT
            },
        }
        let forms = [
            { v: `plain ${SENT}`, type: 'string' },
            { v: null, type: 'null' },
            { v: Symbol(SENT), type: 'symbol' },
            { v: hostile, type: 'object' },
        ]
        for (let f of forms) {
            let rec = mkRec()
            let cap = captureOut(rec)
            try {
                let ev = evem()
                ev.on('ev', () => {
                    throw new Error('first')
                })
                ev.on('error', () => {
                    throw f.v
                })
                evEmit(ev, 'ev', [], { tag: 'demo' })
            }
            finally {
                cap.restore()
            }
            assert.strict.deepStrictEqual(rec.calls, [{ via: 'console.error', args: ['[wsemi demo] listener threw, and reporting it also threw', { errType: f.type, origErrType: 'Error' }] }], f.type)
            assert.strict.deepStrictEqual(dump(rec.calls).includes(SENT), false)
        }
        assert.strict.deepStrictEqual(hit, 0)
    })

    it(`W2: listenerCount拋錯(ev已損壞)或funEmit拋錯時亦經診斷出口, 不外拋, funSettle仍先執行`, function() {
        let order = []
        let rec = mkRec()
        let cap = captureOut(rec)
        let r1 = null
        let r2 = null
        try {
            //ev.emit與listenerCount皆拋錯
            let broken = {
                emit: () => {
                    throw new Error(`e1-${SENT}`)
                },
                listenerCount: () => {
                    throw new Error(`e2-${SENT}`)
                },
            }
            r1 = evEmit(broken, 'ev', [], { tag: 'demo', funSettle: () => order.push('settle') })
            //通報之emit(funEmit)於error事件拋錯
            let ev = evem()
            ev.on('error', () => {})
            r2 = evEmit(ev, 'ev', [], {
                tag: 'demo',
                funEmit: (nm) => {
                    throw new Error(`e3-${nm}-${SENT}`)
                },
            })
        }
        finally {
            cap.restore()
        }
        assert.strict.deepStrictEqual([r1, r2, order], [false, false, ['settle']])
        assert.strict.deepStrictEqual(rec.calls.map((c) => [c.via, c.args[0], c.args[1]]), [
            ['console.error', '[wsemi demo] listener threw, and reporting it also threw', { errType: 'Error', origErrType: 'Error' }],
            ['console.error', '[wsemi demo] listener threw, and reporting it also threw', { errType: 'Error', origErrType: 'Error' }],
        ])
        assert.strict.deepStrictEqual(dump(rec.calls).includes(SENT), false)
    })

    //規則14: 有error監聽者時之程式化通道不變(error事件交給監聽者原值, console不輸出)
    it(`有error監聽者時仍以error事件原值交給監聽者(含拋出值本身), 不經診斷出口, console與funLog皆不輸出`, function() {
        let thrown = new Error(`token=${SENT}`)
        let got = []
        let rec = mkRec()
        let cap = captureOut(rec)
        let r = null
        try {
            let ev = evem()
            ev.on('error', (m) => {
                got.push(m)
            })
            ev.on(EVNAME, () => {
                throw thrown
            })
            r = evEmit(ev, EVNAME, [{ a: 1 }], { tag: 'demo', funLog: mkFunLog(rec) })
        }
        finally {
            cap.restore()
        }
        assert.strict.deepStrictEqual(r, false)
        assert.strict.deepStrictEqual(rec.calls, [])
        assert.strict.deepStrictEqual(got.length, 1)
        assert.strict.deepStrictEqual([got[0].fun, got[0].name, got[0].msg === thrown, got[0].args], ['listener', EVNAME, true, [{ a: 1 }]])
    })

    it(`console.error拋錯時evEmit仍回傳false且不外拋; funSettle仍先於通報執行`, function() {
        let order = []
        let rec = mkRec()
        let cap = captureOut(rec, true)
        let r = null
        try {
            let ev = evem()
            ev.on('ev', () => {
                throw new Error('x')
            })
            r = evEmit(ev, 'ev', [], {
                funSettle: () => {
                    order.push(`settle(console calls=${rec.calls.length})`)
                },
            })
        }
        finally {
            cap.restore()
        }
        assert.strict.deepStrictEqual(r, false)
        assert.strict.deepStrictEqual(order, ['settle(console calls=0)'])
        assert.strict.deepStrictEqual(rec.calls.length >= 1, true)
    })

    //getDiag於通報時才建立(未出錯之派發不讀logDetail與funLog)
    it(`未出錯之派發不讀opt.logDetail與opt.funLog(通報時才讀)`, function() {
        let hit = 0
        let opt = {
            get logDetail() {
                hit++
                return true
            },
            get funLog() {
                hit++
                return () => {}
            },
        }
        let ev = evem()
        ev.on('ev', () => {})
        assert.strict.deepStrictEqual([evEmit(ev, 'ev', [], opt), hit], [true, 0])
    })

})
