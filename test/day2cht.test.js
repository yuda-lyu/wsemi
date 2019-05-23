import assert from 'assert'
import day2cht from '../src/day2cht.mjs'


describe(`day2cht`, function() {

    it(`should return '民國 108 年 1 月 2 日' when input '2019/01/02'`, function() {
        let r = day2cht('2019/01/02')
        assert.strict.deepEqual(r, '民國 108 年 1 月 2 日')
    })

    it(`should return '' when input '2019/02/29'`, function() {
        let r = day2cht('2019/02/29')
        assert.strict.deepEqual(r, '')
    })

    it(`should return '' when input '2019/29/02'`, function() {
        let r = day2cht('2019/29/02')
        assert.strict.deepEqual(r, '')
    })

    it(`should return '' when input '2019/1/02'`, function() {
        let r = day2cht('2019/1/02')
        assert.strict.deepEqual(r, '')
    })

    it(`should return '' when input '2019/01/2'`, function() {
        let r = day2cht('2019/01/2')
        assert.strict.deepEqual(r, '')
    })

    it(`should return '' when input '019/01/02'`, function() {
        let r = day2cht('019/01/02')
        assert.strict.deepEqual(r, '')
    })

    it(`should return '' when input '1.25'`, function() {
        let r = day2cht('1.25')
        assert.strict.deepEqual(r, '')
    })

    it(`should return '' when input 1.25`, function() {
        let r = day2cht(1.25)
        assert.strict.deepEqual(r, '')
    })

    it(`should return '' when input ''`, function() {
        let r = day2cht('')
        assert.strict.deepEqual(r, '')
    })

    it(`should return '' when input []`, function() {
        let r = day2cht([])
        assert.strict.deepEqual(r, '')
    })

    it(`should return '' when input {}`, function() {
        let r = day2cht({})
        assert.strict.deepEqual(r, '')
    })

    it(`should return '' when input null`, function() {
        let r = day2cht(null)
        assert.strict.deepEqual(r, '')
    })

    it(`should return '' when input undefined`, function() {
        let r = day2cht(undefined)
        assert.strict.deepEqual(r, '')
    })

})
