import assert from 'assert'
import obj2u8arr from '../src/obj2u8arr.mjs'


describe(`obj2u8arr`, function() {
    let data = {
        a: [123, 45.67, 'test中文'],
        b: {
            c: new Uint8Array([66, 97, 115]),
        },
    }
    let cdata = `{ a: [123, 45.67, 'test中文'], b: { c: new Uint8Array([66, 97, 115]) } }`
    let u8a = new Uint8Array([
        64, 24, 0, 0, 0, 0, 0, 0, 91, 54, 54, 44,
        51, 93, 123, 34, 97, 34, 58, 91, 49, 50, 51, 44,
        52, 53, 46, 54, 55, 44, 34, 116, 101, 115, 116, 228,
        184, 173, 230, 150, 135, 34, 93, 44, 34, 98, 34, 58,
        123, 34, 99, 34, 58, 34, 91, 66, 108, 97, 122, 101,
        70, 111, 114, 85, 105, 110, 116, 56, 65, 114, 114, 97,
        121, 93, 58, 58, 48, 34, 125, 125, 66, 97, 115
    ])
    let cu8a = `new Uint8Array([ 64, 24, 0, 0, 0, 0, 0, 0, 91, 54, 54, 44, 51, 93, 123, 34, 97, 34, 58, 91, 49, 50, 51, 44, 52, 53, 46, 54, 55, 44, 34, 116, 101, 115, 116, 228, 184, 173, 230, 150, 135, 34, 93, 44, 34, 98, 34, 58, 123, 34, 99, 34, 58, 34, 91, 66, 108, 97, 122, 101, 70, 111, 114, 85, 105, 110, 116, 56, 65, 114, 114, 97, 121, 93, 58, 58, 48, 34, 125, 125, 66, 97, 115 ])`

    it(`should return ${cu8a} when input ${cdata}`, function() {
        let r = obj2u8arr(data)
        let rr = u8a
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return new Uint8Array() when input ''`, function() {
        let r = obj2u8arr('')
        let rr = new Uint8Array()
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return new Uint8Array() when input []`, function() {
        let r = obj2u8arr([])
        let rr = new Uint8Array()
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return new Uint8Array() when input {}`, function() {
        let r = obj2u8arr({})
        let rr = new Uint8Array()
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return new Uint8Array() when input null`, function() {
        let r = obj2u8arr(null)
        let rr = new Uint8Array()
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return new Uint8Array() when input undefined`, function() {
        let r = obj2u8arr(undefined)
        let rr = new Uint8Array()
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return new Uint8Array() when input NaN`, function() {
        let r = obj2u8arr(NaN)
        let rr = new Uint8Array()
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return new Uint8Array() when input an object with BigInt`, function() {
        //序列化失敗時不得產出結構合法但內容為空之封包(解碼端無從辨識)
        let r = obj2u8arr({ id: 1n, name: 'x' })
        let rr = new Uint8Array()
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return new Uint8Array() when input a circular object`, function() {
        let o = { x: 1 }
        o.self = o
        let r = obj2u8arr(o)
        let rr = new Uint8Array()
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should encode an effective array (not an empty packet) when input [1, 2, 3]`, function() {
        //陣列為契約內之輸入型別, 不得回空Uint8Array
        let r = obj2u8arr([1, 2, 3])
        assert.strict.deepStrictEqual(r.length > 0, true, `陣列應可編碼, got ${JSON.stringify(Array.from(r))}`)
    })

    it(`should return { state: 'success', msg } when input [1, 2, 3] with returnWithStateAndMsg`, function() {
        let r = obj2u8arr([1, 2, 3], { returnWithStateAndMsg: true })
        assert.strict.deepStrictEqual(r.state, 'success')
        assert.strict.deepStrictEqual(r.msg.length > 0, true)
    })

    it(`should return { state: 'success', msg: ${cu8a} } when input ${cdata} with returnWithStateAndMsg`, function() {
        let r = obj2u8arr(data, { returnWithStateAndMsg: true })
        let rr = { state: 'success', msg: u8a }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { state: 'error', msg: 'invalid data, data is not an effective object or a non-empty array' } when input NaN with returnWithStateAndMsg`, function() {
        let r = obj2u8arr(NaN, { returnWithStateAndMsg: true })
        let rr = { state: 'error', msg: 'invalid data, data is not an effective object or a non-empty array' }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should encode a single-element array whose only element is an empty value`, function() {
        //不可用isearr判斷: 其於長度為1時會額外檢查該元素是否有效, 使單元素陣列因元素為空值而被整個拒絕
        for (let o of [[''], [null], [0], [false]]) {
            let r = obj2u8arr(o)
            assert.strict.deepStrictEqual(r.length > 0, true, `${JSON.stringify(o)} 應可編碼, got ${JSON.stringify(Array.from(r))}`)
        }
    })

    it(`should not throw but return { state: 'error', msg: 'obj2stru8arr: <Error>' } when input data has a throwing getter`, function() {
        //序列化之非預期錯誤須被攔截, 不得外拋至呼叫端
        let o = {
            get a() {
                throw new Error('boom-getter')
            },
        }
        let r = obj2u8arr(o, { returnWithStateAndMsg: true })
        let rr = { state: 'error', msg: 'obj2stru8arr: Error: boom-getter' }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { state: 'error', msg: 'obj2stru8arr: <TypeError>' } when input an object with BigInt with returnWithStateAndMsg`, function() {
        //內部呼叫之錯誤須前置來源函數名, 供辨識是哪一步出錯
        let r = obj2u8arr({ id: 1n, name: 'x' }, { returnWithStateAndMsg: true })
        assert.strict.deepStrictEqual(Object.keys(r).sort(), ['msg', 'state'])
        assert.strict.deepStrictEqual(r.state, 'error')
        assert.strict.deepStrictEqual(r.msg.indexOf('obj2stru8arr: TypeError') === 0, true, `msg 應標明來源函數與序列化錯誤, got ${r.msg}`)
    })

    it(`should return ${cu8a} when input ${cdata} with invalid returnWithStateAndMsg`, function() {
        let r = obj2u8arr(data, { returnWithStateAndMsg: 'yes' })
        let rr = u8a
        assert.strict.deepStrictEqual(r, rr)
    })

})
