import assert from 'assert'
import u8arr2u16arr from '../src/u8arr2u16arr.mjs'


describe(`u8arr2u16arr`, function() {

    let u8a = new Uint8Array([66, 97, 115])
    let u16a = new Uint16Array([66, 97, 115])
    it(`should return ${u16a} when input ${u8a}`, function() {
        let r = u8arr2u16arr(u8a)
        let rr = u16a
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return new Uint16Array() when input '1.25'`, function() {
        let r = u8arr2u16arr('1.25')
        let rr = new Uint16Array()
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return new Uint16Array() when input 2.25`, function() {
        let r = u8arr2u16arr(2.25)
        let rr = new Uint16Array()
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return new Uint16Array() when input ''`, function() {
        let r = u8arr2u16arr('')
        let rr = new Uint16Array()
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return new Uint16Array() when input []`, function() {
        let r = u8arr2u16arr([])
        let rr = new Uint16Array()
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return new Uint16Array() when input {}`, function() {
        let r = u8arr2u16arr({})
        let rr = new Uint16Array()
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return new Uint16Array() when input null`, function() {
        let r = u8arr2u16arr(null)
        let rr = new Uint16Array()
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return new Uint16Array() when input undefined`, function() {
        let r = u8arr2u16arr(undefined)
        let rr = new Uint16Array()
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return new Uint16Array() when input NaN`, function() {
        let r = u8arr2u16arr(NaN)
        let rr = new Uint16Array()
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { state: 'success', msg: new Uint16Array([66, 97, 115]) } when input new Uint8Array([66, 97, 115]) with returnWithStateAndMsg`, function() {
        let r = u8arr2u16arr(new Uint8Array([66, 97, 115]), { returnWithStateAndMsg: true })
        let rr = { state: 'success', msg: new Uint16Array([66, 97, 115]) }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { state: 'error', msg: 'invalid u8a' } when input NaN with returnWithStateAndMsg`, function() {
        let r = u8arr2u16arr(NaN, { returnWithStateAndMsg: true })
        let rr = { state: 'error', msg: 'invalid u8a' }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should not throw but return { state: 'error', msg: <TypeError> } when input a detached Uint8Array`, function() {
        //轉換本體之非預期錯誤須被攔截, 不得外拋至呼叫端
        let u8a = new Uint8Array([1, 2, 3])
        structuredClone(u8a.buffer, { transfer: [u8a.buffer] }) //使buffer分離
        let r = u8arr2u16arr(u8a, { returnWithStateAndMsg: true })
        assert.strict.deepStrictEqual(r.state, 'error')
        assert.strict.deepStrictEqual(r.msg.indexOf('TypeError') === 0, true, `msg 應為型別錯誤, got ${r.msg}`)
    })

    it(`should not throw but return new Uint16Array() when input a detached Uint8Array by default`, function() {
        let u8a = new Uint8Array([1, 2, 3])
        structuredClone(u8a.buffer, { transfer: [u8a.buffer] })
        let r = u8arr2u16arr(u8a)
        let rr = new Uint16Array()
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return new Uint16Array([66, 97, 115]) when input new Uint8Array([66, 97, 115]) with invalid returnWithStateAndMsg`, function() {
        let r = u8arr2u16arr(new Uint8Array([66, 97, 115]), { returnWithStateAndMsg: 'yes' })
        let rr = new Uint16Array([66, 97, 115])
        assert.strict.deepStrictEqual(r, rr)
    })

})
