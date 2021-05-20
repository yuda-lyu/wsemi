import assert from 'assert'
import arrsort from '../src/arrsort.mjs'


describe(`arrsort`, function() {

    it(`should return [ 1, 4, 21, 30, 100000 ] when input [1, 30, 4, 21, 100000]`, function() {
        let r = arrsort([1, 30, 4, 21, 100000])
        let rr = [1, 4, 21, 30, 100000]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [ 0, 2, 3, 1, 4 ] when input [1, 30, 4, 21, 100000], { returnIndex: true }`, function() {
        let r = arrsort([1, 30, 4, 21, 100000], { returnIndex: true })
        let rr = [0, 2, 3, 1, 4]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [ 'Dec', 'Feb', 'Jan', 'March' ] when input ['March', 'Jan', 'Feb', 'Dec']`, function() {
        let r = arrsort(['March', 'Jan', 'Feb', 'Dec'])
        let rr = ['Dec', 'Feb', 'Jan', 'March']
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [ '1', '  4  ', '21', '30', '100000' ] when input ['1', '30', '  4  ', '21', '100000']`, function() {
        let r = arrsort(['1', '30', '  4  ', '21', '100000'])
        let rr = ['1', '  4  ', '21', '30', '100000']
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [ '1', '  4  ', 21, '30', '100000' ] when input ['1', '30', '  4  ', 21, '100000']`, function() {
        let r = arrsort(['1', '30', '  4  ', 21, '100000'])
        let rr = ['1', '  4  ', 21, '30', '100000']
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [ 'abc1', 'abc4', 'abc21', 'abc30', 'abc100000' ] when input ['abc1', 'abc30', 'abc4', 'abc21', 'abc100000']`, function() {
        let r = arrsort(['abc1', 'abc30', 'abc4', 'abc21', 'abc100000'])
        let rr = ['abc1', 'abc4', 'abc21', 'abc30', 'abc100000']
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [ '  4 abc ', '100000xy', '1a', '21d', '30c' ] when input ['1a', '30c', '  4 abc ', '21d', '100000xy']`, function() {
        let r = arrsort(['1a', '30c', '  4 abc ', '21d', '100000xy'])
        let rr = ['  4 abc ', '100000xy', '1a', '21d', '30c']
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [ { s: 'Dec', i: 30 }, { s: 'Feb', i: 100000 }, { s: 'Jan', i: 4 }, { s: 'March', i: 1 } ] when input [{ s: 'March', i: 1, }, { s: 'Jan', i: 4, }, { s: 'Feb', i: 100000, }, { s: 'Dec', i: 30, }], { compareKey: 's' }`, function() {
        let r = arrsort([{ s: 'March', i: 1, }, { s: 'Jan', i: 4, }, { s: 'Feb', i: 100000, }, { s: 'Dec', i: 30, }], { compareKey: 's' })
        let rr = [{ s: 'Dec', i: 30 }, { s: 'Feb', i: 100000 }, { s: 'Jan', i: 4 }, { s: 'March', i: 1 }]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [ { s: 'abc1', i: 1 }, { s: 'abc4', i: 100000 }, { s: 'abc30', i: 4 }, { s: 'abc100000', i: 30 } ] when input [{ s: 'abc1', i: 1, }, { s: 'abc30', i: 4, }, { s: 'abc4', i: 100000, }, { s: 'abc100000', i: 30, }], { compareKey: 's' }`, function() {
        let r = arrsort([{ s: 'abc1', i: 1, }, { s: 'abc30', i: 4, }, { s: 'abc4', i: 100000, }, { s: 'abc100000', i: 30, }], { compareKey: 's' })
        let rr = [{ s: 'abc1', i: 1 }, { s: 'abc4', i: 100000 }, { s: 'abc30', i: 4 }, { s: 'abc100000', i: 30 }]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [ { s: 'March', i: 1 }, { s: 'Jan', i: 4 }, { s: 'Dec', i: 30 }, { s: 'Feb', i: 100000 } ] when input [{ s: 'March', i: 1, }, { s: 'Jan', i: 4, }, { s: 'Feb', i: 100000, }, { s: 'Dec', i: 30, }], { compareKey: 'i' }`, function() {
        let r = arrsort([{ s: 'March', i: 1, }, { s: 'Jan', i: 4, }, { s: 'Feb', i: 100000, }, { s: 'Dec', i: 30, }], { compareKey: 'i' })
        let rr = [{ s: 'March', i: 1 }, { s: 'Jan', i: 4 }, { s: 'Dec', i: 30 }, { s: 'Feb', i: 100000 }]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [1, 2, 3, '4', 5, 'abc'], 1`, function() {
        let r = arrsort([1, 2, 3, '4', 5, 'abc'], 1)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ['abc'], ''`, function() {
        let r = arrsort(['abc'], '')
        let rr = ['abc']
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ['abc'], []`, function() {
        let r = arrsort(['abc'], [])
        let rr = ['abc']
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ['abc'], {}`, function() {
        let r = arrsort(['abc'], {})
        let rr = ['abc']
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ['abc'], null`, function() {
        let r = arrsort(['abc'], null)
        let rr = ['abc']
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ['abc'], undefined`, function() {
        let r = arrsort(['abc'], undefined)
        let rr = ['abc']
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [], ''`, function() {
        let r = arrsort([], '')
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [], []`, function() {
        let r = arrsort([], [])
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [], {}`, function() {
        let r = arrsort([], {})
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [], null`, function() {
        let r = arrsort([], null)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [], undefined`, function() {
        let r = arrsort([], undefined)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ''`, function() {
        let r = arrsort('')
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input []`, function() {
        let r = arrsort([])
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input {}`, function() {
        let r = arrsort({})
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input null`, function() {
        let r = arrsort(null)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input undefined`, function() {
        let r = arrsort(undefined)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

})
