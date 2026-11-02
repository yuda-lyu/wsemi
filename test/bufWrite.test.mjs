import assert from 'assert'
import bufWrite from '../src/bufWrite.mjs'


describe(`bufWrite`, function() {
    let offset = 0
    let isBE = true
    let mLen = 52
    let nBytes = 8
    let i = 1447656645380
    let j = new Uint8Array([66, 117, 16, 240, 246, 48, 64, 0])
    let k = new Uint8Array(Buffer.alloc(8))

    it(`should get ${j} from buffer when input ${i}, ${Buffer.alloc(8)}, ${offset}, ${isBE}, ${mLen}, ${nBytes}`, function() {
        let b = Buffer.alloc(8)
        bufWrite(i, b, offset, isBE, mLen, nBytes)
        let r = new Uint8Array(b)
        let rr = j
        assert.strict.deepStrictEqual(r, rr)
    })

    //'1.25'可自動轉數字故為有效
    // it(`should get ${k} from buffer when input '1.25', ${Buffer.alloc(8)}, ${offset}, ${isBE}, ${mLen}, ${nBytes}`, function() {
    //     let b = Buffer.alloc(8)
    //     bufWrite('1.25', b, offset, isBE, mLen, nBytes)
    //     let r = new Uint8Array(b)
    //     let rr = new Uint8Array(Buffer.alloc(8))
    //     assert.strict.deepStrictEqual(r, rr)
    // })

    it(`should get ${k} from buffer when input '', ${Buffer.alloc(8)}, ${offset}, ${isBE}, ${mLen}, ${nBytes}`, function() {
        let b = Buffer.alloc(8)
        bufWrite('', b, offset, isBE, mLen, nBytes)
        let r = new Uint8Array(b)
        let rr = new Uint8Array(Buffer.alloc(8))
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should get ${k} from buffer when input [], ${Buffer.alloc(8)}, ${offset}, ${isBE}, ${mLen}, ${nBytes}`, function() {
        let b = Buffer.alloc(8)
        bufWrite([], b, offset, isBE, mLen, nBytes)
        let r = new Uint8Array(b)
        let rr = new Uint8Array(Buffer.alloc(8))
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should get ${k} from buffer when input {}, ${Buffer.alloc(8)}, ${offset}, ${isBE}, ${mLen}, ${nBytes}`, function() {
        let b = Buffer.alloc(8)
        bufWrite({}, b, offset, isBE, mLen, nBytes)
        let r = new Uint8Array(b)
        let rr = new Uint8Array(Buffer.alloc(8))
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should get ${k} from buffer when input null, ${Buffer.alloc(8)}, ${offset}, ${isBE}, ${mLen}, ${nBytes}`, function() {
        let b = Buffer.alloc(8)
        bufWrite(null, b, offset, isBE, mLen, nBytes)
        let r = new Uint8Array(b)
        let rr = new Uint8Array(Buffer.alloc(8))
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should get ${k} from buffer when input undefined, ${Buffer.alloc(8)}, ${offset}, ${isBE}, ${mLen}, ${nBytes}`, function() {
        let b = Buffer.alloc(8)
        bufWrite(undefined, b, offset, isBE, mLen, nBytes)
        let r = new Uint8Array(b)
        let rr = new Uint8Array(Buffer.alloc(8))
        assert.strict.deepStrictEqual(r, rr)
    })

    //使用者2026-11-02定A: value照IEEE754原樣編碼, NaN寫出quiet NaN位元樣式(與Node之Buffer.writeDoubleBE一致), 不再不寫入
    it(`should write the quiet NaN bit pattern 7ff8000000000000 when input NaN, ${Buffer.alloc(8)}, ${offset}, ${isBE}, ${mLen}, ${nBytes}`, function() {
        let b = Buffer.alloc(8)
        let ret = bufWrite(NaN, b, offset, isBE, mLen, nBytes)
        let r = new Uint8Array(b)
        let rr = new Uint8Array([127, 248, 0, 0, 0, 0, 0, 0])
        assert.strict.deepStrictEqual(r, rr)
        assert.strict.deepStrictEqual(ret, true)
        let nb = Buffer.alloc(8)
        nb.writeDoubleBE(NaN)
        assert.strict.deepStrictEqual(new Uint8Array(b), new Uint8Array(nb))
    })

    it(`should get ${k} from buffer when input ${i}, ${Buffer.alloc(8)}, null, ${isBE}, ${mLen}, ${nBytes}`, function() {
        let b = Buffer.alloc(8)
        bufWrite(i, b, null, isBE, mLen, nBytes)
        let r = new Uint8Array(b)
        let rr = new Uint8Array(Buffer.alloc(8))
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should get ${k} from buffer when input ${i}, ${Buffer.alloc(8)}, ${offset}, null, ${mLen}, ${nBytes}`, function() {
        let b = Buffer.alloc(8)
        bufWrite(i, b, offset, null, mLen, nBytes)
        let r = new Uint8Array(b)
        let rr = new Uint8Array(Buffer.alloc(8))
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should get ${k} from buffer when input ${i}, ${Buffer.alloc(8)}, ${offset}, ${isBE}, null, ${nBytes}`, function() {
        let b = Buffer.alloc(8)
        bufWrite(i, b, offset, isBE, null, nBytes)
        let r = new Uint8Array(b)
        let rr = new Uint8Array(Buffer.alloc(8))
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should get ${k} from buffer when input ${i}, ${Buffer.alloc(8)}, ${offset}, ${isBE}, ${mLen}, null`, function() {
        let b = Buffer.alloc(8)
        bufWrite(i, b, offset, isBE, mLen, null)
        let r = new Uint8Array(b)
        let rr = new Uint8Array(Buffer.alloc(8))
        assert.strict.deepStrictEqual(r, rr)
    })

})
