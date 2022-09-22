import assert from 'assert'
import arrMin from '../src/arrMin.mjs'


describe(`arrMin`, function() {
    let k
    let oin = {}
    let oout = {}

    k = 1
    oin[k] = [100000, 1, 30, 4, 21]
    oout[k] = 1
    it(`should return ${JSON.stringify(oout[k])} when input ${JSON.stringify(oin[k])}`, function() {
        k = 1
        let r = arrMin(oin[k])
        let rr = oout[k]
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 2
    oin[k] = [1, 30, 4, 21, 100000]
    oout[k] = 1
    it(`should return ${JSON.stringify(oout[k])} when input ${JSON.stringify(oin[k])}`, function() {
        k = 2
        let r = arrMin(oin[k])
        let rr = oout[k]
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 3
    oin[k] = [1, 30, 4, 100000, 21]
    oout[k] = 1
    it(`should return ${JSON.stringify(oout[k])} when input ${JSON.stringify(oin[k])}`, function() {
        k = 3
        let r = arrMin(oin[k])
        let rr = oout[k]
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 4
    oin[k] = [1, 30, 4, 100000, 21]
    oout[k] = 0
    it(`should return ${JSON.stringify(oout[k])} when input ${JSON.stringify(oin[k])}, { returnIndex: true }`, function() {
        k = 4
        let r = arrMin(oin[k], { returnIndex: true })
        let rr = oout[k]
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 5
    oin[k] = ['March', 'Jan', 'Feb', 'Dec']
    oout[k] = null
    it(`should return ${JSON.stringify(oout[k])} when input ${JSON.stringify(oin[k])}`, function() {
        k = 5
        let r = arrMin(oin[k])
        let rr = oout[k]
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 6
    oin[k] = ['1', '30', '  4  ', '100000', '21']
    oout[k] = 1
    it(`should return ${JSON.stringify(oout[k])} when input ${JSON.stringify(oin[k])}`, function() {
        k = 6
        let r = arrMin(oin[k])
        let rr = oout[k]
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 7
    oin[k] = ['1', '30', '  4  ', '100000', 21]
    oout[k] = 1
    it(`should return ${JSON.stringify(oout[k])} when input ${JSON.stringify(oin[k])}`, function() {
        k = 7
        let r = arrMin(oin[k])
        let rr = oout[k]
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 8
    oin[k] = ['a1', 'b30', '  4  ', '100000', 21]
    oout[k] = 4
    it(`should return ${JSON.stringify(oout[k])} when input ${JSON.stringify(oin[k])}`, function() {
        k = 8
        let r = arrMin(oin[k])
        let rr = oout[k]
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 9
    oin[k] = [{ s: 'March', i: 1 }, { s: 'Jan', i: 4 }, { s: 'Feb', i: 100000 }, { s: 'Dec', i: 30 }, { s: 'Nov', i: 'a25' }]
    oout[k] = { s: 'March', i: 1 }
    it(`should return ${JSON.stringify(oout[k])} when input ${JSON.stringify(oin[k])}, { compareKey: 'i' }`, function() {
        k = 9
        let r = arrMin(oin[k], { compareKey: 'i' })
        let rr = oout[k]
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 10
    oin[k] = [{ s: 'March', i: 1 }, { s: 'Jan', i: 4 }, { s: 'Feb', i: 100000 }, { s: 'Dec', i: 30 }, { s: 'Nov', i: 'a25' }]
    oout[k] = null
    it(`should return ${JSON.stringify(oout[k])} when input ${JSON.stringify(oin[k])}, { compareKey: 's' }`, function() {
        k = 10
        let r = arrMin(oin[k], { compareKey: 's' })
        let rr = oout[k]
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 11
    oin[k] = [{ s: 'March', i: 1 }, { s: 'Jan', i: 4 }, { s: 'Feb', i: 100000 }, { s: 'Dec', i: 30 }, { s: 'Nov', i: 'a25' }]
    oout[k] = 0
    it(`should return ${JSON.stringify(oout[k])} when input ${JSON.stringify(oin[k])}, { compareKey: 'i', returnIndex: true }`, function() {
        k = 11
        let r = arrMin(oin[k], { compareKey: 'i', returnIndex: true })
        let rr = oout[k]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ['123'], ''`, function() {
        let r = arrMin(['123'], '')
        let rr = 123
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ['123'], []`, function() {
        let r = arrMin(['123'], [])
        let rr = 123
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ['123'], {}`, function() {
        let r = arrMin(['123'], {})
        let rr = 123
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ['123'], null`, function() {
        let r = arrMin(['123'], null)
        let rr = 123
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ['123'], undefined`, function() {
        let r = arrMin(['123'], undefined)
        let rr = 123
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ['abc'], ''`, function() {
        let r = arrMin(['abc'], '')
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ['abc'], []`, function() {
        let r = arrMin(['abc'], [])
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ['abc'], {}`, function() {
        let r = arrMin(['abc'], {})
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ['abc'], null`, function() {
        let r = arrMin(['abc'], null)
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ['abc'], undefined`, function() {
        let r = arrMin(['abc'], undefined)
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [], ''`, function() {
        let r = arrMin([], '')
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [], []`, function() {
        let r = arrMin([], [])
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [], {}`, function() {
        let r = arrMin([], {})
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [], null`, function() {
        let r = arrMin([], null)
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [], undefined`, function() {
        let r = arrMin([], undefined)
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ''`, function() {
        let r = arrMin('')
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input []`, function() {
        let r = arrMin([])
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input {}`, function() {
        let r = arrMin({})
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input null`, function() {
        let r = arrMin(null)
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input undefined`, function() {
        let r = arrMin(undefined)
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

})
