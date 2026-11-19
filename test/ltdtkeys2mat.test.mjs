import assert from 'assert'
import ltdtkeys2mat from '../src/ltdtkeys2mat.mjs'
import { NON_ARR } from './tools/diffInputKit.mjs'


describe(`ltdtkeys2mat`, function() {
    let k
    let o = {}

    k = 1
    o[k] = {
        ltdt: [{ a: 12, b: 34.56 }, { a: '123', b: 'xyz' }],
        keys: ['a', 'b'],
        out: [[12, 34.56], ['123', 'xyz']]
    }
    it(`should return ${JSON.stringify(o[k].out)} when input ${JSON.stringify(o[k].ltdt)}, ${JSON.stringify(o[k].keys)}`, function() {
        k = 1
        let r = ltdtkeys2mat(o[k].ltdt, o[k].keys)
        let rr = o[k].out
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 2
    o[k] = {
        ltdt: [],
        keys: ['a', 'b'],
        out: []
    }
    it(`should return ${JSON.stringify(o[k].out)} when input ${JSON.stringify(o[k].ltdt)}, ${JSON.stringify(o[k].keys)}`, function() {
        k = 2
        let r = ltdtkeys2mat(o[k].ltdt, o[k].keys)
        let rr = o[k].out
        assert.strict.deepStrictEqual(r, rr)
    })

    //ws430c(裁定表〈四〉「keys 為非陣列(字串 'a' 等) → 判 keys 無效(預設 []、狀態模式 invalid keys);原默默改為提取全部鍵」): 原期望提取全部鍵 → 新期望[]與invalid keys
    k = 1
    it(`sould return [] (invalid keys) when input [{ a: 12, b: 34.56 }, { a: '123', b: 'xyz' }], '' (ws430c 〈四〉)`, function() {
        let r = ltdtkeys2mat([{ a: 12, b: 34.56 }, { a: '123', b: 'xyz' }], '')
        assert.strict.deepStrictEqual(r, [])
        assert.strict.deepStrictEqual(ltdtkeys2mat([{ a: 12, b: 34.56 }, { a: '123', b: 'xyz' }], '', { returnWithStateAndMsg: true }), { state: 'error', msg: 'invalid keys: must be an array' })
    })

    k = 1
    it(`sould return ${JSON.stringify(o[k].out)} when input [{ a: 12, b: 34.56 }, { a: '123', b: 'xyz' }], []`, function() {
        let r = ltdtkeys2mat([{ a: 12, b: 34.56 }, { a: '123', b: 'xyz' }], [])
        let rr = [[12, 34.56], ['123', 'xyz']]
        assert.strict.deepStrictEqual(r, rr)
    })

    //ws430c(裁定表〈四〉同上): 原期望提取全部鍵 → 新期望[]與invalid keys
    k = 1
    it(`sould return [] (invalid keys) when input [{ a: 12, b: 34.56 }, { a: '123', b: 'xyz' }], {} (ws430c 〈四〉)`, function() {
        let r = ltdtkeys2mat([{ a: 12, b: 34.56 }, { a: '123', b: 'xyz' }], {})
        assert.strict.deepStrictEqual(r, [])
        assert.strict.deepStrictEqual(ltdtkeys2mat([{ a: 12, b: 34.56 }, { a: '123', b: 'xyz' }], {}, { returnWithStateAndMsg: true }), { state: 'error', msg: 'invalid keys: must be an array' })
    })

    k = 1
    it(`sould return ${JSON.stringify(o[k].out)} when input [{ a: 12, b: 34.56 }, { a: '123', b: 'xyz' }], null`, function() {
        let r = ltdtkeys2mat([{ a: 12, b: 34.56 }, { a: '123', b: 'xyz' }], null)
        let rr = [[12, 34.56], ['123', 'xyz']]
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 1
    it(`sould return ${JSON.stringify(o[k].out)} when input [{ a: 12, b: 34.56 }, { a: '123', b: 'xyz' }], undefined`, function() {
        let r = ltdtkeys2mat([{ a: 12, b: 34.56 }, { a: '123', b: 'xyz' }], undefined)
        let rr = [[12, 34.56], ['123', 'xyz']]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return [] when input ''`, function() {
        let r = ltdtkeys2mat('')
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return [] when input []`, function() {
        let r = ltdtkeys2mat([])
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return [] when input {}`, function() {
        let r = ltdtkeys2mat({})
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return [] when input null`, function() {
        let r = ltdtkeys2mat(null)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return [] when input undefined`, function() {
        let r = ltdtkeys2mat(undefined)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return [] when input NaN`, function() {
        let r = ltdtkeys2mat(NaN)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { state: 'success', msg } when input a valid ltdt with returnWithStateAndMsg`, function() {
        //本函數原就有opt參數(opt.empty), returnWithStateAndMsg併入同一opt而非新增參數
        let r = ltdtkeys2mat([{ a: 1, b: 2 }], null, { returnWithStateAndMsg: true })
        let rr = { state: 'success', msg: [[1, 2]] }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should keep opt.empty working together with returnWithStateAndMsg`, function() {
        let r = ltdtkeys2mat([{ a: 1 }], ['a', 'z'], { empty: 'X', returnWithStateAndMsg: true })
        let rr = { state: 'success', msg: [[1, 'X']] }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { state: 'error', msg: 'invalid ltdt: must be an array' } when input NaN with returnWithStateAndMsg`, function() {
        let r = ltdtkeys2mat(NaN, null, { returnWithStateAndMsg: true })
        let rr = { state: 'error', msg: 'invalid ltdt: must be an array' }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { state: 'error' } when any element is not an effective object with returnWithStateAndMsg`, function() {
        let r = ltdtkeys2mat([{ a: 1 }, NaN], ['a'], { returnWithStateAndMsg: true })
        assert.strict.deepStrictEqual(r.state, 'error')
    })

    it(`should fallback to the plain return value when returnWithStateAndMsg is not a boolean`, function() {
        let r = ltdtkeys2mat([{ a: 1, b: 2 }], null, { returnWithStateAndMsg: 'yes' })
        let rr = [[1, 2]]
        assert.strict.deepStrictEqual(r, rr)
    })

    //第221項第六項(dspec §11第6項, 使用者2026-11-03): 空陣列為合法資料, 不是失敗(原state為error, msg為invalid ltdt)
    describe(`empty array is valid data (ws286d)`, function() {
        let D = { returnWithStateAndMsg: true }

        it(`should return { state: 'success', msg: [] } when input [], ['a'] with returnWithStateAndMsg`, function() {
            let r = ltdtkeys2mat([], ['a'], D)
            let rr = { state: 'success', msg: [] }
            assert.strict.deepStrictEqual(r, rr)
        })

        it(`should return { state: 'success', msg: [] } when input [] with any keys (not given, null, [], string, keys) with returnWithStateAndMsg`, function() {
            for (let keys of [undefined, null, [], 'x', ['a', 'b']]) {
                assert.strict.deepStrictEqual(ltdtkeys2mat([], keys, D), { state: 'success', msg: [] })
            }
        })

        it(`should return { state: 'success', msg: [] } when input [] and opt.empty is given with returnWithStateAndMsg`, function() {
            assert.strict.deepStrictEqual(ltdtkeys2mat([], ['a'], { empty: '-', returnWithStateAndMsg: true }), { state: 'success', msg: [] })
        })

        it(`should return a new array every time`, function() {
            let r1 = ltdtkeys2mat([], ['a'], D)
            let r2 = ltdtkeys2mat([], ['a'], D)
            r1.msg.push(1)
            assert.strict.deepStrictEqual(r2, { state: 'success', msg: [] })
        })

        it(`should return [] in the plain mode when input [] (unchanged)`, function() {
            assert.strict.deepStrictEqual(ltdtkeys2mat([], ['a']), [])
            assert.strict.deepStrictEqual(ltdtkeys2mat([]), [])
            assert.strict.deepStrictEqual(ltdtkeys2mat([], ['a'], {}), [])
            assert.strict.deepStrictEqual(ltdtkeys2mat([], ['a'], { returnWithStateAndMsg: false }), [])
        })

        for (let [lb, v] of NON_ARR) {
            it(`should return { state: 'error', msg: 'invalid ltdt: must be an array' } when input ${lb} with returnWithStateAndMsg (unchanged)`, function() {
                assert.strict.deepStrictEqual(ltdtkeys2mat(v, ['a'], D), { state: 'error', msg: 'invalid ltdt: must be an array' })
            })
            it(`should return [] in the plain mode when input ${lb} (unchanged)`, function() {
                assert.strict.deepStrictEqual(ltdtkeys2mat(v, ['a']), [])
            })
        }

        //ws430c(裁定表〈四〉「列為 {}(含只有一個 {} 之 [{}]) → 視為有效列,各欄給 empty」「列非物件 → 訊息指出列號」): 原期望[{}]、[null]、['']、[[]]皆'invalid ltdt' → 新期望[{}]為[['']]、其餘指出row[0]
        it(`should treat [{}] as a valid row and report row[0] for the non-object rows (ws430c 〈四〉)`, function() {
            assert.strict.deepStrictEqual(ltdtkeys2mat([{}], ['a'], D), { state: 'success', msg: [['']] })
            for (let v of [[null], [''], [[]]]) {
                assert.strict.deepStrictEqual(ltdtkeys2mat(v, ['a'], D), { state: 'error', msg: 'invalid ltdt[0]: must be an object' })
            }
        })

        it(`should keep the result of a non-empty ltdt unchanged`, function() {
            assert.strict.deepStrictEqual(ltdtkeys2mat([{ a: 1 }], ['a'], D), { state: 'success', msg: [[1]] })
            assert.strict.deepStrictEqual(ltdtkeys2mat([{ a: 1 }, NaN], ['a'], D).state, 'error')
            assert.strict.deepStrictEqual(ltdtkeys2mat([{ a: 1 }], ['a']), [[1]])
        })
    })

})
