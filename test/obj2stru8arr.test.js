import assert from 'assert'
import obj2stru8arr from '../src/obj2stru8arr.mjs'


describe(`obj2stru8arr`, function() {
    let inp = {
        a: 123,
        b: 45.67,
        c: 'l1-測試中文',
        d: {
            da: 123,
            db: 45.67,
            dc: 'l2-測試中文',
            dd: ['a', 'xyz', 321, 76.54],
            de: new Uint8Array([66, 97, 115]),
        },
    }
    let out = {
        results: '{"a":123,"b":45.67,"c":"l1-測試中文","d":{"da":123,"db":45.67,"dc":"l2-測試中文","dd":["a","xyz",321,76.54],"de":"[Uint8Array]::0"}}',
        binarys: [new Uint8Array([66, 97, 115])]
    }
    let cout = `{ results: '{"a":123,"b":45.67,"c":"l1-測試中文","d":{"da":123,"db":45.67,"dc":"l2-測試中文","dd":["a","xyz",321,76.54],"de":"[Uint8Array]::0"}}', binarys: [ Uint8Array [ 66, 97, 115 ] ] }`
    let empty = {
        results: '{}',
        binarys: []
    }
    let cempty = `{ results: '{}', binarys: [] }`

    it(`should return ${cout} when input ${JSON.stringify(inp)}`, function() {
        let r = obj2stru8arr(inp)
        let rr = out
        assert.strict.deepEqual(r, rr)
    })

    it(`should return ${cempty} when input ''`, function() {
        let r = obj2stru8arr('')
        let rr = empty
        assert.strict.deepEqual(r, rr)
    })

    it(`should return ${cempty} when input []`, function() {
        let r = obj2stru8arr([])
        let rr = empty
        assert.strict.deepEqual(r, rr)
    })

    it(`should return ${cempty} when input {}`, function() {
        let r = obj2stru8arr({})
        let rr = empty
        assert.strict.deepEqual(r, rr)
    })

    it(`should return ${cempty} when input null`, function() {
        let r = obj2stru8arr(null)
        let rr = empty
        assert.strict.deepEqual(r, rr)
    })

    it(`should return ${cempty} when input undefined`, function() {
        let r = obj2stru8arr(undefined)
        let rr = empty
        assert.strict.deepEqual(r, rr)
    })

})
