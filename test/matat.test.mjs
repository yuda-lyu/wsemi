import assert from 'assert'
import matat from '../src/matat.mjs'
import { NON_ARR, LEAK, throwsMsg, throwsMsgNoLeak } from './tools/diffInputKit.mjs'


//ws430c(裁定表〈十一〉「列非陣列(含外層空位) 結果不變(拋錯);訊息指出 row[i]」): 原'invalid mat: must be an array of arrays' → 新'invalid mat: row[i] is not an array'
const MSG_MAT_ROW = (i) => `invalid mat: row[${i}] is not an array`
const MSG_ISTART = 'invalid istart: must be an integer index'


describe(`matat`, function() {
    let k
    let o = {}

    k = 1
    o[k] = {
        in: [['a', 'b', '12.34'], [12, 34.56, 'abc']],
        out: [['b'], [34.56]]
    }
    it(`should return ${JSON.stringify(o[k].out)} when input ${JSON.stringify(o[k].in)}, 1`, function() {
        k = 1
        let r = matat(o[k].in, 1)
        let rr = o[k].out
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 2
    o[k] = {
        in: [['a', 'b', '12.34'], [12, 34.56, 'abc']],
        out: [['b', '12.34'], [34.56, 'abc']]
    }
    it(`should return ${JSON.stringify(o[k].out)} when input ${JSON.stringify(o[k].in)}, 1, 2`, function() {
        k = 2
        let r = matat(o[k].in, 1, 2)
        let rr = o[k].out
        assert.strict.deepStrictEqual(r, rr)
    })

    //ws430c(裁定表〈十一〉「iend 超出列長 → 截至該列最後一欄(原整列回 [])」): 原期望[[], []] → 新期望截至各列最後一欄
    k = 3
    o[k] = {
        in: [['a', 'b', '12.34'], [12, 34.56, 'abc']],
        out: [['b', '12.34'], [34.56, 'abc']]
    }
    it(`should return ${JSON.stringify(o[k].out)} when input ${JSON.stringify(o[k].in)}, 1, 10`, function() {
        k = 3
        let r = matat(o[k].in, 1, 10)
        let rr = o[k].out
        assert.strict.deepStrictEqual(r, rr)
    })

    //使用者2026-11-02: arrAt之iend為opt類參數, 非預期(負數)視為未給, 只取istart一筆
    k = 4
    o[k] = {
        in: [['a', 'b', '12.34'], [12, 34.56, 'abc']],
        out: [['b'], [34.56]]
    }
    it(`should return ${JSON.stringify(o[k].out)} (only istart) when input ${JSON.stringify(o[k].in)}, 1, -10`, function() {
        k = 4
        let r = matat(o[k].in, 1, -10)
        let rr = o[k].out
        assert.strict.deepStrictEqual(r, rr)
    })

    //ws286e: istart為必須參數(索引), 負數屬無效(原回[[], []], 與'x'同為iseint(use: 'index')判定無效), 改throw; 見下方describe
    k = 5
    o[k] = {
        in: [['a', 'b', '12.34'], [12, 34.56, 'abc']],
    }
    it(`should throw invalid istart when input ${JSON.stringify(o[k].in)}, -1, 10`, function() {
        k = 5
        throwsMsg(() => matat(o[k].in, -1, 10), MSG_ISTART)
    })

    k = 6
    o[k] = {
        in: [['a', 'b', '12.34'], [12, 34.56, 'abc']],
    }
    it(`should throw invalid istart when input ${JSON.stringify(o[k].in)}, -1, -10`, function() {
        k = 6
        throwsMsg(() => matat(o[k].in, -1, -10), MSG_ISTART)
    })

    k = 7
    o[k] = {
        in: [['a', 'b', '12.34'], [12, 34.56, 'abc']],
        out: [[], []]
    }
    it(`should return ${JSON.stringify(o[k].out)} when input ${JSON.stringify(o[k].in)}, 10`, function() {
        k = 7
        let r = matat(o[k].in, 10)
        let rr = o[k].out
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 8
    o[k] = {
        in: [['a', 'b', '12.34'], [12, 34.56, 'abc']],
    }
    it(`should throw invalid istart when input ${JSON.stringify(o[k].in)}, -10`, function() {
        k = 8
        throwsMsg(() => matat(o[k].in, -10), MSG_ISTART)
    })

    //ws286e(第221項§11第6項, 使用者2026-11-03逐列確認): mat與istart為必須參數, 無效throw(訊息不帶值); 空陣列為合法資料
    //  對應規格: dspec〈輸入參數之檢測機制〉§11第6項「型別檢測與資料有無無關; 空陣列本身不報錯」、K2(必須參數)、K3(iend為opt類, 非預期視為未給)、V19(訊息格式)、V20(不回顯輸入值)
    //  原回[]之非陣列與缺istart改為throw
    //ws492h(第492項第7批, 使用者2026-11-16「W-16:乙」): mat為第1參數, 非陣列(含未給)一律回輸出型別之空結果[], 不拋錯, 且不檢查istart; mat為陣列時istart缺漏仍throw
    //  對應規格: dspec〈輸入參數之檢測機制〉§11「C7結構運算之第1參數(使用者2026-11-16 W-16:乙)」
    it(`should return [] (no throw) when input ''`, function() {
        assert.strict.deepStrictEqual(matat(''), [])
    })

    it(`should throw invalid istart when input [] (istart not given)`, function() {
        throwsMsg(() => matat([]), MSG_ISTART)
    })

    it(`should return [] (no throw) when input {}`, function() {
        assert.strict.deepStrictEqual(matat({}), [])
    })

    it(`should return [] (no throw) when input null`, function() {
        assert.strict.deepStrictEqual(matat(null), [])
    })

    it(`should return [] (no throw) when input undefined`, function() {
        assert.strict.deepStrictEqual(matat(undefined), [])
    })

    it(`should return [] (no throw) when input NaN`, function() {
        assert.strict.deepStrictEqual(matat(NaN), [])
    })

    describe(`required parameters mat and istart, opt-like iend (ws286e; mat non-array returns [] since ws492h)`, function() {

        let m = [['a', 'b', '12.34'], [12, 34.56, 'abc']]

        // 表列: ('x',0)、(null,0)均回[](ws492h); ([1,2],0)、([[1,2]],'x') → throw; ([[1,2]],0,'x') → [[1]]; ([],0) → []
        it(`should return [] (no throw) when input 'x', 0`, function() {
            assert.strict.deepStrictEqual(matat('x', 0), [])
        })

        it(`should return [] (no throw) when input null, 0`, function() {
            assert.strict.deepStrictEqual(matat(null, 0), [])
        })

        it(`should throw when input [1, 2], 0`, function() {
            throwsMsg(() => matat([1, 2], 0), MSG_MAT_ROW(0))
        })

        it(`should throw when input [[1, 2]], 'x'`, function() {
            throwsMsg(() => matat([[1, 2]], 'x'), MSG_ISTART)
        })

        it(`should return [[1]] when input [[1, 2]], 0, 'x' (iend is opt-like: unexpected value is treated as not given)`, function() {
            assert.strict.deepStrictEqual(matat([[1, 2]], 0, 'x'), [[1]])
        })

        it(`should return [] (no throw) when input [], 0`, function() {
            assert.strict.deepStrictEqual(matat([], 0), [])
        })

        // 空陣列為合法資料: 每次回傳新陣列; istart為字串索引亦可
        it(`should return a new empty array each call and accept a string index when mat is []`, function() {
            let a = []
            let r1 = matat(a, 0)
            let r2 = matat(a, '1', 3)
            assert.strict.deepStrictEqual(r1, [])
            assert.strict.deepStrictEqual(r2, [])
            assert.notStrictEqual(r1, a)
            assert.notStrictEqual(r1, r2)
        })

        // 型別檢測與mat有無資料無關: mat為空陣列時, 無效istart一樣throw
        it(`should throw for an empty mat when istart is invalid (type check is independent of data)`, function() {
            throwsMsg(() => matat([], 'x'), MSG_ISTART)
            throwsMsg(() => matat([], undefined), MSG_ISTART)
            throwsMsg(() => matat([], -1), MSG_ISTART)
            throwsMsg(() => matat([]), MSG_ISTART)
        })

        // mat非陣列(NON_ARR 21種 + 數字): 回[](不拋錯), 不論istart有效(0)、無效('x')或未給
        for (let [lb, v] of [...NON_ARR, ['5', 5]]) {
            it(`should return [] (no throw) when mat is ${lb} whatever istart is`, function() {
                assert.strict.deepStrictEqual(matat(v, 0), [])
                assert.strict.deepStrictEqual(matat(v, 'x'), [])
                assert.strict.deepStrictEqual(matat(v), [])
            })
        }

        // 元素非陣列: 唯一元素/首/中/末; 含陣列空洞
        for (let [lb, v] of [...NON_ARR, ['5', 5]]) {
            it(`should throw invalid mat rows when an element of mat is ${lb}`, function() {
                throwsMsg(() => matat([v], 0), MSG_MAT_ROW(0))
                throwsMsg(() => matat([v, [1, 2]], 0), MSG_MAT_ROW(0))
                throwsMsg(() => matat([[1, 2], v, [3, 4]], 0), MSG_MAT_ROW(1))
                throwsMsg(() => matat([[1, 2], v], 0), MSG_MAT_ROW(1))
            })
        }

        it(`should treat sparse array holes as non-array elements`, function() {
            let h = [[1, 2], , [3, 4]] // eslint-disable-line no-sparse-arrays
            throwsMsg(() => matat(h, 0), MSG_MAT_ROW(1))
        })

        // istart無效(同arrAt之iseint use: 'index'判定): 缺少/undefined/null/NaN/Infinity/負數/小數/超過索引上限/非數字字串/空字串/十六進位/布林/陣列/物件/包裝物件/BigInt/Symbol/函數
        for (let [lb, v] of [
            ['undefined', undefined],
            ['null', null],
            ['NaN', NaN],
            ['Infinity', Infinity],
            ['-Infinity', -Infinity],
            ['-1', -1],
            [`'-1'`, '-1'],
            ['1.5', 1.5],
            [`'1.5'`, '1.5'],
            ['4294967295 (over the index limit)', 4294967295],
            [`'x'`, 'x'],
            [`''`, ''],
            [`'   '`, '   '],
            [`'0x1'`, '0x1'],
            ['true', true],
            ['false', false],
            ['[]', []],
            ['[1]', [1]],
            ['{}', {}],
            ['{ a: 1 }', { a: 1 }],
            ['new Number(1)', new Number(1)], // eslint-disable-line no-new-wrappers
            ['1n', 1n],
            ['Symbol()', Symbol('x')],
            ['() => 1', () => 1],
        ]) {
            it(`should throw invalid istart when istart is ${lb}`, function() {
                throwsMsg(() => matat(m, v), MSG_ISTART)
                throwsMsg(() => matat(m, v, 2), MSG_ISTART)
                throwsMsg(() => matat([], v), MSG_ISTART)
            })
        }

        // istart有效: 整數、數字字串(去頭尾空白後取值)
        it(`should accept an integer or a numeric string as istart`, function() {
            assert.strict.deepStrictEqual(matat(m, 0), [['a'], [12]])
            assert.strict.deepStrictEqual(matat(m, '1'), [['b'], [34.56]])
            assert.strict.deepStrictEqual(matat(m, ' 1 ', '2'), [['b', '12.34'], [34.56, 'abc']])
        })

        // istart超出各列長度屬資料範圍而非型別: 該列回傳[], 不throw(不變)
        it(`should return empty rows (no throw) when istart is beyond the row length`, function() {
            assert.strict.deepStrictEqual(matat(m, 3), [[], []])
            assert.strict.deepStrictEqual(matat([[1], [2, 3]], 1), [[], [3]])
        })

        // iend為opt類參數: 非預期視為未給(只取istart一筆), 不throw
        for (let [lb, v] of [
            ['undefined', undefined],
            ['null', null],
            ['NaN', NaN],
            ['Infinity', Infinity],
            ['-10', -10],
            ['1.5', 1.5],
            [`'x'`, 'x'],
            ['{}', {}],
            ['[]', []],
            ['true', true],
        ]) {
            it(`should treat iend ${lb} as not given and not throw`, function() {
                assert.strict.deepStrictEqual(matat(m, 1, v), [['b'], [34.56]])
            })
        }

        // 檢測順序: mat(陣列, 元素)、istart; mat非陣列時回[]而不檢查istart(ws492h)
        it(`should check in the order mat (array, rows) then istart, and return [] before checking istart when mat is not an array`, function() {
            assert.strict.deepStrictEqual(matat('x', 'x'), [])
            throwsMsg(() => matat([1], 'x'), MSG_MAT_ROW(0))
            assert.strict.deepStrictEqual(matat(null), [])
            throwsMsg(() => matat([[1]], 'x'), MSG_ISTART)
        })

        //ws430c(裁定表〈十一〉「只有一列空列([[]]) → 回 [[]](原因 isearr 回 [],列數消失)」): 原期望matat([[]], 0)為[] → 新期望[[]](列數不變); [[], []]不變
        it(`should return [[]] for [[]] and keep [[], []] for two empty rows (row count kept, ws430c 〈十一〉)`, function() {
            assert.strict.deepStrictEqual(matat([[]], 0), [[]])
            assert.strict.deepStrictEqual(matat([[], []], 0), [[], []])
        })

        // 訊息不回顯輸入值(V20)
        it(`should not echo the input value in the messages`, function() {
            assert.strict.deepStrictEqual(matat(LEAK, 0), []) //mat非陣列不拋錯, 無訊息可回顯
            assert.strict.deepStrictEqual(matat({ LEAK }, 0), [])
            throwsMsgNoLeak(() => matat([LEAK], 0), MSG_MAT_ROW(0))
            throwsMsgNoLeak(() => matat([[1]], LEAK), MSG_ISTART)
            throwsMsgNoLeak(() => matat([[1]], { LEAK }), MSG_ISTART)
        })

        it(`should not mutate the input matrix`, function() {
            let a = [[1, 2, 3], [4, 5, 6]]
            matat(a, 1, 2)
            assert.strict.deepStrictEqual(a, [[1, 2, 3], [4, 5, 6]])
        })

    })

})
