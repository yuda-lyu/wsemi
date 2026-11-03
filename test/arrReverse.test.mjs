import assert from 'assert'
import arrReverse from '../src/arrReverse.mjs'
import { NON_ARR, LEAK, throwsMsg, throwsMsgNoLeak } from './tools/diffInputKit.mjs'


const MSG_VALL = 'invalid vall: must be an array'


describe(`arrReverse`, function() {

    it(`should return [ 'abc', 5, 4, 3, 2, 1 ] when input [1, 2, 3, 4, 5, 'abc']`, function() {
        let r = arrReverse([1, 2, 3, 4, 5, 'abc'])
        let rr = ['abc', 5, 4, 3, 2, 1]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [ 'abc', 5, '4', 3, 2, 1 ] when input [1, 2, 3, '4', 5, 'abc']`, function() {
        let r = arrReverse([1, 2, 3, '4', 5, 'abc'])
        let rr = ['abc', 5, '4', 3, 2, 1]
        assert.strict.deepStrictEqual(r, rr)
    })

    //ws286e(第221項§11第6項, 使用者2026-11-03逐列確認): vall為必須參數, 非陣列throw(訊息不帶值); 空陣列為合法資料, 回傳[]
    //  對應規格: dspec〈輸入參數之檢測機制〉§11第6項「型別檢測與資料有無無關; 空陣列本身不報錯」、V19(訊息格式)、V20(不回顯輸入值)
    it(`should throw invalid vall when input ''`, function() {
        throwsMsg(() => arrReverse(''), MSG_VALL)
    })

    it(`should return [] when input []`, function() {
        let r = arrReverse([])
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should throw invalid vall when input {}`, function() {
        throwsMsg(() => arrReverse({}), MSG_VALL)
    })

    it(`should throw invalid vall when input null`, function() {
        throwsMsg(() => arrReverse(null), MSG_VALL)
    })

    it(`should throw invalid vall when input undefined`, function() {
        throwsMsg(() => arrReverse(undefined), MSG_VALL)
    })

    it(`should throw invalid vall when input NaN`, function() {
        throwsMsg(() => arrReverse(NaN), MSG_VALL)
    })

    it(`should throw invalid vall when no argument is given`, function() {
        throwsMsg(() => arrReverse(), MSG_VALL)
    })

    for (let [lb, v] of [...NON_ARR, [`'x'`, 'x'], ['5', 5]]) {
        it(`should throw invalid vall when input ${lb}`, function() {
            throwsMsg(() => arrReverse(v), MSG_VALL)
        })
    }

    it(`should not echo the input value in the message of an invalid vall`, function() {
        throwsMsgNoLeak(() => arrReverse(LEAK), MSG_VALL)
        throwsMsgNoLeak(() => arrReverse({ LEAK }), MSG_VALL)
        throwsMsgNoLeak(() => arrReverse({ length: 1, 0: LEAK }), MSG_VALL)
    })

    //表列: ([]) → [] 不變, 回傳新陣列
    it(`should return a new empty array each call when input []`, function() {
        let a = []
        let r1 = arrReverse(a)
        let r2 = arrReverse(a)
        assert.strict.deepStrictEqual(r1, [])
        assert.notStrictEqual(r1, a)
        assert.notStrictEqual(r1, r2)
    })

    it(`should return a deep-cloned reversed array and not mutate the input`, function() {
        let a = [{ x: 1 }, [2, 3], 'k']
        let r = arrReverse(a)
        assert.strict.deepStrictEqual(r, ['k', [2, 3], { x: 1 }])
        assert.strict.deepStrictEqual(a, [{ x: 1 }, [2, 3], 'k'])
        assert.notStrictEqual(r[2], a[0])
        assert.notStrictEqual(r[1], a[1])
    })

    //未列之合法呼叫不得改變: 僅含單一廣義無效元素(isearr為false)之陣列維持原行為回傳[](本次不動, 見報告需裁示)
    it(`should keep returning [] for an array of a single iser element (unchanged, not in the confirmed table)`, function() {
        for (let v of [null, undefined, '', {}, [], NaN]) {
            assert.strict.deepStrictEqual(arrReverse([v]), [])
        }
        assert.strict.deepStrictEqual(arrReverse([null, null]), [null, null])
    })

    it(`should return [] when input [], ''`, function() {
        let r = arrReverse([], '')
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [], []`, function() {
        let r = arrReverse([], [])
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [], {}`, function() {
        let r = arrReverse([], {})
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [], null`, function() {
        let r = arrReverse([], null)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [], undefined`, function() {
        let r = arrReverse([], undefined)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ['abc'], ''`, function() {
        let r = arrReverse(['abc'], '')
        let rr = ['abc']
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ['abc'], []`, function() {
        let r = arrReverse(['abc'], [])
        let rr = ['abc']
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ['abc'], {}`, function() {
        let r = arrReverse(['abc'], {})
        let rr = ['abc']
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ['abc'], null`, function() {
        let r = arrReverse(['abc'], null)
        let rr = ['abc']
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ['abc'], undefined`, function() {
        let r = arrReverse(['abc'], undefined)
        let rr = ['abc']
        assert.strict.deepStrictEqual(r, rr)
    })

})
