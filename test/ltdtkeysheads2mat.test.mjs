import assert from 'assert'
import ltdtkeysheads2mat from '../src/ltdtkeysheads2mat.mjs'
import { NON_ARR } from './tools/diffInputKit.mjs'


describe(`ltdtkeysheads2mat`, function() {
    let k
    let o = {}

    k = 1
    o[k] = {
        ltdt: [{ a: 12, b: 34.56 }, { a: '123', b: 'xyz' }],
        keys: ['a', 'b'],
        kphead: { a: 'c1', b: 'c2' },
        out: [['c1', 'c2'], [12, 34.56], ['123', 'xyz']]
    }
    it(`should return ${JSON.stringify(o[k].out)} when input ${JSON.stringify(o[k].ltdt)}, ${JSON.stringify(o[k].keys)}, ${JSON.stringify(o[k].kphead)}`, function() {
        k = 1
        let r = ltdtkeysheads2mat(o[k].ltdt, o[k].keys, o[k].kphead)
        let rr = o[k].out
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 2
    o[k] = {
        ltdt: [{ a: 12, b: 34.56 }, { a: '123', b: 'xyz' }],
        keys: ['a', 'b'],
        kphead: {},
        out: [['a', 'b'], [12, 34.56], ['123', 'xyz']]
    }
    it(`should return ${JSON.stringify(o[k].out)} when input ${JSON.stringify(o[k].ltdt)}, ${JSON.stringify(o[k].keys)}, ${JSON.stringify(o[k].kphead)}`, function() {
        k = 2
        let r = ltdtkeysheads2mat(o[k].ltdt, o[k].keys, o[k].kphead)
        let rr = o[k].out
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 3
    o[k] = {
        ltdt: [{ a: 12, b: 34.56 }, { a: '123', b: 'xyz' }],
        keys: [],
        kphead: { a: 'c1', b: 'c2' },
        out: [['c1', 'c2'], [12, 34.56], ['123', 'xyz']]
    }
    it(`should return ${JSON.stringify(o[k].out)} when input ${JSON.stringify(o[k].ltdt)}, ${JSON.stringify(o[k].keys)}, ${JSON.stringify(o[k].kphead)}`, function() {
        k = 3
        let r = ltdtkeysheads2mat(o[k].ltdt, o[k].keys, o[k].kphead)
        let rr = o[k].out
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 4
    o[k] = {
        ltdt: [{ a: 12, b: 34.56 }, { a: '123', b: 'xyz' }],
        keys: [],
        kphead: {},
        out: [['a', 'b'], [12, 34.56], ['123', 'xyz']]
    }
    it(`should return ${JSON.stringify(o[k].out)} when input ${JSON.stringify(o[k].ltdt)}, ${JSON.stringify(o[k].keys)}, ${JSON.stringify(o[k].kphead)}`, function() {
        k = 4
        let r = ltdtkeysheads2mat(o[k].ltdt, o[k].keys, o[k].kphead)
        let rr = o[k].out
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 2
    it(`should return ${JSON.stringify(o[k].out)} when input [{ a: 12, b: 34.56 }, { a: '123', b: 'xyz' }], ['a', 'b'], ''`, function() {
        let r = ltdtkeysheads2mat([{ a: 12, b: 34.56 }, { a: '123', b: 'xyz' }], ['a', 'b'], '')
        let rr = [['a', 'b'], [12, 34.56], ['123', 'xyz']]
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 2
    it(`should return ${JSON.stringify(o[k].out)} when input [{ a: 12, b: 34.56 }, { a: '123', b: 'xyz' }], ['a', 'b'], []`, function() {
        let r = ltdtkeysheads2mat([{ a: 12, b: 34.56 }, { a: '123', b: 'xyz' }], ['a', 'b'], [])
        let rr = [['a', 'b'], [12, 34.56], ['123', 'xyz']]
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 2
    it(`should return ${JSON.stringify(o[k].out)} when input [{ a: 12, b: 34.56 }, { a: '123', b: 'xyz' }], ['a', 'b'], {}`, function() {
        let r = ltdtkeysheads2mat([{ a: 12, b: 34.56 }, { a: '123', b: 'xyz' }], ['a', 'b'], {})
        let rr = [['a', 'b'], [12, 34.56], ['123', 'xyz']]
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 2
    it(`should return ${JSON.stringify(o[k].out)} when input [{ a: 12, b: 34.56 }, { a: '123', b: 'xyz' }], ['a', 'b'], null`, function() {
        let r = ltdtkeysheads2mat([{ a: 12, b: 34.56 }, { a: '123', b: 'xyz' }], ['a', 'b'], null)
        let rr = [['a', 'b'], [12, 34.56], ['123', 'xyz']]
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 2
    it(`should return ${JSON.stringify(o[k].out)} when input [{ a: 12, b: 34.56 }, { a: '123', b: 'xyz' }], ['a', 'b'], undefined`, function() {
        let r = ltdtkeysheads2mat([{ a: 12, b: 34.56 }, { a: '123', b: 'xyz' }], ['a', 'b'], undefined)
        let rr = [['a', 'b'], [12, 34.56], ['123', 'xyz']]
        assert.strict.deepStrictEqual(r, rr)
    })

    //ws430c(裁定表〈五〉「keys 非陣列或全部無效 → 同 ltdtkeys2mat(keys 無效判 invalid keys)」): 原期望由ltdt提取全部鍵 → 新期望[]與invalid keys
    k = 2
    it(`should return [] (invalid keys) when input [{ a: 12, b: 34.56 }, { a: '123', b: 'xyz' }], '' (ws430c 〈五〉)`, function() {
        let r = ltdtkeysheads2mat([{ a: 12, b: 34.56 }, { a: '123', b: 'xyz' }], '')
        assert.strict.deepStrictEqual(r, [])
        assert.strict.deepStrictEqual(ltdtkeysheads2mat([{ a: 12, b: 34.56 }, { a: '123', b: 'xyz' }], '', {}, { returnWithStateAndMsg: true }), { state: 'error', msg: 'invalid keys: must be an array' })
    })

    k = 2
    it(`should return ${JSON.stringify(o[k].out)} when input [{ a: 12, b: 34.56 }, { a: '123', b: 'xyz' }], []`, function() {
        let r = ltdtkeysheads2mat([{ a: 12, b: 34.56 }, { a: '123', b: 'xyz' }], [])
        let rr = [['a', 'b'], [12, 34.56], ['123', 'xyz']]
        assert.strict.deepStrictEqual(r, rr)
    })

    //ws430c(裁定表〈五〉同上): 原期望由ltdt提取全部鍵 → 新期望[]與invalid keys
    k = 2
    it(`should return [] (invalid keys) when input [{ a: 12, b: 34.56 }, { a: '123', b: 'xyz' }], {} (ws430c 〈五〉)`, function() {
        let r = ltdtkeysheads2mat([{ a: 12, b: 34.56 }, { a: '123', b: 'xyz' }], {})
        assert.strict.deepStrictEqual(r, [])
        assert.strict.deepStrictEqual(ltdtkeysheads2mat([{ a: 12, b: 34.56 }, { a: '123', b: 'xyz' }], {}, {}, { returnWithStateAndMsg: true }), { state: 'error', msg: 'invalid keys: must be an array' })
    })

    k = 2
    it(`should return ${JSON.stringify(o[k].out)} when input [{ a: 12, b: 34.56 }, { a: '123', b: 'xyz' }], null`, function() {
        let r = ltdtkeysheads2mat([{ a: 12, b: 34.56 }, { a: '123', b: 'xyz' }], null)
        let rr = [['a', 'b'], [12, 34.56], ['123', 'xyz']]
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 2
    it(`should return ${JSON.stringify(o[k].out)} when input [{ a: 12, b: 34.56 }, { a: '123', b: 'xyz' }], undefined`, function() {
        let r = ltdtkeysheads2mat([{ a: 12, b: 34.56 }, { a: '123', b: 'xyz' }], undefined)
        let rr = [['a', 'b'], [12, 34.56], ['123', 'xyz']]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return [] when input ''`, function() {
        let r = ltdtkeysheads2mat('')
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return [] when input []`, function() {
        let r = ltdtkeysheads2mat([])
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return [] when input {}`, function() {
        let r = ltdtkeysheads2mat({})
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return [] when input null`, function() {
        let r = ltdtkeysheads2mat(null)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return [] when input undefined`, function() {
        let r = ltdtkeysheads2mat(undefined)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return [] when input NaN`, function() {
        let r = ltdtkeysheads2mat(NaN)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { state: 'success', msg } when input a valid ltdt with returnWithStateAndMsg`, function() {
        //opt為第4參數, 因第2、3參數keys與kphead為既有參數
        let r = ltdtkeysheads2mat([{ a: 1, b: 2 }], [], {}, { returnWithStateAndMsg: true })
        let rr = { state: 'success', msg: [['a', 'b'], [1, 2]] }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { state: 'error', msg: 'invalid ltdt: must be an array' } when input NaN with returnWithStateAndMsg`, function() {
        let r = ltdtkeysheads2mat(NaN, [], {}, { returnWithStateAndMsg: true })
        let rr = { state: 'error', msg: 'invalid ltdt: must be an array' }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { state: 'error' } when any element is not an effective object with returnWithStateAndMsg`, function() {
        let r = ltdtkeysheads2mat([{ a: 1 }, NaN], [], {}, { returnWithStateAndMsg: true })
        assert.strict.deepStrictEqual(r.state, 'error')
    })

    it(`should fallback to the plain return value when returnWithStateAndMsg is not a boolean`, function() {
        let r = ltdtkeysheads2mat([{ a: 1, b: 2 }], [], {}, { returnWithStateAndMsg: 'yes' })
        let rr = [['a', 'b'], [1, 2]]
        assert.strict.deepStrictEqual(r, rr)
    })

    //第221項第六項(dspec §11第6項, 使用者2026-11-03): 空陣列為合法資料, 不是失敗(原state為error, msg為invalid ltdt); 不含表頭列, 與預設模式一致
    describe(`empty array is valid data (ws286d)`, function() {
        let D = { returnWithStateAndMsg: true }

        it(`should return { state: 'success', msg: [] } (no head row) when input [], ['a'], { a: 'A' } with returnWithStateAndMsg`, function() {
            let r = ltdtkeysheads2mat([], ['a'], { a: 'A' }, D)
            let rr = { state: 'success', msg: [] }
            assert.strict.deepStrictEqual(r, rr)
        })

        it(`should return { state: 'success', msg: [] } when input [] with any keys and kphead with returnWithStateAndMsg`, function() {
            assert.strict.deepStrictEqual(ltdtkeysheads2mat([], undefined, undefined, D), { state: 'success', msg: [] })
            assert.strict.deepStrictEqual(ltdtkeysheads2mat([], [], {}, D), { state: 'success', msg: [] })
            assert.strict.deepStrictEqual(ltdtkeysheads2mat([], null, null, D), { state: 'success', msg: [] })
            assert.strict.deepStrictEqual(ltdtkeysheads2mat([], ['a', 'b'], { a: 'A' }, D), { state: 'success', msg: [] })
        })

        it(`should return a new array every time`, function() {
            let r1 = ltdtkeysheads2mat([], ['a'], { a: 'A' }, D)
            let r2 = ltdtkeysheads2mat([], ['a'], { a: 'A' }, D)
            r1.msg.push(1)
            assert.strict.deepStrictEqual(r2, { state: 'success', msg: [] })
        })

        it(`should return [] in the plain mode when input [] (unchanged, same as the state mode msg)`, function() {
            assert.strict.deepStrictEqual(ltdtkeysheads2mat([], ['a'], { a: 'A' }), [])
            assert.strict.deepStrictEqual(ltdtkeysheads2mat([]), [])
            assert.strict.deepStrictEqual(ltdtkeysheads2mat([], ['a'], { a: 'A' }, {}), [])
            assert.strict.deepStrictEqual(ltdtkeysheads2mat([], ['a'], { a: 'A' }, D).msg, ltdtkeysheads2mat([], ['a'], { a: 'A' }))
        })

        for (let [lb, v] of NON_ARR) {
            it(`should return { state: 'error', msg: 'invalid ltdt: must be an array' } when input ${lb} with returnWithStateAndMsg (unchanged)`, function() {
                assert.strict.deepStrictEqual(ltdtkeysheads2mat(v, ['a'], { a: 'A' }, D), { state: 'error', msg: 'invalid ltdt: must be an array' })
            })
            it(`should return [] in the plain mode when input ${lb} (unchanged)`, function() {
                assert.strict.deepStrictEqual(ltdtkeysheads2mat(v, ['a'], { a: 'A' }), [])
            })
        }

        //ws430c(裁定表〈五〉「列 {}、列非物件 → 同 ltdtkeys2mat({} 有效;非物件列之訊息指出列號)」): 原期望[{}]、[null]、['']、[[]]皆'invalid ltdt' → 新期望[{}]為[['A'], ['']]、其餘指出row[0]
        it(`should treat [{}] as a valid row and report row[0] for the non-object rows (ws430c 〈五〉)`, function() {
            assert.strict.deepStrictEqual(ltdtkeysheads2mat([{}], ['a'], { a: 'A' }, D), { state: 'success', msg: [['A'], ['']] })
            for (let v of [[null], [''], [[]]]) {
                assert.strict.deepStrictEqual(ltdtkeysheads2mat(v, ['a'], { a: 'A' }, D), { state: 'error', msg: 'invalid ltdt[0]: must be an object' })
            }
        })

        it(`should keep the result of a non-empty ltdt unchanged (with the head row)`, function() {
            assert.strict.deepStrictEqual(ltdtkeysheads2mat([{ a: 1 }], ['a'], { a: 'A' }, D), { state: 'success', msg: [['A'], [1]] })
            assert.strict.deepStrictEqual(ltdtkeysheads2mat([{ a: 1 }], ['a'], { a: 'A' }), [['A'], [1]])
        })
    })

})
