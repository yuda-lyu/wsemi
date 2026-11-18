import assert from 'assert'
import arrReverse from '../src/arrReverse.mjs'
import { NON_ARR, LEAK } from './tools/diffInputKit.mjs'


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
    //ws492h(第492項第7批, 使用者2026-11-16「W-16:乙」): vall為第1參數, 非陣列一律回輸出型別之空結果[], 不拋錯(原throw invalid vall)
    //  對應規格: dspec〈輸入參數之檢測機制〉§11「C7結構運算之第1參數(使用者2026-11-16 W-16:乙)」
    it(`should return [] when input ''`, function() {
        assert.strict.deepStrictEqual(arrReverse(''), [])
    })

    it(`should return [] when input []`, function() {
        let r = arrReverse([])
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input {}`, function() {
        assert.strict.deepStrictEqual(arrReverse({}), [])
    })

    it(`should return [] when input null`, function() {
        assert.strict.deepStrictEqual(arrReverse(null), [])
    })

    it(`should return [] when input undefined`, function() {
        assert.strict.deepStrictEqual(arrReverse(undefined), [])
    })

    it(`should return [] when input NaN`, function() {
        assert.strict.deepStrictEqual(arrReverse(NaN), [])
    })

    it(`should return [] when no argument is given`, function() {
        assert.strict.deepStrictEqual(arrReverse(), [])
    })

    for (let [lb, v] of [...NON_ARR, [`'x'`, 'x'], ['5', 5]]) {
        it(`should return [] (no throw) when input ${lb}`, function() {
            let r = arrReverse(v)
            assert.strict.deepStrictEqual(r, [])
            assert.ok(Array.isArray(r))
        })
    }

    it(`should not throw nor echo anything when the input is a non-array carrying a leak mark`, function() {
        assert.strict.deepStrictEqual(arrReverse(LEAK), [])
        assert.strict.deepStrictEqual(arrReverse({ LEAK }), [])
        assert.strict.deepStrictEqual(arrReverse({ length: 1, 0: LEAK }), [])
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

    //ws492h(W-19, 比照第三批「單一空元素不再當空陣列」): 僅含單一空元素([null]、[undefined]、['']、[{}]、[[]]、[NaN])之陣列視為一個元素, 照常反序而保留(原靜默回傳[])
    it(`should keep an array of a single empty element as one element (not treated as an empty array)`, function() {
        for (let v of [null, undefined, '', {}, [], NaN]) {
            let a = [v]
            let r = arrReverse(a)
            assert.strict.deepStrictEqual(r, [v])
            assert.notStrictEqual(r, a)
            assert.strict.deepStrictEqual(a, [v]) //不改動輸入
        }
        assert.strict.deepStrictEqual(arrReverse([null, null]), [null, null])
    })

    it(`should reverse an array whose elements are all empty elements in order`, function() {
        assert.strict.deepStrictEqual(arrReverse([null, '', {}, [], undefined]), [undefined, [], {}, '', null])
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
