import assert from 'assert'
import str2u8arr from '../src/str2u8arr.mjs'


describe(`str2u8arr`, function() {
    let u8a = new Uint8Array([116, 101, 115, 116, 228, 184, 173, 230, 150, 135])

    it(`should return ${u8a} when input 'test中文'`, function() {
        let r = str2u8arr('test中文')
        let rr = u8a
        assert.strict.deepStrictEqual(r, rr)
    })

    // it(`should return new Uint8Array() when input '1.25'`, function() {
    //     let r = str2u8arr('1.25')
    //     let rr = new Uint8Array()
    //     assert.strict.deepStrictEqual(r, rr)
    // })

    it(`should return new Uint8Array() when input 2.25`, function() {
        let r = str2u8arr(2.25)
        let rr = new Uint8Array()
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return new Uint8Array() when input ''`, function() {
        let r = str2u8arr('')
        let rr = new Uint8Array()
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return new Uint8Array() when input []`, function() {
        let r = str2u8arr([])
        let rr = new Uint8Array()
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return new Uint8Array() when input {}`, function() {
        let r = str2u8arr({})
        let rr = new Uint8Array()
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return new Uint8Array() when input null`, function() {
        let r = str2u8arr(null)
        let rr = new Uint8Array()
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return new Uint8Array() when input undefined`, function() {
        let r = str2u8arr(undefined)
        let rr = new Uint8Array()
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return new Uint8Array() when input NaN`, function() {
        let r = str2u8arr(NaN)
        let rr = new Uint8Array()
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { state: 'success', msg } when input 'abc' with returnWithStateAndMsg`, function() {
        let r = str2u8arr('abc', { returnWithStateAndMsg: true })
        let rr = { state: 'success', msg: new Uint8Array([97, 98, 99]) }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { state: 'error', msg: 'invalid str' } when input NaN with returnWithStateAndMsg`, function() {
        let r = str2u8arr(NaN, { returnWithStateAndMsg: true })
        let rr = { state: 'error', msg: 'invalid str' }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should fallback to the plain return value when returnWithStateAndMsg is not a boolean`, function() {
        let r = str2u8arr('abc', { returnWithStateAndMsg: 'yes' })
        let rr = new Uint8Array([97, 98, 99])
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should encode to UTF-8 bytes, including 4-byte characters, a leading BOM and NUL`, function() {
        //以原生TextEncoder編碼, 期望值為UTF-8規範之位元組
        assert.strict.deepStrictEqual(str2u8arr('😀'), new Uint8Array([0xF0, 0x9F, 0x98, 0x80]))
        assert.strict.deepStrictEqual(str2u8arr('\uFEFFabc'), new Uint8Array([0xEF, 0xBB, 0xBF, 0x61, 0x62, 0x63]))
        assert.strict.deepStrictEqual(str2u8arr('a\u0000b'), new Uint8Array([0x61, 0x00, 0x62]))
        assert.strict.deepStrictEqual(str2u8arr('é€'), new Uint8Array([0xC3, 0xA9, 0xE2, 0x82, 0xAC]))
    })

    let loneSurrogates = ['a\uD800b', '\uDC00', '\uDC00\uD800', 'abc\uD83D']

    it(`should fail for strings with lone surrogates instead of replacing them with U+FFFD`, function() {
        //孤立代理碼元無法正確編碼為UTF-8, TextEncoder會靜默換成U+FFFD而改變資料, 故視為失敗
        for (let s of loneSurrogates) {
            assert.strict.deepStrictEqual(str2u8arr(s), new Uint8Array(), JSON.stringify(s))
            assert.strict.deepStrictEqual(str2u8arr(s, { returnWithStateAndMsg: true }), { state: 'error', msg: 'invalid str, contains lone surrogates' }, JSON.stringify(s))
        }
    })

    it(`should detect lone surrogates the same way without String.prototype.isWellFormed`, function() {
        //舊環境無isWellFormed時改以正則判斷, 結果須相同
        let desc = Object.getOwnPropertyDescriptor(String.prototype, 'isWellFormed')
        delete String.prototype.isWellFormed
        try {
            for (let s of loneSurrogates) {
                assert.strict.deepStrictEqual(str2u8arr(s, { returnWithStateAndMsg: true }), { state: 'error', msg: 'invalid str, contains lone surrogates' }, JSON.stringify(s))
            }
            assert.strict.deepStrictEqual(str2u8arr('a😀b'), new Uint8Array([0x61, 0xF0, 0x9F, 0x98, 0x80, 0x62]))
        }
        finally {
            Object.defineProperty(String.prototype, 'isWellFormed', desc) // eslint-disable-line no-extend-native
        }
    })

    it(`should encode large strings`, function() {
        //原以crypto-js經base64轉換, 約10MB需1.6秒, 50MB需9秒; 改用原生後與資料量成線性
        let s = 'test中文abc😀'.repeat(500000)
        let r = str2u8arr(s)
        assert.strict.deepStrictEqual(r.length, Buffer.byteLength(s, 'utf8'))
        assert.strict.deepStrictEqual(Buffer.from(r).toString('utf8') === s, true)
    })

})
