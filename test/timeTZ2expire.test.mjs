import assert from 'assert'
import timeTZ2expire from '../src/timeTZ2expire.mjs'


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
