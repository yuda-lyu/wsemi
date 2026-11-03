import assert from 'assert'
import matConcat from '../src/matConcat.mjs'
import { NON_ARR, LEAK, throwsMsg, throwsMsgNoLeak } from './tools/diffInputKit.mjs'


const MSG_M1 = 'invalid mat1: must be an array'
const MSG_M1_ROWS = 'invalid mat1: must be an array of arrays'
const MSG_M2 = 'invalid mat2: must be an array'
const MSG_M2_ROWS = 'invalid mat2: must be an array of arrays'


describe(`matConcat`, function() {
    let k
    let o = {}

    k = 1
    o[k] = {
        in: {
            mat1: [['a', 'b'], [1.1, 2.2]],
            mat2: [['c', 'd'], [10.1, 20.2]],
        },
        out: [
            ['a', 'b', 'c', 'd'],
            [1.1, 2.2, 10.1, 20.2]
        ]
    }
    it(`should return ${JSON.stringify(o[k].out)} when input ${JSON.stringify(o[k].in.mat1)}, ${JSON.stringify(o[k].in.mat2)}`, function() {
        k = 1
        let r = matConcat(o[k].in.mat1, o[k].in.mat2)
        let rr = o[k].out
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 2
    o[k] = {
        in: {
            mat1: [['a', 'b', 'c'], [1, 2, 3], [1.1, 2.2, 3.3]],
            mat2: [['x', 'y'], [-10.1, -20.2]],
        },
        out: [
            ['a', 'b', 'c', 'x', 'y'],
            [1, 2, 3, -10.1, -20.2],
            [1.1, 2.2, 3.3, null, null]
        ]
    }
    it(`should return ${JSON.stringify(o[k].out)} when input ${JSON.stringify(o[k].in.mat1)}, ${JSON.stringify(o[k].in.mat2)}`, function() {
        k = 2
        let r = matConcat(o[k].in.mat1, o[k].in.mat2)
        let rr = o[k].out
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 3
    o[k] = {
        in: {
            mat1: [['a', 'b'], [1.1, 2.2]],
            mat2: [['x', 'y', 'z'], [-1, -2, -3], [-10.1, -20.2, -30.3]],
        },
        out: [
            ['a', 'b', 'x', 'y', 'z'],
            [1.1, 2.2, -1, -2, -3],
            [null, null, -10.1, -20.2, -30.3]
        ]
    }
    it(`should return ${JSON.stringify(o[k].out)} when input ${JSON.stringify(o[k].in.mat1)}, ${JSON.stringify(o[k].in.mat2)}`, function() {
        k = 3
        let r = matConcat(o[k].in.mat1, o[k].in.mat2)
        let rr = o[k].out
        assert.strict.deepStrictEqual(r, rr)
    })

    //ws286e(第221項§11第6項, 使用者2026-11-03逐列確認): mat1與mat2為必須參數(二維陣列), 無效throw(訊息不帶值); 空陣列為合法資料
    //  對應規格: dspec〈輸入參數之檢測機制〉§11第6項「型別檢測與資料有無無關; 空陣列本身不報錯」、K2(必須參數)、V19(訊息格式)、V20(不回顯輸入值)
    //  原回[]之單參數呼叫(缺mat2)與非陣列改為throw
    it(`should throw invalid mat1 when input ''`, function() {
        throwsMsg(() => matConcat(''), MSG_M1)
    })

    it(`should throw invalid mat2 when input [] (mat2 not given)`, function() {
        throwsMsg(() => matConcat([]), MSG_M2)
    })

    it(`should throw invalid mat1 when input {}`, function() {
        throwsMsg(() => matConcat({}), MSG_M1)
    })

    it(`should throw invalid mat1 when input null`, function() {
        throwsMsg(() => matConcat(null), MSG_M1)
    })

    it(`should throw invalid mat1 when input undefined`, function() {
        throwsMsg(() => matConcat(undefined), MSG_M1)
    })

    it(`should throw invalid mat1 when input NaN`, function() {
        throwsMsg(() => matConcat(NaN), MSG_M1)
    })

    it(`should throw invalid mat1 when no argument is given`, function() {
        throwsMsg(() => matConcat(), MSG_M1)
    })

    describe(`required parameters mat1 and mat2 (ws286e)`, function() {

        // 表列: ('x',[])、([],'x')、([1],[2]) → throw; ([],[]) → [] 不變; ([[1]],[])、([],[[1]]) → [[1]] 不變
        it(`should throw when input 'x', []`, function() {
            throwsMsg(() => matConcat('x', []), MSG_M1)
        })

        it(`should throw when input [], 'x'`, function() {
            throwsMsg(() => matConcat([], 'x'), MSG_M2)
        })

        it(`should throw when input [1], [2]`, function() {
            throwsMsg(() => matConcat([1], [2]), MSG_M1_ROWS)
        })

        it(`should return [] (no throw) when input [], []`, function() {
            assert.strict.deepStrictEqual(matConcat([], []), [])
        })

        it(`should return [[1]] when input [[1]], []`, function() {
            assert.strict.deepStrictEqual(matConcat([[1]], []), [[1]])
        })

        it(`should return [[1]] when input [], [[1]]`, function() {
            assert.strict.deepStrictEqual(matConcat([], [[1]]), [[1]])
        })

        // 空陣列為合法資料: 每次回傳新陣列, 不是輸入本身
        it(`should return a new array each call for [], [] and for one empty side`, function() {
            let a = []
            let b = []
            let r1 = matConcat(a, b)
            let r2 = matConcat(a, b)
            assert.strict.deepStrictEqual(r1, [])
            assert.notStrictEqual(r1, a)
            assert.notStrictEqual(r1, b)
            assert.notStrictEqual(r1, r2)
            let m = [[1, 2]]
            let r3 = matConcat(m, [])
            assert.strict.deepStrictEqual(r3, [[1, 2]])
            assert.notStrictEqual(r3, m)
            assert.notStrictEqual(r3[0], m[0])
        })

        // 單邊為空: 以另一邊之列數與欄數為準, 左右位置照常
        it(`should keep the position of the non-empty side when the other side is empty`, function() {
            assert.strict.deepStrictEqual(matConcat([['a', 'b'], [1, 2]], []), [['a', 'b'], [1, 2]])
            assert.strict.deepStrictEqual(matConcat([], [['a', 'b'], [1, 2]]), [['a', 'b'], [1, 2]])
        })

        // 未列之合法呼叫不得改變: 只含空列之矩陣
        it(`should keep the behavior for matrices of empty rows (unchanged)`, function() {
            assert.strict.deepStrictEqual(matConcat([[]], [[]]), [[]])
            assert.strict.deepStrictEqual(matConcat([[], []], [[1]]), [[1], [null]])
        })

        // mat1非陣列(NON_ARR 21種 + 數字), mat2有效
        for (let [lb, v] of [...NON_ARR, ['5', 5]]) {
            it(`should throw invalid mat1 when mat1 is ${lb} and mat2 is [[1]]`, function() {
                throwsMsg(() => matConcat(v, [[1]]), MSG_M1)
            })
            it(`should throw invalid mat2 when mat2 is ${lb} and mat1 is [[1]]`, function() {
                throwsMsg(() => matConcat([[1]], v), MSG_M2)
            })
        }

        // 元素非陣列(各列須為陣列): 單一元素/首/中/末, 左右兩側; 含陣列空洞
        for (let [lb, v] of [...NON_ARR, ['5', 5]]) {
            it(`should throw invalid mat1 rows when an element of mat1 is ${lb}`, function() {
                throwsMsg(() => matConcat([v], [[1]]), MSG_M1_ROWS)
                throwsMsg(() => matConcat([v, [1]], [[1]]), MSG_M1_ROWS)
                throwsMsg(() => matConcat([[1], v, [2]], [[1]]), MSG_M1_ROWS)
                throwsMsg(() => matConcat([[1], v], []), MSG_M1_ROWS)
            })
            it(`should throw invalid mat2 rows when an element of mat2 is ${lb}`, function() {
                throwsMsg(() => matConcat([[1]], [v]), MSG_M2_ROWS)
                throwsMsg(() => matConcat([[1]], [v, [1]]), MSG_M2_ROWS)
                throwsMsg(() => matConcat([[1]], [[1], v, [2]]), MSG_M2_ROWS)
                throwsMsg(() => matConcat([], [[1], v]), MSG_M2_ROWS)
            })
        }

        it(`should treat sparse array holes as non-array elements`, function() {
            let h = [[1], , [3]] // eslint-disable-line no-sparse-arrays
            throwsMsg(() => matConcat(h, [[1]]), MSG_M1_ROWS)
            throwsMsg(() => matConcat([[1]], h), MSG_M2_ROWS)
        })

        // 檢測順序: mat1(陣列, 元素)、mat2(陣列, 元素)
        it(`should check in the order mat1 (array, rows) then mat2 (array, rows)`, function() {
            throwsMsg(() => matConcat('x', 'y'), MSG_M1)
            throwsMsg(() => matConcat([1], 'y'), MSG_M1_ROWS)
            throwsMsg(() => matConcat([[1]], [2]), MSG_M2_ROWS)
            throwsMsg(() => matConcat([1], [2]), MSG_M1_ROWS)
            throwsMsg(() => matConcat('x', [2]), MSG_M1)
        })

        // 訊息不回顯輸入值(V20)
        it(`should not echo the input value in the messages`, function() {
            throwsMsgNoLeak(() => matConcat(LEAK, [[1]]), MSG_M1)
            throwsMsgNoLeak(() => matConcat({ LEAK }, [[1]]), MSG_M1)
            throwsMsgNoLeak(() => matConcat([[1]], LEAK), MSG_M2)
            throwsMsgNoLeak(() => matConcat([LEAK], [[1]]), MSG_M1_ROWS)
            throwsMsgNoLeak(() => matConcat([[1]], [{ LEAK }]), MSG_M2_ROWS)
        })

        it(`should not mutate the inputs`, function() {
            let m1 = [['a', 'b'], [1, 2]]
            let m2 = [['c'], [3]]
            matConcat(m1, m2)
            assert.strict.deepStrictEqual(m1, [['a', 'b'], [1, 2]])
            assert.strict.deepStrictEqual(m2, [['c'], [3]])
        })

    })

})
