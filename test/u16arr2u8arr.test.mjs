import assert from 'assert'
import u16arr2u8arr from '../src/u16arr2u8arr.mjs'


describe(`u16arr2u8arr`, function() {

    let u16a = new Uint16Array([66, 97, 115])
    let u8a = new Uint8Array([66, 97, 115])
    it(`should return ${u8a} when input ${u16a}`, function() {
        let r = u16arr2u8arr(u16a)
        let rr = u8a
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return new Uint8Array() when input '1.25'`, function() {
        let r = u16arr2u8arr('1.25')
        let rr = new Uint8Array()
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return new Uint8Array() when input 2.25`, function() {
        let r = u16arr2u8arr(2.25)
        let rr = new Uint8Array()
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return new Uint8Array() when input ''`, function() {
        let r = u16arr2u8arr('')
        let rr = new Uint8Array()
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return new Uint8Array() when input []`, function() {
        let r = u16arr2u8arr([])
        let rr = new Uint8Array()
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return new Uint8Array() when input {}`, function() {
        let r = u16arr2u8arr({})
        let rr = new Uint8Array()
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return new Uint8Array() when input null`, function() {
        let r = u16arr2u8arr(null)
        let rr = new Uint8Array()
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return new Uint8Array() when input undefined`, function() {
        let r = u16arr2u8arr(undefined)
        let rr = new Uint8Array()
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return new Uint8Array() when input NaN`, function() {
        let r = u16arr2u8arr(NaN)
        let rr = new Uint8Array()
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { state: 'success', msg: new Uint8Array([66, 97, 115]) } when input new Uint16Array([66, 97, 115]) with returnWithStateAndMsg`, function() {
        let r = u16arr2u8arr(new Uint16Array([66, 97, 115]), { returnWithStateAndMsg: true })
        let rr = { state: 'success', msg: new Uint8Array([66, 97, 115]) }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { state: 'error', msg: 'invalid u16a: must be a Uint16Array' } when input NaN with returnWithStateAndMsg`, function() {
        let r = u16arr2u8arr(NaN, { returnWithStateAndMsg: true })
        let rr = { state: 'error', msg: 'invalid u16a: must be a Uint16Array' }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should not throw but return { state: 'error', msg: 'can not convert u16a to u8a' } (the fixed message, not the TypeError text) when input a detached Uint16Array`, function() {
        //轉換本體之非預期錯誤須被攔截, 不得外拋至呼叫端
        //第676項(R-CATCH-TEXT-01): msg為固定詞彙(V19、V20), 不再轉出原生錯誤之文字(原為'TypeError: ...'); 細節經opt之診斷出口
        let u16a = new Uint16Array([1, 2, 3])
        structuredClone(u16a.buffer, { transfer: [u16a.buffer] }) //使buffer分離
        let r = u16arr2u8arr(u16a, { returnWithStateAndMsg: true })
        assert.strict.deepStrictEqual(r, { state: 'error', msg: 'can not convert u16a to u8a' })
    })

    it(`should return new Uint8Array([66, 97, 115]) when input new Uint16Array([66, 97, 115]) with invalid returnWithStateAndMsg`, function() {
        let r = u16arr2u8arr(new Uint16Array([66, 97, 115]), { returnWithStateAndMsg: 'yes' })
        let rr = new Uint8Array([66, 97, 115])
        assert.strict.deepStrictEqual(r, rr)
    })

})
