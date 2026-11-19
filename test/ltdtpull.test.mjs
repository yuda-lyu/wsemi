import assert from 'assert'
import ltdtpull from '../src/ltdtpull.mjs'
import { NON_ARR, NON_OBJ_ELEM, LEAK, throwsMsg, throwsMsgNoLeak } from './tools/diffInputKit.mjs'


const MSG_DEL = 'invalid ltdtDel: must be an array'
//ws430c(裁定表〈九〉): 元素非物件之訊息改為指出索引(原'… must be an array of objects'); key之訊息改為'… or a finite number'(原'invalid key: must be a non-empty string')
//ws492j V19/V20: 'invalid ltdtAll: row[i] is not an object' → 'invalid ltdtAll[i]: must be an object'; 'invalid ltdtDel: row[i] has no own key [k]'(帶呼叫端給之欄位名) → 'invalid ltdtDel[i]: must have the primary key as an own field'(不帶欄位名); 'has an invalid key value' → 'must have a primary key of a non-empty string or a finite number'
const MSG_ALL_ROW = (i) => `invalid ltdtAll[${i}]: must be an object`
const MSG_DEL_ROW = (i) => `invalid ltdtDel[${i}]: must be an object`
const MSG_KEY = 'invalid key: must be a non-empty string or a finite number'
const MSG_DEL_NOKEY = (i) => `invalid ltdtDel[${i}]: must have the primary key as an own field`
const MSG_DEL_BADVAL = (i) => `invalid ltdtDel[${i}]: must have a primary key of a non-empty string or a finite number`


