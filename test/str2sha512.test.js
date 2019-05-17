import assert from 'assert'
import str2sha512 from '../src/str2sha512.mjs'


describe('str2sha512', function() {

    it(`sould return 'ab43333a01571e767a2eb15460c270fa123964c121b88c73e274a211d6e2cf98b10d89220e8d04e2fc573354da93400f3255e94d445dc956e177aa4201a4fc30' when input 'test中文'`, function() {
        let r = str2sha512('test中文')
        let rr = 'ab43333a01571e767a2eb15460c270fa123964c121b88c73e274a211d6e2cf98b10d89220e8d04e2fc573354da93400f3255e94d445dc956e177aa4201a4fc30'
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return 'q0MzOgFXHnZ6LrFUYMJw+hI5ZMEhuIxz4nSiEdbiz5ixDYkiDo0E4vxXM1Tak0APMlXpTURdyVbhd6pCAaT8MA==' when input 'test中文', true`, function() {
        let r = str2sha512('test中文', true)
        let rr = 'q0MzOgFXHnZ6LrFUYMJw+hI5ZMEhuIxz4nSiEdbiz5ixDYkiDo0E4vxXM1Tak0APMlXpTURdyVbhd6pCAaT8MA=='
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return '' when input 'test中文', ''`, function() {
        let r = str2sha512('test中文', '')
        let rr = ''
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return '' when input 'test中文', []`, function() {
        let r = str2sha512('test中文', [])
        let rr = ''
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return '' when input 'test中文', {}`, function() {
        let r = str2sha512('test中文', {})
        let rr = ''
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return '' when input 'test中文', null`, function() {
        let r = str2sha512('test中文', null)
        let rr = ''
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return 'ab43333a01571e767a2eb15460c270fa123964c121b88c73e274a211d6e2cf98b10d89220e8d04e2fc573354da93400f3255e94d445dc956e177aa4201a4fc30' when input 'test中文', undefined`, function() {
        let r = str2sha512('test中文', undefined)
        let rr = 'ab43333a01571e767a2eb15460c270fa123964c121b88c73e274a211d6e2cf98b10d89220e8d04e2fc573354da93400f3255e94d445dc956e177aa4201a4fc30'
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return '' when input ''`, function() {
        let r = str2sha512('')
        let rr = ''
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return '' when input []`, function() {
        let r = str2sha512([])
        let rr = ''
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return '' when input {}`, function() {
        let r = str2sha512({})
        let rr = ''
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return '' when input null`, function() {
        let r = str2sha512(null)
        let rr = ''
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return '' when input undefined`, function() {
        let r = str2sha512(undefined)
        let rr = ''
        assert.strict.deepEqual(r, rr)
    })

})
