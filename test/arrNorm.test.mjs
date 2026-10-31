import assert from 'assert'
import arrNorm from '../src/arrNorm.mjs'


let isErr = (msg) => {
    return (err) => {
        assert.strict.deepStrictEqual(err instanceof Error, true)
        assert.strict.deepStrictEqual(err.message, msg)
        return true
    }
}


describe(`arrNorm`, function() {

    it(`should return 5.477225575051661 when input [1, 2, 3, 4]`, function() {
        let r = arrNorm([1, 2, 3, 4])
        let rr = 5.477225575051661
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 0.2 when input [0.1, 0.1, 0.1, 0.1]`, function() {
        let r = arrNorm([0.1, 0.1, 0.1, 0.1])
        let rr = 0.2
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 60.249481325568276 when input [11, 22, 33, 44]`, function() {
        let r = arrNorm([11, 22, 33, 44])
        let rr = 60.249481325568276
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 5.477225575051661 when input [1, '2', 3, 4]`, function() {
        let r = arrNorm([1, '2', 3, 4])
        let rr = 5.477225575051661
        assert.strict.deepStrictEqual(r, rr)
    })

    //第221項第二批(dspec §11第15項, 使用者2026-10-31): arrNorm之基準值opt.base預設0, 非有效數字以0代入、不影響平方和, 故回到sqrt(1 + 4) = sqrt(5)
    //  (第一批連動曾暫為sqrt(7)=2.6457513110645907, 該期望依第15項改定)
    it(`should return 2.23606797749979 when input [1, '2', null, null]`, function() {
        let r = arrNorm([1, '2', null, null])
        let rr = 2.23606797749979
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return null when input ''`, function() {
        let r = arrNorm('')
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    //第221項第二批(第15項): 空陣列視為0個有效數字, 原回null改throw(與arrMax([])一致)
    it(`should throw when input []`, function() {
        assert.throws(() => arrNorm([]), isErr('invalid vec: must contain a valid number'))
    })

    it(`should return null when input {}`, function() {
        let r = arrNorm({})
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return null when input null`, function() {
        let r = arrNorm(null)
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return null when input undefined`, function() {
        let r = arrNorm(undefined)
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return null when input NaN`, function() {
        let r = arrNorm(NaN)
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    //第221項第二批(第15項): 第2參數視為opt(非物件者視為未給); 空陣列throw(原回null)
    it(`should throw when input [], ''`, function() {
        assert.throws(() => arrNorm([], ''), isErr('invalid vec: must contain a valid number'))
    })

    it(`should throw when input [], []`, function() {
        assert.throws(() => arrNorm([], []), isErr('invalid vec: must contain a valid number'))
    })

    it(`should throw when input [], {}`, function() {
        assert.throws(() => arrNorm([], {}), isErr('invalid vec: must contain a valid number'))
    })

    it(`should throw when input [], null`, function() {
        assert.throws(() => arrNorm([], null), isErr('invalid vec: must contain a valid number'))
    })

    it(`should throw when input [], undefined`, function() {
        assert.throws(() => arrNorm([], undefined), isErr('invalid vec: must contain a valid number'))
    })

    //第221項第二批(第15項): 向量內沒有任何有效數字(['abc'])時throw(第一批連動曾暫為1、原為null)
    it(`should throw when input ['abc'], ''`, function() {
        assert.throws(() => arrNorm(['abc'], ''), isErr('invalid vec: must contain a valid number'))
    })

    it(`should throw when input ['abc'], []`, function() {
        assert.throws(() => arrNorm(['abc'], []), isErr('invalid vec: must contain a valid number'))
    })

    it(`should throw when input ['abc'], {}`, function() {
        assert.throws(() => arrNorm(['abc'], {}), isErr('invalid vec: must contain a valid number'))
    })

    it(`should throw when input ['abc'], null`, function() {
        assert.throws(() => arrNorm(['abc'], null), isErr('invalid vec: must contain a valid number'))
    })

    it(`should throw when input ['abc'], undefined`, function() {
        assert.throws(() => arrNorm(['abc'], undefined), isErr('invalid vec: must contain a valid number'))
    })

})
