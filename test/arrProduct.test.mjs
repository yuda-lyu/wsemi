import assert from 'assert'
import arrProduct from '../src/arrProduct.mjs'


describe(`arrProduct`, function() {

    it(`should return 1 when input [1, 2, 3, 4], [0.1, 0.1, 0.1, 0.1]`, function() {
        let r = arrProduct([1, 2, 3, 4], [0.1, 0.1, 0.1, 0.1])
        let rr = 1
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 33 when input [1, 2, 3, 4], [0.1, 0.1, 0.1, 0.1], [11, 22, 33, 44]`, function() {
        let r = arrProduct([1, 2, 3, 4], [0.1, 0.1, 0.1, 0.1], [11, 22, 33, 44])
        let rr = 33
        assert.strict.deepStrictEqual(r, rr)
    })

    //第221項第二批(dspec §11第15項, 使用者2026-10-31): arrProduct之基準值opt.base預設0(呼叫arrMulti時傳base: 0), 非有效數字之項為0、不影響總和,
    //  第3位置(null × 0.1)與第4位置(null × null)之乘積皆為0, 故為1 * 0.1 + 2 * 0.1 = 0.30000000000000004
    //  (修前0.4: 第3位置null被當單位元而計0.1; 第一批連動曾暫為1.4; 兩者依第15項改定)
    it(`should return 0.30000000000000004 when input [1, '2', null, null], [0.1, 0.1, 0.1, null]`, function() {
        let r = arrProduct([1, '2', null, null], [0.1, 0.1, 0.1, null])
        let rr = 0.30000000000000004
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 8 when input [1, 2], [2, 3]`, function() {
        let r = arrProduct([1, 2], [2, 3])
        let rr = 8
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return null when input [1, 2], [2]`, function() {
        let r = arrProduct([1, 2], [2])
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return null when input [1, 2], [2, 3, 4]`, function() {
        let r = arrProduct([1, 2], [2, 3, 4])
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 38 when input [1, 2], [2, 3], [4, 5]`, function() {
        let r = arrProduct([1, 2], [2, 3], [4, 5])
        let rr = 38
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return null when input [1, 2], [2, 3], [4, 5, 6]`, function() {
        let r = arrProduct([1, 2], [2, 3], [4, 5, 6])
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return null when input [1, 2], [2, 3], [4]`, function() {
        let r = arrProduct([1, 2], [2, 3], [4])
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 258 when input [1, 2], [2, 3], [4, 5], [6, 7]`, function() {
        let r = arrProduct([1, 2], [2, 3], [4, 5], [6, 7])
        let rr = 258
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return null when input [1, 2], [2, 3], [4, 5], [6, 7, 8]`, function() {
        let r = arrProduct([1, 2], [2, 3], [4, 5], [6, 7, 8])
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return null when input [1, 2], [2, 3], [4, 5], [6]`, function() {
        let r = arrProduct([1, 2], [2, 3], [4, 5], [6])
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 2274 when input [1, 2], [2, 3], [4, 5], [6, 7], [8, 9]`, function() {
        let r = arrProduct([1, 2], [2, 3], [4, 5], [6, 7], [8, 9])
        let rr = 2274
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return null when input [1, 2], [2, 3], [4, 5], [6, 7], [8, 9, 10]`, function() {
        let r = arrProduct([1, 2], [2, 3], [4, 5], [6, 7], [8, 9, 10])
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return null when input [1, 2], [2, 3], [4, 5], [6, 7], [8]`, function() {
        let r = arrProduct([1, 2], [2, 3], [4, 5], [6, 7], [8])
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 38 when input [1, '2'], [2, 3], [4, 5]`, function() {
        let r = arrProduct([1, '2'], [2, 3], [4, 5])
        let rr = 38
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 38 when input [1, 2], ['2', 3], [4, 5]`, function() {
        let r = arrProduct([1, 2], ['2', 3], [4, 5])
        let rr = 38
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 38 when input [1, '2'], [2, '3'], [4, '5']`, function() {
        let r = arrProduct([1, '2'], [2, '3'], [4, '5'])
        let rr = 38
        assert.strict.deepStrictEqual(r, rr)
    })

    //第221項第二批(dspec §11第15項): 非有效數字以基準值0代入, 該位置乘積為0, 故只剩1 * 2 * 4 = 8(原以1計算得8 + 5 = 13)
    it(`should return 8 when input [1, 'a'], [2, 'b'], [4, '5']`, function() {
        let r = arrProduct([1, 'a'], [2, 'b'], [4, '5'])
        let rr = 8
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return null when input ''`, function() {
        let r = arrProduct('')
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return null when input []`, function() {
        let r = arrProduct([])
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return null when input {}`, function() {
        let r = arrProduct({})
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return null when input null`, function() {
        let r = arrProduct(null)
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return null when input undefined`, function() {
        let r = arrProduct(undefined)
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return null when input NaN`, function() {
        let r = arrProduct(NaN)
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return null when input [], ''`, function() {
        let r = arrProduct([], '')
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    //第221項第二批(dspec §11第15項): 每個輸入陣列各自至少1個有效數字(空陣列視為0個), 否則throw(原回null)
    //第221項第六項(dspec §11第6項, 使用者2026-11-03): arrProduct由陣列算出單一數值, 空陣列算不出而報錯(維持); 守護案: 不可因arrAdd/arrMulti改為空進空出而連帶放行
    it(`should throw when input [], []`, function() {
        assert.throws(() => arrProduct([], []), (err) => {
            assert.strict.deepStrictEqual(err instanceof Error, true)
            assert.strict.deepStrictEqual(err.message, 'invalid arrs[0]: must contain a valid number')
            return true
        })
    })

    //第221項第六項: 一邊為空陣列即報錯(原回null), 索引為空之一邊
    it(`should throw with the index of the empty array when input [1], []`, function() {
        assert.throws(() => arrProduct([1], []), (err) => {
            assert.strict.deepStrictEqual(err instanceof Error, true)
            assert.strict.deepStrictEqual(err.message, 'invalid arrs[1]: must contain a valid number')
            return true
        })
    })

    it(`should throw with the index of the empty array when input [], [1]`, function() {
        assert.throws(() => arrProduct([], [1]), { message: 'invalid arrs[0]: must contain a valid number' })
    })

    it(`should throw when one side is empty even if the other has a different length or no valid number`, function() {
        assert.throws(() => arrProduct([1, 2], []), { message: 'invalid arrs[1]: must contain a valid number' })
        assert.throws(() => arrProduct([], [1, 2]), { message: 'invalid arrs[0]: must contain a valid number' })
        assert.throws(() => arrProduct(['a'], []), { message: 'invalid arrs[1]: must contain a valid number' })
        assert.throws(() => arrProduct([], ['a']), { message: 'invalid arrs[0]: must contain a valid number' })
    })

    it(`should throw with the index of the first empty array when more than two arrays`, function() {
        assert.throws(() => arrProduct([1], [2], []), { message: 'invalid arrs[2]: must contain a valid number' })
        assert.throws(() => arrProduct([1], [], [2]), { message: 'invalid arrs[1]: must contain a valid number' })
        assert.throws(() => arrProduct([], [], [2]), { message: 'invalid arrs[0]: must contain a valid number' })
        assert.throws(() => arrProduct([1], [], [], { base: 1 }), { message: 'invalid arrs[1]: must contain a valid number' })
    })

    it(`should not echo any input value in the message when one side is empty`, function() {
        assert.throws(() => arrProduct(['SECRET-xyz'], []), (err) => !err.message.includes('SECRET'))
    })

    //不在本輪: 兩邊皆非空而長度不同仍回null(容器處置不變)
    it(`should return null when input [1, 2], [3] (non-empty arrays of different length, unchanged)`, function() {
        assert.strict.deepStrictEqual(arrProduct([1, 2], [3]), null)
        assert.strict.deepStrictEqual(arrProduct([3], [1, 2]), null)
    })

    //非陣列屬容器無效, 先於空陣列之檢查, 仍回null
    it(`should return null when an argument is not an array even if another one is empty`, function() {
        assert.strict.deepStrictEqual(arrProduct([], 'x'), null)
        assert.strict.deepStrictEqual(arrProduct('x', []), null)
        assert.strict.deepStrictEqual(arrProduct([1], [], 'x'), null)
    })

    it(`should return null when input [], {}`, function() {
        let r = arrProduct([], {})
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return null when input [], null`, function() {
        let r = arrProduct([], null)
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return null when input [], undefined`, function() {
        let r = arrProduct([], undefined)
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return null when input ['abc'], ''`, function() {
        let r = arrProduct(['abc'], '')
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    //第221項第六項: 一邊為空陣列即報錯(原回null)
    it(`should throw when input ['abc'], []`, function() {
        assert.throws(() => arrProduct(['abc'], []), { message: 'invalid arrs[1]: must contain a valid number' })
    })

    it(`should return null when input ['abc'], {}`, function() {
        let r = arrProduct(['abc'], {})
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return null when input ['abc'], null`, function() {
        let r = arrProduct(['abc'], null)
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return null when input ['abc'], undefined`, function() {
        let r = arrProduct(['abc'], undefined)
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

})
