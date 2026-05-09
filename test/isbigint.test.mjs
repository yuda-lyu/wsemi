import assert from 'assert'
import isbigint from '../src/isbigint.mjs'


describe(`isbigint`, function() {

    it(`should return true when input 0n`, function() {
        let r = isbigint(0n)
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input 123n`, function() {
        let r = isbigint(123n)
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input -123n`, function() {
        let r = isbigint(-123n)
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input BigInt(123)`, function() {
        let r = isbigint(BigInt(123))
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input BigInt('9007199254740993') (超過Number.MAX_SAFE_INTEGER)`, function() {
        let r = isbigint(BigInt('9007199254740993'))
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input Object(123n) (boxed BigInt)`, function() {
        let r = isbigint(Object(123n))
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return false when input 0`, function() {
        let r = isbigint(0)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input 123`, function() {
        let r = isbigint(123)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input -125`, function() {
        let r = isbigint(-125)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input 1.25`, function() {
        let r = isbigint(1.25)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '123'`, function() {
        let r = isbigint('123')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '123n' (字串型不算BigInt)`, function() {
        let r = isbigint('123n')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input ''`, function() {
        let r = isbigint('')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input true`, function() {
        let r = isbigint(true)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input false`, function() {
        let r = isbigint(false)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input []`, function() {
        let r = isbigint([])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input [123n]`, function() {
        let r = isbigint([123n])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input {}`, function() {
        let r = isbigint({})
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input { a: 123n }`, function() {
        let r = isbigint({ a: 123n })
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input null`, function() {
        let r = isbigint(null)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input undefined`, function() {
        let r = isbigint(undefined)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input NaN`, function() {
        let r = isbigint(NaN)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input function() {}`, function() {
        let r = isbigint(function() {})
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input Symbol('x')`, function() {
        let r = isbigint(Symbol('x'))
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input new Error('xxx')`, function() {
        let r = isbigint(new Error('xxx'))
        assert.strict.deepStrictEqual(r, false)
    })

})
