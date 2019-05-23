import assert from 'assert'
import matat from '../src/matat.mjs'


describe(`matat`, function() {
    let k
    let o = {}

    k = 1
    o[k] = {
        in: [['a', 'b', '12.34'], [12, 34.56, 'abc']],
        out: [['b'], [34.56]]
    }
    it(`should return ${JSON.stringify(o[k].out)} when input ${JSON.stringify(o[k].in)}, 1`, function() {
        k = 1
        let r = matat(o[k].in, 1)
        let rr = o[k].out
        assert.strict.deepEqual(r, rr)
    })

    k = 2
    o[k] = {
        in: [['a', 'b', '12.34'], [12, 34.56, 'abc']],
        out: [['b', '12.34'], [34.56, 'abc']]
    }
    it(`should return ${JSON.stringify(o[k].out)} when input ${JSON.stringify(o[k].in)}, 1, 2`, function() {
        k = 2
        let r = matat(o[k].in, 1, 2)
        let rr = o[k].out
        assert.strict.deepEqual(r, rr)
    })

    k = 3
    o[k] = {
        in: [['a', 'b', '12.34'], [12, 34.56, 'abc']],
        out: [[], []]
    }
    it(`should return ${JSON.stringify(o[k].out)} when input ${JSON.stringify(o[k].in)}, 1, 10`, function() {
        k = 3
        let r = matat(o[k].in, 1, 10)
        let rr = o[k].out
        assert.strict.deepEqual(r, rr)
    })

    k = 4
    o[k] = {
        in: [['a', 'b', '12.34'], [12, 34.56, 'abc']],
        out: [[], []]
    }
    it(`should return ${JSON.stringify(o[k].out)} when input ${JSON.stringify(o[k].in)}, 1, -10`, function() {
        k = 4
        let r = matat(o[k].in, 1, -10)
        let rr = o[k].out
        assert.strict.deepEqual(r, rr)
    })

    k = 5
    o[k] = {
        in: [['a', 'b', '12.34'], [12, 34.56, 'abc']],
        out: [[], []]
    }
    it(`should return ${JSON.stringify(o[k].out)} when input ${JSON.stringify(o[k].in)}, -1, 10`, function() {
        k = 5
        let r = matat(o[k].in, -1, 10)
        let rr = o[k].out
        assert.strict.deepEqual(r, rr)
    })

    k = 6
    o[k] = {
        in: [['a', 'b', '12.34'], [12, 34.56, 'abc']],
        out: [[], []]
    }
    it(`should return ${JSON.stringify(o[k].out)} when input ${JSON.stringify(o[k].in)}, -1, -10`, function() {
        k = 6
        let r = matat(o[k].in, -1, -10)
        let rr = o[k].out
        assert.strict.deepEqual(r, rr)
    })

    k = 7
    o[k] = {
        in: [['a', 'b', '12.34'], [12, 34.56, 'abc']],
        out: [[], []]
    }
    it(`should return ${JSON.stringify(o[k].out)} when input ${JSON.stringify(o[k].in)}, 10`, function() {
        k = 7
        let r = matat(o[k].in, 10)
        let rr = o[k].out
        assert.strict.deepEqual(r, rr)
    })

    k = 8
    o[k] = {
        in: [['a', 'b', '12.34'], [12, 34.56, 'abc']],
        out: [[], []]
    }
    it(`should return ${JSON.stringify(o[k].out)} when input ${JSON.stringify(o[k].in)}, -10`, function() {
        k = 8
        let r = matat(o[k].in, -10)
        let rr = o[k].out
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return [] when input ''`, function() {
        let r = matat('')
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return [] when input []`, function() {
        let r = matat([])
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return [] when input {}`, function() {
        let r = matat({})
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return [] when input null`, function() {
        let r = matat(null)
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return [] when input undefined`, function() {
        let r = matat(undefined)
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

})
