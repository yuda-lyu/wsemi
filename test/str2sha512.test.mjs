import assert from 'assert'
import str2sha512 from '../src/str2sha512.mjs'


describe(`str2sha512`, function() {

    it(`sould return 'ab43333a01571e767a2eb15460c270fa123964c121b88c73e274a211d6e2cf98b10d89220e8d04e2fc573354da93400f3255e94d445dc956e177aa4201a4fc30' when input 'test中文'`, function() {
        let r = str2sha512('test中文')
        let rr = 'ab43333a01571e767a2eb15460c270fa123964c121b88c73e274a211d6e2cf98b10d89220e8d04e2fc573354da93400f3255e94d445dc956e177aa4201a4fc30'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return 'q0MzOgFXHnZ6LrFUYMJw+hI5ZMEhuIxz4nSiEdbiz5ixDYkiDo0E4vxXM1Tak0APMlXpTURdyVbhd6pCAaT8MA==' when input 'test中文', true`, function() {
        let r = str2sha512('test中文', true)
        let rr = 'q0MzOgFXHnZ6LrFUYMJw+hI5ZMEhuIxz4nSiEdbiz5ixDYkiDo0E4vxXM1Tak0APMlXpTURdyVbhd6pCAaT8MA=='
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould fallback base64 to false when input 'test中文', ''`, function() {
        let r = str2sha512('test中文', '')
        let rr = 'ab43333a01571e767a2eb15460c270fa123964c121b88c73e274a211d6e2cf98b10d89220e8d04e2fc573354da93400f3255e94d445dc956e177aa4201a4fc30'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould fallback base64 to false when input 'test中文', []`, function() {
        let r = str2sha512('test中文', [])
        let rr = 'ab43333a01571e767a2eb15460c270fa123964c121b88c73e274a211d6e2cf98b10d89220e8d04e2fc573354da93400f3255e94d445dc956e177aa4201a4fc30'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould fallback base64 to false when input 'test中文', {}`, function() {
        let r = str2sha512('test中文', {})
        let rr = 'ab43333a01571e767a2eb15460c270fa123964c121b88c73e274a211d6e2cf98b10d89220e8d04e2fc573354da93400f3255e94d445dc956e177aa4201a4fc30'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould fallback base64 to false when input 'test中文', null`, function() {
        let r = str2sha512('test中文', null)
        let rr = 'ab43333a01571e767a2eb15460c270fa123964c121b88c73e274a211d6e2cf98b10d89220e8d04e2fc573354da93400f3255e94d445dc956e177aa4201a4fc30'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return 'ab43333a01571e767a2eb15460c270fa123964c121b88c73e274a211d6e2cf98b10d89220e8d04e2fc573354da93400f3255e94d445dc956e177aa4201a4fc30' when input 'test中文', undefined`, function() {
        let r = str2sha512('test中文', undefined)
        let rr = 'ab43333a01571e767a2eb15460c270fa123964c121b88c73e274a211d6e2cf98b10d89220e8d04e2fc573354da93400f3255e94d445dc956e177aa4201a4fc30'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input ''`, function() {
        let r = str2sha512('')
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input []`, function() {
        let r = str2sha512([])
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input {}`, function() {
        let r = str2sha512({})
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input null`, function() {
        let r = str2sha512(null)
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input undefined`, function() {
        let r = str2sha512(undefined)
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input NaN`, function() {
        let r = str2sha512(NaN)
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { state: 'success', msg } when input 'abc' with returnWithStateAndMsg`, function() {
        //opt為第3參數, 因第2參數base64為既有參數
        let r = str2sha512('abc', false, { returnWithStateAndMsg: true })
        let rr = { state: 'success', msg: str2sha512('abc') }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { state: 'error', msg: 'str2sha: invalid str' } when input NaN with returnWithStateAndMsg`, function() {
        //內部呼叫之錯誤須前置來源函數名
        let r = str2sha512(NaN, false, { returnWithStateAndMsg: true })
        let rr = { state: 'error', msg: 'str2sha: invalid str' }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should fallback to the plain return value when returnWithStateAndMsg is not a boolean`, function() {
        let r = str2sha512('abc', false, { returnWithStateAndMsg: 'yes' })
        let rr = str2sha512('abc')
        assert.strict.deepStrictEqual(r, rr)
    })

})
