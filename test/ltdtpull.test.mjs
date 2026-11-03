import assert from 'assert'
import ltdtpull from '../src/ltdtpull.mjs'
import { NON_ARR, NON_OBJ_ELEM, LEAK, throwsMsg, throwsMsgNoLeak } from './tools/diffInputKit.mjs'


const MSG_ALL = 'invalid ltdtAll: must be an array'
const MSG_ALL_ROWS = 'invalid ltdtAll: must be an array of objects'
const MSG_DEL = 'invalid ltdtDel: must be an array'
const MSG_DEL_ROWS = 'invalid ltdtDel: must be an array of objects'
const MSG_KEY = 'invalid key: must be a non-empty string'


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
    it(`should throw invalid ltdtAll when input ''`, function() {
        throwsMsg(() => ltdtpull(''), MSG_ALL)
    })

    it(`should throw invalid ltdtDel when input [] (ltdtDel not given)`, function() {
        throwsMsg(() => ltdtpull([]), MSG_DEL)
    })

    it(`should throw invalid ltdtAll when input {}`, function() {
        throwsMsg(() => ltdtpull({}), MSG_ALL)
    })

    it(`should throw invalid ltdtAll when input null`, function() {
        throwsMsg(() => ltdtpull(null), MSG_ALL)
    })

    it(`should throw invalid ltdtAll when input undefined`, function() {
        throwsMsg(() => ltdtpull(undefined), MSG_ALL)
    })

    it(`should throw invalid ltdtAll when input NaN`, function() {
        throwsMsg(() => ltdtpull(NaN), MSG_ALL)
    })

    it(`should throw invalid ltdtAll when no argument is given`, function() {
        throwsMsg(() => ltdtpull(), MSG_ALL)
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
        throwsMsg(() => ltdtpull(['abc'], ''), MSG_ALL_ROWS)
    })

    it(`should throw invalid ltdtAll rows when input ['abc'], []`, function() {
        throwsMsg(() => ltdtpull(['abc'], []), MSG_ALL_ROWS)
    })

    it(`should throw invalid ltdtAll rows when input ['abc'], {}`, function() {
        throwsMsg(() => ltdtpull(['abc'], {}), MSG_ALL_ROWS)
    })

    it(`should throw invalid ltdtAll rows when input ['abc'], null`, function() {
        throwsMsg(() => ltdtpull(['abc'], null), MSG_ALL_ROWS)
    })

    it(`should throw invalid ltdtAll rows when input ['abc'], undefined`, function() {
        throwsMsg(() => ltdtpull(['abc'], undefined), MSG_ALL_ROWS)
    })

    describe(`required parameters ltdtAll, ltdtDel and key (ws286e)`, function() {

        // 表列: ('x',[],'id')、([],'x','id')、([{id:1}],[{id:1}],'')、([],[],'')、(['x'],[],'id')、([{id:1}],['x'],'id') → throw
        it(`should throw when input 'x', [], 'id'`, function() {
            throwsMsg(() => ltdtpull('x', [], 'id'), MSG_ALL)
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
            throwsMsg(() => ltdtpull(['x'], [], 'id'), MSG_ALL_ROWS)
        })

        it(`should throw when input [{ id: 1 }], ['x'], 'id'`, function() {
            throwsMsg(() => ltdtpull([{ id: 1 }], ['x'], 'id'), MSG_DEL_ROWS)
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

        // 未列之合法呼叫不得改變: ltdtDel為[]時回傳ltdtAll本身(非複本)
        it(`should return ltdtAll itself (not a copy) when ltdtDel is [] (unchanged)`, function() {
            let all = [{ id: 1 }, { id: 2 }]
            assert.strictEqual(ltdtpull(all, [], 'id'), all)
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

        it(`should return [] (no throw) when ltdtAll is [] and ltdtDel has items, and when nothing in ltdtAll matches`, function() {
            assert.strict.deepStrictEqual(ltdtpull([], [{ id: 1 }, { id: 2 }], 'x.y'), [])
            assert.strict.deepStrictEqual(ltdtpull([{ id: 1 }, { id: 2 }], [{ id: 3 }], 'id'), [{ id: 1 }, { id: 2 }])
        })

        it(`should accept a nested key path`, function() {
            assert.strict.deepStrictEqual(ltdtpull([{ a: { b: 1 } }, { a: { b: 2 } }], [{ a: { b: 1 } }], 'a.b'), [{ a: { b: 2 } }])
        })

        // ltdtAll非陣列(NON_ARR 21種 + 數字), 其餘有效
        for (let [lb, v] of [...NON_ARR, ['5', 5]]) {
            it(`should throw invalid ltdtAll when ltdtAll is ${lb}`, function() {
                throwsMsg(() => ltdtpull(v, [], 'id'), MSG_ALL)
                throwsMsg(() => ltdtpull(v, [{ id: 1 }], 'id'), MSG_ALL)
            })
            it(`should throw invalid ltdtDel when ltdtDel is ${lb}`, function() {
                throwsMsg(() => ltdtpull([], v, 'id'), MSG_DEL)
                throwsMsg(() => ltdtpull([{ id: 1 }], v, 'id'), MSG_DEL)
            })
        }

        // 元素非物件(NON_OBJ_ELEM 20種): 唯一元素/首/中/末, ltdtAll與ltdtDel兩側; ltdtAll或ltdtDel之另一側為空陣列亦throw
        for (let [lb, v] of NON_OBJ_ELEM) {
            it(`should throw invalid ltdtAll rows when an element of ltdtAll is ${lb}`, function() {
                throwsMsg(() => ltdtpull([v], [], 'id'), MSG_ALL_ROWS)
                throwsMsg(() => ltdtpull([v, { id: 1 }], [{ id: 1 }], 'id'), MSG_ALL_ROWS)
                throwsMsg(() => ltdtpull([{ id: 1 }, v, { id: 2 }], [{ id: 1 }], 'id'), MSG_ALL_ROWS)
                throwsMsg(() => ltdtpull([{ id: 1 }, v], [], 'id'), MSG_ALL_ROWS)
            })
            it(`should throw invalid ltdtDel rows when an element of ltdtDel is ${lb}`, function() {
                throwsMsg(() => ltdtpull([], [v], 'id'), MSG_DEL_ROWS)
                throwsMsg(() => ltdtpull([{ id: 1 }], [v, { id: 1 }], 'id'), MSG_DEL_ROWS)
                throwsMsg(() => ltdtpull([{ id: 1 }], [{ id: 1 }, v, { id: 2 }], 'id'), MSG_DEL_ROWS)
                throwsMsg(() => ltdtpull([{ id: 1 }], [{ id: 1 }, v], 'id'), MSG_DEL_ROWS)
            })
        }

        it(`should treat sparse array holes as non-object elements`, function() {
            let h = [{ id: 1 }, , { id: 3 }] // eslint-disable-line no-sparse-arrays
            throwsMsg(() => ltdtpull(h, [], 'id'), MSG_ALL_ROWS)
            throwsMsg(() => ltdtpull([{ id: 1 }], h, 'id'), MSG_DEL_ROWS)
        })

        // key無效(非非空字串): 與ltdtAll、ltdtDel有無資料無關
        for (let [lb, v] of [
            ['undefined', undefined],
            ['null', null],
            [`''`, ''],
            ['0', 0],
            ['1', 1],
            ['NaN', NaN],
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

        // 檢測順序: ltdtAll(陣列, 元素)、ltdtDel(陣列, 元素)、key
        it(`should check in the order ltdtAll (array, rows), ltdtDel (array, rows), key`, function() {
            throwsMsg(() => ltdtpull('x', 'y', 'z'), MSG_ALL)
            throwsMsg(() => ltdtpull(['x'], 'y', ''), MSG_ALL_ROWS)
            throwsMsg(() => ltdtpull([], 'y', ''), MSG_DEL)
            throwsMsg(() => ltdtpull([], ['y'], ''), MSG_DEL_ROWS)
            throwsMsg(() => ltdtpull([], [], ''), MSG_KEY)
            throwsMsg(() => ltdtpull(['x'], ['y'], 'id'), MSG_ALL_ROWS)
        })

        // 訊息不回顯輸入值(V20)
        it(`should not echo the input value in the messages`, function() {
            throwsMsgNoLeak(() => ltdtpull(LEAK, [], 'id'), MSG_ALL)
            throwsMsgNoLeak(() => ltdtpull({ LEAK }, [], 'id'), MSG_ALL)
            throwsMsgNoLeak(() => ltdtpull([LEAK], [], 'id'), MSG_ALL_ROWS)
            throwsMsgNoLeak(() => ltdtpull([], LEAK, 'id'), MSG_DEL)
            throwsMsgNoLeak(() => ltdtpull([{ id: 1 }], [LEAK], 'id'), MSG_DEL_ROWS)
            throwsMsgNoLeak(() => ltdtpull([{ id: 1 }], [{ id: 1 }], { LEAK }), MSG_KEY)
        })

    })

})
