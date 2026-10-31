import assert from 'assert'
import arrMax from '../src/arrMax.mjs'


describe(`arrMax`, function() {
    let k
    let oin = {}
    let oout = {}

    k = 1
    oin[k] = [100000, 1, 30, 4, 21]
    oout[k] = 100000
    it(`should return ${JSON.stringify(oout[k])} when input ${JSON.stringify(oin[k])}`, function() {
        k = 1
        let r = arrMax(oin[k])
        let rr = oout[k]
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 2
    oin[k] = [1, 30, 4, 21, 100000]
    oout[k] = 100000
    it(`should return ${JSON.stringify(oout[k])} when input ${JSON.stringify(oin[k])}`, function() {
        k = 2
        let r = arrMax(oin[k])
        let rr = oout[k]
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 3
    oin[k] = [1, 30, 4, 100000, 21]
    oout[k] = 100000
    it(`should return ${JSON.stringify(oout[k])} when input ${JSON.stringify(oin[k])}`, function() {
        k = 3
        let r = arrMax(oin[k])
        let rr = oout[k]
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 4
    oin[k] = [1, 30, 4, 100000, 21]
    oout[k] = 3
    it(`should return ${JSON.stringify(oout[k])} when input ${JSON.stringify(oin[k])}, { returnIndex: true }`, function() {
        k = 4
        let r = arrMax(oin[k], { returnIndex: true })
        let rr = oout[k]
        assert.strict.deepStrictEqual(r, rr)
    })

    //第221項第一批: 沒有任何有效數字throw(使用者2026-10-31裁定「若沒法計算與回傳結果, 那就報錯」; 修前回null)
    k = 5
    oin[k] = ['March', 'Jan', 'Feb', 'Dec']
    oout[k] = 'invalid vall: must contain a valid number'
    it(`should throw ${JSON.stringify(oout[k])} when input ${JSON.stringify(oin[k])}`, function() {
        k = 5
        assert.throws(() => arrMax(oin[k]), { message: oout[k] })
    })

    k = 6
    oin[k] = ['1', '30', '  4  ', '100000', '21']
    oout[k] = 100000
    it(`should return ${JSON.stringify(oout[k])} when input ${JSON.stringify(oin[k])}`, function() {
        k = 6
        let r = arrMax(oin[k])
        let rr = oout[k]
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 7
    oin[k] = ['1', '30', '  4  ', '100000', 21]
    oout[k] = 100000
    it(`should return ${JSON.stringify(oout[k])} when input ${JSON.stringify(oin[k])}`, function() {
        k = 7
        let r = arrMax(oin[k])
        let rr = oout[k]
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 8
    oin[k] = ['a1', 'b30', '  4  ', '100000', 21]
    oout[k] = 100000
    it(`should return ${JSON.stringify(oout[k])} when input ${JSON.stringify(oin[k])}`, function() {
        k = 8
        let r = arrMax(oin[k])
        let rr = oout[k]
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 9
    oin[k] = [{ s: 'March', i: 1 }, { s: 'Jan', i: 4 }, { s: 'Feb', i: 100000 }, { s: 'Dec', i: 30 }, { s: 'Nov', i: 'a25' }]
    oout[k] = { s: 'Feb', i: 100000 }
    it(`should return ${JSON.stringify(oout[k])} when input ${JSON.stringify(oin[k])}, { compareKey: 'i' }`, function() {
        k = 9
        let r = arrMax(oin[k], { compareKey: 'i' })
        let rr = oout[k]
        assert.strict.deepStrictEqual(r, rr)
    })

    //第221項第一批: compareKey欄位內沒有任何有效數字throw(修前回null)
    k = 10
    oin[k] = [{ s: 'March', i: 1 }, { s: 'Jan', i: 4 }, { s: 'Feb', i: 100000 }, { s: 'Dec', i: 30 }, { s: 'Nov', i: 'a25' }]
    oout[k] = 'invalid vall: must contain a valid number'
    it(`should throw ${JSON.stringify(oout[k])} when input ${JSON.stringify(oin[k])}, { compareKey: 's' }`, function() {
        k = 10
        assert.throws(() => arrMax(oin[k], { compareKey: 's' }), { message: oout[k] })
    })

    k = 11
    oin[k] = [{ s: 'March', i: 1 }, { s: 'Jan', i: 4 }, { s: 'Feb', i: 100000 }, { s: 'Dec', i: 30 }, { s: 'Nov', i: 'a25' }]
    oout[k] = 2
    it(`should return ${JSON.stringify(oout[k])} when input ${JSON.stringify(oin[k])}, { compareKey: 'i', returnIndex: true }`, function() {
        k = 11
        let r = arrMax(oin[k], { compareKey: 'i', returnIndex: true })
        let rr = oout[k]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ['123'], ''`, function() {
        let r = arrMax(['123'], '')
        let rr = 123
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ['123'], []`, function() {
        let r = arrMax(['123'], [])
        let rr = 123
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ['123'], {}`, function() {
        let r = arrMax(['123'], {})
        let rr = 123
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ['123'], null`, function() {
        let r = arrMax(['123'], null)
        let rr = 123
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ['123'], undefined`, function() {
        let r = arrMax(['123'], undefined)
        let rr = 123
        assert.strict.deepStrictEqual(r, rr)
    })

    //第221項第一批: 沒有任何有效數字(含空陣列)throw 'invalid vall: must contain a valid number'、vall非陣列throw 'invalid vall: must be an array'(修前皆回null)
    it(`should throw when input ['abc'], ''`, function() {
        assert.throws(() => arrMax(['abc'], ''), { message: 'invalid vall: must contain a valid number' })
    })

    it(`should throw when input ['abc'], []`, function() {
        assert.throws(() => arrMax(['abc'], []), { message: 'invalid vall: must contain a valid number' })
    })

    it(`should throw when input ['abc'], {}`, function() {
        assert.throws(() => arrMax(['abc'], {}), { message: 'invalid vall: must contain a valid number' })
    })

    it(`should throw when input ['abc'], null`, function() {
        assert.throws(() => arrMax(['abc'], null), { message: 'invalid vall: must contain a valid number' })
    })

    it(`should throw when input ['abc'], undefined`, function() {
        assert.throws(() => arrMax(['abc'], undefined), { message: 'invalid vall: must contain a valid number' })
    })

    it(`should throw when input [], ''`, function() {
        assert.throws(() => arrMax([], ''), { message: 'invalid vall: must contain a valid number' })
    })

    it(`should throw when input [], []`, function() {
        assert.throws(() => arrMax([], []), { message: 'invalid vall: must contain a valid number' })
    })

    it(`should throw when input [], {}`, function() {
        assert.throws(() => arrMax([], {}), { message: 'invalid vall: must contain a valid number' })
    })

    it(`should throw when input [], null`, function() {
        assert.throws(() => arrMax([], null), { message: 'invalid vall: must contain a valid number' })
    })

    it(`should throw when input [], undefined`, function() {
        assert.throws(() => arrMax([], undefined), { message: 'invalid vall: must contain a valid number' })
    })

    it(`should throw when input ''`, function() {
        assert.throws(() => arrMax(''), { message: 'invalid vall: must be an array' })
    })

    it(`should throw when input []`, function() {
        assert.throws(() => arrMax([]), { message: 'invalid vall: must contain a valid number' })
    })

    it(`should throw when input {}`, function() {
        assert.throws(() => arrMax({}), { message: 'invalid vall: must be an array' })
    })

    it(`should throw when input null`, function() {
        assert.throws(() => arrMax(null), { message: 'invalid vall: must be an array' })
    })

    it(`should throw when input undefined`, function() {
        assert.throws(() => arrMax(undefined), { message: 'invalid vall: must be an array' })
    })

    it(`should throw when input NaN`, function() {
        assert.throws(() => arrMax(NaN), { message: 'invalid vall: must be an array' })
    })

})
