import assert from 'assert'
import bufReadDbl from '../src/bufReadDbl.mjs'


describe(`bufReadDbl`, function() {
    let offset = 0
    let isBE = true
    let mLen = 52
    let nBytes = 8
    let b = new Uint8Array([66, 117, 16, 240, 246, 48, 64, 0])
    let j = 1447656645380

    it(`should return ${j} when input ${b}`, function() {
        let r = bufReadDbl(b)
        let rr = j
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return ${j} when input ${b}, ${offset}, ${isBE}, ${mLen}, ${nBytes}`, function() {
        let r = bufReadDbl(b, offset, isBE, mLen, nBytes)
        let rr = j
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return ${j} when input '1.25'`, function() {
        let r = bufReadDbl('1.25')
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return ${j} when input 2.25`, function() {
        let r = bufReadDbl(2.25)
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return ${j} when input ''`, function() {
        let r = bufReadDbl('')
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return ${j} when input []`, function() {
        let r = bufReadDbl([])
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return ${j} when input {}`, function() {
        let r = bufReadDbl({})
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return ${j} when input null`, function() {
        let r = bufReadDbl(null)
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return ${j} when input undefined`, function() {
        let r = bufReadDbl(undefined)
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return ${j} when input NaN`, function() {
        let r = bufReadDbl(NaN)
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return ${j} when input ${b}, null, ${isBE}, ${mLen}, ${nBytes}`, function() {
        let r = bufReadDbl(b, null, isBE, mLen, nBytes)
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return ${j} when input ${b}, ${offset}, null, ${mLen}, ${nBytes}`, function() {
        let r = bufReadDbl(b, offset, null, mLen, nBytes)
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return ${j} when input ${b}, ${offset}, ${isBE}, null, ${nBytes}`, function() {
        let r = bufReadDbl(b, offset, isBE, null, nBytes)
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return ${j} when input ${b}, ${offset}, ${isBE}, ${mLen}, null`, function() {
        let r = bufReadDbl(b, offset, isBE, mLen, null)
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    //第221項已知缺陷先修(ws270): bufRead檢查offset + nBytes不超出buffer長度, 內容不足8位元組之buffer回傳null(修前讀到undefined而回出NaN等失真數值)
    it(`should return null when the buffer is shorter than 8 bytes`, function() {
        assert.strict.deepStrictEqual(bufReadDbl(new Uint8Array([66, 117, 16, 240])), null)
        assert.strict.deepStrictEqual(bufReadDbl(new Uint8Array([])), null)
    })

    it(`should return null when offset + 8 is beyond the buffer, and read when it fits`, function() {
        let u8 = new Uint8Array([9, ...b]) // 長度9
        assert.strict.deepStrictEqual(bufReadDbl(u8, 1), j) // 1 + 8 = 9, 恰在尾端
        assert.strict.deepStrictEqual(bufReadDbl(u8, 2), null) // 2 + 8 > 9
        assert.strict.deepStrictEqual(bufReadDbl(u8, -1), null)
    })

})
