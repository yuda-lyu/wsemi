import assert from 'assert'
import pseudoRandom from '../src/pseudoRandom.mjs'


describe(`pseudoRandom`, function() {

    //因平行化測試故呼叫順序不同, 導致連續相依性測試會無法一致, 故seed=start1(1)須手動測試

    it(`should treat a Number wrapper seed as a non-number (W-20: the number branch is judged by isnbr, which only accepts primitives): same as its string form, not the number`, function() {
        //W-20: 直接判型之站點(原lodash isNumber, 包裝物件為true)改isnbr; 包裝數字不走數字種子分支, 走字串分支(cstr拆包為'123'), 結果同pseudoRandom('123')而異於pseudoRandom(123)
        let rNum = pseudoRandom(123)
        let rStr = pseudoRandom('123')
        let rWrap = pseudoRandom(new Number(123)) // eslint-disable-line no-new-wrappers
        assert.strict.deepStrictEqual(rWrap, rStr)
        assert.strict.notDeepStrictEqual(rWrap, rNum) //鑑別力前提: 數字種子與字串種子之結果相異
    })

    it(`should return 0.6964691872708499 when input 123`, function() {
        let r = pseudoRandom(123)
        let rr = 0.6964691872708499
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 0.8510874302592129 when input 12.3`, function() {
        let r = pseudoRandom(12.3)
        let rr = 0.8510874302592129
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 0.6314232510048896 when input 'abc' for (1)`, function() {
        let r = pseudoRandom('abc')
        let rr = 0.6314232510048896
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 0.6314232510048896 when input 'abc' for (2)`, function() {
        let r = pseudoRandom('abc')
        let rr = 0.6314232510048896
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 0.9743434484116733 when input 'def'`, function() {
        let r = pseudoRandom('def')
        let rr = 0.9743434484116733
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 0.007978770649060607 when input 'BH01S123'`, function() {
        let r = pseudoRandom('BH01S123')
        let rr = 0.007978770649060607
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 0.9579511017072946 when input 'BH-01:S-123'`, function() {
        let r = pseudoRandom('BH-01:S-123')
        let rr = 0.9579511017072946
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 0.6314232510048896 when input 'abc', true`, function() {
        let fr = pseudoRandom('abc', true)
        let r = fr()
        let rr = 0.6314232510048896
        assert.strict.deepStrictEqual(r, rr)
    })

})
