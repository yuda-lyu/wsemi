import assert from 'assert'
import timemsTZ2expire from '../src/timemsTZ2expire.mjs'


describe(`timemsTZ2expire`, function() {
    let tNow = '2020-10-18T12:34:56.987+08:00'

    it(`sould return { today: true, msg: '2秒後', err: '' } when input '2020-10-18T12:34:58.987+08:00', ${tNow}`, function() {
        let r = timemsTZ2expire('2020-10-18T12:34:58.987+08:00', tNow)
        let rr = { today: true, msg: '2秒後', err: '' }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return { today: true, msg: '2秒後', err: '' } when input '2020-10-18T04:34:58.987+00:00', ${tNow}`, function() {
        let r = timemsTZ2expire('2020-10-18T04:34:58.987+00:00', tNow)
        let rr = { today: true, msg: '2秒後', err: '' }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return { today: true, msg: '2秒後', err: '' } when input '2020-10-18T04:34:58.987Z', ${tNow}`, function() {
        let r = timemsTZ2expire('2020-10-18T04:34:58.987Z', tNow)
        let rr = { today: true, msg: '2秒後', err: '' }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return { today: true, msg: '2秒後', err: '' } when input '2020-10-18T12:34:58.123+08:00', ${tNow}`, function() {
        let r = timemsTZ2expire('2020-10-18T12:34:58.123+08:00', tNow)
        let rr = { today: true, msg: '1秒後', err: '' }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return { today: true, msg: '2秒後', err: '' } when input '2020-10-18T12:34:58.987+08:00', ${tNow}`, function() {
        let r = timemsTZ2expire('2020-10-18T12:34:58.987+08:00', tNow)
        let rr = { today: true, msg: '2秒後', err: '' }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return { today: true, msg: '3分鐘後', err: '' } when input '2020-10-18T12:37:58.987+08:00', ${tNow}`, function() {
        let r = timemsTZ2expire('2020-10-18T12:37:58.987+08:00', tNow)
        let rr = { today: true, msg: '3分鐘後', err: '' }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return { today: true, msg: '4小時後，今天16:37', err: '' } when input '2020-10-18T16:37:58.987+08:00', ${tNow}`, function() {
        let r = timemsTZ2expire('2020-10-18T16:37:58.987+08:00', tNow)
        let rr1 = { today: true, msg: '4小時後，今天16:37', err: '' }
        let rr2 = { today: true, msg: '4小時後，今天08:37', err: '' } //github-actions時區
        let sr = JSON.stringify(r)
        let srr1 = JSON.stringify(rr1)
        let srr2 = JSON.stringify(rr2)
        let rr = sr === srr1 || sr === srr2
        assert.strict.deepStrictEqual(true, rr)
    })

    it(`sould return { today: false, msg: '5天後', err: '' } when input '2020-10-23T16:37:58.987+08:00', ${tNow}`, function() {
        let r = timemsTZ2expire('2020-10-23T16:37:58.987+08:00', tNow)
        let rr = { today: false, msg: '5天後', err: '' }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return { today: false, msg: '6個月後', err: '' } when input '2021-04-23T16:37:58.987+08:00', ${tNow}`, function() {
        let r = timemsTZ2expire('2021-04-23T16:37:58.987+08:00', tNow)
        let rr = { today: false, msg: '6個月後', err: '' }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return { today: false, msg: '7年後', err: '' } when input '2028-04-23T16:37:58.987+08:00', ${tNow}`, function() {
        let r = timemsTZ2expire('2028-04-23T16:37:58.987+08:00', tNow)
        let rr = { today: false, msg: '7年後', err: '' }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return { today: null, msg: '', err: '時間已過' } when input '2018-04-23T16:37:58.987+08:00', ${tNow}`, function() {
        let r = timemsTZ2expire('2018-04-23T16:37:58.987+08:00', tNow)
        let rr = { today: null, msg: '', err: '時間已過' }
        assert.strict.deepStrictEqual(r, rr)
    })

})
