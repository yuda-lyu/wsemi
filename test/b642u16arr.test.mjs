import assert from 'assert'
import b642u16arr from '../src/b642u16arr.mjs'


describe(`b642u16arr`, function() {

    it(`should return new Uint16Array([1, 2.3, '45', 'abc']) when input 'AQACAC0AAAA='`, function() {
        //以逐位元組(little-endian)解碼, 每個元素佔2 bytes
        let u8a = new Uint16Array([1, 2.3, '45', 'abc'])
        let r = b642u16arr('AQACAC0AAAA=')
        let rr = u8a
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return new Uint16Array([513, 45]) when input 'AQItAA=='`, function() {
        //舊版以逐元素解碼故得[1,2,45,0], 現以逐位元組解碼故4 bytes得2個元素
        let r = b642u16arr('AQItAA==')
        let rr = new Uint16Array([513, 45])
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return new Uint16Array() when input '1.25'`, function() {
        //'1.25'會被視為base64文字進行轉換, 得3 bytes; 位元組長度非偶數無法組成Uint16Array故回空
        let r = b642u16arr('1.25')
        let rr = new Uint16Array()
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return new Uint16Array() when the decoded byte length is odd`, function() {
        let r = b642u16arr('QQ==') //1 byte
        let rr = new Uint16Array()
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should round-trip elements greater than 255`, function() {
        //舊版經u8arr2u16arr逐元素解碼, 大於255之元素會遺失高位元組
        let r = b642u16arr('AgAsAf//')
        let rr = new Uint16Array([2, 300, 65535])
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return new Uint16Array() when input 2.25`, function() {
        let r = b642u16arr(2.25)
        let rr = new Uint16Array()
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return new Uint16Array() when input ''`, function() {
        let r = b642u16arr('')
        let rr = new Uint16Array()
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return new Uint16Array() when input []`, function() {
        let r = b642u16arr([])
        let rr = new Uint16Array()
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return new Uint16Array() when input {}`, function() {
        let r = b642u16arr({})
        let rr = new Uint16Array()
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return new Uint16Array() when input null`, function() {
        let r = b642u16arr(null)
        let rr = new Uint16Array()
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return new Uint16Array() when input undefined`, function() {
        let r = b642u16arr(undefined)
        let rr = new Uint16Array()
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return new Uint16Array() when input NaN`, function() {
        let r = b642u16arr(NaN)
        let rr = new Uint16Array()
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { state: 'success', msg } when input 'CwBPAAYA' with returnWithStateAndMsg`, function() {
        let r = b642u16arr('CwBPAAYA', { returnWithStateAndMsg: true })
        let rr = { state: 'success', msg: new Uint16Array([11, 79, 6]) }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { state: 'error', msg: 'invalid b64' } when input NaN with returnWithStateAndMsg`, function() {
        let r = b642u16arr(NaN, { returnWithStateAndMsg: true })
        let rr = { state: 'error', msg: 'invalid b64' }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { state: 'error', msg: <not even> } when the decoded byte length is odd with returnWithStateAndMsg`, function() {
        let r = b642u16arr('QQ==', { returnWithStateAndMsg: true })
        assert.strict.deepStrictEqual(r.state, 'error')
        assert.strict.deepStrictEqual(r.msg.indexOf('is not even') >= 0, true, `msg 應標明位元組長度非偶數, got ${r.msg}`)
    })

    it(`should fallback to the plain return value when returnWithStateAndMsg is not a boolean`, function() {
        let r = b642u16arr('CwBPAAYA', { returnWithStateAndMsg: 'yes' })
        let rr = new Uint16Array([11, 79, 6])
        assert.strict.deepStrictEqual(r, rr)
    })

})
