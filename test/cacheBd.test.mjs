import assert from 'assert'
import delay from '../src/delay.mjs'
import cacheBd from '../src/cacheBd.mjs'
import { runPmSettle } from './tools/pmSettleRun.mjs'


describe(`cacheBd`, function() {

    let test1 = async () => {
        let ms = []

        let fun = async(p1, p2) => {
            await delay(300)
            return `${p1}:${p2}`
        }

        let bc = cacheBd(fun)
        let execFun = bc.get
        let execFunCache = bc.getFromCache

        let pm1 = execFunCache(123, 'abc') //pm1執行取得快取, 因無快取將持續等待
        pm1
            .then((res) => {
            // console.log('res', res)
                ms.push({ result: `pm1-${res}` })
            })

        let pm2 = execFun(4.56, 'def') //pm2執行原本函數與使用輸入, 會最先回傳, 且更新快取給等待或之後取得快取使用
        pm2
            .then((res) => {
            // console.log('res', res)
                ms.push({ result: `pm2-${res}` })
            })

        let pm3 = execFunCache(78.9, 'xyz') //pm3執行取得快取, 因已有快取將直接取得快取
        pm3
            .then((res) => {
            // console.log('res', res)
                ms.push({ result: `pm3-${res}` })
            })

        await Promise.all([pm1, pm2, pm3])
        // console.log('rs', rs)

        // console.log('ms', ms)
        return ms
    }
    // await test1()
    let ms1 = [
        { result: 'pm2-4.56:def' },
        { result: 'pm1-4.56:def' },
        { result: 'pm3-4.56:def' }
    ]
    it(`should return '${JSON.stringify(ms1)}' when run test1'`, async function() {
        let ms = await test1()
        assert.strict.deepStrictEqual(ms, ms1)
    })

    let test2 = async () => {
        let ms = []

        let fun = async(p1, p2) => {
            await delay(300)
            return `${p1}:${p2}`
        }

        let bc = cacheBd(fun)
        let execFun = bc.get
        let execFunCache = bc.getFromCache

        setTimeout(() => {
            // console.log('pm1 exec..')
            let pm1 = execFunCache(123, 'abc') //pm1執行取得快取, 因無快取將持續等待
            pm1
                .then((res) => {
                    // console.log('pm1 then', res)
                    ms.push({ result: `pm1-${res}` })
                })
        }, 1)

        setTimeout(() => {
            // console.log('pm2 exec..')
            let pm2 = execFun(4.56, 'def') //1000ms後, pm2執行原本函數與使用輸入, 會最先回傳, 且更新快取給等待或之後取得快取使用
            pm2
                .then((res) => {
                    // console.log('pm2 then', res)
                    ms.push({ result: `pm2-${res}` })
                })
        }, 1000)

        setTimeout(() => {
            // console.log('pm3 exec..')
            let pm3 = execFunCache(78.9, 'xyz') //pm3執行取得快取, 因已有快取將直接取得快取
            pm3
                .then((res) => {
                    // console.log('pm3 then', res)
                    ms.push({ result: `pm3-${res}` })
                })
        }, 3000)

        await delay(5000)

        // console.log('ms', ms)
        return ms
    }
    // await test2()
    let ms2 = [
        { result: 'pm2-4.56:def' },
        { result: 'pm1-4.56:def' },
        { result: 'pm3-4.56:def' }
    ]
    it(`should return '${JSON.stringify(ms2)}' when run test2'`, async function() {
        let ms = await test2()
        assert.strict.deepStrictEqual(ms, ms2)
    })

    let test3 = async () => {
        let ms = []

        let fun = async(p1, p2) => {
            await delay(300)
            return `${p1}:${p2}`
        }

        let bc = cacheBd(fun)
        let execFun = bc.get
        let execFunCache = bc.getFromCache

        setTimeout(() => {
            // console.log('pm1 exec..')
            let pm1 = execFunCache(123, 'abc') //pm1執行取得快取, 因無快取將持續等待, 3000ms將執行get與自己的輸入, 並最先回傳
            pm1
                .then((res) => {
                    // console.log('pm1 then', res)
                    ms.push({ result: `pm1-${res}` })
                })
        }, 1)

        setTimeout(() => {
            // console.log('pm2 exec..')
            let pm2 = execFun(4.56, 'def') //3500ms後, pm2執行原本函數與使用輸入, 計算完畢則會覆蓋快取, 此快取將再給等待或之後取得快取使用
            pm2
                .then((res) => {
                    // console.log('pm2 then', res)
                    ms.push({ result: `pm2-${res}` })
                })
        }, 3500)

        setTimeout(() => {
            // console.log('pm3 exec..')
            let pm3 = execFunCache(78.9, 'xyz') //pm3執行取得快取, 因已有快取將直接取得快取
            pm3
                .then((res) => {
                    // console.log('pm3 then', res)
                    ms.push({ result: `pm3-${res}` })
                })
        }, 4500)

        await delay(6500)

        // console.log('ms', ms)
        return ms
    }
    // await test3()
    let ms3 = [
        { result: 'pm1-123:abc' },
        { result: 'pm2-4.56:def' },
        { result: 'pm3-4.56:def' }
    ]
    it(`should return '${JSON.stringify(ms3)}' when run test3'`, async function() {
        let ms = await test3()
        assert.strict.deepStrictEqual(ms, ms3)
    })

})


