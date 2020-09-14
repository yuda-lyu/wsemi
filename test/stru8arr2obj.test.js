import assert from 'assert'
import stru8arr2obj from '../src/stru8arr2obj.mjs'


describe(`stru8arr2obj`, function() {
    let inp = {
        results: '{"a":123,"b":45.67,"c":"l1-測試中文","d":{"da":123,"db":45.67,"dc":"l2-測試中文","dd":["a","xyz",321,76.54],"de":"[Uint8Array]::0"}}',
        binarys: [new Uint8Array([66, 97, 115])]
    }
    let out = {
        a: 123,
        b: 45.67,
        c: 'l1-測試中文',
        d: {
            da: 123,
            db: 45.67,
            dc: 'l2-測試中文',
            dd: ['a', 'xyz', 321, 76.54],
            de: new Uint8Array([66, 97, 115]),
        }
    }
    let cout = `{ a: 123, b: 45.67, c: 'l1-測試中文', d: { da: 123, db: 45.67, dc: 'l2-測試中文', dd: ['a', 'xyz', 321, 76.54], de: new Uint8Array([66, 97, 115]), } }`
    let empty = {}
    let cempty = '{}'

    it(`should return ${cout} when input ${JSON.stringify(inp)}`, function() {
        let r = stru8arr2obj(inp)
        let rr = out
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return ${cempty} when input ''`, function() {
        let r = stru8arr2obj('')
        let rr = empty
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return ${cempty} when input []`, function() {
        let r = stru8arr2obj([])
        let rr = empty
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return ${cempty} when input {}`, function() {
        let r = stru8arr2obj({})
        let rr = empty
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return ${cempty} when input null`, function() {
        let r = stru8arr2obj(null)
        let rr = empty
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return ${cempty} when input undefined`, function() {
        let r = stru8arr2obj(undefined)
        let rr = empty
        assert.strict.deepStrictEqual(r, rr)
    })

})
