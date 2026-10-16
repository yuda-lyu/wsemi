import assert from 'assert'
import waitFun from '../src/waitFun.mjs'
import { runPmSettle } from './tools/pmSettleRun.mjs'


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

        it(`fun(250ms, 恆false)慢於timeInterval(100ms): 最大並行1, 呼叫3次, reject時無執行中之呼叫 [規則13]`, function() {
            //R-PM-SETTLE-01 規則13: 前一次呼叫未完成時該週期不呼叫fun(只計次); 逾次於呼叫完成時判定; JSDoc waitFun:17「前一次呼叫未完成時該週期不呼叫fun(輪詢不重疊)但仍計入嘗試次數」、:18「超過最大嘗試次數時reject字串'exceeded attemptNum[最大嘗試次數]'」
            //呼叫3次: 立即1次(250ms)後啟動輪詢, 第1週期呼叫(執行中之第2、3週期只計次), 第4週期呼叫(執行中之第5、6週期只計次), 其完成時已計6次>5而reject
            assert.strict.deepStrictEqual(r.out.s1, { s: 'reject', v: 'exceeded attemptNum[5]', calls: 3, maxConc: 1, inflightAtSettle: 0 })
        })

        it(`fun同步回傳false: 呼叫attemptNum+2次後reject [規則13]`, function() {
            //R-PM-SETTLE-01 規則13: fun最多被呼叫attemptNum+2次(立即1次+輪詢); JSDoc waitFun:16「故fun最多被呼叫attemptNum+2次」
            assert.strict.deepStrictEqual(r.out.s3, { s: 'reject', v: 'exceeded attemptNum[5]', calls: 7 })
        })

        it(`先啟動之慢輪(500ms)回true, 其間之週期不呼叫: resolve [規則13]`, function() {
            //R-PM-SETTLE-01 規則13: 逾次於呼叫完成時判定(不被其後之週期搶先判逾次); JSDoc waitFun:18「resolve回傳為空代表f函數回傳true」
            assert.strict.deepStrictEqual(r.out.s5, { s: 'resolve', maxConc: 1 })
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

    it(`fun非函數(7值)時reject字串'waitfunction需輸入函數f' [規則12]`, async function() {
        for (let v of [undefined, null, 0, 'abc', {}, Promise.resolve(1), async function* () {}]) {
            let r = await waitFun(v).then(() => 'resolve', (e) => e)
            //R-PM-SETTLE-01 規則12: waitFun reject字串(寫入JSDoc); JSDoc waitFun:18「fun非函數時reject字串'waitfunction需輸入函數f'」
            assert.strict.deepStrictEqual(r, 'waitfunction需輸入函數f')
        }
    })

})
