import assert from 'assert'
import pmQueue from '../src/pmQueue.mjs'
import { runPmSettle } from './tools/pmSettleRun.mjs'
import { traceRec, useFakeClock } from './tools/timeKit.mjs'


describe(`pmQueue`, function() {

    //test1~test4之結果取決於各任務之持續時間(測試自帶計時器, 300/200/100ms)與佇列之啟動順序(相對先後即規格), 時間本身即規格, 以假時鐘推進(R-TRACE-01 P5); 原以真實計時器與700ms之快照, 負載下計時器遲到即改變先後或使快照缺筆
    //settled, 假時鐘推進完畢後取結果: 假時鐘不會自行前進, 若尚未完成則拋錯, 不直接await以免懸置(並使假時鐘無法restore)
    async function settled(p) {
        let done = false
        let pp = p.then((v) => {
            done = true
            return v
        }, (e) => {
            done = true
            throw e
        })
        pp.catch(() => {})
        await new Promise((resolve) => setImmediate(resolve)) //真實setImmediate讓出, 使已可進行之microtask全數執行
        if (!done) {
            throw new Error('not settled within the advanced fake time')
        }
        return pp
    }

    //runFake, 啟用假時鐘執行test並推進700ms(原快照時點), 回傳其結果
    async function runFake(test, onTrace) {
        let clock = useFakeClock()
        try {
            let p = test(onTrace)
            await clock.advance(700)
            return await settled(p)
        }
        finally {
            clock.restore()
        }
    }

    //fmt, 事件轉為簡式字串: push1、start1/1(任務序號/含該任務之執行中數)、end1/0(任務序號/不含該任務之執行中數, 失敗者尾綴!)、cancel1
    let fmt = (e) => {
        if (e.type === 'start') {
            return `start${e.n}/${e.running}`
        }
        if (e.type === 'end') {
            return `end${e.n}/${e.running}${e.ok ? '' : '!'}`
        }
        return `${e.type}${e.n}`
    }

    async function test1(onTrace) {
        return new Promise((resolve, reject) => {

            let ms = []
            let pmq = pmQueue(1, false, { onTrace }) //同時處理1個

            function fun1(v) {
                // console.log('call fun1')
                ms.push('call fun1')
                return new Promise(function(resolve, reject) {
                    setTimeout(function() {
                        ms.push('fun1 resolve: ' + v)
                        resolve('#' + v)
                    }, 300)
                })
            }

            function fun2(v) {
                // console.log('call fun2')
                ms.push('call fun2')
                return new Promise(function(resolve, reject) {
                    setTimeout(function() {
                        ms.push('fun2 resolve: ' + v)
                        resolve('#' + v)
                    }, 200)
                })
            }

            function fun3(v) {
                // console.log('call fun3')
                ms.push('call fun3')
                return new Promise(function(resolve, reject) {
                    setTimeout(function() {
                        ms.push('fun3 resolve: ' + v)
                        resolve('#' + v)
                    }, 100)
                })
            }

            pmq(fun1, 'inp1')
                .then(function(msg) {
                    // console.log('t1 then', msg)
                    ms.push('t1 then: ' + msg)
                })
                .catch(function(msg) {
                    // console.log('t1 catch', msg)
                    ms.push('t1 catch: ' + 'reason ' + msg.reason)
                })
            pmq(fun2, 'inp2')
                .then(function(msg) {
                    // console.log('t2 then', msg)
                    ms.push('t2 then: ' + msg)
                })
                .catch(function(msg) {
                    // console.log('t2 catch', msg)
                    ms.push('t2 catch: ' + 'reason ' + msg.reason)
                })
            pmq(fun3, 'inp3')
                .then(function(msg) {
                    // console.log('t3 then', msg)
                    ms.push('t3 then: ' + msg)
                })
                .catch(function(msg) {
                    // console.log('t3 catch', msg)
                    ms.push('t3 catch: ' + 'reason ' + msg.reason)
                })
            setTimeout(function() {
                resolve(ms)
            }, 700)
        })
    }
    // console.log('test1')
    // test1
    // call fun1
    // t1 then #inp1
    // call fun2
    // t2 then #inp2
    // call fun3
    // t3 then #inp3
    // ["call fun1","fun1 resolve: inp1","t1 then: #inp1","call fun2","fun2 resolve: inp2","t2 then: #inp2","call fun3","fun3 resolve: inp3","t3 then: #inp3"]
    let r1 = '["call fun1","fun1 resolve: inp1","t1 then: #inp1","call fun2","fun2 resolve: inp2","t2 then: #inp2","call fun3","fun3 resolve: inp3","t3 then: #inp3"]'
    it(`should return '${r1}' when run test1'`, async function() {
        let tr = traceRec()
        let ms = await runFake(test1, tr.on)
        // console.log(JSON.stringify(ms))
        assert.strict.deepStrictEqual(JSON.stringify(ms), r1)
        //觀察回調: takeLimit=1時任務依序執行(含該任務之執行中數恆為1, 前一個end後下一個才start), 全數3個於700ms內完成
        assert.strict.deepStrictEqual(tr.events.map(fmt), ['push1', 'push2', 'push3', 'start1/1', 'end1/0', 'start2/1', 'end2/0', 'start3/1', 'end3/0'])
    })

    async function test2(onTrace) {
        return new Promise((resolve, reject) => {

            let ms = []
            let pmq = pmQueue(2, false, { onTrace }) //同時處理2個

            function fun1(v) {
                // console.log('call fun1')
                ms.push('call fun1')
                return new Promise(function(resolve, reject) {
                    setTimeout(function() {
                        ms.push('fun1 resolve: ' + v)
                        resolve('#' + v)
                    }, 300)
                })
            }

            function fun2(v) {
                // console.log('call fun2')
                ms.push('call fun2')
                return new Promise(function(resolve, reject) {
                    setTimeout(function() {
                        ms.push('fun2 resolve: ' + v)
                        resolve('#' + v)
                    }, 200)
                })
            }

            function fun3(v) {
                // console.log('call fun3')
                ms.push('call fun3')
                return new Promise(function(resolve, reject) {
                    setTimeout(function() {
                        ms.push('fun3 resolve: ' + v)
                        resolve('#' + v)
                    }, 100)
                })
            }

            pmq(fun1, 'inp1')
                .then(function(msg) {
                    // console.log('t1 then', msg)
                    ms.push('t1 then: ' + msg)
                })
                .catch(function(msg) {
                    // console.log('t1 catch', msg)
                    ms.push('t1 catch: ' + 'reason ' + msg.reason)
                })
            pmq(fun2, 'inp2')
                .then(function(msg) {
                    // console.log('t2 then', msg)
                    ms.push('t2 then: ' + msg)
                })
                .catch(function(msg) {
                    // console.log('t2 catch', msg)
                    ms.push('t2 catch: ' + 'reason ' + msg.reason)
                })
            pmq(fun3, 'inp3')
                .then(function(msg) {
                    // console.log('t3 then', msg)
                    ms.push('t3 then: ' + msg)
                })
                .catch(function(msg) {
                    // console.log('t3 catch', msg)
                    ms.push('t3 catch: ' + 'reason ' + msg.reason)
                })
            setTimeout(function() {
                resolve(ms)
            }, 700)
        })
    }
    // console.log('test2')
    // test2
    // call fun1
    // call fun2
    // t2 then #inp2
    // call fun3
    // t1 then #inp1
    // t3 then #inp3
    // ["call fun1","call fun2","fun2 resolve: inp2","t2 then: #inp2","call fun3","fun1 resolve: inp1","t1 then: #inp1","fun3 resolve: inp3","t3 then: #inp3"]
    let r2 = '["call fun1","call fun2","fun2 resolve: inp2","t2 then: #inp2","call fun3","fun1 resolve: inp1","t1 then: #inp1","fun3 resolve: inp3","t3 then: #inp3"]'
    it(`should return '${r2}' when run test2'`, async function() {
        let tr = traceRec()
        let ms = await runFake(test2, tr.on)
        // console.log(JSON.stringify(ms))
        assert.strict.deepStrictEqual(JSON.stringify(ms), r2)
        //觀察回調: takeLimit=2時前2個同時執行(含該任務之執行中數至多2), fun2(200ms)先於fun1(300ms)結束後第3個才啟動並晚於fun1結束(fun3於fun2結束後方啟動), 全數3個於700ms內完成
        assert.strict.deepStrictEqual(tr.events.map(fmt), ['push1', 'push2', 'push3', 'start1/1', 'start2/2', 'end2/1', 'start3/2', 'end1/1', 'end3/0'])
    })

    async function test3(onTrace) {
        return new Promise((resolve, reject) => {

            let ms = []
            let pmq = pmQueue(null, false, { onTrace }) //同時處理全部

            function fun1(v) {
                // console.log('call fun1')
                ms.push('call fun1')
                return new Promise(function(resolve, reject) {
                    setTimeout(function() {
                        ms.push('fun1 resolve: ' + v)
                        resolve('#' + v)
                    }, 300)
                })
            }

            function fun2(v) {
                // console.log('call fun2')
                ms.push('call fun2')
                return new Promise(function(resolve, reject) {
                    setTimeout(function() {
                        ms.push('fun2 resolve: ' + v)
                        resolve('#' + v)
                    }, 200)
                })
            }

            function fun3(v) {
                // console.log('call fun3')
                ms.push('call fun3')
                return new Promise(function(resolve, reject) {
                    setTimeout(function() {
                        ms.push('fun3 resolve: ' + v)
                        resolve('#' + v)
                    }, 100)
                })
            }

            pmq(fun1, 'inp1')
                .then(function(msg) {
                    // console.log('t1 then', msg)
                    ms.push('t1 then: ' + msg)
                })
                .catch(function(msg) {
                    // console.log('t1 catch', msg)
                    ms.push('t1 catch: ' + 'reason ' + msg.reason)
                })
            pmq(fun2, 'inp2')
                .then(function(msg) {
                    // console.log('t2 then', msg)
                    ms.push('t2 then: ' + msg)
                })
                .catch(function(msg) {
                    // console.log('t2 catch', msg)
                    ms.push('t2 catch: ' + 'reason ' + msg.reason)
                })
            pmq(fun3, 'inp3')
                .then(function(msg) {
                    // console.log('t3 then', msg)
                    ms.push('t3 then: ' + msg)
                })
                .catch(function(msg) {
                    // console.log('t3 catch', msg)
                    ms.push('t3 catch: ' + 'reason ' + msg.reason)
                })
            setTimeout(function() {
                resolve(ms)
            }, 700)
        })
    }
    // console.log('test3')
    // test3
    // call fun1
    // call fun2
    // call fun3
    // t3 then #inp3
    // t2 then #inp2
    // t1 then #inp1
    // ["call fun1","call fun2","call fun3","fun3 resolve: inp3","t3 then: #inp3","fun2 resolve: inp2","t2 then: #inp2","fun1 resolve: inp1","t1 then: #inp1"]
    let r3 = '["call fun1","call fun2","call fun3","fun3 resolve: inp3","t3 then: #inp3","fun2 resolve: inp2","t2 then: #inp2","fun1 resolve: inp1","t1 then: #inp1"]'
    it(`should return '${r3}' when run test3'`, async function() {
        let tr = traceRec()
        let ms = await runFake(test3, tr.on)
        // console.log(JSON.stringify(ms))
        assert.strict.deepStrictEqual(JSON.stringify(ms), r3)
        //觀察回調: 不限制時3個同時執行(執行中數達3), 依持續時間短者先結束, 全數於700ms內完成
        assert.strict.deepStrictEqual(tr.events.map(fmt), ['push1', 'push2', 'push3', 'start1/1', 'start2/2', 'start3/3', 'end3/2', 'end2/1', 'end1/0'])
    })

    async function test4(onTrace) {
        return new Promise((resolve, reject) => {

            let ms = []
            let pmq = pmQueue(null, true, { onTrace }) //同時處理全部, 但只拿最後執行者的結果

            function fun1(v) {
                // console.log('call fun1')
                ms.push('call fun1')
                return new Promise(function(resolve, reject) {
                    setTimeout(function() {
                        ms.push('fun1 resolve: ' + v)
                        resolve('#' + v)
                    }, 300)
                })
            }

            function fun2(v) {
                // console.log('call fun2')
                ms.push('call fun2')
                return new Promise(function(resolve, reject) {
                    setTimeout(function() {
                        ms.push('fun2 resolve: ' + v)
                        resolve('#' + v)
                    }, 200)
                })
            }

            function fun3(v) {
                // console.log('call fun3')
                ms.push('call fun3')
                return new Promise(function(resolve, reject) {
                    setTimeout(function() {
                        ms.push('fun3 resolve: ' + v)
                        resolve('#' + v)
                    }, 100)
                })
            }

            pmq(fun1, 'inp1')
                .then(function(msg) {
                    // console.log('t1 then', msg)
                    ms.push('t1 then: ' + msg)
                })
                .catch(function(msg) {
                    // console.log('t1 catch', msg)
                    ms.push('t1 catch: ' + 'reason ' + msg.reason)
                })
            pmq(fun2, 'inp2')
                .then(function(msg) {
                    // console.log('t2 then', msg)
                    ms.push('t2 then: ' + msg)
                })
                .catch(function(msg) {
                    // console.log('t2 catch', msg)
                    ms.push('t2 catch: ' + 'reason ' + msg.reason)
                })
            pmq(fun3, 'inp3')
                .then(function(msg) {
                    // console.log('t3 then', msg)
                    ms.push('t3 then: ' + msg)
                })
                .catch(function(msg) {
                    // console.log('t3 catch', msg)
                    ms.push('t3 catch: ' + 'reason ' + msg.reason)
                })
            setTimeout(function() {
                resolve(ms)
            }, 700)
        })
    }
    // console.log('test4')
    // test4
    // call fun1
    // call fun2
    // call fun3
    // t3 then #inp3
    // t2 catch { reason: 'cancelled' }
    // t1 catch { reason: 'cancelled' }
    // ["call fun1","call fun2","call fun3","fun3 resolve: inp3","t3 then: #inp3","fun2 resolve: inp2","t2 catch: reason cancelled","fun1 resolve: inp1","t1 catch: reason cancelled"]
    let r4 = '["call fun1","call fun2","call fun3","fun3 resolve: inp3","t3 then: #inp3","fun2 resolve: inp2","t2 catch: reason cancelled","fun1 resolve: inp1","t1 catch: reason cancelled"]'
    it(`should return '${r4}' when run test4'`, async function() {
        let tr = traceRec()
        let ms = await runFake(test4, tr.on)
        // console.log(JSON.stringify(ms))
        assert.strict.deepStrictEqual(JSON.stringify(ms), r4)
        //觀察回調: takeLast下仍全數執行完畢(3個皆end), 但非最後呼叫者(1、2)之結果被捨棄而cancel, 最後呼叫者(3)不cancel, 全數於700ms內完成
        assert.strict.deepStrictEqual(tr.events.map(fmt), ['push1', 'push2', 'push3', 'start1/1', 'start2/2', 'start3/3', 'end3/2', 'end2/1', 'cancel2', 'end1/0', 'cancel1'])
    })

    it(`should behave the same without onTrace, with a recording onTrace, and with a throwing, rejecting or invalid onTrace`, async function() {
        //R-TRACE-01 P3: 未傳觀察回調時之對外行為不變(第3參數可省略, 同舊版之pmQueue(takeLimit, takeLast)); P4: 回調之拋錯與回傳值不影響佇列、不產生未處理之rejection; 以假時鐘使各次之時序相同
        let un = []
        let onUn = (v) => un.push(String(v))
        process.on('unhandledRejection', onUn)
        let rs = []
        try {
            let rec = traceRec()
            for (let onTrace of [undefined, rec.on, () => {
                throw new Error('trace boom')
            }, () => Promise.reject(new Error('trace reject')), 'abc']) {
                let got = []
                for (let test of [test1, test2, test3, test4]) {
                    got.push(JSON.stringify(await runFake(test, onTrace)))
                }
                rs.push(got)
            }
            //省略第3參數
            let clock = useFakeClock()
            try {
                let got = []
                let pmq = pmQueue(1)
                let ps = [pmq((v) => new Promise((resolve) => setTimeout(() => resolve(v), 10)), 'x'), pmq(() => 'y')]
                await clock.advance(50)
                got = await settled(Promise.all(ps))
                rs.push(got)
            }
            finally {
                clock.restore()
            }
            await new Promise((resolve) => setImmediate(resolve))
            assert.strict.deepStrictEqual(rec.events.length > 0, true)
        }
        finally {
            process.removeListener('unhandledRejection', onUn)
        }
        let r1234 = [r1, r2, r3, r4]
        assert.strict.deepStrictEqual([rs, un], [[r1234, r1234, r1234, r1234, r1234, ['x', 'y']], []])
    })

    it(`should notify push, start, end and cancel through onTrace with frozen events of primitive fields and no receiver`, async function() {
        //JSDoc opt.onTrace: 事件為凍結物件{ type, ... }, 欄位依type列舉且皆為原始值; 回調不帶接收者呼叫(R-TRACE-01 P4: 唯讀快照、最少欄位、不暴露內部可變狀態)
        let meta = []
        let tr = traceRec()
        let onTrace = function(e) {
            meta.push([this, Object.isFrozen(e)])
            tr.on(e)
        }
        let clock = useFakeClock()
        try {
            //takeLimit=2、takeLast=true: 成功、失敗(reject)、非函數各一, 最後呼叫者為非函數; 前兩者被cancel
            let pmq = pmQueue(2, true, { onTrace })
            let ps = [
                pmq(() => new Promise((resolve) => setTimeout(() => resolve('a'), 10))),
                pmq(() => new Promise((resolve, reject) => setTimeout(() => reject(new Error('b')), 5))),
                pmq('notFun'),
            ].map((p) => p.then((v) => ['resolve', v], (e) => ['reject', e]))
            await clock.advance(50)
            let rs = await settled(Promise.all(ps))
            assert.strict.deepStrictEqual(rs, [['reject', { reason: 'cancelled' }], ['reject', { reason: 'cancelled' }], ['reject', 'fun is not a function']])
        }
        finally {
            clock.restore()
        }
        //各type之欄位固定(排序後)
        let keys = {}
        for (let e of tr.events) {
            keys[e.type] = Object.keys(e).sort().join(',')
        }
        assert.strict.deepStrictEqual(keys, { push: 'n,type', start: 'n,running,type', end: 'n,ok,running,type', cancel: 'n,type' })
        //欄位皆為原始值(數字、字串、布林或null)
        assert.strict.deepStrictEqual(tr.events.every((e) => Object.values(e).every((v) => v === null || ['number', 'string', 'boolean'].includes(typeof v))), true)
        //事件為凍結物件, 回調不帶接收者(this為undefined)
        assert.strict.deepStrictEqual(meta.length > 0 && meta.every(([self, frozen]) => self === undefined && frozen), true)
        //任務序號依呼叫順序由1起算; 失敗者與非函數者ok為false; 非函數者仍通知start與end
        assert.strict.deepStrictEqual(tr.events.filter((e) => e.type === 'end').map((e) => `${e.n}:${e.ok}`), ['2:false', '3:false', '1:true'])
        assert.strict.deepStrictEqual(tr.events.filter((e) => e.type === 'start').map((e) => e.n), [1, 2, 3])
        //takeLast: 非最後呼叫者(1、2)被cancel, 最後者(3)不cancel
        assert.strict.deepStrictEqual(tr.events.filter((e) => e.type === 'cancel').map((e) => e.n), [2, 1])
    })

})


