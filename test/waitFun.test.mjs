import assert from 'assert'
import waitFun from '../src/waitFun.mjs'
import { runPmSettle } from './tools/pmSettleRun.mjs'
import { traceRec, useFakeClock } from './tools/timeKit.mjs'


describe(`waitFun`, function() {

    function test1() {
        return new Promise((resolve, reject) => {
            let ms = []

            let i = 0
            waitFun(function() {
                i++
                // console.log('waiting: ' + i)
                ms.push('waiting: ' + i)
                return i >= 2
            })
                .then(function() {
                    // console.log('test1 then')
                    ms.push('test1 then')
                })

            setTimeout(function() {
                resolve(ms)
            }, 1100)

        })
    }
    let r1 = '["waiting: 1","waiting: 2","test1 then"]'
    it(`should return '${r1}' when run test1`, async function() {
        let ms = await test1()
        assert.strict.deepStrictEqual(JSON.stringify(ms), r1)
    })

    function test2() {
        let ms = []
        let i = 0

        let f = () => {
            return new Promise((resolve, reject) => {
                setTimeout(function() {
                    i++
                    // console.log('waiting: ' + i)
                    ms.push('waiting: ' + i)
                    resolve(i >= 2)
                }, 1100)
            })
        }

        return waitFun(f)
            .then(function() {
                // console.log('test2 then')
                ms.push('test2 then')
                return ms
            })

    }
    let r2 = '["waiting: 1","waiting: 2","test2 then"]'
    it(`should return '${r2}' when run test2`, async function() {
        let ms = await test2()
        assert.strict.deepStrictEqual(JSON.stringify(ms), r2)
    })

    function test3() {
        let ms = []
        let i = 0

        let f = () => {
            return new Promise((resolve, reject) => {
                setTimeout(function() {
                    i++
                    // console.log('waiting: ' + i)
                    ms.push('waiting: ' + i)
                    resolve(false)
                }, 1100)
            })
        }

        return waitFun(f, { attemptNum: 1 })
            .then(function() {
                // console.log('test3 then')
                ms.push('test3 then')
                return ms
            })
            .catch(function() {
                // console.log('test3 catch')
                ms.push('test3 catch')
                return ms
            })

    }
    let r3 = '["waiting: 1","waiting: 2","test3 catch"]'
    it(`should return '${r3}' when run test3`, async function() {
        let ms = await test3()
        assert.strict.deepStrictEqual(JSON.stringify(ms), r3)
    })

})


describe(`waitFun settle(R-PM-SETTLE-01)`, function() {

    it(`waitFun: 輪詢中拋錯或reject即reject該錯誤並停止輪詢, 同立即呼叫; 超過次數reject'exceeded attemptNum[N]' [規則1、2、5、文件]`, function() {
        let { r } = runPmSettle('waitFunIntervalFail')
        assert.strict.deepStrictEqual(r.out, {
            intervalReject: { s: 'reject', same: true, calls: 2 },
            intervalSyncThrow: { s: 'reject', same: true, calls: 2 },
            immediateReject: { s: 'reject', same: true },
            exceeded: { s: 'reject', v: 'exceeded attemptNum[2]' },
        })
        assert.strict.deepStrictEqual(r.unhandled, [])
    })

    it(`exitWaitFun: 任務失敗後計時器已釋放, 行程自然結束 [規則3、5]`, function() {
        //以是否被逾時終止判定(殘留之interval會使行程永不結束), 不以牆鐘門檻判定, 避免並行高負載誤判
        let { status, signal } = runPmSettle('exitWaitFun', 'natural')
        assert.strict.deepStrictEqual({ status, signal }, { status: 0, signal: null })
    })

})


