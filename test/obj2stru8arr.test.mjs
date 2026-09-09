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
        results: '{"a":123,"b":45.67,"c":"l1-測試中文","d":{"da":123,"db":45.67,"dc":"l2-測試中文","dd":["a","xyz",321,76.54],"de":"[BlazeForUint8Array]::0"}}',
        binarys: [new Uint8Array([66, 97, 115])]
    }
    let cout = `{ results: '{"a":123,"b":45.67,"c":"l1-測試中文","d":{"da":123,"db":45.67,"dc":"l2-測試中文","dd":["a","xyz",321,76.54],"de":"[BlazeForUint8Array]::0"}}', binarys: [ Uint8Array [ 66, 97, 115 ] ] }`
    let empty = {
        results: '',
        binarys: []
    }
    let cempty = `{ results: '{}', binarys: [] }`

    it(`should return ${cout} when input ${JSON.stringify(inp)}`, function() {
        let r = obj2stru8arr(inp)
        let rr = out
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return ${cempty} when input ''`, function() {
        let r = obj2stru8arr('')
        let rr = empty
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return ${cempty} when input []`, function() {
        let r = obj2stru8arr([])
        let rr = empty
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return ${cempty} when input {}`, function() {
        let r = obj2stru8arr({})
        let rr = empty
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return ${cempty} when input null`, function() {
        let r = obj2stru8arr(null)
        let rr = empty
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return ${cempty} when input undefined`, function() {
        let r = obj2stru8arr(undefined)
        let rr = empty
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return ${cempty} when input NaN`, function() {
        let r = obj2stru8arr(NaN)
        let rr = empty
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return ${cempty} when input an object with BigInt`, function() {
        let r = obj2stru8arr({ id: 1n, name: 'x' })
        let rr = empty
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return ${cempty} when input a circular object`, function() {
        let o = { x: 1 }
        o.self = o
        let r = obj2stru8arr(o)
        let rr = empty
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { state: 'success', msg: ${cout} } when input ${JSON.stringify(inp)} with returnWithStateAndMsg`, function() {
        let r = obj2stru8arr(inp, { returnWithStateAndMsg: true })
        let rr = { state: 'success', msg: out }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { state: 'error', msg: 'invalid data, data is not an object or array' } when input NaN with returnWithStateAndMsg`, function() {
        let r = obj2stru8arr(NaN, { returnWithStateAndMsg: true })
        let rr = { state: 'error', msg: 'invalid data, data is not an object or array' }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { state: 'error', msg: 'invalid data, data is an empty object or empty array' } when input {} with returnWithStateAndMsg`, function() {
        let r = obj2stru8arr({}, { returnWithStateAndMsg: true })
        let rr = { state: 'error', msg: 'invalid data, data is an empty object or empty array' }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { state: 'error', msg: 'invalid data, data is an empty object or empty array' } when input [] with returnWithStateAndMsg`, function() {
        let r = obj2stru8arr([], { returnWithStateAndMsg: true })
        let rr = { state: 'error', msg: 'invalid data, data is an empty object or empty array' }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { results: '[1,2,3]', binarys: [] } when input [1, 2, 3]`, function() {
        //陣列亦為支援之輸入型別(obj2u8arr之契約為物件或陣列, 解碼端stru8arr2obj原就能還原陣列)
        let r = obj2stru8arr([1, 2, 3])
        let rr = { results: '[1,2,3]', binarys: [] }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { results: '["a","[BlazeForUint8Array]::0"]', binarys: [ Uint8Array [ 66 ] ] } when input ['a', new Uint8Array([66])]`, function() {
        let r = obj2stru8arr(['a', new Uint8Array([66])])
        let rr = { results: '["a","[BlazeForUint8Array]::0"]', binarys: [new Uint8Array([66])] }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should not throw but return { state: 'error', msg: <Error> } when input data has a throwing getter`, function() {
        //序列化之非預期錯誤須被攔截, 不得外拋至呼叫端
        let o = {
            get a() {
                throw new Error('boom-getter')
            },
        }
        let r = obj2stru8arr(o, { returnWithStateAndMsg: true })
        let rr = { state: 'error', msg: 'Error: boom-getter' }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { state: 'error', msg: <TypeError> } when input an object with BigInt with returnWithStateAndMsg`, function() {
        let r = obj2stru8arr({ id: 1n, name: 'x' }, { returnWithStateAndMsg: true })
        assert.strict.deepStrictEqual(Object.keys(r).sort(), ['msg', 'state'])
        assert.strict.deepStrictEqual(r.state, 'error')
        assert.strict.deepStrictEqual(r.msg.indexOf('TypeError') === 0, true, `msg 應為序列化錯誤, got ${r.msg}`)
    })

    it(`should return ${cout} when input ${JSON.stringify(inp)} with invalid returnWithStateAndMsg`, function() {
        let r = obj2stru8arr(inp, { returnWithStateAndMsg: 'yes' })
        let rr = out
        assert.strict.deepStrictEqual(r, rr)
    })

})
