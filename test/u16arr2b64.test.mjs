import assert from 'assert'
import u16arr2b64 from '../src/u16arr2b64.mjs'


describe(`u16arr2b64`, function() {

    it(`should return 'AgAsAf//' when input new Uint16Array([2, 300, 65535]) (elements greater than 255 must not be truncated)`, function() {
        //舊版經u16arr2u8arr逐元素轉換, 300會被截為44、65535被截為255
        let r = u16arr2b64(new Uint16Array([2, 300, 65535]))
        let rr = 'AgAsAf//'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'AQACAC0AAAA=' when input new Uint16Array([1, 2.3, '45', 'abc'])`, function() {
        let u8a = new Uint16Array([1, 2.3, '45', 'abc'])
        let r = u16arr2b64(u8a)
        let rr = 'AQACAC0AAAA='
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input '1.25'`, function() {
        let r = u16arr2b64('1.25')
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input 2.25`, function() {
        let r = u16arr2b64(2.25)
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input ''`, function() {
        let r = u16arr2b64('')
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input []`, function() {
        let r = u16arr2b64([])
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input {}`, function() {
        let r = u16arr2b64({})
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input null`, function() {
        let r = u16arr2b64(null)
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input undefined`, function() {
        let r = u16arr2b64(undefined)
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input NaN`, function() {
        let r = u16arr2b64(NaN)
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { state: 'success', msg: 'QgBhAHMA' } when input new Uint16Array([66, 97, 115]) with returnWithStateAndMsg`, function() {
        let r = u16arr2b64(new Uint16Array([66, 97, 115]), { returnWithStateAndMsg: true })
        let rr = { state: 'success', msg: 'QgBhAHMA' }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { state: 'error', msg: 'invalid u16a' } when input NaN with returnWithStateAndMsg`, function() {
        let r = u16arr2b64(NaN, { returnWithStateAndMsg: true })
        let rr = { state: 'error', msg: 'invalid u16a' }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should not throw but return { state: 'error', msg: 'u16arr2u8arr: <TypeError>' } when input a detached Uint16Array`, function() {
        //轉換本體之非預期錯誤須被攔截; 改為自取位元組視圖後不再經u16arr2u8arr, 故錯誤來自本函數自身
        let u16a = new Uint16Array([1, 2, 3])
        structuredClone(u16a.buffer, { transfer: [u16a.buffer] }) //使buffer分離
        let r = u16arr2b64(u16a, { returnWithStateAndMsg: true })
        assert.strict.deepStrictEqual(r.state, 'error')
        assert.strict.deepStrictEqual(r.msg.indexOf('TypeError') === 0, true, `msg 應為型別錯誤, got ${r.msg}`)
    })

    it(`should return 'QgBhAHMA' when input new Uint16Array([66, 97, 115]) with invalid returnWithStateAndMsg`, function() {
        let r = u16arr2b64(new Uint16Array([66, 97, 115]), { returnWithStateAndMsg: 'yes' })
        let rr = 'QgBhAHMA'
        assert.strict.deepStrictEqual(r, rr)
    })

})