describe(`waitFun 輪詢不重疊(R-PM-SETTLE-01規則13)`, function() {

    describe(`子行程: fun慢於timeInterval、同步回傳、先啟動之慢輪回true`, function() {
        let r = null
        before(function() {
            r = runPmSettle('waitFunNoOverlap').r
        })

        it(`fun(250ms, 恆false)慢於timeInterval(100ms): 最大並行1, 執行中之週期只計次不呼叫, 逾次於呼叫完成時reject, reject時無執行中之呼叫 [規則13]`, function() {
            //R-PM-SETTLE-01 規則13: 前一次呼叫未完成時該週期不呼叫fun(只計次); 逾次於呼叫完成時判定; JSDoc waitFun:17「前一次呼叫未完成時該週期不呼叫fun(輪詢不重疊)但仍計入嘗試次數」、:18「超過最大嘗試次數時reject字串'exceeded attemptNum[最大嘗試次數]'」
            //以觀察回調之事件序列判定(R-TRACE-01 P2): 原斷言呼叫恰3次(立即1次後, 第1、4週期呼叫), 次數隨週期與fun耗時之真實比例而變, 負載下不穩; 改驗各週期之busy與呼叫之對應、計次與reject之時點
            assert.strict.deepStrictEqual(r.out.s1, { s: 'reject', v: 'exceeded attemptNum[5]', maxConc: 1, inflightAtSettle: 0, overlapFree: true, ticksCounted: true, callsMatch: true, rejectAtResult: true })
        })

        it(`fun同步回傳false: 呼叫attemptNum+2次後reject [規則13]`, function() {
            //R-PM-SETTLE-01 規則13: fun最多被呼叫attemptNum+2次(立即1次+輪詢); JSDoc waitFun:16「故fun最多被呼叫attemptNum+2次」
            assert.strict.deepStrictEqual(r.out.s3, { s: 'reject', v: 'exceeded attemptNum[5]', calls: 7 })
        })

        it(`先啟動之慢輪(500ms)回true, 其間之週期不呼叫: resolve [規則13]`, function() {
            //R-PM-SETTLE-01 規則13: 逾次於呼叫完成時判定(不被其後之週期搶先判逾次); JSDoc waitFun:18「resolve回傳為空代表f函數回傳true」; 觀察回調: 最後為該慢輪完成(ok為true)而resolve
            assert.strict.deepStrictEqual(r.out.s5, { s: 'resolve', maxConc: 1, last: [['result', true], ['resolve', null]] })
        })

        it(`無未處理之rejection與未捕捉例外 [規則2]`, function() {
            //R-PM-SETTLE-01 規則2
            assert.strict.deepStrictEqual({ unhandled: r.unhandled, uncaught: r.uncaught }, { unhandled: [], uncaught: [] })
        })
    })

    it(`立即呼叫為false而其後之呼叫永不settle: 不settle且不再累積呼叫 [規則13]`, function() {
        let { r } = runPmSettle('waitFunHang')
        //R-PM-SETTLE-01 規則13: fun回傳永不settle之Promise時亦不settle(不再累積呼叫); JSDoc waitFun:18「fun回傳永不settle之Promise時亦不settle(不再累積呼叫)」; 懸置以子行程看門狗(600ms)判定
        assert.strict.deepStrictEqual(r.out, { s: 'pending', calls: 2 })
        //R-PM-SETTLE-01 規則2
        assert.strict.deepStrictEqual({ unhandled: r.unhandled, uncaught: r.uncaught }, { unhandled: [], uncaught: [] })
    })

    it(`立即呼叫為false而其後之呼叫永不settle, 以pmTimeout包裝: pmTimeout逾時reject, 逾次後計時器停止而行程自然結束 [規則13、5]`, function() {
        //以是否被逾時終止判定(殘留之interval會使行程永不結束), 不以牆鐘門檻判定, 避免並行高負載誤判
        let { r, status, signal } = runPmSettle('waitFunHangExit', 'natural')
        //R-PM-SETTLE-01 規則5: 失敗路徑之清理(計時器); 規則13: 需逾時者以pmTimeout包裝; JSDoc waitFun:18「fun回傳永不settle之Promise時亦不settle…計數超過attemptNum後停止計時器」
        assert.strict.deepStrictEqual({ status, signal }, { status: 0, signal: null })
        //R-PM-SETTLE-01 規則13: 不再累積呼叫(立即1次+輪詢1次); pmTimeout JSDoc「逾時則reject一個code為'TIMEOUT'之Error」
        assert.strict.deepStrictEqual(r.out, { s: 'reject', code: 'TIMEOUT', calls: 2 })
        //R-PM-SETTLE-01 規則2
        assert.strict.deepStrictEqual({ unhandled: r.unhandled, uncaught: r.uncaught }, { unhandled: [], uncaught: [] })
    })

    it(`觀察回調: 依序通知呼叫、週期(含busy)、結果、停止與settle之原因; 未傳回調或回調拋錯、回傳rejection、非函數時結果相同 [R-TRACE-01]`, async function() {
        //JSDoc waitFun opt.onTrace; R-TRACE-01 P3(未傳回調時行為不變)、P4(回調之拋錯與回傳值不影響結果、不產生未處理之rejection); 以假時鐘使各次之時序相同(P5)
        let slow = () => new Promise((resolve) => setTimeout(() => resolve(false), 250))
        let scenarios = () => {
            let i = 0
            let k = 0
            return [
                ['resolve3', () => {
                    i++
                    return i >= 3
                }, { timeInterval: 100 }, 400],
                ['exceeded', () => false, { attemptNum: 2, timeInterval: 100 }, 400],
                ['tickError', async () => {
                    k++
                    if (k === 2) {
                        throw new Error('boom')
                    }
                    return false
                }, { timeInterval: 100 }, 300],
                ['slowBusy', slow, { attemptNum: 3, timeInterval: 100 }, 1000],
                ['invalid', 'abc', {}, 10],
                ['immediateThrow', () => {
                    throw new Error('first')
                }, {}, 10],
            ]
        }
        //ats, 紀錄器那次各情境settle時已收到之事件數, 供驗證settle發生於最後一個事件(resolve或reject)之後
        let ats = {}
        let run = async (onTrace, count) => {
            let out = {}
            for (let [name, fun, opt, ms] of scenarios()) {
                let clock = useFakeClock()
                try {
                    let res = null
                    let calls = 0
                    let f = fun
                    if (typeof fun === 'function') {
                        f = (...args) => {
                            calls++
                            return fun(...args)
                        }
                    }
                    let fin = (v) => {
                        res = v
                        if (count) {
                            ats[name] = count(name)
                        }
                    }
                    waitFun(f, { ...opt, onTrace: onTrace ? onTrace(name) : undefined }).then(() => {
                        fin('resolve')
                    }, (e) => {
                        fin(`reject:${e instanceof Error ? e.message : e}`)
                    })
                    await clock.advance(ms)
                    out[name] = [res, calls]
                }
                finally {
                    clock.restore()
                }
            }
            return out
        }
        let un = []
        let onUn = (v) => un.push(String(v))
        process.on('unhandledRejection', onUn)
        let recs = {}
        let outs = []
        try {
            outs.push(await run(null))
            outs.push(await run((name) => {
                recs[name] = traceRec()
                return recs[name].on
            }, (name) => recs[name].events.length))
            outs.push(await run(() => () => {
                throw new Error('trace boom')
            }))
            outs.push(await run(() => () => Promise.reject(new Error('trace reject'))))
            outs.push(await run(() => 'abc'))
            await new Promise((resolve) => setImmediate(resolve))
        }
        finally {
            process.removeListener('unhandledRejection', onUn)
        }
        let expOut = {
            resolve3: ['resolve', 3],
            exceeded: ['reject:exceeded attemptNum[2]', 4],
            tickError: ['reject:boom', 2],
            slowBusy: ['reject:exceeded attemptNum[3]', 3],
            invalid: ['reject:waitfunction需輸入函數f', 0],
            immediateThrow: ['reject:first', 1],
        }
        assert.strict.deepStrictEqual([outs, un], [[expOut, expOut, expOut, expOut, expOut], []])
        let pick = (e) => [e.type, e.n, ...(e.type === 'tick' ? [e.busy] : e.type === 'result' ? [e.ok] : e.type === 'reject' ? [e.reason] : [])]
        let seq = Object.fromEntries(Object.entries(recs).map(([k, v]) => [k, v.events.map(pick)]))
        assert.strict.deepStrictEqual(seq, {
            resolve3: [['call', 0], ['result', 0, false], ['tick', 1, false], ['call', 1], ['result', 1, false], ['tick', 2, false], ['call', 2], ['result', 2, true], ['resolve', 2]],
            exceeded: [['call', 0], ['result', 0, false], ['tick', 1, false], ['call', 1], ['result', 1, false], ['tick', 2, false], ['call', 2], ['result', 2, false], ['tick', 3, false], ['call', 3], ['result', 3, false], ['reject', 3, 'exceeded']],
            tickError: [['call', 0], ['result', 0, false], ['tick', 1, false], ['call', 1], ['reject', 1, 'error']],
            //慢於週期: 執行中之週期只計次(busy), 計數超過attemptNum而仍執行中時停止計時器, 該次完成時reject
            slowBusy: [['call', 0], ['result', 0, false], ['tick', 1, false], ['call', 1], ['tick', 2, true], ['tick', 3, true], ['result', 3, false], ['tick', 4, false], ['call', 4], ['tick', 5, true], ['stop', 5], ['result', 5, false], ['reject', 5, 'exceeded']],
            invalid: [['reject', 0, 'invalid']],
            immediateThrow: [['call', 0], ['reject', 0, 'error']],
        })
        //settle於最後一個事件(resolve或reject)之後: 逾次者於該次呼叫完成時才reject, 不於執行中之週期reject(規則13)
        assert.strict.deepStrictEqual(Object.keys(recs).filter((k) => ats[k] !== recs[k].events.length), [])
        //事件為凍結物件
        assert.strict.deepStrictEqual(Object.values(recs).every((v) => v.events.every((e) => Object.isFrozen(e))), true)
    })

    it(`fun非函數(7值)時reject字串'waitfunction需輸入函數f' [規則12]`, async function() {
        for (let v of [undefined, null, 0, 'abc', {}, Promise.resolve(1), async function* () {}]) {
            let r = await waitFun(v).then(() => 'resolve', (e) => e)
            //R-PM-SETTLE-01 規則12: waitFun reject字串(寫入JSDoc); JSDoc waitFun:18「fun非函數時reject字串'waitfunction需輸入函數f'」
            assert.strict.deepStrictEqual(r, 'waitfunction需輸入函數f')
        }
    })

})
