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

})
