import assert from 'assert'
import arrNorm from '../src/arrNorm.mjs'


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

    //第221項第一批連動(arrNorm、arrProduct本身未改; arrNorm = sqrt(arrProduct(v, v)), arrProduct內呼叫arrMulti):
    //  arrMulti依使用者2026-10-31裁定改為「非有效數字以預設值1計算」, 同位置皆非有效數字者由null改為1, 故arrProduct加總多1、此處由sqrt(5)變sqrt(7);
    //  此為連動之現況而非定案, arrProduct/arrNorm對標記之處置待後續批次裁示(見第221項報告〈待裁示〉)
    it(`should return 2.6457513110645907 when input [1, '2', null, null]`, function() {
        let r = arrNorm([1, '2', null, null])
        let rr = 2.6457513110645907
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return null when input ''`, function() {
        let r = arrNorm('')
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return null when input []`, function() {
        let r = arrNorm([])
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
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

    it(`should return null when input [], ''`, function() {
        let r = arrNorm([], '')
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return null when input [], []`, function() {
        let r = arrNorm([], [])
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return null when input [], {}`, function() {
        let r = arrNorm([], {})
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return null when input [], null`, function() {
        let r = arrNorm([], null)
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return null when input [], undefined`, function() {
        let r = arrNorm([], undefined)
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    //第221項第一批連動(同上): arrMulti(['abc'], ['abc'])由[null]改為[1], arrProduct得1而非null, arrNorm得sqrt(1)=1而非null(待裁示, 非定案)
    it(`should return 1 when input ['abc'], ''`, function() {
        let r = arrNorm(['abc'], '')
        let rr = 1
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 1 when input ['abc'], []`, function() {
        let r = arrNorm(['abc'], [])
        let rr = 1
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 1 when input ['abc'], {}`, function() {
        let r = arrNorm(['abc'], {})
        let rr = 1
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 1 when input ['abc'], null`, function() {
        let r = arrNorm(['abc'], null)
        let rr = 1
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 1 when input ['abc'], undefined`, function() {
        let r = arrNorm(['abc'], undefined)
        let rr = 1
        assert.strict.deepStrictEqual(r, rr)
    })

})
