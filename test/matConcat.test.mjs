import assert from 'assert'
import matConcat from '../src/matConcat.mjs'


describe(`matConcat`, function() {
    let k
    let o = {}

    k = 1
    o[k] = {
        in: {
            mat1: [['a', 'b'], [1.1, 2.2]],
            mat2: [['c', 'd'], [10.1, 20.2]],
        },
        out: [
            ['a', 'b', 'c', 'd'],
            [1.1, 2.2, 10.1, 20.2]
        ]
    }
    it(`should return ${JSON.stringify(o[k].out)} when input ${JSON.stringify(o[k].in.mat1)}, ${JSON.stringify(o[k].in.mat2)}`, function() {
        k = 1
        let r = matConcat(o[k].in.mat1, o[k].in.mat2)
        let rr = o[k].out
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 2
    o[k] = {
        in: {
            mat1: [['a', 'b', 'c'], [1, 2, 3], [1.1, 2.2, 3.3]],
            mat2: [['x', 'y'], [-10.1, -20.2]],
        },
        out: [
            ['a', 'b', 'c', 'x', 'y'],
            [1, 2, 3, -10.1, -20.2],
            [1.1, 2.2, 3.3, null, null]
        ]
    }
    it(`should return ${JSON.stringify(o[k].out)} when input ${JSON.stringify(o[k].in.mat1)}, ${JSON.stringify(o[k].in.mat2)}`, function() {
        k = 2
        let r = matConcat(o[k].in.mat1, o[k].in.mat2)
        let rr = o[k].out
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 3
    o[k] = {
        in: {
            mat1: [['a', 'b'], [1.1, 2.2]],
            mat2: [['x', 'y', 'z'], [-1, -2, -3], [-10.1, -20.2, -30.3]],
        },
        out: [
            ['a', 'b', 'x', 'y', 'z'],
            [1.1, 2.2, -1, -2, -3],
            [null, null, -10.1, -20.2, -30.3]
        ]
    }
    it(`should return ${JSON.stringify(o[k].out)} when input ${JSON.stringify(o[k].in.mat1)}, ${JSON.stringify(o[k].in.mat2)}`, function() {
        k = 3
        let r = matConcat(o[k].in.mat1, o[k].in.mat2)
        let rr = o[k].out
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return [] when input ''`, function() {
        let r = matConcat('')
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return [] when input []`, function() {
        let r = matConcat([])
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return [] when input {}`, function() {
        let r = matConcat({})
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return [] when input null`, function() {
        let r = matConcat(null)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return [] when input undefined`, function() {
        let r = matConcat(undefined)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return [] when input NaN`, function() {
        let r = matConcat(NaN)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

})
