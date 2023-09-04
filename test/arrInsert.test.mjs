import assert from 'assert'
import arrInsert from '../src/arrInsert.mjs'


describe(`arrInsert`, function() {

    it(`should return ['abc'] when input [], 0, 'abc'`, function() {
        let r = arrInsert([], 0, 'abc')
        let rr = ['abc']
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return ['abc', 1, 2.5, '123'] when input [1, 2.5, '123'], 0, 'abc'`, function() {
        let r = arrInsert([1, 2.5, '123'], 0, 'abc')
        let rr = ['abc', 1, 2.5, '123']
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [1, 'abc', 2.5, '123'] when input [1, 2.5, '123'], 1, 'abc'`, function() {
        let r = arrInsert([1, 2.5, '123'], 1, 'abc')
        let rr = [1, 'abc', 2.5, '123']
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [1, 2.5, '123', 'abc'] when input [1, 2.5, '123'], 3, 'abc'`, function() {
        let r = arrInsert([1, 2.5, '123'], 3, 'abc')
        let rr = [1, 2.5, '123', 'abc']
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [ 1, 2.5, '123' ] when input [1, 2.5, '123'], 4, 'abc'`, function() {
        let r = arrInsert([1, 2.5, '123'], 4, 'abc')
        let rr = [1, 2.5, '123']
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [1, null, 2.5, '123'] when input [1, 2.5, '123'], 1, null`, function() {
        let r = arrInsert([1, 2.5, '123'], 1, null)
        let rr = [1, null, 2.5, '123']
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [ 1, 'abc', null, 'xyz', 2.5, '123' ] when input [1, 2.5, '123'], 1, ['abc', null, 'xyz']`, function() {
        let r = arrInsert([1, 2.5, '123'], 1, ['abc', null, 'xyz'])
        let rr = [1, 'abc', null, 'xyz', 2.5, '123']
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return false when input ''`, function() {
        let r = arrInsert('')
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return false when input []`, function() {
        let r = arrInsert([])
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return false when input {}`, function() {
        let r = arrInsert({})
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return false when input null`, function() {
        let r = arrInsert(null)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return false when input undefined`, function() {
        let r = arrInsert(undefined)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return false when input NaN`, function() {
        let r = arrInsert(NaN)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return false when input [], ''`, function() {
        let r = arrInsert([], '')
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return false when input [], []`, function() {
        let r = arrInsert([], [])
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return false when input [], {}`, function() {
        let r = arrInsert([], {})
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return false when input [], null`, function() {
        let r = arrInsert([], null)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return false when input [], undefined`, function() {
        let r = arrInsert([], undefined)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return false when input ['abc'], ''`, function() {
        let r = arrInsert(['abc'], '')
        let rr = ['abc']
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return false when input ['abc'], []`, function() {
        let r = arrInsert(['abc'], [])
        let rr = ['abc']
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return false when input ['abc'], {}`, function() {
        let r = arrInsert(['abc'], {})
        let rr = ['abc']
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return false when input ['abc'], null`, function() {
        let r = arrInsert(['abc'], null)
        let rr = ['abc']
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return false when input ['abc'], undefined`, function() {
        let r = arrInsert(['abc'], undefined)
        let rr = ['abc']
        assert.strict.deepStrictEqual(r, rr)
    })

})
