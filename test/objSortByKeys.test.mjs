import assert from 'assert'
import objSortByKeys from '../src/objSortByKeys.mjs'


describe(`objSortByKeys`, function() {

    let obj1 = {
        'x2': 2,
        'x1': 1,
        'x3': 3,
    }
    it(`should return { x1: 1, x2: 2, x3: 3 } when input ${JSON.stringify(obj1)}, ['x1', 'x2', 'x3']`, function() {
        let r = objSortByKeys(obj1, ['x1', 'x2', 'x3'])
        let rr = { x1: 1, x2: 2, x3: 3 }
        assert.strict.deepStrictEqual(r, rr)
    })

    let obj2 = {
        'x2': 2,
        'x111': 1,
        'x33': 3,
    }
    it(`should return { x111: 1, x2: 2, x33: 3 } when input ${JSON.stringify(obj2)}, ['x111', 'x2', 'x33']`, function() {
        let r = objSortByKeys(obj2, ['x111', 'x2', 'x33'])
        let rr = { x111: 1, x2: 2, x33: 3 }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input '', ['x111', 'x2', 'x33']`, function() {
        let r = objSortByKeys('', ['x111', 'x2', 'x33'])
        let rr = {}
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [], ['x111', 'x2', 'x33']`, function() {
        let r = objSortByKeys([], ['x111', 'x2', 'x33'])
        let rr = {}
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return {} when input {}, ['x111', 'x2', 'x33']`, function() {
        let r = objSortByKeys({}, ['x111', 'x2', 'x33'])
        let rr = {}
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return null when input null, ['x111', 'x2', 'x33']`, function() {
        let r = objSortByKeys(null, ['x111', 'x2', 'x33'])
        let rr = {}
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return undefined when input undefined, ['x111', 'x2', 'x33']`, function() {
        let r = objSortByKeys(undefined, ['x111', 'x2', 'x33'])
        let rr = {}
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input ''`, function() {
        let r = objSortByKeys('')
        let rr = {}
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input []`, function() {
        let r = objSortByKeys([])
        let rr = {}
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return {} when input {}`, function() {
        let r = objSortByKeys({})
        let rr = {}
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return null when input null`, function() {
        let r = objSortByKeys(null)
        let rr = {}
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return undefined when input undefined`, function() {
        let r = objSortByKeys(undefined)
        let rr = {}
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return undefined when input NaN`, function() {
        let r = objSortByKeys(NaN)
        let rr = {}
        assert.strict.deepStrictEqual(r, rr)
    })

})
