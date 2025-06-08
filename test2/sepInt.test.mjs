import assert from 'assert'
import sepInt from '../src/sepInt.mjs'


describe(`sepInt`, function() {

    it(`should return [3, 3, 4] when input 10, 3`, function() {
        let r = sepInt(10, 3)
        assert.strict.deepStrictEqual(r, [3, 3, 4])
    })

    it(`should return [-4, -3, -3] when input -10, 3`, function() {
        let r = sepInt(-10, 3)
        assert.strict.deepStrictEqual(r, [-4, -3, -3])
    })

    it(`should return [] when input 10, 0`, function() {
        let r = sepInt(10, 0)
        assert.strict.deepStrictEqual(r, [])
    })

    it(`should return [] when input 10, ''`, function() {
        let r = sepInt(10, '')
        assert.strict.deepStrictEqual(r, [])
    })

    it(`should return [] when input 10, []`, function() {
        let r = sepInt(10, [])
        assert.strict.deepStrictEqual(r, [])
    })

    it(`should return [] when input 10, {}`, function() {
        let r = sepInt(10, {})
        assert.strict.deepStrictEqual(r, [])
    })

    it(`should return [] when input 10, null`, function() {
        let r = sepInt(10, null)
        assert.strict.deepStrictEqual(r, [])
    })

    it(`should return [] when input 10, undefined`, function() {
        let r = sepInt(10, undefined)
        assert.strict.deepStrictEqual(r, [])
    })

    it(`should return [] when input ''`, function() {
        let r = sepInt('')
        assert.strict.deepStrictEqual(r, [])
    })

    it(`should return [] when input []`, function() {
        let r = sepInt([])
        assert.strict.deepStrictEqual(r, [])
    })

    it(`should return [] when input {}`, function() {
        let r = sepInt({})
        assert.strict.deepStrictEqual(r, [])
    })

    it(`should return [] when input null`, function() {
        let r = sepInt(null)
        assert.strict.deepStrictEqual(r, [])
    })

    it(`should return [] when input undefined`, function() {
        let r = sepInt(undefined)
        assert.strict.deepStrictEqual(r, [])
    })

    it(`should return [] when input NaN`, function() {
        let r = sepInt(NaN)
        assert.strict.deepStrictEqual(r, [])
    })

})
