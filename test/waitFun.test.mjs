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
