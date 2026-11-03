import assert from 'assert'
import arrAdd from '../src/arrAdd.mjs'


describe(`arrAdd`, function() {

    it(`should return [1.1, 2.1, 3.1, 4.1] when input [1, 2, 3, 4], [0.1, 0.1, 0.1, 0.1]`, function() {
        let r = arrAdd([1, 2, 3, 4], [0.1, 0.1, 0.1, 0.1])
        let rr = [1.1, 2.1, 3.1, 4.1]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [12.1, 24.1, 36.1, 48.1] when input [1, 2, 3, 4], [0.1, 0.1, 0.1, 0.1], [11, 22, 33, 44]`, function() {
        let r = arrAdd([1, 2, 3, 4], [0.1, 0.1, 0.1, 0.1], [11, 22, 33, 44])
        let rr = [12.1, 24.1, 36.1, 48.1]
        assert.strict.deepStrictEqual(r, rr)
    })

    //第221項第一批: 凡非有效數字一律以預設值0計算(使用者2026-10-31裁定), 同位置皆非有效數字者為0(修前為null)
    it(`should return [1.1, 2.1, 0.1, 0] when input [1, '2', null, null], [0.1, 0.1, 0.1, null]`, function() {
        let r = arrAdd([1, '2', null, null], [0.1, 0.1, 0.1, null])
        let rr = [1.1, 2.1, 0.1, 0]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [3, 5] when input [1, 2], [2, 3]`, function() {
        let r = arrAdd([1, 2], [2, 3])
        let rr = [3, 5]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [1, 2], [2]`, function() {
        let r = arrAdd([1, 2], [2])
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [1, 2], [2, 3, 4]`, function() {
        let r = arrAdd([1, 2], [2, 3, 4])
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [7, 10] when input [1, 2], [2, 3], [4, 5]`, function() {
        let r = arrAdd([1, 2], [2, 3], [4, 5])
        let rr = [7, 10]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [1, 2], [2, 3], [4, 5, 6]`, function() {
        let r = arrAdd([1, 2], [2, 3], [4, 5, 6])
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [1, 2], [2, 3], [4]`, function() {
        let r = arrAdd([1, 2], [2, 3], [4])
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [13, 17] when input [1, 2], [2, 3], [4, 5], [6, 7]`, function() {
        let r = arrAdd([1, 2], [2, 3], [4, 5], [6, 7])
        let rr = [13, 17]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [1, 2], [2, 3], [4, 5], [6, 7, 8]`, function() {
        let r = arrAdd([1, 2], [2, 3], [4, 5], [6, 7, 8])
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [1, 2], [2, 3], [4, 5], [6]`, function() {
        let r = arrAdd([1, 2], [2, 3], [4, 5], [6])
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [21, 26] when input [1, 2], [2, 3], [4, 5], [6, 7], [8, 9]`, function() {
        let r = arrAdd([1, 2], [2, 3], [4, 5], [6, 7], [8, 9])
        let rr = [21, 26]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [1, 2], [2, 3], [4, 5], [6, 7], [8, 9, 10]`, function() {
        let r = arrAdd([1, 2], [2, 3], [4, 5], [6, 7], [8, 9, 10])
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [1, 2], [2, 3], [4, 5], [6, 7], [8]`, function() {
        let r = arrAdd([1, 2], [2, 3], [4, 5], [6, 7], [8])
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [7, 10] when input [1, '2'], [2, 3], [4, 5]`, function() {
        let r = arrAdd([1, '2'], [2, 3], [4, 5])
        let rr = [7, 10]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [7, 10] when input [1, 2], ['2', 3], [4, 5]`, function() {
        let r = arrAdd([1, 2], ['2', 3], [4, 5])
        let rr = [7, 10]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [7, 10] when input [1, '2'], [2, '3'], [4, '5']`, function() {
        let r = arrAdd([1, '2'], [2, '3'], [4, '5'])
        let rr = [7, 10]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [7, 5] when input [1, 'a'], [2, 'b'], [4, '5']`, function() {
        let r = arrAdd([1, 'a'], [2, 'b'], [4, '5'])
        let rr = [7, 5]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ''`, function() {
        let r = arrAdd('')
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input []`, function() {
        let r = arrAdd([])
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input {}`, function() {
        let r = arrAdd({})
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input null`, function() {
        let r = arrAdd(null)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input undefined`, function() {
        let r = arrAdd(undefined)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input NaN`, function() {
        let r = arrAdd(NaN)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [], ''`, function() {
        let r = arrAdd([], '')
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    //第221項第二批(dspec §11第15項): 有元素的陣列各自至少1個有效數字, 否則throw(原回[])
    it(`should throw when input ['a'], ['b'] (non-empty arrays without a valid number)`, function() {
        assert.throws(() => arrAdd(['a'], ['b']), (err) => {
            assert.strict.deepStrictEqual(err instanceof Error, true)
            assert.strict.deepStrictEqual(err.message, 'invalid arrs[0]: must contain a valid number')
            return true
        })
    })

    it(`should throw with the index of the array without a valid number when input [1], ['b']`, function() {
        assert.throws(() => arrAdd([1], ['b']), { message: 'invalid arrs[1]: must contain a valid number' })
    })

    //第221項第六項(dspec §11第6項, 使用者2026-11-03): 空陣列為合法資料, 向量處理空進空出, 不報錯
    it(`should return [] when input [], [] (empty in, empty out)`, function() {
        let r = arrAdd([], [])
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [], [], [] and the opt is given`, function() {
        assert.strict.deepStrictEqual(arrAdd([], [], []), [])
        assert.strict.deepStrictEqual(arrAdd([], [], { base: 5 }), [])
        assert.strict.deepStrictEqual(arrAdd([], [], undefined), [])
    })

    it(`should return a new array every time for [], []`, function() {
        let r1 = arrAdd([], [])
        let r2 = arrAdd([], [])
        r1.push(1)
        assert.strict.deepStrictEqual(r2, [])
    })

    //長度不同屬容器處置(先於有效數字之檢查), 與空陣列無關: 一邊空一邊非空仍回[], 不throw
    it(`should return [] when input [1], [] or [], [1] (different length, container handling unchanged)`, function() {
        assert.strict.deepStrictEqual(arrAdd([1], []), [])
        assert.strict.deepStrictEqual(arrAdd([], [1]), [])
        assert.strict.deepStrictEqual(arrAdd([], ['a']), [])
        assert.strict.deepStrictEqual(arrAdd(['a'], []), [])
    })

    it(`should return [] when input [], {}`, function() {
        let r = arrAdd([], {})
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [], null`, function() {
        let r = arrAdd([], null)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [], undefined`, function() {
        let r = arrAdd([], undefined)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ['abc'], ''`, function() {
        let r = arrAdd(['abc'], '')
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ['abc'], []`, function() {
        let r = arrAdd(['abc'], [])
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ['abc'], {}`, function() {
        let r = arrAdd(['abc'], {})
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ['abc'], null`, function() {
        let r = arrAdd(['abc'], null)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ['abc'], undefined`, function() {
        let r = arrAdd(['abc'], undefined)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

})
