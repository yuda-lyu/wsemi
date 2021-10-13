import assert from 'assert'
import timeTZ2past from '../src/timeTZ2past.mjs'


describe(`timeTZ2past`, function() {
    let tNow = '2020-10-18T12:34:56+08:00'

    it(`sould return { today: true, msg: '2秒前', err: '' } when input '2020-10-18T12:34:54+08:00', ${tNow}`, function() {
        let r = timeTZ2past('2020-10-18T12:34:54+08:00', tNow)
        let rr = { today: true, msg: '2秒前', err: '' }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return { today: true, msg: '3分鐘前', err: '' } when input '2020-10-18T12:31:54+08:00', ${tNow}`, function() {
        let r = timeTZ2past('2020-10-18T12:31:54+08:00', tNow)
        let rr = { today: true, msg: '3分鐘前', err: '' }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return { today: true, msg: '4小時前', err: '' } when input '2020-10-18T08:31:54+08:00', ${tNow}`, function() {
        let r = timeTZ2past('2020-10-18T08:31:54+08:00', tNow)
        let rr = { today: true, msg: '4小時前', err: '' }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return { today: false, msg: '5天前', err: '' } when input '2020-10-13T08:31:54+08:00', ${tNow}`, function() {
        let r = timeTZ2past('2020-10-13T08:31:54+08:00', tNow)
        let rr = { today: false, msg: '5天前', err: '' }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return { today: false, msg: '6個月前', err: '' } when input '2020-04-13T08:31:54+08:00', ${tNow}`, function() {
        let r = timeTZ2past('2020-04-13T08:31:54+08:00', tNow)
        let rr = { today: false, msg: '6個月前', err: '' }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return { today: false, msg: '7年前', err: '' } when input '2013-04-13T08:31:54+08:00', ${tNow}`, function() {
        let r = timeTZ2past('2013-04-13T08:31:54+08:00', tNow)
        let rr = { today: false, msg: '7年前', err: '' }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return { today: null, msg: '', err: '時間未到' } when input '2023-04-13T08:31:54+08:00', ${tNow}`, function() {
        let r = timeTZ2past('2023-04-13T08:31:54+08:00', tNow)
        let rr = { today: null, msg: '', err: '時間未到' }
        assert.strict.deepStrictEqual(r, rr)
    })

})
