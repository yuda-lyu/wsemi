import assert from 'assert'
import timemsTZ2past from '../src/timemsTZ2past.mjs'
import { thrownCases } from './tools/codecThrown.mjs'
import { showDeep } from './tools/caseKit.mjs'


describe(`timemsTZ2past`, function() {
    let tNow = '2020-10-18T12:34:56.987+08:00'

    it(`sould return { today: true, msg: '2秒前', err: '' } when input '2020-10-18T12:34:54.987+08:00', ${tNow}`, function() {
        let r = timemsTZ2past('2020-10-18T12:34:54.987+08:00', tNow)
        let rr = { today: true, msg: '2秒前', err: '' }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return { today: true, msg: '2秒前', err: '' } when input '2020-10-18T04:34:54.987+00:00', ${tNow}`, function() {
        let r = timemsTZ2past('2020-10-18T04:34:54.987+00:00', tNow)
        let rr = { today: true, msg: '2秒前', err: '' }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return { today: true, msg: '2秒前', err: '' } when input '2020-10-18T04:34:54.987Z', ${tNow}`, function() {
        let r = timemsTZ2past('2020-10-18T04:34:54.987Z', tNow)
        let rr = { today: true, msg: '2秒前', err: '' }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return { today: true, msg: '2秒前', err: '' } when input '2020-10-18T12:34:55.500+08:00', ${tNow}`, function() {
        let r = timemsTZ2past('2020-10-18T12:34:55.500+08:00', tNow)
        let rr = { today: true, msg: '1秒前', err: '' }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return { today: true, msg: '3分鐘前', err: '' } when input '2020-10-18T12:31:54.987+08:00', ${tNow}`, function() {
        let r = timemsTZ2past('2020-10-18T12:31:54.987+08:00', tNow)
        let rr = { today: true, msg: '3分鐘前', err: '' }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return { today: true, msg: '4小時前', err: '' } when input '2020-10-18T08:31:54.987+08:00', ${tNow}`, function() {
        let r = timemsTZ2past('2020-10-18T08:31:54.987+08:00', tNow)
        let rr = { today: true, msg: '4小時前', err: '' }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return { today: false, msg: '5天前', err: '' } when input '2020-10-13T08:31:54.987+08:00', ${tNow}`, function() {
        let r = timemsTZ2past('2020-10-13T08:31:54.987+08:00', tNow)
        let rr = { today: false, msg: '5天前', err: '' }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return { today: false, msg: '6個月前', err: '' } when input '2020-04-13T08:31:54.987+08:00', ${tNow}`, function() {
        let r = timemsTZ2past('2020-04-13T08:31:54.987+08:00', tNow)
        let rr = { today: false, msg: '6個月前', err: '' }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return { today: false, msg: '7年前', err: '' } when input '2013-04-13T08:31:54.987+08:00', ${tNow}`, function() {
        let r = timemsTZ2past('2013-04-13T08:31:54.987+08:00', tNow)
        let rr = { today: false, msg: '7年前', err: '' }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return { today: null, msg: '', err: '時間未到' } when input '2023-04-13T08:31:54.987+08:00', ${tNow}`, function() {
        let r = timemsTZ2past('2023-04-13T08:31:54.987+08:00', tNow)
        let rr = { today: null, msg: '', err: '時間未到' }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { state: 'success', msg } when the time is computed with returnWithStateAndMsg`, function() {
        //opt為第3參數, 因第2參數tNow為既有參數
        let r = timemsTZ2past('2010-01-02T03:04:05.678+08:00', tNow, { returnWithStateAndMsg: true })
        assert.strict.deepStrictEqual(r.state, 'success')
        assert.strict.deepStrictEqual(r.msg, timemsTZ2past('2010-01-02T03:04:05.678+08:00', tNow))
    })

    it(`should treat 時間未到 as success (it is a computed result, not a failure) with returnWithStateAndMsg`, function() {
        let r = timemsTZ2past('2023-04-13T08:31:54.987+08:00', tNow, { returnWithStateAndMsg: true })
        let rr = { state: 'success', msg: { today: null, msg: '', err: '時間未到' } }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { state: 'error', msg: 'invalid t: must be a time string YYYY-MM-DDTHH:mm:ss.SSS with a time zone (Z, +HH:mm or -HH:mm)' } when input NaN with returnWithStateAndMsg`, function() {
        let r = timemsTZ2past(NaN, tNow, { returnWithStateAndMsg: true })
        let rr = { state: 'error', msg: 'invalid t: must be a time string YYYY-MM-DDTHH:mm:ss.SSS with a time zone (Z, +HH:mm or -HH:mm)' }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return the same V19 message in the err field (default mode) when input NaN`, function() {
        let r = timemsTZ2past(NaN, tNow)
        let rr = { today: null, msg: '', err: 'invalid t: must be a time string YYYY-MM-DDTHH:mm:ss.SSS with a time zone (Z, +HH:mm or -HH:mm)' }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should fallback to the plain return value when returnWithStateAndMsg is not a boolean`, function() {
        let r = timemsTZ2past('2023-04-13T08:31:54.987+08:00', tNow, { returnWithStateAndMsg: 'yes' })
        let rr = { today: null, msg: '', err: '時間未到' }
        assert.strict.deepStrictEqual(r, rr)
    })

})


describe(`timemsTZ2past 非字串之tNow為物件(R-CODEC-ERR-01之2, W-20: 判斷函數只收原始值)`, function() {

    let t = '2020-10-18T12:34:54.987+08:00'

    //tNow由呼叫端給定: 讀其Symbol.toStringTag時拋出指定值之物件(修前isestr以Object.prototype.toString.call判型, 會觸發此getter而拋出, 函數以失敗形狀回報;
    //  修後以typeof判型, 函數不讀物件之任何內容, 視同非字串之tNow改取目前時間, 不拋錯; catch與_errToStr保留為防線, 但呼叫端給定之值已不可能抵達)
    //thrownCases(test/tools/codecThrown.mjs)為呼叫端可拋出之各種值
    let mkTNow = (v, counter) => ({
        get [Symbol.toStringTag]() {
            counter.n++
            throw v
        },
    })

    it(`should not throw, never read the object tNow (its getter is not called) and give the same result as the default tNow whatever it throws on reading Symbol.toStringTag [R-CODEC-ERR-01之2]`, function() {
        let want = showDeep(timemsTZ2past(t, null))
        for (let c of thrownCases) {
            let counter = { n: 0 }
            let r = null
            assert.doesNotThrow(() => {
                r = timemsTZ2past(t, mkTNow(c.mk(), counter))
            }, c.name)
            assert.strict.deepStrictEqual([c.name, counter.n, showDeep(r)], [c.name, 0, want])
        }
    })

    it(`should return { state: 'success', msg: <the default result> } with returnWithStateAndMsg, never an error state, when tNow is such an object [R-CODEC-ERR-01之2]`, function() {
        let want = showDeep(timemsTZ2past(t, null, { returnWithStateAndMsg: true }))
        assert.strict.deepStrictEqual(want.state, 'success')
        for (let c of thrownCases) {
            let counter = { n: 0 }
            let r = null
            assert.doesNotThrow(() => {
                r = timemsTZ2past(t, mkTNow(c.mk(), counter), { returnWithStateAndMsg: true })
            }, c.name)
            assert.strict.deepStrictEqual([c.name, counter.n, showDeep(r)], [c.name, 0, want])
        }
    })

    it(`should treat a revoked Proxy as tNow like any non-string: no throw, same result as the default tNow`, function() {
        let r = Proxy.revocable({}, {})
        r.revoke()
        let want = showDeep(timemsTZ2past(t, null))
        assert.strict.deepStrictEqual(showDeep(timemsTZ2past(t, r.proxy)), want)
    })

})
