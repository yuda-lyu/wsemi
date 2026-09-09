import assert from 'assert'
import stru8arr2obj from '../src/stru8arr2obj.mjs'


describe(`stru8arr2obj`, function() {
    let inp = {
        results: '{"a":123,"b":45.67,"c":"l1-測試中文","d":{"da":123,"db":45.67,"dc":"l2-測試中文","dd":["a","xyz",321,76.54],"de":"[BlazeForUint8Array]::0"}}',
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

    it(`should return ${cempty} when input NaN`, function() {
        let r = stru8arr2obj(NaN)
        let rr = empty
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return ${cempty} when input results is not a valid json`, function() {
        let r = stru8arr2obj({ results: 'not-json', binarys: [] })
        let rr = empty
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { a: 1, b: Uint8Array [ 66 ] } when input results with the new marker`, function() {
        let r = stru8arr2obj({ results: '{"a":1,"b":"[BlazeForUint8Array]::0"}', binarys: [new Uint8Array([66])] })
        let rr = { a: 1, b: new Uint8Array([66]) }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should NOT restore the legacy marker (kept as a plain string) when input results with the legacy marker`, function() {
        //舊版標記已不再支援還原, 舊版產出之封包其binary會留為標記字串
        let r = stru8arr2obj({ results: '{"a":1,"b":"[Uint8Array]::0"}', binarys: [new Uint8Array([66])] })
        let rr = { a: 1, b: '[Uint8Array]::0' }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [1, 2, 3] when input results is an array`, function() {
        let r = stru8arr2obj({ results: '[1,2,3]', binarys: [] })
        let rr = [1, 2, 3]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { state: 'success', msg: ${cout} } when input ${JSON.stringify(inp)} with returnWithStateAndMsg`, function() {
        let r = stru8arr2obj(inp, { returnWithStateAndMsg: true })
        let rr = { state: 'success', msg: out }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { state: 'error', msg: 'invalid data' } when input NaN with returnWithStateAndMsg`, function() {
        let r = stru8arr2obj(NaN, { returnWithStateAndMsg: true })
        let rr = { state: 'error', msg: 'invalid data' }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should not throw but return { state: 'error', msg: <Error> } when input data has a throwing getter`, function() {
        //取值之非預期錯誤須被攔截, 不得外拋至呼叫端
        let o = {
            get results() {
                throw new Error('boom-getter')
            },
            binarys: [],
        }
        let r = stru8arr2obj(o, { returnWithStateAndMsg: true })
        let rr = { state: 'error', msg: 'Error: boom-getter' }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { state: 'error', msg: 'invalid results' } when input results is empty with returnWithStateAndMsg`, function() {
        let r = stru8arr2obj({ results: '', binarys: [] }, { returnWithStateAndMsg: true })
        let rr = { state: 'error', msg: 'invalid results' }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { state: 'error', msg: 'invalid binarys' } when input binarys is not an array with returnWithStateAndMsg`, function() {
        let r = stru8arr2obj({ results: '{"a":1}', binarys: 'x' }, { returnWithStateAndMsg: true })
        let rr = { state: 'error', msg: 'invalid binarys' }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { state: 'error', msg: <SyntaxError> } when input results is not a valid json with returnWithStateAndMsg`, function() {
        let r = stru8arr2obj({ results: 'not-json', binarys: [] }, { returnWithStateAndMsg: true })
        assert.strict.deepStrictEqual(Object.keys(r).sort(), ['msg', 'state'])
        assert.strict.deepStrictEqual(r.state, 'error')
        assert.strict.deepStrictEqual(r.msg.indexOf('SyntaxError') === 0, true, `msg 應為解析錯誤, got ${r.msg}`)
    })

    it(`should return ${cout} when input ${JSON.stringify(inp)} with invalid returnWithStateAndMsg`, function() {
        let r = stru8arr2obj(inp, { returnWithStateAndMsg: 'yes' })
        let rr = out
        assert.strict.deepStrictEqual(r, rr)
    })

})
