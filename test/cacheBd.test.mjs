import assert from 'assert'
import delay from '../src/delay.mjs'
import cacheBd from '../src/cacheBd.mjs'
import { runPmSettle } from './tools/pmSettleRun.mjs'
import { traceRec, useFakeClock } from './tools/timeKit.mjs'


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

    //test3之結果取決於pm1之輪詢鏈(1ms+3×1000ms)與pm2之get(3500ms)之先後, 時間本身即規格, 以假時鐘推進並以觀察回調(onTrace)斷言事件內容與順序(R-TRACE-01 P5); 原以真實計時器, 負載下輪詢鏈累積遲到即改變先後
    //runFake, 啟用假時鐘執行test並推進ms毫秒, 回傳其結果; 推進後仍未完成即報錯(假時鐘不自行前進, 否則將懸置至逾時且未還原時鐘)
    async function runFake(test, ms, onTrace) {
        let clock = useFakeClock()
        try {
            let p = Promise.resolve(test(onTrace))
            let done = false
            p.then(() => {
                done = true
            }, () => {
                done = true
            })
            await clock.advance(ms)
            if (!done) {
                throw new Error(`test not settled within ${ms}ms of fake time`)
            }
            return await p
        }
        finally {
            clock.restore()
        }
    }

    //recAt, 觀察回調之紀錄器, 事件附上假時鐘之虛擬時刻(Date.now()); lines()回傳'時刻 事件'字串陣列; 時刻即虛擬毫秒, 時間本身即規格
    function recAt() {
        let tr = traceRec()
        let at = []
        let on = (e) => {
            at.push(Date.now())
            tr.on(e)
        }
        let fmt = (e) => {
            if (e.type === 'poll') {
                return `poll c${e.call}#${e.i}` + (e.cached ? ' cached' : '') + (e.running > 0 ? ` running=${e.running}` : '') + (e.trigger ? ' trigger' : '')
            }
            if (e.type === 'get') {
                return `get s${e.seq}`
            }
            if (e.type === 'done') {
                return `done s${e.seq} ` + (e.ok ? 'ok' : 'fail') + ' ' + (e.cached ? 'cached' : 'uncached')
            }
            return `settle c${e.call} ` + (e.ok ? 'ok' : 'fail')
        }
        let lines = () => {
            return tr.events.map((e, i) => `${at[i]} ${fmt(e)}`)
        }
        return { on, tr, lines }
    }

    let test3 = async (onTrace) => {
        let ms = []

        let fun = async(p1, p2) => {
            await delay(300)
            return `${p1}:${p2}`
        }

        let bc = cacheBd(fun, { onTrace })
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
        let rec = recAt()
        let ms = await runFake(test3, 6500, rec.on)
        assert.strict.deepStrictEqual(ms, ms3)
        //JSDoc「getFromCache於嘗試nTrigger次之後，若尚無快取且無任何執行中之get…才觸發get」「每次間隔1000ms」: pm1(1ms)第1~3次嘗試(1、1001、2001ms)不觸發, 第4次(3001ms)無快取且無執行中之get而觸發get(seq1, 早於pm2之get 3500ms), 於3301ms結束並寫入快取, pm1取得快取而結束; pm2(3500ms)之get為seq2, 於3800ms結束並覆蓋快取; pm3(4500ms)第1次嘗試即有快取而結束
        assert.strict.deepStrictEqual(rec.lines(), [
            '1 poll c1#1',
            '1001 poll c1#2',
            '2001 poll c1#3',
            '3001 poll c1#4 trigger',
            '3001 get s1',
            '3301 done s1 ok cached',
            '3301 settle c1 ok',
            '3500 get s2',
            '3800 done s2 ok cached',
            '4500 poll c2#1 cached',
            '4500 settle c2 ok',
        ])
    })

    //快取之有無以「是否已有結果」判定, 不以值判定(JSDoc: fun成功回傳之任何值含null與undefined皆視為已有快取); 假時鐘下計時器不自行前進, 若未視為已有快取則getFromCache持續輪詢, 故先讓出一次, 未完成再推進以得nMax逾限之明確失敗訊息
    it(`should treat any value returned by fun, including null, undefined and falsy values, as a cache`, async function() {
        let clock = useFakeClock()
        try {
            let out = []
            for (let [label, v] of [['null', null], ['undefined', undefined], ['0', 0], ['empty string', ''], ['false', false], ['NaN', NaN]]) {
                let rec = recAt()
                let bc = cacheBd(async () => v, { nMax: 3, onTrace: rec.on })
                await bc.get() //直接get一次寫入快取
                let done = false
                let pm = bc.getFromCache().then((x) => ({ x }), (e) => ({ err: e.message }))
                pm.then(() => {
                    done = true
                })
                await new Promise((resolve) => setImmediate(resolve))
                if (!done) {
                    await clock.advance(3000) //未視為已有快取: 輪詢3次(每次1000ms)後超過nMax而reject
                }
                let r = await pm
                out.push({
                    label,
                    r,
                    pollCached: rec.tr.events.filter((e) => e.type === 'poll').map((e) => e.cached),
                    settleOk: rec.tr.events.filter((e) => e.type === 'settle').map((e) => e.ok),
                })
            }
            //已有快取時getFromCache第1次嘗試即取得(poll之cached為true)且取得該值本身
            let exp = (label, v) => ({ label, r: { x: v }, pollCached: [true], settleOk: [true] })
            assert.strict.deepStrictEqual(out, [exp('null', null), exp('undefined', undefined), exp('0', 0), exp('empty string', ''), exp('false', false), exp('NaN', NaN)])
        }
        finally {
            clock.restore()
        }
    })

    it(`should stop polling after the get triggered by getFromCache returns null, running fun only once`, async function() {
        //JSDoc 「嘗試nTrigger次之後，若尚無快取且無任何執行中之get才觸發get」: 觸發之get成功回傳null即為已有快取, 第4次嘗試(3000ms)觸發後即結束, 不再觸發第2次
        let clock = useFakeClock()
        try {
            let rec = recAt()
            let calls = 0
            let bc = cacheBd(async () => {
                calls++
                return null
            }, { nMax: 10, onTrace: rec.on })
            let pm = bc.getFromCache().then((x) => ({ x }), (e) => ({ err: e.message }))
            await clock.advance(3000)
            //讓出一次後仍未完成則回'stuck', 免懸置
            let r = await Promise.race([pm, new Promise((resolve) => setImmediate(() => resolve('stuck')))])
            assert.strict.deepStrictEqual([r, calls], [{ x: null }, 1])
            assert.strict.deepStrictEqual(rec.lines(), [
                '0 poll c1#1',
                '1000 poll c1#2',
                '2000 poll c1#3',
                '3000 poll c1#4 trigger',
                '3000 get s1',
                '3000 done s1 ok cached',
                '3000 settle c1 ok',
            ])
        }
        finally {
            clock.restore()
        }
    })

    it(`should behave the same without onTrace, with a recording onTrace, and with a throwing, rejecting or invalid onTrace`, async function() {
        //R-TRACE-01 P3: 未傳觀察回調時之對外行為不變(cacheBd(fun)可省略opt, 見同檔其他案); P4: 回調之拋錯與回傳值不影響快取、不產生未處理之rejection; 以假時鐘使各次之時序相同
        let un = []
        let onUn = (v) => un.push(String(v))
        process.on('unhandledRejection', onUn)
        let rs = []
        let rec = recAt()
        try {
            for (let onTrace of [undefined, rec.on, () => {
                throw new Error('trace boom')
            }, () => Promise.reject(new Error('trace reject')), 'abc']) {
                rs.push(await runFake(test3, 6500, onTrace))
            }
            await new Promise((resolve) => setImmediate(resolve))
            assert.strict.deepStrictEqual(rec.tr.events.length > 0, true)
        }
        finally {
            process.removeListener('unhandledRejection', onUn)
        }
        assert.strict.deepStrictEqual([rs, un], [[ms3, ms3, ms3, ms3, ms3], []])
    })

    it(`should notify polls, gets, dones and settles through onTrace with frozen events of primitive fields and no receiver`, async function() {
        //JSDoc opt.onTrace: 事件為凍結物件{ type, ... }, 欄位依type列舉且只含數字與布林; 回調不帶接收者呼叫(R-TRACE-01 P4: 唯讀快照、最少欄位、不暴露內部可變狀態)
        let clock = useFakeClock()
        try {
            let meta = []
            let rec = recAt()
            let onTrace = function(e) {
                meta.push([this, Object.isFrozen(e)])
                rec.on(e)
            }
            let fun = async (ms) => {
                await delay(Math.abs(ms))
                if (ms < 0) {
                    throw new Error('down')
                }
                return ms
            }

            //直接呼叫之get: 先啟動(seq1, 500ms)而後完成者不覆蓋後啟動(seq2, 100ms)已寫入之快取(cached:false); 失敗之get(seq3)ok:false; 有快取時getFromCache第1次嘗試即結束
            let bc = cacheBd(fun, { nMax: 2, nTrigger: 1, onTrace })
            let p1 = bc.get(500)
            let p2 = bc.get(100)
            await clock.advance(500)
            await p1
            await p2
            let p3 = bc.get(-50).catch(() => {})
            await clock.advance(50)
            await p3
            //已有快取時僅微任務即結束; 假時鐘下計時器不自行前進, 若無快取則懸置, 以setImmediate判定而回'stuck', 免懸置至逾時且未還原時鐘
            let r1 = await Promise.race([bc.getFromCache(1), new Promise((resolve) => setImmediate(() => resolve('stuck')))])

            //無快取且有執行中之直接get(1800ms後失敗): 超過nTrigger之嘗試(第2次)因有執行中之get而不觸發; 超過nMax仍無快取而reject(settle之ok:false)
            let bc2 = cacheBd(fun, { nMax: 2, nTrigger: 1, onTrace })
            let p4 = bc2.get(-1800).catch(() => {})
            let p5 = bc2.getFromCache(1).then(() => 'resolve', (e) => e.message)
            await clock.advance(2100)
            await p4
            let r2 = await p5

            assert.strict.deepStrictEqual([r1, r2], [100, 'exceeded nMax[2]'])
            assert.strict.deepStrictEqual(rec.lines(), [
                '0 get s1',
                '0 get s2',
                '100 done s2 ok cached',
                '500 done s1 ok uncached',
                '500 get s3',
                '550 done s3 fail uncached',
                '550 poll c1#1 cached',
                '550 settle c1 ok',
                '550 get s1',
                '550 poll c1#1 running=1',
                '1550 poll c1#2 running=1',
                '2350 done s1 fail uncached',
                '2550 settle c1 fail',
            ])
            //各type之欄位固定且皆為原始值
            let keys = {}
            for (let e of rec.tr.events) {
                keys[e.type] = Object.keys(e).join(',')
                assert.strict.deepStrictEqual(Object.values(e).every((v) => v === null || typeof v !== 'object'), true)
            }
            assert.strict.deepStrictEqual(keys, {
                poll: 'type,call,i,cached,running,trigger',
                get: 'type,seq',
                done: 'type,seq,ok,cached',
                settle: 'type,call,ok',
            })
            assert.strict.deepStrictEqual(meta.every(([self, frozen]) => self === undefined && frozen), true)
        }
        finally {
            clock.restore()
        }
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
