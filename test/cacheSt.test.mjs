import assert from 'assert'
import delay from '../src/delay.mjs'
import cacheSt from '../src/cacheSt.mjs'
import { runPmSettle } from './tools/pmSettleRun.mjs'
import { traceRec, useFakeClock } from './tools/timeKit.mjs'


describe(`cacheSt`, function() {

    //test1: 基本CRUD - set/get/check/del
    let test1 = async () => {
        let ms = []

        let cs = cacheSt({ timeExpire: 60000 })

        await cs.set('a', 'val-a')
        ms.push({ 'get a': await cs.get('a') })
        ms.push({ 'check a': await cs.check('a') })
        ms.push({ 'check b': await cs.check('b') })
        ms.push({ 'get b (none)': await cs.get('b') })
        await cs.del('a')
        ms.push({ 'check a after del': await cs.check('a') })
        ms.push({ 'get a after del': await cs.get('a') })

        cs.clear()
        // console.log('ms', ms)
        return ms
    }
    // await test1()
    let ms1 = [
        { 'get a': 'val-a' },
        { 'check a': true },
        { 'check b': false },
        { 'get b (none)': null },
        { 'check a after del': false },
        { 'get a after del': null },
    ]
    it(`should return '${JSON.stringify(ms1)}' when run test1'`, async function() {
        let ms = await test1()
        assert.strict.deepStrictEqual(ms, ms1)
    })

    //test2: checkWithSet 原子性mutex取得釋放
    let test2 = async () => {
        let ms = []

        let cs = cacheSt({ timeExpire: 60000 })

        ms.push({ '1st checkWithSet': cs.checkWithSet('lock') })
        ms.push({ '2nd checkWithSet': cs.checkWithSet('lock') })
        await cs.del('lock')
        ms.push({ 'after del': cs.checkWithSet('lock') })

        cs.clear()
        return ms
    }
    let ms2 = [
        { '1st checkWithSet': true },
        { '2nd checkWithSet': false },
        { 'after del': true },
    ]
    it(`should return '${JSON.stringify(ms2)}' when run test2'`, async function() {
        let ms = await test2()
        assert.strict.deepStrictEqual(ms, ms2)
    })

    //test3: setWithFree 多key原子占用 + fn成功 + 自動釋放
    let test3 = async () => {
        let ms = []

        let cs = cacheSt({ timeExpire: 60000 })

        let r = await cs.setWithFree(['k1', 'k2'], async () => {
            ms.push({ 'k1 inside': await cs.check('k1') })
            ms.push({ 'k2 inside': await cs.check('k2') })
            return 'result-x'
        })
        ms.push({ result: r })
        ms.push({ 'k1 after': await cs.check('k1') })
        ms.push({ 'k2 after': await cs.check('k2') })

        cs.clear()
        return ms
    }
    let ms3 = [
        { 'k1 inside': true },
        { 'k2 inside': true },
        { result: 'result-x' },
        { 'k1 after': false },
        { 'k2 after': false },
    ]
    it(`should return '${JSON.stringify(ms3)}' when run test3'`, async function() {
        let ms = await test3()
        assert.strict.deepStrictEqual(ms, ms3)
    })

    //test4: setWithFree 衝突時 rollback 已占之 keys
    let test4 = async () => {
        let ms = []

        let cs = cacheSt({ timeExpire: 60000 })

        cs.checkWithSet('k2') //預先占用 k2

        try {
            await cs.setWithFree(['k1', 'k2'], async () => {
                ms.push({ inside: 'should not reach' })
                return 'x'
            })
        }
        catch (err) {
            ms.push({ rejected: err })
        }
        ms.push({ 'k1 after (should be rolled back)': await cs.check('k1') })
        ms.push({ 'k2 after (preoccupied)': await cs.check('k2') })

        cs.clear()
        return ms
    }
    let ms4 = [
        { rejected: 'setWithFree: key in use: k2' },
        { 'k1 after (should be rolled back)': false },
        { 'k2 after (preoccupied)': true },
    ]
    it(`should return '${JSON.stringify(ms4)}' when run test4'`, async function() {
        let ms = await test4()
        assert.strict.deepStrictEqual(ms, ms4)
    })

    //test5: setWithFree fn拋錯時 finally 仍釋放 locks 且 err 向外傳遞
    let test5 = async () => {
        let ms = []

        let cs = cacheSt({ timeExpire: 60000 })

        try {
            await cs.setWithFree(['k1', 'k2'], async () => {
                throw new Error('boom')
            })
        }
        catch (err) {
            ms.push({ caught: err.message })
        }
        ms.push({ 'k1 after (should be released)': await cs.check('k1') })
        ms.push({ 'k2 after (should be released)': await cs.check('k2') })

        cs.clear()
        return ms
    }
    let ms5 = [
        { caught: 'boom' },
        { 'k1 after (should be released)': false },
        { 'k2 after (should be released)': false },
    ]
    it(`should return '${JSON.stringify(ms5)}' when run test5'`, async function() {
        let ms = await test5()
        assert.strict.deepStrictEqual(ms, ms5)
    })

    //test6: waitExist 等到 key 出現後 resolve
    let test6 = async () => {
        let ms = []

        let cs = cacheSt({ timeExpire: 60000 })

        setTimeout(() => {
            cs.set('ready', 'data-y')
        }, 200)

        await cs.waitExist('ready', { attemptNum: 30, timeInterval: 100 })
        ms.push({ 'value after waitExist': await cs.get('ready') })

        cs.clear()
        return ms
    }
    let ms6 = [
        { 'value after waitExist': 'data-y' },
    ]
    it(`should return '${JSON.stringify(ms6)}' when run test6'`, async function() {
        let ms = await test6()
        assert.strict.deepStrictEqual(ms, ms6)
    })

    //test7: waitExist 超時 reject (字串訊息以 'waitExist timeout' 開頭)
    let test7 = async () => {
        let ms = []

        let cs = cacheSt({ timeExpire: 60000 })

        try {
            await cs.waitExist('never', { attemptNum: 5, timeInterval: 50 })
            ms.push({ 'should not reach': true })
        }
        catch (err) {
            ms.push({ 'is string': typeof err === 'string' })
            ms.push({ 'starts with prefix': typeof err === 'string' && err.startsWith('waitExist timeout') })
        }

        cs.clear()
        return ms
    }
    let ms7 = [
        { 'is string': true },
        { 'starts with prefix': true },
    ]
    it(`should return '${JSON.stringify(ms7)}' when run test7'`, async function() {
        let ms = await test7()
        assert.strict.deepStrictEqual(ms, ms7)
    })

    //test8: waitNotExist 等到 key 消失後 resolve
    let test8 = async () => {
        let ms = []

        let cs = cacheSt({ timeExpire: 60000 })

        await cs.set('temp', 'pending')
        setTimeout(() => {
            cs.del('temp')
        }, 200)

        await cs.waitNotExist('temp', { attemptNum: 30, timeInterval: 100 })
        ms.push({ 'check after waitNotExist': await cs.check('temp') })

        cs.clear()
        return ms
    }
    let ms8 = [
        { 'check after waitNotExist': false },
    ]
    it(`should return '${JSON.stringify(ms8)}' when run test8'`, async function() {
        let ms = await test8()
        assert.strict.deepStrictEqual(ms, ms8)
    })

    //test9: TTL 偵測 - key 超過 timeExpire 後被內部 setInterval 自動刪除
    let test9 = async () => {
        let ms = []

        //timeExpire=100ms, timeDetect=50ms - 偵測週期短於過期, 確保被偵測到
        let cs = cacheSt({ timeExpire: 100, timeDetect: 50 })

        await cs.set('shortLived', 'will-expire')
        ms.push({ 'right after set': await cs.check('shortLived') })

        await delay(300) //等過 timeExpire + 至少 5 個偵測週期
        ms.push({ 'after expire': await cs.check('shortLived') })

        cs.clear()
        return ms
    }
    let ms9 = [
        { 'right after set': true },
        { 'after expire': false },
    ]
    it(`should return '${JSON.stringify(ms9)}' when run test9'`, async function() {
        let ms = await test9()
        assert.strict.deepStrictEqual(ms, ms9)
    })

    //key為任意字串, __proto__與Object原型之屬性名(constructor、toString等)亦為一般key: 未set不存在、set後可取回、不影響其他key
    it(`should treat __proto__ and names on Object.prototype as ordinary keys`, async function() {
        let cs = cacheSt({ timeDetect: 1000 })
        try {
            let names = ['__proto__', 'constructor', 'toString', 'hasOwnProperty', 'valueOf']
            for (let k of names) {
                assert.strict.deepStrictEqual(await cs.check(k), false, `check ${k} before set`)
                assert.strict.deepStrictEqual(await cs.get(k), null, `get ${k} before set`)
            }
            assert.strict.deepStrictEqual(cs.checkWithSet('toString'), true)
            assert.strict.deepStrictEqual(await cs.check('toString'), true)
            await cs.set('__proto__', 'v')
            assert.strict.deepStrictEqual(await cs.get('__proto__'), 'v')
            assert.strict.deepStrictEqual(await cs.check('value'), false) //set __proto__不得使未set之key被視為存在
            assert.strict.deepStrictEqual(await cs.check('time'), false)
            await cs.set('constructor', 1)
            assert.strict.deepStrictEqual(await cs.get('constructor'), 1)
            await cs.del('constructor')
            assert.strict.deepStrictEqual(await cs.check('constructor'), false)
            await cs.del('__proto__')
            assert.strict.deepStrictEqual(await cs.check('__proto__'), false)
        }
        finally {
            cs.clear()
        }
    })

    it(`should expire __proto__ like other keys`, async function() {
        let cs = cacheSt({ timeExpire: 100, timeDetect: 50 })
        try {
            await cs.set('__proto__', 1)
            assert.strict.deepStrictEqual(await cs.check('__proto__'), true)
            await delay(300)
            assert.strict.deepStrictEqual(await cs.check('__proto__'), false)
        }
        finally {
            cs.clear()
        }
    })

    //--- 觀察回調(onTrace) ---
    //TTL偵測之到期時刻(timeExpire與timeDetect之比較)本身即規格, 以假時鐘推進並以觀察回調斷言事件內容(R-TRACE-01 P5)

    //recAt, 觀察回調之紀錄器, 事件附上假時鐘之虛擬時刻(Date.now()); lines()回傳'時刻 事件'字串陣列
    function recAt() {
        let tr = traceRec()
        let at = []
        let on = (e) => {
            at.push(Date.now())
            tr.on(e)
        }
        let lines = () => {
            return tr.events.map((e, i) => `${at[i]} ` + (e.type === 'expire' ? `expire ${e.key} age=${e.age}` : `detect#${e.n} size=${e.size} expired=${e.expired}`))
        }
        return { on, tr, lines }
    }

    it(`should notify each expired key and each detection cycle through onTrace`, async function() {
        //JSDoc「key寫入超過此時間後將被內部偵測週期自動刪除」「timeDetect…TTL偵測週期」: timeExpire=100、timeDetect=50, a於0ms寫入、b於70ms寫入; 偵測於50、100、150、...ms; 超過(嚴格大於)100ms才刪除, a於150ms(age150, 100ms時age為100不刪)、b於200ms(age130)刪除; clear後不再偵測
        let clock = useFakeClock()
        try {
            let rec = recAt()
            let cs = cacheSt({ timeExpire: 100, timeDetect: 50, onTrace: rec.on })
            await cs.set('a', 1)
            setTimeout(() => {
                cs.set('b', 2)
            }, 70)
            await clock.advance(260)
            assert.strict.deepStrictEqual(rec.lines(), [
                '50 detect#1 size=1 expired=0',
                '100 detect#2 size=2 expired=0',
                '150 expire a age=150',
                '150 detect#3 size=2 expired=1',
                '200 expire b age=130',
                '200 detect#4 size=1 expired=1',
                '250 detect#5 size=0 expired=0',
            ])
            //JSDoc「回傳事件物件…clear」: clear後不再偵測亦不再通知
            cs.clear()
            let n = rec.tr.events.length
            await clock.advance(200)
            assert.strict.deepStrictEqual(rec.tr.events.length, n)
        }
        finally {
            clock.restore()
        }
    })

    it(`should not notify after clear even within the detection cycle in progress`, async function() {
        //JSDoc opt.onTrace「clear後不再呼叫(含clear時正在進行之偵測週期之餘下部分)」: x、y於150ms同一偵測週期到期, 回調於x之expire事件內呼叫clear, 則y之expire與該週期之detect不再通知
        let clock = useFakeClock()
        try {
            let rec = recAt()
            let cs = null
            cs = cacheSt({
                timeExpire: 100,
                timeDetect: 50,
                onTrace: (e) => {
                    rec.on(e)
                    if (e.type === 'expire') {
                        cs.clear()
                    }
                },
            })
            await cs.set('x', 1)
            await cs.set('y', 2)
            await clock.advance(400)
            assert.strict.deepStrictEqual(rec.lines(), [
                '50 detect#1 size=2 expired=0',
                '100 detect#2 size=2 expired=0',
                '150 expire x age=150',
            ])
        }
        finally {
            clock.restore()
        }
    })

    it(`should behave the same without onTrace, with a recording onTrace, and with a throwing, rejecting or invalid onTrace`, async function() {
        //R-TRACE-01 P3: 未傳觀察回調時之對外行為不變; P4: 回調之拋錯與回傳值不影響快取、不產生未處理之rejection; 以假時鐘使各次之時序相同; 情境含TTL到期(a於150ms、b於200ms)與waitExist(c於90ms寫入, 輪詢20ms間隔, 於101ms輪詢到而resolve)
        let un = []
        let onUn = (v) => un.push(String(v))
        process.on('unhandledRejection', onUn)
        let rs = []
        let rec = recAt()
        let run = async (onTrace) => {
            let clock = useFakeClock()
            try {
                let cs = cacheSt({ timeExpire: 100, timeDetect: 50, onTrace })
                let ms = []
                let snap = async (label) => {
                    ms.push(`${label}:${await cs.check('a')},${await cs.check('b')}`)
                }
                await cs.set('a', 1)
                let pmWait = cs.waitExist('c', { attemptNum: 10, timeInterval: 20 }).then(() => `waitExist@${Date.now()}`, (e) => `waitExist!${e}`) //waitFun之立即呼叫為async, 其setInterval於advance第1次推進後(1ms)才建立, 故輪詢於21、41、...、101ms
                setTimeout(() => {
                    cs.set('b', 2)
                }, 70)
                setTimeout(() => {
                    cs.set('c', 3)
                }, 90)
                for (let t of [40, 120, 160, 220, 260]) {
                    await clock.advance(t - Date.now())
                    await snap(`t${t}`)
                }
                ms.push(await pmWait)
                cs.clear()
                return JSON.stringify(ms)
            }
            finally {
                clock.restore()
            }
        }
        try {
            for (let onTrace of [undefined, rec.on, () => {
                throw new Error('trace boom')
            }, () => Promise.reject(new Error('trace reject')), 'abc']) {
                rs.push(await run(onTrace))
            }
            await new Promise((resolve) => setImmediate(resolve))
            assert.strict.deepStrictEqual(rec.tr.events.length > 0, true)
        }
        finally {
            process.removeListener('unhandledRejection', onUn)
        }
        //a(0ms寫入)於150ms被刪、b(70ms寫入)於200ms被刪: 40ms僅a, 120ms皆在(100ms時a之age為100不刪), 160ms僅b, 220ms起皆無
        let want = JSON.stringify(['t40:true,false', 't120:true,true', 't160:false,true', 't220:false,false', 't260:false,false', 'waitExist@101'])
        assert.strict.deepStrictEqual([rs, un], [[want, want, want, want, want], []])
    })

    it(`should notify expire and detect through onTrace with frozen events of primitive fields and no receiver`, async function() {
        //JSDoc opt.onTrace: 事件為凍結物件{ type, ... }, 欄位依type列舉; 回調不帶接收者呼叫(R-TRACE-01 P4: 唯讀快照、最少欄位、不暴露內部可變狀態)
        let clock = useFakeClock()
        try {
            let meta = []
            let rec = recAt()
            let onTrace = function(e) {
                meta.push([this, Object.isFrozen(e)])
                rec.on(e)
            }
            let cs = cacheSt({ timeExpire: 100, timeDetect: 50, onTrace })
            await cs.set('a', 1)
            await clock.advance(160)
            cs.clear()
            let keys = {}
            for (let e of rec.tr.events) {
                keys[e.type] = Object.keys(e).join(',')
                assert.strict.deepStrictEqual(Object.values(e).every((v) => v === null || typeof v !== 'object'), true)
            }
            assert.strict.deepStrictEqual(keys, {
                detect: 'type,n,size,expired',
                expire: 'type,key,age',
            })
            assert.strict.deepStrictEqual(rec.tr.events.length, 4) //detect#1(50)、detect#2(100)、expire+detect#3(150)
            assert.strict.deepStrictEqual(meta.every(([self, frozen]) => self === undefined && frozen), true)
        }
        finally {
            clock.restore()
        }
    })

})


describe(`cacheSt settle(R-PM-SETTLE-01)`, function() {

    it(`cacheSt: setWithFree之fn以惡意值拒絕時外傳原值且釋放key [規則2、5]`, function() {
        let { r } = runPmSettle('cacheStHostile')
        assert.strict.deepStrictEqual(r.out, { s: 'reject', same: true, freed: true })
    })

})