describe(`pmQueue settle(R-PM-SETTLE-01)`, function() {

    it(`pmQueue: 任務以惡意值拒絕時該呼叫reject原值, 後續任務照常 [規則1、3]`, function() {
        let { r } = runPmSettle('queueHostileThenGood')
        assert.strict.deepStrictEqual(r.out, { t1: { s: 'reject', same: true }, t2: { s: 'resolve', v: 'good' } })
        assert.strict.deepStrictEqual(r.unhandled, [])
    })

    it(`pmQueue: 任務同步回傳Symbol.toStringTag會拋之物件時resolve原值, 後續任務照常 [規則1、3、8]`, function() {
        let { r } = runPmSettle('queueSyncReturnTagGetter')
        assert.strict.deepStrictEqual(r.out, { t1: { s: 'resolve', same: true }, t2: { s: 'resolve', v: 'good' } })
        assert.strict.deepStrictEqual(r.unhandled, [])
    })

    it(`pmQueue、pmThrottle、pmInvResolve: 任務之取消皆以{ reason: 'cancelled' }傳出 [規則4、7]`, function() {
        let { r } = runPmSettle('queueCancelPassThrough')
        assert.strict.deepStrictEqual(r.out, {
            pmQueue: { s: 'reject', reason: 'cancelled' },
            pmThrottle: { s: 'reject', reason: 'cancelled' },
            pmInvResolve: { s: 'reject', reason: 'cancelled' },
        })
    })

    it(`pmQueue: 任務同步拋出null時reject null [規則1]`, function() {
        let { r } = runPmSettle('queueThrowNull')
        assert.strict.deepStrictEqual(r.out, { s: 'reject', isNull: true })
    })

})


