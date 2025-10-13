import assert from 'assert'
import haskey from '../src/haskey.mjs'


describe(`haskey`, function() {

    it(`should return true when input { 1: 'abc', a: 123, b: 'xyz', c: '45op', d: null }, 1`, function() {
        let r = haskey({ 1: 'abc', a: 123, b: 'xyz', c: '45op', d: null }, 1)
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input { 1: 'abc', a: 123, b: 'xyz', c: '45op', d: null }, '1'`, function() {
        let r = haskey({ 1: 'abc', a: 123, b: 'xyz', c: '45op', d: null }, '1')
        assert.strict.deepStrictEqual(r, true) //字串型數字key會自動轉成數字
    })

    it(`should return true when input { 1.2: 'abc', a: 123, b: 'xyz', c: '45op', d: null }, 1.2`, function() {
        let r = haskey({ 1.2: 'abc', a: 123, b: 'xyz', c: '45op', d: null }, 1.2)
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input { 1.2: 'abc', a: 123, b: 'xyz', c: '45op', d: null }, '1.2'`, function() {
        let r = haskey({ 1.2: 'abc', a: 123, b: 'xyz', c: '45op', d: null }, '1.2')
        assert.strict.deepStrictEqual(r, true) //字串型數字key會自動轉成數字
    })


    it(`should return true when input { '1': 'abc', a: 123, b: 'xyz', c: '45op', d: null }, 1`, function() {
        let r = haskey({ '1': 'abc', 'a': 123, 'b': 'xyz', 'c': '45op', 'd': null }, 1)
        assert.strict.deepStrictEqual(r, true) //數字key會自動轉成字串才判斷
    })

    it(`should return true when input { '1': 'abc', a: 123, b: 'xyz', c: '45op', d: null }, '1'`, function() {
        let r = haskey({ '1': 'abc', 'a': 123, 'b': 'xyz', 'c': '45op', 'd': null }, '1')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input { '1.2': 'abc', a: 123, b: 'xyz', c: '45op', d: null }, 1.2`, function() {
        let r = haskey({ '1.2': 'abc', 'a': 123, 'b': 'xyz', 'c': '45op', 'd': null }, 1.2)
        assert.strict.deepStrictEqual(r, true) //數字key會自動轉成字串才判斷
    })

    it(`should return true when input { '1.2': 'abc', a: 123, b: 'xyz', c: '45op', d: null }, '1.2'`, function() {
        let r = haskey({ '1.2': 'abc', 'a': 123, 'b': 'xyz', 'c': '45op', 'd': null }, '1.2')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input { a: 123, b: 'xyz', c: '45op', d: null }, 'a'`, function() {
        let r = haskey({ a: 123, b: 'xyz', c: '45op', d: null }, 'a')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input { a: 123, b: 'xyz', c: '45op', d: null }, 'd'`, function() {
        let r = haskey({ a: 123, b: 'xyz', c: '45op', d: null }, 'd')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input { a: 123, b: 'xyz', c: '45op', d: null, e: undefined }, 'e'`, function() {
        let r = haskey({ a: 123, b: 'xyz', c: '45op', d: null, e: undefined }, 'e')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return false when input { a: 123, b: 'xyz', c: '45op', d: null, e: undefined }, 'f'`, function() {
        let r = haskey({ a: 123, b: 'xyz', c: '45op', d: null, e: undefined }, 'f')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '125'`, function() {
        let r = haskey('125')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input 1.25`, function() {
        let r = haskey(1.25)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input ''`, function() {
        let r = haskey('')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input []`, function() {
        let r = haskey([])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input {}`, function() {
        let r = haskey({})
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input null`, function() {
        let r = haskey(null)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input undefined`, function() {
        let r = haskey(undefined)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input NaN`, function() {
        let r = haskey(NaN)
        assert.strict.deepStrictEqual(r, false)
    })

})
