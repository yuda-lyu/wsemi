import assert from 'assert'
import isfun from '../src/isfun.mjs'


describe(`isfun`, function() {

    it(`should return false when input '2019-01-01'`, function() {
        let r = isfun('2019-01-01')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01'`, function() {
        let r = isfun('2019-21-01')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return true when input function() {}`, function() {
        let r = isfun(function() {})
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input () => {}`, function() {
        let r = isfun(() => {})
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input async function() {}`, function() {
        let r = isfun(async function() {})
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input function* () {}`, function() {
        //改委派lodash之isFunction後generator函數亦為函數; 原以toString標籤判定之實作漏掉此類
        let r = isfun(function* () {})
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input class {}`, function() {
        let r = isfun(class {})
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input a bound function`, function() {
        let f = function() {}
        let r = isfun(f.bind(null))
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return false when input '1.25'`, function() {
        let r = isfun('1.25')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '125'`, function() {
        let r = isfun('125')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input 125`, function() {
        let r = isfun(125)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input -125`, function() {
        let r = isfun(-125)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input 1.25`, function() {
        let r = isfun(1.25)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input -1.25`, function() {
        let r = isfun(-1.25)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '125abc'`, function() {
        let r = isfun('125abc')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input 'abc125'`, function() {
        let r = isfun('abc125')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '12a5'`, function() {
        let r = isfun('12a5')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input ''`, function() {
        let r = isfun('')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input false`, function() {
        let r = isfun(false)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input []`, function() {
        let r = isfun([])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input [{}]`, function() {
        let r = isfun([{}])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input [{ a: 123 }]`, function() {
        let r = isfun([{ a: 123 }])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input ['']`, function() {
        let r = isfun([''])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input ['abc']`, function() {
        let r = isfun(['abc'])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input {}`, function() {
        let r = isfun({})
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input { a: 123 }`, function() {
        let r = isfun({ a: 123 })
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input { a: 123, b: null, c: [45.67] }`, function() {
        let r = isfun({ a: 123, b: null, c: [45.67] })
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input null`, function() {
        let r = isfun(null)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input undefined`, function() {
        let r = isfun(undefined)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input NaN`, function() {
        let r = isfun(NaN)
        assert.strict.deepStrictEqual(r, false)
    })

})