describe(`ltdtpull`, function() {

    it(`should return [ { x: 2, y: 'y2' } ] when input [{ x: 1, y: 'y1' }, { x: 2, y: 'y2' }], [{ x: 1, y: 'y3' }], 'x'`, function() {
        let r = ltdtpull([{ x: 1, y: 'y1' }, { x: 2, y: 'y2' }], [{ x: 1, y: 'y3' }], 'x')
        let rr = [{ x: 2, y: 'y2' }]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [ { id: 2, v: 'v2' } ] when input [{ id: 1, v: 'v1' }, { id: 2, v: 'v2' }, { id: 3, v: 'v3' }], [{ id: 1, v: '-v1' }, { id: 3, v: '-v3' }], 'id'`, function() {
        let r = ltdtpull([{ id: 1, v: 'v1' }, { id: 2, v: 'v2' }, { id: 3, v: 'v3' }], [{ id: 1, v: '-v1' }, { id: 3, v: '-v3' }], 'id')
        let rr = [{ id: 2, v: 'v2' }]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [ { id: 2, v: 'v2' } ] when input [{ id: 1, v: 'v1' }, { id: 2, v: 'v2' }, { id: 3, v: 'v3' }], [], 'id'`, function() {
        let r = ltdtpull([{ id: 1, v: 'v1' }, { id: 2, v: 'v2' }, { id: 3, v: 'v3' }], [], 'id')
        let rr = [{ id: 1, v: 'v1' }, { id: 2, v: 'v2' }, { id: 3, v: 'v3' }]
        assert.strict.deepStrictEqual(r, rr)
    })

    //ws286e(第221項§11第6項, 使用者2026-11-03逐列確認): ltdtAll、ltdtDel、key皆為必須參數, 無效throw(訊息不帶值); 空陣列為合法資料, 不報錯
    //  對應規格: dspec〈輸入參數之檢測機制〉§11第6項「ltdtpull([], 'x', 'id') 仍報錯, 因為 'x' 不是陣列。空陣列本身不報錯」(型別檢測與資料有無無關)、K2(必須參數)、V19(訊息格式)、V20(不回顯輸入值)
    //  原回[]之非陣列、元素非物件、key無效與缺參數一律改為throw
    //ws492h(第492項第7批, 使用者2026-11-16「W-16:乙」): ltdtAll為第1參數, 非陣列一律回輸出型別之空結果[], 不拋錯(且不檢查ltdtDel與key); ltdtAll為陣列時其餘必須參數之檢測不變(如ltdtpull([], 'x', 'id')仍throw)
    //  對應規格: dspec〈輸入參數之檢測機制〉§11「C7結構運算之第1參數(使用者2026-11-16 W-16:乙)」
    it(`should return [] (no throw) when input ''`, function() {
        assert.strict.deepStrictEqual(ltdtpull(''), [])
    })

    it(`should throw invalid ltdtDel when input [] (ltdtDel not given)`, function() {
        throwsMsg(() => ltdtpull([]), MSG_DEL)
    })

    it(`should return [] (no throw) when input {}`, function() {
        assert.strict.deepStrictEqual(ltdtpull({}), [])
    })

    it(`should return [] (no throw) when input null`, function() {
        assert.strict.deepStrictEqual(ltdtpull(null), [])
    })

    it(`should return [] (no throw) when input undefined`, function() {
        assert.strict.deepStrictEqual(ltdtpull(undefined), [])
    })

    it(`should return [] (no throw) when input NaN`, function() {
        assert.strict.deepStrictEqual(ltdtpull(NaN), [])
    })

    it(`should return [] (no throw) when no argument is given`, function() {
        assert.strict.deepStrictEqual(ltdtpull(), [])
    })

    it(`should throw invalid ltdtDel when input [], ''`, function() {
        throwsMsg(() => ltdtpull([], ''), MSG_DEL)
    })

    it(`should throw invalid key when input [], [] (key not given)`, function() {
        throwsMsg(() => ltdtpull([], []), MSG_KEY)
    })

    it(`should throw invalid ltdtDel when input [], {}`, function() {
        throwsMsg(() => ltdtpull([], {}), MSG_DEL)
    })

    it(`should throw invalid ltdtDel when input [], null`, function() {
        throwsMsg(() => ltdtpull([], null), MSG_DEL)
    })

    it(`should throw invalid ltdtDel when input [], undefined`, function() {
        throwsMsg(() => ltdtpull([], undefined), MSG_DEL)
    })

    it(`should throw invalid ltdtAll rows when input ['abc'], ''`, function() {
        throwsMsg(() => ltdtpull(['abc'], ''), MSG_ALL_ROW(0))
    })

    it(`should throw invalid ltdtAll rows when input ['abc'], []`, function() {
        throwsMsg(() => ltdtpull(['abc'], []), MSG_ALL_ROW(0))
    })

    it(`should throw invalid ltdtAll rows when input ['abc'], {}`, function() {
        throwsMsg(() => ltdtpull(['abc'], {}), MSG_ALL_ROW(0))
    })

    it(`should throw invalid ltdtAll rows when input ['abc'], null`, function() {
        throwsMsg(() => ltdtpull(['abc'], null), MSG_ALL_ROW(0))
    })

    it(`should throw invalid ltdtAll rows when input ['abc'], undefined`, function() {
        throwsMsg(() => ltdtpull(['abc'], undefined), MSG_ALL_ROW(0))
    })

    describe(`required parameters ltdtAll, ltdtDel and key (ws286e)`, function() {

        // 表列: ('x',[],'id')、([],'x','id')、([{id:1}],[{id:1}],'')、([],[],'')、(['x'],[],'id')、([{id:1}],['x'],'id') → throw
        it(`should return [] (no throw, ws492h) when input 'x', [], 'id'`, function() {
            assert.strict.deepStrictEqual(ltdtpull('x', [], 'id'), [])
        })

        it(`should throw when input [], 'x', 'id'`, function() {
            throwsMsg(() => ltdtpull([], 'x', 'id'), MSG_DEL)
        })

        it(`should throw when input [{ id: 1 }], [{ id: 1 }], ''`, function() {
            throwsMsg(() => ltdtpull([{ id: 1 }], [{ id: 1 }], ''), MSG_KEY)
        })

        it(`should throw when input [], [], '' (empty arrays do not excuse an invalid key)`, function() {
            throwsMsg(() => ltdtpull([], [], ''), MSG_KEY)
        })

        it(`should throw when input ['x'], [], 'id'`, function() {
            throwsMsg(() => ltdtpull(['x'], [], 'id'), MSG_ALL_ROW(0))
        })

        it(`should throw when input [{ id: 1 }], ['x'], 'id'`, function() {
            throwsMsg(() => ltdtpull([{ id: 1 }], ['x'], 'id'), MSG_DEL_ROW(0))
        })

        // 表列: ([],[],'id')、([],[{id:1}],'id') → []; ([{id:1}],[],'id') → [{id:1}] 不變
        it(`should return [] (no throw) when input [], [], 'id'`, function() {
            assert.strict.deepStrictEqual(ltdtpull([], [], 'id'), [])
        })

        it(`should return [] (no throw) when input [], [{ id: 1 }], 'id'`, function() {
            assert.strict.deepStrictEqual(ltdtpull([], [{ id: 1 }], 'id'), [])
        })

        it(`should return [{ id: 1 }] when input [{ id: 1 }], [], 'id'`, function() {
            assert.strict.deepStrictEqual(ltdtpull([{ id: 1 }], [], 'id'), [{ id: 1 }])
        })

        //ws430c(裁定表〈九〉「ltdtDel 為 [] → 回新陣列(淺複本;原回 ltdtAll 本身)」): 原期望strictEqual(ltdtAll本身) → 新期望為另一陣列、內容與元素相同
        it(`should return a shallow copy (not ltdtAll itself) when ltdtDel is [] (ws430c 〈九〉)`, function() {
            let all = [{ id: 1 }, { id: 2 }]
            let r = ltdtpull(all, [], 'id')
            assert.notStrictEqual(r, all)
            assert.strict.deepStrictEqual(r, all)
            assert.strictEqual(r[0], all[0])
            assert.strictEqual(r[1], all[1])
        })

        it(`should return the rest of ltdtAll as a new array when ltdtDel is not empty`, function() {
            let all = [{ id: 1 }, { id: 2 }, { id: 3 }]
            let del = [{ id: 2 }]
            let r = ltdtpull(all, del, 'id')
            assert.strict.deepStrictEqual(r, [{ id: 1 }, { id: 3 }])
            assert.notStrictEqual(r, all)
            assert.strict.deepStrictEqual(all, [{ id: 1 }, { id: 2 }, { id: 3 }])
            assert.strict.deepStrictEqual(del, [{ id: 2 }])
        })

        //ws430c(裁定表〈九〉「ltdtDel 之列缺該自有鍵 → 拋錯」): 原期望ltdtpull([], [{ id: 1 }, { id: 2 }], 'x.y')回[] → 新期望拋row[0] has no own key; 第二式不變
        it(`should return [] when nothing in ltdtAll matches, and throw when a row of ltdtDel has no own key even if ltdtAll is [] (ws430c 〈九〉)`, function() {
            throwsMsg(() => ltdtpull([], [{ id: 1 }, { id: 2 }], 'x.y'), MSG_DEL_NOKEY(0))
            assert.strict.deepStrictEqual(ltdtpull([{ id: 1 }, { id: 2 }], [{ id: 3 }], 'id'), [{ id: 1 }, { id: 2 }])
        })

        //ws430c(裁定表〈九〉「只讀自有同名鍵, 不經 lodash differenceBy 之路徑解析('a.b' 為欄位名)」): 原期望'a.b'解析為巢狀路徑而刪除{a:{b:1}} → 新期望ltdtDel之{a:{b:1}}無自有'a.b'欄位而拋錯, 自有'a.b'欄位者依欄位名比對
        it(`should treat a dotted key as a field name, not a nested path (ws430c 〈九〉)`, function() {
            throwsMsg(() => ltdtpull([{ a: { b: 1 } }, { a: { b: 2 } }], [{ a: { b: 1 } }], 'a.b'), MSG_DEL_NOKEY(0))
            assert.strict.deepStrictEqual(ltdtpull([{ 'a.b': 1 }, { 'a.b': 2 }, { a: { b: 1 } }], [{ 'a.b': 1 }], 'a.b'), [{ 'a.b': 2 }, { a: { b: 1 } }])
        })

        // ltdtAll非陣列(NON_ARR 21種 + 數字): 回[](不拋錯, ws492h), 不論ltdtDel與key是否有效(第1參數無效時不檢查其餘)
        for (let [lb, v] of [...NON_ARR, ['5', 5]]) {
            it(`should return [] (no throw) when ltdtAll is ${lb}`, function() {
                assert.strict.deepStrictEqual(ltdtpull(v, [], 'id'), [])
                assert.strict.deepStrictEqual(ltdtpull(v, [{ id: 1 }], 'id'), [])
                assert.strict.deepStrictEqual(ltdtpull(v, 'x', ''), [])
                assert.strict.deepStrictEqual(ltdtpull(v), [])
            })
            it(`should throw invalid ltdtDel when ltdtDel is ${lb}`, function() {
                throwsMsg(() => ltdtpull([], v, 'id'), MSG_DEL)
                throwsMsg(() => ltdtpull([{ id: 1 }], v, 'id'), MSG_DEL)
            })
        }

        // 元素非物件(NON_OBJ_ELEM 20種): 唯一元素/首/中/末, ltdtAll與ltdtDel兩側; ltdtAll或ltdtDel之另一側為空陣列亦throw; ws430c(〈九〉): 訊息指出row[i]
        for (let [lb, v] of NON_OBJ_ELEM) {
            it(`should throw invalid ltdtAll rows when an element of ltdtAll is ${lb}`, function() {
                throwsMsg(() => ltdtpull([v], [], 'id'), MSG_ALL_ROW(0))
                throwsMsg(() => ltdtpull([v, { id: 1 }], [{ id: 1 }], 'id'), MSG_ALL_ROW(0))
                throwsMsg(() => ltdtpull([{ id: 1 }, v, { id: 2 }], [{ id: 1 }], 'id'), MSG_ALL_ROW(1))
                throwsMsg(() => ltdtpull([{ id: 1 }, v], [], 'id'), MSG_ALL_ROW(1))
            })
            it(`should throw invalid ltdtDel rows when an element of ltdtDel is ${lb}`, function() {
                throwsMsg(() => ltdtpull([], [v], 'id'), MSG_DEL_ROW(0))
                throwsMsg(() => ltdtpull([{ id: 1 }], [v, { id: 1 }], 'id'), MSG_DEL_ROW(0))
                throwsMsg(() => ltdtpull([{ id: 1 }], [{ id: 1 }, v, { id: 2 }], 'id'), MSG_DEL_ROW(1))
                throwsMsg(() => ltdtpull([{ id: 1 }], [{ id: 1 }, v], 'id'), MSG_DEL_ROW(1))
            })
        }

        it(`should treat sparse array holes as non-object elements`, function() {
            let h = [{ id: 1 }, , { id: 3 }] // eslint-disable-line no-sparse-arrays
            throwsMsg(() => ltdtpull(h, [], 'id'), MSG_ALL_ROW(1))
            throwsMsg(() => ltdtpull([{ id: 1 }], h, 'id'), MSG_DEL_ROW(1))
        })

        // key無效(非「非空字串或有限數字」): 與ltdtAll、ltdtDel有無資料無關; ws430c(〈九〉「key 為有限數字 視同字串欄名」): 原列為無效之0與1移出, 改於下方之有效案
        for (let [lb, v] of [
            ['undefined', undefined],
            ['null', null],
            [`''`, ''],
            ['NaN', NaN],
            ['Infinity', Infinity],
            ['true', true],
            ['false', false],
            [`['id']`, ['id']],
            ['{}', {}],
            ['{ id: 1 }', { id: 1 }],
            ['() => "id"', () => 'id'],
            ['Symbol()', Symbol('id')],
            ['1n', 1n],
            ['new Date(0)', new Date(0)],
        ]) {
            it(`should throw invalid key when key is ${lb}`, function() {
                throwsMsg(() => ltdtpull([{ id: 1 }], [{ id: 1 }], v), MSG_KEY)
                throwsMsg(() => ltdtpull([{ id: 1 }], [], v), MSG_KEY)
                throwsMsg(() => ltdtpull([], [{ id: 1 }], v), MSG_KEY)
                throwsMsg(() => ltdtpull([], [], v), MSG_KEY)
            })
        }

        // 檢測順序: ltdtAll(陣列, 元素)、ltdtDel(陣列, 元素)、key、ltdtDel之鍵
        it(`should check in the order ltdtAll (array, rows), ltdtDel (array, rows), key, keys of ltdtDel, and return [] when ltdtAll is not an array`, function() {
            assert.strict.deepStrictEqual(ltdtpull('x', 'y', 'z'), []) //ws492h: ltdtAll非陣列回[], 不再檢查ltdtDel與key
            throwsMsg(() => ltdtpull(['x'], 'y', ''), MSG_ALL_ROW(0))
            throwsMsg(() => ltdtpull([], 'y', ''), MSG_DEL)
            throwsMsg(() => ltdtpull([], ['y'], ''), MSG_DEL_ROW(0))
            throwsMsg(() => ltdtpull([], [], ''), MSG_KEY)
            throwsMsg(() => ltdtpull(['x'], ['y'], 'id'), MSG_ALL_ROW(0))
            throwsMsg(() => ltdtpull([{ id: 1 }], [{ v: 1 }], ''), MSG_KEY)
        })

        // 訊息不回顯輸入值(V20)
        it(`should not echo the input value in the messages`, function() {
            assert.strict.deepStrictEqual(ltdtpull(LEAK, [], 'id'), []) //ltdtAll非陣列不拋錯, 無訊息可回顯
            assert.strict.deepStrictEqual(ltdtpull({ LEAK }, [], 'id'), [])
            throwsMsgNoLeak(() => ltdtpull([LEAK], [], 'id'), MSG_ALL_ROW(0))
            throwsMsgNoLeak(() => ltdtpull([], LEAK, 'id'), MSG_DEL)
            throwsMsgNoLeak(() => ltdtpull([{ id: 1 }], [LEAK], 'id'), MSG_DEL_ROW(0))
            throwsMsgNoLeak(() => ltdtpull([{ id: 1 }], [{ id: 1 }], { LEAK }), MSG_KEY)
            throwsMsgNoLeak(() => ltdtpull([{ id: 1 }], [{ id: 1 }], LEAK), MSG_DEL_NOKEY(0)) //ws492j V20: 欄位名(呼叫端給之key)亦不帶入訊息(原ws430c3〈十六〉帶欄位名)
            throwsMsgNoLeak(() => ltdtpull([{ id: 1 }], [{ v: LEAK }], 'id'), MSG_DEL_NOKEY(0))
            throwsMsgNoLeak(() => ltdtpull([{ id: 1 }], [{ id: { LEAK } }], 'id'), MSG_DEL_BADVAL(0))
        })

    })

})