describe(`cacheBd settle(R-PM-SETTLE-01)`, function() {

    it(`cacheBd: 取值失敗後解除lock, getFromCache之後續嘗試可取得 [規則5]`, function() {
        let { r } = runPmSettle('cacheBdRetry')
        assert.strict.deepStrictEqual(r.out, { s: 'resolve', v: 'value', calls: 2 })
    })

})


describe(`cacheBd 並發與寫入序(R-PM-SETTLE-01規則15)`, function() {

    it(`5個getFromCache並行且fun耗時600ms: 只觸發1次get且皆取得同值 [規則15]`, function() {
        let { r } = runPmSettle('cacheBdSingleFlight')
        //R-PM-SETTLE-01 規則15: getFromCache只在無任何執行中之get時才觸發; JSDoc cacheBd:18「getFromCache於嘗試nTrigger次之後，若尚無快取且無任何執行中之get(含直接呼叫者)才觸發get」
        let v0 = { s: 'resolve', v: 'v0' }
        assert.strict.deepStrictEqual(r.out, { calls: 1, results: [v0, v0, v0, v0, v0] })
        //R-PM-SETTLE-01 規則2
        assert.strict.deepStrictEqual({ unhandled: r.unhandled, uncaught: r.uncaught }, { unhandled: [], uncaught: [] })
    })

    it(`getFromCache觸發之慢get執行中, 其間直接get失敗結束: 另一getFromCache仍不觸發 [規則15]`, function() {
        let { r } = runPmSettle('cacheBdNoTriggerWhileRunning')
        //R-PM-SETTLE-01 規則15: 以執行中之get之Promise集合取代布林lock, 有任一執行中之get(含直接呼叫之get)時不觸發; 直接get失敗仍向外報錯
        assert.strict.deepStrictEqual(r.out, { calls: 2, A: { s: 'resolve', v: 'v0' }, D: { s: 'reject', v: 'down1' }, B: { s: 'resolve', v: 'v0' } })
        //R-PM-SETTLE-01 規則2
        assert.strict.deepStrictEqual({ unhandled: r.unhandled, uncaught: r.uncaught }, { unhandled: [], uncaught: [] })
    })

    it(`先啟動之慢get晚於後啟動之快get完成: 各get回傳自身之結果, 快取為後啟動者之值 [規則15]`, function() {
        let { r } = runPmSettle('cacheBdSeqGuard')
        //R-PM-SETTLE-01 規則15: 寫入快取以遞增之啟動序號守門, 啟動序號小於已寫入者之結果不覆蓋快取, get本身仍回傳其自身之結果; JSDoc cacheBd:18「先啟動而後完成者之結果不覆蓋後啟動者已寫入之快取」
        assert.strict.deepStrictEqual(r.out, { old: { s: 'resolve', v: 'v0' }, new: { s: 'resolve', v: 'v1' }, cache: { s: 'resolve', v: 'v1' } })
    })

    it(`直接呼叫之get失敗而呼叫端未接: 成為1則未處理之rejection, 不被本函數吞下 [規則15]`, function() {
        let { r } = runPmSettle('cacheBdDirectGetUncaught')
        //R-PM-SETTLE-01 規則15: get本身仍回傳其自身之結果, 失敗仍向外報錯(以登記記號判定執行中, 不於回傳之Promise上掛處理器, 呼叫端未接之失敗同HEAD與cache.get、pmQueue成為unhandledRejection); JSDoc cacheBd:18「get為直接執行fun並回傳其自身之結果(失敗則reject其錯誤)」
        assert.strict.deepStrictEqual({ unhandled: r.unhandled, uncaught: r.uncaught }, { unhandled: ['direct-fail'], uncaught: [] })
    })

    it(`fun同步拋錯之直接get失敗後, getFromCache之後續嘗試仍可觸發並取得 [規則15]`, function() {
        let { r } = runPmSettle('cacheBdSyncThrowRetry')
        //R-PM-SETTLE-01 規則15: 執行中之登記於該次get落定時移除, 失敗亦移除而可重試(fun同步拋錯亦同); 失敗仍向外報錯
        assert.strict.deepStrictEqual(r.out, { direct: { s: 'reject', v: 'sync-transient' }, fromCache: { s: 'resolve', v: 'value' }, calls: 2 })
        //R-PM-SETTLE-01 規則2
        assert.strict.deepStrictEqual({ unhandled: r.unhandled, uncaught: r.uncaught }, { unhandled: [], uncaught: [] })
    })

    it(`fun非函數時get以TypeError被reject, getFromCache輪詢至nMax後reject Error('exceeded nMax[nMax]') [規則12]`, async function() {
        let bc = cacheBd('abc', { nMax: 2, nTrigger: 1 })
        let r1 = await bc.get().then(() => 'resolve', (e) => (e instanceof TypeError ? 'TypeError' : String(e)))
        let r2 = await bc.getFromCache().then(() => 'resolve', (e) => (e instanceof Error ? e.message : String(e)))
        //R-PM-SETTLE-01 規則12: cacheBd.get以TypeError reject而getFromCache輪詢至nMax(寫入JSDoc); JSDoc cacheBd:18「fun非函數時get以TypeError被reject，getFromCache吞下其錯誤而持續輪詢至nMax後reject」
        assert.strict.deepStrictEqual({ r1, r2 }, { r1: 'TypeError', r2: 'exceeded nMax[2]' })
    })

})
