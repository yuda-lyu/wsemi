import assert from 'assert'
import ltdt2vrtsable from '../src/ltdt2vrtsable.mjs'
import { NON_ARR } from './tools/diffInputKit.mjs'


describe(`ltdt2vrtsable`, function() {
    let k
    let o = {}

    k = 1
    o[k] = {
        ltdt: [
            {
                a: {
                    value: '123',
                    style: {}
                },
                b: {
                    value: 34.56,
                    style: {}
                },
            }, {
                a: {
                    value: '123',
                    style: {}
                },
                b: {
                    value: 'xyz',
                    style: {}
                },
            }
        ],
        mgkeys: ['a'],
        out: [
            {
                'a': {
                    'rowspan': 2,
                    'value': '123',
                    'style': {}
                },
                'b': {
                    'rowspan': 1,
                    'value': 34.56,
                    'style': {}
                }
            },
            {
                'a': {
                    'rowspan': null,
                    'value': '123',
                    'style': {}
                },
                'b': {
                    'rowspan': 1,
                    'value': 'xyz',
                    'style': {}
                }
            }
        ]
    }
    it(`should return ${JSON.stringify(o[k].out)} when input ${JSON.stringify(o[k].ltdt)}, ${JSON.stringify(o[k].mgkeys)}`, function() {
        k = 1
        let r = ltdt2vrtsable(o[k].ltdt, o[k].mgkeys)
        let rr = o[k].out
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 2
    o[k] = {
        ltdt: [
            {
                a: {
                    value: '123',
                    style: {}
                },
                b: {
                    value: 34.56,
                    style: {}
                },
            }, {
                a: {
                    value: '123',
                    style: {}
                },
                b: {
                    value: 'xyz',
                    style: {}
                },
            }
        ],
        mgkeys: [],
        out: [
            {
                'a': {
                    'rowspan': 1,
                    'value': '123',
                    'style': {}
                },
                'b': {
                    'rowspan': 1,
                    'value': 34.56,
                    'style': {}
                }
            },
            {
                'a': {
                    'rowspan': 1,
                    'value': '123',
                    'style': {}
                },
                'b': {
                    'rowspan': 1,
                    'value': 'xyz',
                    'style': {}
                }
            }
        ]
    }
    it(`should return ${JSON.stringify(o[k].out)} when input ${JSON.stringify(o[k].ltdt)}, ${JSON.stringify(o[k].mgkeys)}`, function() {
        k = 2
        let r = ltdt2vrtsable(o[k].ltdt, o[k].mgkeys)
        let rr = o[k].out
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 3
    o[k] = {
        ltdt: [
            {
                a: {
                    value: '123',
                    style: {}
                },
                b: {
                    value: 34.56,
                    style: {}
                },
            }, {
                a: {
                    value: '123',
                    style: {}
                },
                b: {
                    value: 'xyz',
                    style: {}
                },
            }
        ],
        mgkeys: ['mn'],
        out: [
            {
                'a': {
                    'rowspan': 1,
                    'value': '123',
                    'style': {}
                },
                'b': {
                    'rowspan': 1,
                    'value': 34.56,
                    'style': {}
                }
            },
            {
                'a': {
                    'rowspan': 1,
                    'value': '123',
                    'style': {}
                },
                'b': {
                    'rowspan': 1,
                    'value': 'xyz',
                    'style': {}
                }
            }
        ]
    }
    it(`should return ${JSON.stringify(o[k].out)} when input ${JSON.stringify(o[k].ltdt)}, ${JSON.stringify(o[k].mgkeys)}`, function() {
        k = 3
        let r = ltdt2vrtsable(o[k].ltdt, o[k].mgkeys)
        let rr = o[k].out
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 4
    o[k] = {
        ltdt: [],
        mgkeys: [],
        out: []
    }
    it(`should return ${JSON.stringify(o[k].out)} when input ${JSON.stringify(o[k].ltdt)}, ${JSON.stringify(o[k].mgkeys)}`, function() {
        k = 4
        let r = ltdt2vrtsable(o[k].ltdt, o[k].mgkeys)
        let rr = o[k].out
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return [] when input [{"a":{"value":"123","style":{}},"b":{"value":34.56,"style":{}}},{"a":{"value":"123","style":{}},"b":{"value":"xyz","style":{}}}], ''`, function() {
        let r = ltdt2vrtsable([{ 'a': { 'value': '123', 'style': {} }, 'b': { 'value': 34.56, 'style': {} } }, { 'a': { 'value': '123', 'style': {} }, 'b': { 'value': 'xyz', 'style': {} } }], '')
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    //前面已測
    // it(`sould return [] when input [{"a":{"value":"123","style":{}},"b":{"value":34.56,"style":{}}},{"a":{"value":"123","style":{}},"b":{"value":"xyz","style":{}}}], []`, function() {
    //     let r = ltdt2vrtsable([{ 'a': { 'value': '123', 'style': {} }, 'b': { 'value': 34.56, 'style': {} } }, { 'a': { 'value': '123', 'style': {} }, 'b': { 'value': 'xyz', 'style': {} } }], [])
    //     let rr = []
    //     assert.strict.deepStrictEqual(r, rr)
    // })

    it(`sould return [] when input [{"a":{"value":"123","style":{}},"b":{"value":34.56,"style":{}}},{"a":{"value":"123","style":{}},"b":{"value":"xyz","style":{}}}], {}`, function() {
        let r = ltdt2vrtsable([{ 'a': { 'value': '123', 'style': {} }, 'b': { 'value': 34.56, 'style': {} } }, { 'a': { 'value': '123', 'style': {} }, 'b': { 'value': 'xyz', 'style': {} } }], {})
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return [] when input [{"a":{"value":"123","style":{}},"b":{"value":34.56,"style":{}}},{"a":{"value":"123","style":{}},"b":{"value":"xyz","style":{}}}], null`, function() {
        let r = ltdt2vrtsable([{ 'a': { 'value': '123', 'style': {} }, 'b': { 'value': 34.56, 'style': {} } }, { 'a': { 'value': '123', 'style': {} }, 'b': { 'value': 'xyz', 'style': {} } }], null)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    //前面已測, mgkeys為undefined會自動給[]
    // it(`sould return [] when input [{"a":{"value":"123","style":{}},"b":{"value":34.56,"style":{}}},{"a":{"value":"123","style":{}},"b":{"value":"xyz","style":{}}}], undefined`, function() {
    //     let r = ltdt2vrtsable([{ 'a': { 'value': '123', 'style': {} }, 'b': { 'value': 34.56, 'style': {} } }, { 'a': { 'value': '123', 'style': {} }, 'b': { 'value': 'xyz', 'style': {} } }], undefined)
    //     let rr = []
    //     assert.strict.deepStrictEqual(r, rr)
    // })

    it(`sould return [] when input ''`, function() {
        let r = ltdt2vrtsable('')
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return [] when input []`, function() {
        let r = ltdt2vrtsable([])
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return [] when input {}`, function() {
        let r = ltdt2vrtsable({})
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return [] when input null`, function() {
        let r = ltdt2vrtsable(null)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return [] when input undefined`, function() {
        let r = ltdt2vrtsable(undefined)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return [] when input NaN`, function() {
        let r = ltdt2vrtsable(NaN)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { state: 'success', msg } when input a valid ltdt with returnWithStateAndMsg`, function() {
        //opt為第3參數, 因第2參數mergerowkeys為既有參數
        let ltdt = [{ a: 1, b: 2 }]
        let r = ltdt2vrtsable(ltdt, [], { returnWithStateAndMsg: true })
        let rr = { state: 'success', msg: ltdt2vrtsable(ltdt) }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { state: 'error', msg: 'invalid ltdt' } when input NaN with returnWithStateAndMsg`, function() {
        let r = ltdt2vrtsable(NaN, [], { returnWithStateAndMsg: true })
        let rr = { state: 'error', msg: 'invalid ltdt' }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { state: 'error', msg: 'invalid mergerowkeys' } when mergerowkeys is not an array with returnWithStateAndMsg`, function() {
        let r = ltdt2vrtsable([{ a: 1 }], NaN, { returnWithStateAndMsg: true })
        let rr = { state: 'error', msg: 'invalid mergerowkeys' }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { state: 'error' } when any element is not an effective object with returnWithStateAndMsg`, function() {
        let r = ltdt2vrtsable([{ a: 1 }, NaN], [], { returnWithStateAndMsg: true })
        assert.strict.deepStrictEqual(r.state, 'error')
    })

    it(`should fallback to the plain return value when returnWithStateAndMsg is not a boolean`, function() {
        let ltdt = [{ a: 1, b: 2 }]
        let r = ltdt2vrtsable(ltdt, [], { returnWithStateAndMsg: 'yes' })
        let rr = ltdt2vrtsable(ltdt)
        assert.strict.deepStrictEqual(r, rr)
    })

    //第221項第六項(dspec §11第6項, 使用者2026-11-03): 空陣列為合法資料, 不是失敗(原state為error, msg為invalid ltdt)
    describe(`empty array is valid data (ws286d)`, function() {
        let D = { returnWithStateAndMsg: true }

        it(`should return { state: 'success', msg: [] } when input [], [] with returnWithStateAndMsg`, function() {
            let r = ltdt2vrtsable([], [], D)
            let rr = { state: 'success', msg: [] }
            assert.strict.deepStrictEqual(r, rr)
        })

        it(`should return { state: 'success', msg: [] } when input [] with a valid mergerowkeys (not given, [], ['a']) with returnWithStateAndMsg`, function() {
            assert.strict.deepStrictEqual(ltdt2vrtsable([], undefined, D), { state: 'success', msg: [] })
            assert.strict.deepStrictEqual(ltdt2vrtsable([], [], D), { state: 'success', msg: [] })
            assert.strict.deepStrictEqual(ltdt2vrtsable([], ['a'], D), { state: 'success', msg: [] })
        })

        //型別檢測與資料有無無關: ltdt為空陣列, mergerowkeys型別無效仍為失敗
        it(`should return { state: 'error', msg: 'invalid mergerowkeys' } when input [], 'x' with returnWithStateAndMsg (type check is independent of emptiness)`, function() {
            for (let v of ['x', 123, null, {}, true, NaN]) {
                assert.strict.deepStrictEqual(ltdt2vrtsable([], v, D), { state: 'error', msg: 'invalid mergerowkeys' })
            }
        })

        it(`should return a new array every time`, function() {
            let r1 = ltdt2vrtsable([], [], D)
            let r2 = ltdt2vrtsable([], [], D)
            r1.msg.push(1)
            assert.strict.deepStrictEqual(r2, { state: 'success', msg: [] })
        })

        it(`should return [] in the plain mode when input [] (unchanged)`, function() {
            assert.strict.deepStrictEqual(ltdt2vrtsable([], []), [])
            assert.strict.deepStrictEqual(ltdt2vrtsable([]), [])
            assert.strict.deepStrictEqual(ltdt2vrtsable([], [], {}), [])
            assert.strict.deepStrictEqual(ltdt2vrtsable([], 'x'), [])
        })

        for (let [lb, v] of NON_ARR) {
            it(`should return { state: 'error', msg: 'invalid ltdt' } when input ${lb} with returnWithStateAndMsg (unchanged)`, function() {
                assert.strict.deepStrictEqual(ltdt2vrtsable(v, [], D), { state: 'error', msg: 'invalid ltdt' })
            })
            it(`should return [] in the plain mode when input ${lb} (unchanged)`, function() {
                assert.strict.deepStrictEqual(ltdt2vrtsable(v, []), [])
            })
        }

        it(`should keep non-empty arrays that are not effective as error with returnWithStateAndMsg (unchanged)`, function() {
            for (let v of [[{}], [null], [''], [[]]]) {
                assert.strict.deepStrictEqual(ltdt2vrtsable(v, [], D), { state: 'error', msg: 'invalid ltdt' })
            }
        })

        it(`should keep the result of a non-empty ltdt unchanged`, function() {
            let ltdt = [{ a: { value: 1, style: {} } }]
            assert.strict.deepStrictEqual(ltdt2vrtsable(ltdt, [], D), { state: 'success', msg: [{ a: { value: 1, style: {}, rowspan: 1 } }] })
            assert.strict.deepStrictEqual(ltdt2vrtsable([{ a: 1 }, NaN], [], D).state, 'error')
        })
    })

})
