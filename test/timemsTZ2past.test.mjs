import assert from 'assert'
import timemsTZ2past from '../src/timemsTZ2past.mjs'


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

    it(`should return { state: 'error', msg: 'invalid t' } when input NaN with returnWithStateAndMsg`, function() {
        let r = timemsTZ2past(NaN, tNow, { returnWithStateAndMsg: true })
        let rr = { state: 'error', msg: 'invalid t' }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should fallback to the plain return value when returnWithStateAndMsg is not a boolean`, function() {
        let r = timemsTZ2past('2023-04-13T08:31:54.987+08:00', tNow, { returnWithStateAndMsg: 'yes' })
        let rr = { today: null, msg: '', err: '時間未到' }
        assert.strict.deepStrictEqual(r, rr)
    })

})
