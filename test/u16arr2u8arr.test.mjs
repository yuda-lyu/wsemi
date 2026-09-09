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

    it(`should return { state: 'error', msg: 'invalid u16a' } when input NaN with returnWithStateAndMsg`, function() {
        let r = u16arr2u8arr(NaN, { returnWithStateAndMsg: true })
        let rr = { state: 'error', msg: 'invalid u16a' }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should not throw but return { state: 'error', msg: <TypeError> } when input a detached Uint16Array`, function() {
        //轉換本體之非預期錯誤須被攔截, 不得外拋至呼叫端
        let u16a = new Uint16Array([1, 2, 3])
        structuredClone(u16a.buffer, { transfer: [u16a.buffer] }) //使buffer分離
        let r = u16arr2u8arr(u16a, { returnWithStateAndMsg: true })
        assert.strict.deepStrictEqual(r.state, 'error')
        assert.strict.deepStrictEqual(r.msg.indexOf('TypeError') === 0, true, `msg 應為型別錯誤, got ${r.msg}`)
    })

    it(`should return new Uint8Array([66, 97, 115]) when input new Uint16Array([66, 97, 115]) with invalid returnWithStateAndMsg`, function() {
        let r = u16arr2u8arr(new Uint16Array([66, 97, 115]), { returnWithStateAndMsg: 'yes' })
        let rr = new Uint8Array([66, 97, 115])
        assert.strict.deepStrictEqual(r, rr)
    })

})
