import assert from 'assert'
import isarr1 from '../src/isarr1.mjs'


describe(`isarr1`, function() {

    it(`should return false when input '1.25'`, function() {
        let r = isarr1('1.25')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input 125`, function() {
        let r = isarr1(125)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input -1.25`, function() {
        let r = isarr1(-1.25)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input ''`, function() {
        let r = isarr1('')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input []`, function() {
        let r = isarr1([])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return true when input [{}]`, function() {
        let r = isarr1([{}])
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input [{ a: 123 }]`, function() {
        let r = isarr1([{ a: 123 }])
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input ['']`, function() {
        //與isearr之差異處: isearr於長度1時會檢查元素有效性而回false
        let r = isarr1([''])
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input [null]`, function() {
        let r = isarr1([null])
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input [undefined]`, function() {
        let r = isarr1([undefined])
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input [0]`, function() {
        let r = isarr1([0])
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input ['abc']`, function() {
        let r = isarr1(['abc'])
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input ['', 'a']`, function() {
        let r = isarr1(['', 'a'])
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return false when input {}`, function() {
        let r = isarr1({})
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input { a: 123 }`, function() {
        let r = isarr1({ a: 123 })
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input null`, function() {
        let r = isarr1(null)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input undefined`, function() {
        let r = isarr1(undefined)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input NaN`, function() {
        let r = isarr1(NaN)
        assert.strict.deepStrictEqual(r, false)
    })

})
