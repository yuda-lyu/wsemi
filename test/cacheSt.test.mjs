import assert from 'assert'
import delay from '../src/delay.mjs'
import cacheSt from '../src/cacheSt.mjs'


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

})
