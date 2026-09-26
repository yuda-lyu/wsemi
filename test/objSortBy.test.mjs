import assert from 'assert'
import objSortBy from '../src/objSortBy.mjs'


describe(`objSortBy`, function() {

    let obj1 = {
        'a': 3,
        'b': 2,
        'c': 1,
    }
    // let robj1 = objSortBy(obj1, (v, k) => {
    //     return v
    // })
    // console.log(robj1)
    // => { c: 1, b: 2, a: 3 }

    it(`should return { c: 1, b: 2, a: 3 } when input ${JSON.stringify(obj1)}, (v,k)=>v`, function() {
        let r = objSortBy(obj1, (v, k) => v)
        let rr = { c: 1, b: 2, a: 3 }
        assert.strict.deepStrictEqual(r, rr)
    })

    let obj2 = {
        'x2': 2,
        'x1': 1,
        'x3': 3,
    }
    // let robj2 = objSortBy(obj2, (v, k) => {
    //     return k
    // })
    // console.log(robj2)
    // => { x1: 1, x2: 2, x3: 3 }

    it(`should return { x1: 1, x2: 2, x3: 3 } when input ${JSON.stringify(obj2)}, (v,k)=>k`, function() {
        let r = objSortBy(obj2, (v, k) => k)
        let rr = { x1: 1, x2: 2, x3: 3 }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should order keys by numbers first and put values that cannot be converted or parsed last`, function() {
        //規則同arrSort: 數字(含數字字串)依數值, 其他字串其次, 空字串、純空白字串、null等放最末且維持原順序; 以鍵之順序斷言(deepStrictEqual不比對鍵之順序)
        let r = objSortBy({ a: 10, b: '', c: '9', d: 'x', e: null, f: 1 }, (v) => v)
        assert.strict.deepStrictEqual(Object.keys(r), ['f', 'c', 'a', 'd', 'b', 'e'])
    })

    let testFun = () => {
        return 0
    }

    it(`should return '' when input '', testFun`, function() {
        let r = objSortBy('', testFun)
        let rr = {}
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [], testFun`, function() {
        let r = objSortBy([], testFun)
        let rr = {}
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return {} when input {}, testFun`, function() {
        let r = objSortBy({}, testFun)
        let rr = {}
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return null when input null, testFun`, function() {
        let r = objSortBy(null, testFun)
        let rr = {}
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return undefined when input undefined, testFun`, function() {
        let r = objSortBy(undefined, testFun)
        let rr = {}
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return undefined when input NaN, testFun`, function() {
        let r = objSortBy(NaN, testFun)
        let rr = {}
        assert.strict.deepStrictEqual(r, rr)
    })

})
