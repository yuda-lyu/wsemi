import assert from 'assert'
import arrSep from '../src/arrSep.mjs'


describe(`arrSep`, function() {
    let k
    let o = {}

    let arr = ['a', 123, 'xyz', 5.678, null, 'd', [], { x: 'x1', y: 'y1' }]

    k = 0
    o[k] = [
        ['a', 123],
        ['xyz', 5.678],
        [null, 'd'],
        [[], { x: 'x1', y: 'y1' }]
    ]
    it(`should return ${JSON.stringify(o[k].out)} when input ${JSON.stringify(arr)}, 2`, function() {
        k = 0
        let r = arrSep(arr, 2)
        assert.strict.deepStrictEqual(r, o[k])
    })

    k = 1
    o[k] = [
        ['a', 123, 'xyz'],
        [5.678, null, 'd'],
        [[], { x: 'x1', y: 'y1' }]
    ]
    it(`should return ${JSON.stringify(o[k].out)} when input ${JSON.stringify(arr)}, 3`, function() {
        k = 1
        let r = arrSep(arr, 3)
        assert.strict.deepStrictEqual(r, o[k])
    })

    it(`should return [] when input ${JSON.stringify(arr)}, ''`, function() {
        let r = arrSep(arr, '')
        assert.strict.deepStrictEqual(r, [])
    })

    it(`should return [] when input ${JSON.stringify(arr)}, []`, function() {
        let r = arrSep(arr, [])
        assert.strict.deepStrictEqual(r, [])
    })

    it(`should return [] when input ${JSON.stringify(arr)}, {}`, function() {
        let r = arrSep(arr, {})
        assert.strict.deepStrictEqual(r, [])
    })

    it(`should return [] when input ${JSON.stringify(arr)}, null`, function() {
        let r = arrSep(arr, null)
        assert.strict.deepStrictEqual(r, [])
    })

    it(`should return [] when input ${JSON.stringify(arr)}, undefined`, function() {
        let r = arrSep(arr, undefined)
        assert.strict.deepStrictEqual(r, [])
    })

    it(`should return [] when input ''`, function() {
        let r = arrSep('')
        assert.strict.deepStrictEqual(r, [])
    })

    it(`should return [] when input []`, function() {
        let r = arrSep([])
        assert.strict.deepStrictEqual(r, [])
    })

    it(`should return [] when input {}`, function() {
        let r = arrSep({})
        assert.strict.deepStrictEqual(r, [])
    })

    it(`should return [] when input null`, function() {
        let r = arrSep(null)
        assert.strict.deepStrictEqual(r, [])
    })

    it(`should return [] when input undefined`, function() {
        let r = arrSep(undefined)
        assert.strict.deepStrictEqual(r, [])
    })

})
