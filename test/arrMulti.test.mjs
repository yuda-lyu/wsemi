import assert from 'assert'
import arrMulti from '../src/arrMulti.mjs'


describe(`arrMulti`, function() {

    it(`should return [0.1, 0.2, 0.30000000000000004, 0.4] when input [1, 2, 3, 4], [0.1, 0.1, 0.1, 0.1]`, function() {
        let r = arrMulti([1, 2, 3, 4], [0.1, 0.1, 0.1, 0.1])
        let rr = [0.1, 0.2, 0.30000000000000004, 0.4]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [1.1, 4.4, 9.900000000000002, 17.6] when input [1, 2, 3, 4], [0.1, 0.1, 0.1, 0.1], [11, 22, 33, 44]`, function() {
        let r = arrMulti([1, 2, 3, 4], [0.1, 0.1, 0.1, 0.1], [11, 22, 33, 44])
        let rr = [1.1, 4.4, 9.900000000000002, 17.6]
        assert.strict.deepStrictEqual(r, rr)
    })

    //第221項第一批: 凡非有效數字一律以預設值1計算(使用者2026-10-31裁定), 同位置皆非有效數字者為1(修前為null)
    it(`should return [0.1, 0.2, 0.1, 1] when input [1, '2', null, null], [0.1, 0.1, 0.1, null]`, function() {
        let r = arrMulti([1, '2', null, null], [0.1, 0.1, 0.1, null])
        let rr = [0.1, 0.2, 0.1, 1]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [2, 6] when input [1, 2], [2, 3]`, function() {
        let r = arrMulti([1, 2], [2, 3])
        let rr = [2, 6]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [1, 2], [2]`, function() {
        let r = arrMulti([1, 2], [2])
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [1, 2], [2, 3, 4]`, function() {
        let r = arrMulti([1, 2], [2, 3, 4])
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [8, 30] when input [1, 2], [2, 3], [4, 5]`, function() {
        let r = arrMulti([1, 2], [2, 3], [4, 5])
        let rr = [8, 30]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [1, 2], [2, 3], [4, 5, 6]`, function() {
        let r = arrMulti([1, 2], [2, 3], [4, 5, 6])
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [1, 2], [2, 3], [4]`, function() {
        let r = arrMulti([1, 2], [2, 3], [4])
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [48, 210] when input [1, 2], [2, 3], [4, 5], [6, 7]`, function() {
        let r = arrMulti([1, 2], [2, 3], [4, 5], [6, 7])
        let rr = [48, 210]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [1, 2], [2, 3], [4, 5], [6, 7, 8]`, function() {
        let r = arrMulti([1, 2], [2, 3], [4, 5], [6, 7, 8])
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [1, 2], [2, 3], [4, 5], [6]`, function() {
        let r = arrMulti([1, 2], [2, 3], [4, 5], [6])
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [384, 1890] when input [1, 2], [2, 3], [4, 5], [6, 7], [8, 9]`, function() {
        let r = arrMulti([1, 2], [2, 3], [4, 5], [6, 7], [8, 9])
        let rr = [384, 1890]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [1, 2], [2, 3], [4, 5], [6, 7], [8, 9, 10]`, function() {
        let r = arrMulti([1, 2], [2, 3], [4, 5], [6, 7], [8, 9, 10])
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [1, 2], [2, 3], [4, 5], [6, 7], [8]`, function() {
        let r = arrMulti([1, 2], [2, 3], [4, 5], [6, 7], [8])
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [8, 30] when input [1, '2'], [2, 3], [4, 5]`, function() {
        let r = arrMulti([1, '2'], [2, 3], [4, 5])
        let rr = [8, 30]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [8, 30] when input [1, 2], ['2', 3], [4, 5]`, function() {
        let r = arrMulti([1, 2], ['2', 3], [4, 5])
        let rr = [8, 30]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [8, 30] when input [1, '2'], [2, '3'], [4, '5']`, function() {
        let r = arrMulti([1, '2'], [2, '3'], [4, '5'])
        let rr = [8, 30]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [8, 5] when input [1, 'a'], [2, 'b'], [4, '5']`, function() {
        let r = arrMulti([1, 'a'], [2, 'b'], [4, '5'])
        let rr = [8, 5]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ''`, function() {
        let r = arrMulti('')
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input []`, function() {
        let r = arrMulti([])
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input {}`, function() {
        let r = arrMulti({})
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input null`, function() {
        let r = arrMulti(null)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input undefined`, function() {
        let r = arrMulti(undefined)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input NaN`, function() {
        let r = arrMulti(NaN)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [], ''`, function() {
        let r = arrMulti([], '')
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    //第221項第二批(dspec §11第15項): 有元素的陣列各自至少1個有效數字, 否則throw(原回[])
    it(`should throw when input ['a'], ['b'] (non-empty arrays without a valid number)`, function() {
        assert.throws(() => arrMulti(['a'], ['b']), (err) => {
            assert.strict.deepStrictEqual(err instanceof Error, true)
            assert.strict.deepStrictEqual(err.message, 'invalid arrs[0]: must contain a valid number')
            return true
        })
    })

    it(`should throw with the index of the array without a valid number when input [1], ['b']`, function() {
        assert.throws(() => arrMulti([1], ['b']), { message: 'invalid arrs[1]: must contain a valid number' })
    })

    //第221項第六項(dspec §11第6項, 使用者2026-11-03): 空陣列為合法資料, 向量處理空進空出, 不報錯
    it(`should return [] when input [], [] (empty in, empty out)`, function() {
        let r = arrMulti([], [])
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [], [], [] and the opt is given`, function() {
        assert.strict.deepStrictEqual(arrMulti([], [], []), [])
        assert.strict.deepStrictEqual(arrMulti([], [], { base: 5 }), [])
        assert.strict.deepStrictEqual(arrMulti([], [], undefined), [])
    })

    it(`should return a new array every time for [], []`, function() {
        let r1 = arrMulti([], [])
        let r2 = arrMulti([], [])
        r1.push(1)
        assert.strict.deepStrictEqual(r2, [])
    })

    //長度不同屬容器處置(先於有效數字之檢查), 與空陣列無關: 一邊空一邊非空仍回[], 不throw
    it(`should return [] when input [1], [] or [], [1] (different length, container handling unchanged)`, function() {
        assert.strict.deepStrictEqual(arrMulti([1], []), [])
        assert.strict.deepStrictEqual(arrMulti([], [1]), [])
        assert.strict.deepStrictEqual(arrMulti([], ['a']), [])
        assert.strict.deepStrictEqual(arrMulti(['a'], []), [])
    })

    it(`should return [] when input [], {}`, function() {
        let r = arrMulti([], {})
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [], null`, function() {
        let r = arrMulti([], null)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [], undefined`, function() {
        let r = arrMulti([], undefined)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ['abc'], ''`, function() {
        let r = arrMulti(['abc'], '')
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ['abc'], []`, function() {
        let r = arrMulti(['abc'], [])
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ['abc'], {}`, function() {
        let r = arrMulti(['abc'], {})
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ['abc'], null`, function() {
        let r = arrMulti(['abc'], null)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ['abc'], undefined`, function() {
        let r = arrMulti(['abc'], undefined)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

})
