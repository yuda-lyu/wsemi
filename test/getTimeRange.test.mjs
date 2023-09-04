import assert from 'assert'
import getTimeRange from '../src/getTimeRange.mjs'


describe(`getTimeRange`, function() {

    it(`sould return '2019-01-01T09:00 至 無' when input '2019-01-01T09:00:00'`, function() {
        let r = getTimeRange('2019-01-01T09:00:00')
        let rr = '2019-01-01T09:00 至 無'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '2019-01-01T09:00 至 12:34' when input '2019-01-01T09:00:00', '2019-01-01T12:34:56'`, function() {
        let r = getTimeRange('2019-01-01T09:00:00', '2019-01-01T12:34:56')
        let rr = '2019-01-01T09:00 至 12:34'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '2019-01-01T09:00 至 12:00' when input '2019-01-01T09:00:00', '2019-01-01T12:00:00'`, function() {
        let r = getTimeRange('2019-01-01T09:00:00', '2019-01-01T12:00:00')
        let rr = '2019-01-01T09:00 至 12:00'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '2019-01-01T19:00 至 12:00 (起始時間大於結束時間)' when input '2019-01-01T19:00:00', '2019-01-01T12:00:00'`, function() {
        let r = getTimeRange('2019-01-01T19:00:00', '2019-01-01T12:00:00')
        let rr = '2019-01-01T19:00 至 12:00 (起始時間大於結束時間)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '2019-01-01T09:00 至 2019-01-03T12:00' when input '2019-01-01T09:00:00', '2019-01-03T12:00:00'`, function() {
        let r = getTimeRange('2019-01-01T09:00:00', '2019-01-03T12:00:00')
        let rr = '2019-01-01T09:00 至 2019-01-03T12:00'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '2019-01-03T09:00 至 2019-01-01T12:00 (起始時間大於結束時間)' when input '2019-01-03T09:00:00', '2019-01-01T12:00:00'`, function() {
        let r = getTimeRange('2019-01-03T09:00:00', '2019-01-01T12:00:00')
        let rr = '2019-01-03T09:00 至 2019-01-01T12:00 (起始時間大於結束時間)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '結束時間格式錯誤' when input '2019-01-01T09:00:00', ''`, function() {
        let r = getTimeRange('2019-01-01T09:00:00', '')
        let rr = '結束時間格式錯誤'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '結束時間格式錯誤' when input '2019-01-01T09:00:00', []`, function() {
        let r = getTimeRange('2019-01-01T09:00:00', [])
        let rr = '結束時間格式錯誤'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '結束時間格式錯誤' when input '2019-01-01T09:00:00', {}`, function() {
        let r = getTimeRange('2019-01-01T09:00:00', {})
        let rr = '結束時間格式錯誤'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '結束時間格式錯誤' when input '2019-01-01T09:00:00', null`, function() {
        let r = getTimeRange('2019-01-01T09:00:00', null)
        let rr = '結束時間格式錯誤'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '2019-01-01T09:00 至 無' when input '2019-01-01T09:00:00', undefined`, function() {
        let r = getTimeRange('2019-01-01T09:00:00', undefined)
        let rr = '2019-01-01T09:00 至 無'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '無起始時間' when input '', '2019-01-01T12:00:00'`, function() {
        let r = getTimeRange('', '2019-01-01T12:00:00')
        let rr = '無起始時間'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '無起始時間' when input [], '2019-01-01T12:00:00'`, function() {
        let r = getTimeRange([], '2019-01-01T12:00:00')
        let rr = '無起始時間'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '無起始時間' when input {}, '2019-01-01T12:00:00'`, function() {
        let r = getTimeRange({}, '2019-01-01T12:00:00')
        let rr = '無起始時間'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '無起始時間' when input null, '2019-01-01T12:00:00'`, function() {
        let r = getTimeRange(null, '2019-01-01T12:00:00')
        let rr = '無起始時間'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '無起始時間' when input undefined, '2019-01-01T12:00:00'`, function() {
        let r = getTimeRange(undefined, '2019-01-01T12:00:00')
        let rr = '無起始時間'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '無起始時間' when input ''`, function() {
        let r = getTimeRange('')
        let rr = '無起始時間'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '無起始時間' when input []`, function() {
        let r = getTimeRange([])
        let rr = '無起始時間'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '無起始時間' when input {}`, function() {
        let r = getTimeRange({})
        let rr = '無起始時間'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '無起始時間' when input null`, function() {
        let r = getTimeRange(null)
        let rr = '無起始時間'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '無起始時間' when input undefined`, function() {
        let r = getTimeRange(undefined)
        let rr = '無起始時間'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '無起始時間' when input NaN`, function() {
        let r = getTimeRange(NaN)
        let rr = '無起始時間'
        assert.strict.deepStrictEqual(r, rr)
    })

})
