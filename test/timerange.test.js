import assert from 'assert'
import timerange from '../src/timerange.mjs'


describe(`timerange`, function() {

    it(`sould return '2019/01/01 09:00 至 無' when input '2019/01/01 09:00:00'`, function() {
        let r = timerange('2019/01/01 09:00:00')
        let rr = '2019/01/01 09:00 至 無'
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return '2019/01/01 09:00 至 12:34' when input '2019/01/01 09:00:00', '2019/01/01 12:34:56'`, function() {
        let r = timerange('2019/01/01 09:00:00', '2019/01/01 12:34:56')
        let rr = '2019/01/01 09:00 至 12:34'
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return '2019/01/01 09:00 至 12:00' when input '2019/01/01 09:00:00', '2019/01/01 12:00:00'`, function() {
        let r = timerange('2019/01/01 09:00:00', '2019/01/01 12:00:00')
        let rr = '2019/01/01 09:00 至 12:00'
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return '2019/01/01 19:00 至 12:00 (起始時間大於結束時間)' when input '2019/01/01 19:00:00', '2019/01/01 12:00:00'`, function() {
        let r = timerange('2019/01/01 19:00:00', '2019/01/01 12:00:00')
        let rr = '2019/01/01 19:00 至 12:00 (起始時間大於結束時間)'
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return '2019/01/01 09:00 至 2019/01/03 12:00' when input '2019/01/01 09:00:00', '2019/01/03 12:00:00'`, function() {
        let r = timerange('2019/01/01 09:00:00', '2019/01/03 12:00:00')
        let rr = '2019/01/01 09:00 至 2019/01/03 12:00'
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return '2019/01/03 09:00 至 2019/01/01 12:00 (起始時間大於結束時間)' when input '2019/01/03 09:00:00', '2019/01/01 12:00:00'`, function() {
        let r = timerange('2019/01/03 09:00:00', '2019/01/01 12:00:00')
        let rr = '2019/01/03 09:00 至 2019/01/01 12:00 (起始時間大於結束時間)'
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return '結束時間格式錯誤' when input '2019/01/01 09:00:00', ''`, function() {
        let r = timerange('2019/01/01 09:00:00', '')
        let rr = '結束時間格式錯誤'
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return '結束時間格式錯誤' when input '2019/01/01 09:00:00', []`, function() {
        let r = timerange('2019/01/01 09:00:00', [])
        let rr = '結束時間格式錯誤'
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return '結束時間格式錯誤' when input '2019/01/01 09:00:00', {}`, function() {
        let r = timerange('2019/01/01 09:00:00', {})
        let rr = '結束時間格式錯誤'
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return '結束時間格式錯誤' when input '2019/01/01 09:00:00', null`, function() {
        let r = timerange('2019/01/01 09:00:00', null)
        let rr = '結束時間格式錯誤'
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return '2019/01/01 09:00 至 無' when input '2019/01/01 09:00:00', undefined`, function() {
        let r = timerange('2019/01/01 09:00:00', undefined)
        let rr = '2019/01/01 09:00 至 無'
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return '無起始時間' when input '', '2019/01/01 12:00:00'`, function() {
        let r = timerange('', '2019/01/01 12:00:00')
        let rr = '無起始時間'
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return '無起始時間' when input [], '2019/01/01 12:00:00'`, function() {
        let r = timerange([], '2019/01/01 12:00:00')
        let rr = '無起始時間'
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return '無起始時間' when input {}, '2019/01/01 12:00:00'`, function() {
        let r = timerange({}, '2019/01/01 12:00:00')
        let rr = '無起始時間'
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return '無起始時間' when input null, '2019/01/01 12:00:00'`, function() {
        let r = timerange(null, '2019/01/01 12:00:00')
        let rr = '無起始時間'
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return '無起始時間' when input undefined, '2019/01/01 12:00:00'`, function() {
        let r = timerange(undefined, '2019/01/01 12:00:00')
        let rr = '無起始時間'
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return '無起始時間' when input ''`, function() {
        let r = timerange('')
        let rr = '無起始時間'
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return '無起始時間' when input []`, function() {
        let r = timerange([])
        let rr = '無起始時間'
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return '無起始時間' when input {}`, function() {
        let r = timerange({})
        let rr = '無起始時間'
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return '無起始時間' when input null`, function() {
        let r = timerange(null)
        let rr = '無起始時間'
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return '無起始時間' when input undefined`, function() {
        let r = timerange(undefined)
        let rr = '無起始時間'
        assert.strict.deepEqual(r, rr)
    })

})
