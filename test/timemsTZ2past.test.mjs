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


describe(`timemsTZ2past 非Error拋出值(R-CODEC-ERR-01之2)`, function() {

    let t = '2020-10-18T12:34:54.987+08:00'

    //tNow由呼叫端給定, try內core經istimemsTZ(tNow)之isestr之Object.prototype.toString.call讀其Symbol.toStringTag時拋出指定值
    //thrownCases(test/tools/codecThrown.mjs)為呼叫端可拋出之各種值, msg為_errToStr應得之字串; 修正前catch內err.toString()遇其任一皆再拋TypeError, 使函數同步外拋至呼叫端
    let mkTNow = (v) => ({
        get [Symbol.toStringTag]() {
            throw v
        },
    })

    //預設模式沿用既有失敗形狀{ today, msg, err }, 錯誤字串不外露, 故任何拋出值皆為同一結果
    it(`should not throw but return { today: null, msg: '', err: '時間轉換失敗' } whatever tNow throws on reading Symbol.toStringTag without opt [R-CODEC-ERR-01之2]`, function() {
        for (let c of thrownCases) {
            let r = null
            assert.doesNotThrow(() => {
                r = timemsTZ2past(t, mkTNow(c.mk()))
            }, c.name)
            assert.strict.deepStrictEqual(showDeep(r), { today: null, msg: '', err: '時間轉換失敗' }, c.name)
        }
    })

    for (let c of thrownCases) {
        it(`should not throw but return { state: 'error', msg: '${c.msg}' } when tNow throws ${c.name} on reading Symbol.toStringTag with returnWithStateAndMsg [R-CODEC-ERR-01之2]`, function() {
            let r = null
            assert.doesNotThrow(() => {
                r = timemsTZ2past(t, mkTNow(c.mk()), { returnWithStateAndMsg: true })
            })
            assert.strict.deepStrictEqual(showDeep(r), { state: 'error', msg: c.msg })
        })
    }

    it(`(守門) should return { state: 'error', msg: 'Error: boom' } (same as err.toString()) when tNow throws an Error on reading Symbol.toStringTag with returnWithStateAndMsg [R-CODEC-ERR-01之2]`, function() {
        let r = timemsTZ2past(t, mkTNow(new Error('boom')), { returnWithStateAndMsg: true })
        assert.strict.deepStrictEqual(showDeep(r), { state: 'error', msg: 'Error: boom' })
    })

})
