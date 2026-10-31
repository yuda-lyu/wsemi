import assert from 'assert'
import arrAccum from '../src/arrAccum.mjs'


describe(`arrAccum`, function () {

    it(`should return [1, 3, 6, 10] when input [1, 2, 3, 4]`, function () {
        let r = arrAccum([1, 2, 3, 4])
        let rr = [1, 3, 6, 10]
        assert.strict.deepStrictEqual(r, rr)
    })

    //第221項第二批(dspec §11第15項, 使用者2026-10-31): 非有效數字以基準值opt.base(預設0)代入累加, 輸出與輸入逐筆對應, 不再改成空字串
    it(`should return [1, 3, 6, 6, 10] when input [1, 2, 3, null, 4]`, function () {
        let r = arrAccum([1, 2, 3, null, 4])
        let rr = [1, 3, 6, 6, 10]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [1, 3, 6, 6, 10] when input [1, 2, 3, '', 4]`, function () {
        let r = arrAccum([1, 2, 3, '', 4])
        let rr = [1, 3, 6, 6, 10]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input 123.456`, function () {
        let r = arrAccum(123.456)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input '123.456'`, function () {
        let r = arrAccum('123.456')
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ''`, function () {
        let r = arrAccum('')
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    //第221項第二批(第15項): 空陣列視為0個有效數字, 原回[]改throw(與arrMax([])一致)
    it(`should throw when input []`, function () {
        assert.throws(() => arrAccum([]), (err) => {
            assert.strict.deepStrictEqual(err instanceof Error, true)
            assert.strict.deepStrictEqual(err.message, 'invalid vec: must contain a valid number')
            return true
        })
    })

    it(`should return [] when input {}`, function () {
        let r = arrAccum({})
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input null`, function () {
        let r = arrAccum(null)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input undefined`, function () {
        let r = arrAccum(undefined)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input NaN`, function () {
        let r = arrAccum(NaN)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

})
