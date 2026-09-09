import assert from 'assert'
import u8arr2ab from '../src/u8arr2ab.mjs'


describe(`u8arr2ab`, function() {

    it(`should return [object ArrayBuffer] when input new Uint8Array([66, 97, 115])`, function() {
        let u8a = new Uint8Array([66, 97, 115])
        let r = u8arr2ab(u8a)
        let rr = u8a.buffer
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input '1.25'`, function() {
        let r = u8arr2ab('1.25')
        let rr = new ArrayBuffer()
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input 2.25`, function() {
        let r = u8arr2ab(2.25)
        let rr = new ArrayBuffer()
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input ''`, function() {
        let r = u8arr2ab('')
        let rr = new ArrayBuffer()
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input []`, function() {
        let r = u8arr2ab([])
        let rr = new ArrayBuffer()
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input {}`, function() {
        let r = u8arr2ab({})
        let rr = new ArrayBuffer()
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input null`, function() {
        let r = u8arr2ab(null)
        let rr = new ArrayBuffer()
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input undefined`, function() {
        let r = u8arr2ab(undefined)
        let rr = new ArrayBuffer()
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input NaN`, function() {
        let r = u8arr2ab(NaN)
        let rr = new ArrayBuffer()
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { state: 'success', msg: u8a.buffer } when input new Uint8Array([66, 97, 115]) with returnWithStateAndMsg`, function() {
        let u8a = new Uint8Array([66, 97, 115])
        let r = u8arr2ab(u8a, { returnWithStateAndMsg: true })
        let rr = { state: 'success', msg: u8a.buffer }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return only the viewed range when input is a view into a larger buffer`, function() {
        //不可直接回u8a.buffer, 否則會夾帶視圖範圍外之資料
        let big = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8])
        let view = new Uint8Array(big.buffer, 2, 3)
        let r = u8arr2ab(view)
        let rr = new Uint8Array([3, 4, 5]).buffer
        assert.strict.deepStrictEqual(r, rr)
        assert.strict.deepStrictEqual(r.byteLength, 3)
    })

    it(`should return only the viewed range when input is a nodejs Buffer (which shares a pooled buffer)`, function() {
        //nodejs之Buffer.from小資料會共用64KB pool, 直接回底層buffer會夾帶其他Buffer之內容
        let buf = Buffer.from('abc')
        let r = u8arr2ab(buf)
        let rr = new Uint8Array([97, 98, 99]).buffer
        assert.strict.deepStrictEqual(r, rr)
        assert.strict.deepStrictEqual(r.byteLength, 3)
    })

    it(`should return { state: 'error', msg: 'invalid u8a' } when input NaN with returnWithStateAndMsg`, function() {
        let r = u8arr2ab(NaN, { returnWithStateAndMsg: true })
        let rr = { state: 'error', msg: 'invalid u8a' }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return u8a.buffer when input new Uint8Array([66, 97, 115]) with invalid returnWithStateAndMsg`, function() {
        let u8a = new Uint8Array([66, 97, 115])
        let r = u8arr2ab(u8a, { returnWithStateAndMsg: 'yes' })
        let rr = u8a.buffer
        assert.strict.deepStrictEqual(r, rr)
    })

})
