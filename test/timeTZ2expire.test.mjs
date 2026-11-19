import assert from 'assert'
import timeTZ2expire from '../src/timeTZ2expire.mjs'
import { thrownCases } from './tools/codecThrown.mjs'
import { showDeep } from './tools/caseKit.mjs'


describe(`timeTZ2expire`, function() {
    let tNow = '2020-10-18T12:34:56+08:00'

    it(`sould return { today: true, msg: '2秒後', err: '' } when input '2020-10-18T12:34:58+08:00', ${tNow}`, function() {
        let r = timeTZ2expire('2020-10-18T12:34:58+08:00', tNow)
        let rr = { today: true, msg: '2秒後', err: '' }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return { today: true, msg: '3分鐘後', err: '' } when input '2020-10-18T12:37:58+08:00', ${tNow}`, function() {
        let r = timeTZ2expire('2020-10-18T12:37:58+08:00', tNow)
        let rr = { today: true, msg: '3分鐘後', err: '' }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return { today: true, msg: '4小時後，今天16:37', err: '' } when input '2020-10-18T16:37:58+08:00', ${tNow}`, function() {
        let r = timeTZ2expire('2020-10-18T16:37:58+08:00', tNow)
        let rr1 = { today: true, msg: '4小時後，今天16:37', err: '' }
        let rr2 = { today: true, msg: '4小時後，今天08:37', err: '' } //github-actions時區
        let sr = JSON.stringify(r)
        let srr1 = JSON.stringify(rr1)
        let srr2 = JSON.stringify(rr2)
        let rr = sr === srr1 || sr === srr2
        assert.strict.deepStrictEqual(true, rr)
    })

    it(`sould return { today: false, msg: '5天後', err: '' } when input '2020-10-23T16:37:58+08:00', ${tNow}`, function() {
        let r = timeTZ2expire('2020-10-23T16:37:58+08:00', tNow)
        let rr = { today: false, msg: '5天後', err: '' }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return { today: false, msg: '6個月後', err: '' } when input '2021-04-23T16:37:58+08:00', ${tNow}`, function() {
        let r = timeTZ2expire('2021-04-23T16:37:58+08:00', tNow)
        let rr = { today: false, msg: '6個月後', err: '' }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return { today: false, msg: '7年後', err: '' } when input '2028-04-23T16:37:58+08:00', ${tNow}`, function() {
        let r = timeTZ2expire('2028-04-23T16:37:58+08:00', tNow)
        let rr = { today: false, msg: '7年後', err: '' }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return { today: null, msg: '', err: '時間已過' } when input '2018-04-23T16:37:58+08:00', ${tNow}`, function() {
        let r = timeTZ2expire('2018-04-23T16:37:58+08:00', tNow)
        let rr = { today: null, msg: '', err: '時間已過' }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { state: 'success', msg } when the time is computed with returnWithStateAndMsg`, function() {
        //opt為第3參數, 因第2參數tNow為既有參數
        let r = timeTZ2expire('2030-01-02T03:04:05+08:00', tNow, { returnWithStateAndMsg: true })
        assert.strict.deepStrictEqual(r.state, 'success')
        assert.strict.deepStrictEqual(r.msg, timeTZ2expire('2030-01-02T03:04:05+08:00', tNow))
    })

    it(`should treat 時間已過 as success (it is a computed result, not a failure) with returnWithStateAndMsg`, function() {
        //err欄位之'時間已過'是算得之業務結果, 非轉換失敗, 故state須為success
        let r = timeTZ2expire('2018-04-23T16:37:58+08:00', tNow, { returnWithStateAndMsg: true })
        let rr = { state: 'success', msg: { today: null, msg: '', err: '時間已過' } }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { state: 'error', msg: 'invalid t' } when input NaN with returnWithStateAndMsg`, function() {
        let r = timeTZ2expire(NaN, tNow, { returnWithStateAndMsg: true })
        let rr = { state: 'error', msg: 'invalid t' }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should fallback to the plain return value when returnWithStateAndMsg is not a boolean`, function() {
        let r = timeTZ2expire('2018-04-23T16:37:58+08:00', tNow, { returnWithStateAndMsg: 'yes' })
        let rr = { today: null, msg: '', err: '時間已過' }
        assert.strict.deepStrictEqual(r, rr)
    })

})


describe(`timeTZ2expire 非字串之tNow為物件(R-CODEC-ERR-01之2, W-20: 判斷函數只收原始值)`, function() {

    let t = '2020-10-18T12:34:58+08:00'

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
        let want = showDeep(timeTZ2expire(t, null))
        for (let c of thrownCases) {
            let counter = { n: 0 }
            let r = null
            assert.doesNotThrow(() => {
                r = timeTZ2expire(t, mkTNow(c.mk(), counter))
            }, c.name)
            assert.strict.deepStrictEqual([c.name, counter.n, showDeep(r)], [c.name, 0, want])
        }
    })

    it(`should return { state: 'success', msg: <the default result> } with returnWithStateAndMsg, never an error state, when tNow is such an object [R-CODEC-ERR-01之2]`, function() {
        let want = showDeep(timeTZ2expire(t, null, { returnWithStateAndMsg: true }))
        assert.strict.deepStrictEqual(want.state, 'success')
        for (let c of thrownCases) {
            let counter = { n: 0 }
            let r = null
            assert.doesNotThrow(() => {
                r = timeTZ2expire(t, mkTNow(c.mk(), counter), { returnWithStateAndMsg: true })
            }, c.name)
            assert.strict.deepStrictEqual([c.name, counter.n, showDeep(r)], [c.name, 0, want])
        }
    })

    it(`should treat a revoked Proxy as tNow like any non-string: no throw, same result as the default tNow`, function() {
        let r = Proxy.revocable({}, {})
        r.revoke()
        let want = showDeep(timeTZ2expire(t, null))
        assert.strict.deepStrictEqual(showDeep(timeTZ2expire(t, r.proxy)), want)
    })

})