describe(`pmQueue 非函數任務(R-PM-SETTLE-01規則12)`, function() {

    it(`非函數之任務(7值)以字串'fun is not a function'被reject, 後續任務照常 [規則12]`, function() {
        let { r } = runPmSettle('nonFunQueue')
        //R-PM-SETTLE-01 規則12: pmQueue之任務非函數時回傳之Promise以字串'fun is not a function' reject; JSDoc pmQueue:25「第1參數非函數時該任務之Promise以字串'fun is not a function'被reject」
        let rj = { s: 'reject', v: 'fun is not a function' }
        assert.strict.deepStrictEqual(r.out, { undefined: rj, null: rj, zero: rj, str: rj, obj: rj, pm: rj, asyncGen: rj, next: { s: 'resolve', v: 'good' } })
        //R-PM-SETTLE-01 規則2
        assert.strict.deepStrictEqual({ unhandled: r.unhandled, uncaught: r.uncaught }, { unhandled: [], uncaught: [] })
    })

    it(`pmQueue(0, true)排兩有效任務後排非函數(最後一筆): 前兩者照常被取消, 非函數者以'fun is not a function'被reject [規則12]`, function() {
        let { r } = runPmSettle('nonFunQueueTakeLast')
        //R-PM-SETTLE-01 規則12: pmQueue照常排入, 輪到時以同一字串reject(takeLast下非函數為最後一筆時其前之任務照常被取消); 規則4: 取消一律以{ reason: 'cancelled' }傳出
        let cancelled = { s: 'reject', reason: 'cancelled' }
        assert.strict.deepStrictEqual(r.out, { t1: cancelled, t2: cancelled, t3: { s: 'reject', v: 'fun is not a function' } })
        //R-PM-SETTLE-01 規則2
        assert.strict.deepStrictEqual({ unhandled: r.unhandled, uncaught: r.uncaught }, { unhandled: [], uncaught: [] })
    })

})
