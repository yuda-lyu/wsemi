import assert from 'assert'
import str2aes from '../src/str2aes.mjs'


describe(`str2aes`, function() {
    let str = 'test中文abcdefghijklmn'
    let key = '1234567890abcdefghijk'

    it(`sould return 96*char(hex) when input '${str}', '${key}'`, function() {
        let r = str2aes(str, key)
        let rr = 96
        assert.strict.deepStrictEqual(r.length, rr)
    })

    it(`sould return 64*char(base64) when input '${str}', '${key}', true`, function() {
        let r = str2aes(str, key, true)
        let rr = 64
        assert.strict.deepStrictEqual(r.length, rr)
    })

    it(`sould fallback base64 to false when base64 is an invalid type`, function() {
        //base64非布林值時回退為false, 即輸出hex(96字元), 而非base64(64字元)
        //AES每次加密含隨機salt故密文不固定, 以長度辨別輸出格式
        for (let v of ['', [], {}, null, 1]) {
            let r = str2aes(str, key, v)
            assert.strict.deepStrictEqual(r.length, 96)
        }
    })

    it(`should return '' when key is an invalid type`, function() {
        assert.strict.deepStrictEqual(str2aes(str, ''), '')
        assert.strict.deepStrictEqual(str2aes(str, []), '')
        assert.strict.deepStrictEqual(str2aes(str, {}), '')
        assert.strict.deepStrictEqual(str2aes(str, null), '')
        assert.strict.deepStrictEqual(str2aes(str, undefined), '')
    })

    it(`should return '' when input 12.34`, function() {
        let r = str2aes(12.34)
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input [1, '3', 'abc']`, function() {
        let r = str2aes([1, '3', 'abc'])
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input { a: 12.34, b: 'abc' }`, function() {
        let r = str2aes({ a: 12.34, b: 'abc' })
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input { a: 12.34, b: 'abc', c: '', d: null, e: undefined, f: [], g: {} }`, function() {
        let r = str2aes({ a: 12.34, b: 'abc', c: '', d: null, e: undefined, f: [], g: {} })
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input ''`, function() {
        let r = str2aes('')
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input []`, function() {
        let r = str2aes([])
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input {}`, function() {
        let r = str2aes({})
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input null`, function() {
        let r = str2aes(null)
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input undefined`, function() {
        let r = str2aes(undefined)
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input NaN`, function() {
        let r = str2aes(NaN)
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { state: 'success', msg } when input a string and a key with returnWithStateAndMsg`, function() {
        //opt為第4參數, 因第2、3參數key與base64為既有參數; AES帶隨機salt故每次結果不同, 只驗狀態
        let r = str2aes('abc', 'k', false, { returnWithStateAndMsg: true })
        assert.strict.deepStrictEqual(r.state, 'success')
        assert.strict.deepStrictEqual(typeof r.msg === 'string' && r.msg.length > 0, true)
    })

    it(`should return { state: 'error', msg: 'invalid str' } when str is not a string with returnWithStateAndMsg`, function() {
        let r = str2aes(NaN, 'k', false, { returnWithStateAndMsg: true })
        let rr = { state: 'error', msg: 'invalid str' }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { state: 'error', msg: 'invalid key' } when key is not a string with returnWithStateAndMsg`, function() {
        let r = str2aes('abc', NaN, false, { returnWithStateAndMsg: true })
        let rr = { state: 'error', msg: 'invalid key' }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should fallback to the plain return value when returnWithStateAndMsg is not a boolean`, function() {
        let r = str2aes('abc', 'k', false, { returnWithStateAndMsg: 'yes' })
        assert.strict.deepStrictEqual(typeof r === 'string' && r.length > 0, true)
    })

})
