import assert from 'assert'
import arrSep from '../src/arrSep.mjs'
import { NON_ARR, LEAK, throwsMsg, throwsMsgNoLeak } from './tools/diffInputKit.mjs'


const MSG_ARR = 'invalid arr: must be an array'
const MSG_OPT = 'invalid opt: must be a positive integer or an object with numCount or numGroup'
const MSG_OPT_OBJ = 'invalid opt.numCount or opt.numGroup'


describe(`arrSep`, function() {
    let k
    let o = {}

    let arr = ['a', 123, 'xyz', 5.678, null, 'd', [], { x: 'x1', y: 'y1' }]

    k = 0
    o[k] = [
        ['a', 123],
        ['xyz', 5.678],
        [null, 'd'],
        [[], { x: 'x1', y: 'y1' }]
    ]
    it(`should return ${JSON.stringify(o[k].out)} when input ${JSON.stringify(arr)}, 2`, function() {
        k = 0
        let r = arrSep(arr, 2)
        assert.strict.deepStrictEqual(r, o[k])
    })

    k = 1
    o[k] = [
        ['a', 123, 'xyz'],
        [5.678, null, 'd'],
        [[], { x: 'x1', y: 'y1' }]
    ]
    it(`should return ${JSON.stringify(o[k].out)} when input ${JSON.stringify(arr)}, 3`, function() {
        k = 1
        let r = arrSep(arr, 3)
        assert.strict.deepStrictEqual(r, o[k])
    })

    k = 2
    o[k] = [
        ['a', 123],
        ['xyz', 5.678],
        [null, 'd'],
        [[], { x: 'x1', y: 'y1' }]
    ]
    it(`should return ${JSON.stringify(o[k].out)} when input ${JSON.stringify(arr)}, { numCount: 2 }`, function() {
        k = 2
        let r = arrSep(arr, { numCount: 2 })
        assert.strict.deepStrictEqual(r, o[k])
    })

    k = 3
    o[k] = [
        ['a', 'd'],
        [123, []],
        ['xyz', { x: 'x1', y: 'y1' }],
        [5.678],
        [null]
    ]
    it(`should return ${JSON.stringify(o[k].out)} when input ${JSON.stringify(arr)}, { numGroup: 5 }`, function() {
        k = 3
        let r = arrSep(arr, { numGroup: 5 })
        assert.strict.deepStrictEqual(r, o[k])
    })

    //ws286e(第221項§11第6項, 使用者2026-11-03逐列確認): arr與切分數量(opt)皆為必須參數, 無效throw(訊息不帶值); 空陣列為合法資料(切分數量有效時回傳[])
    //  對應規格: dspec〈輸入參數之檢測機制〉§11第6項「型別檢測與資料有無無關; 空陣列本身不報錯」、K2(必須參數)、V19(訊息格式)、V20(不回顯輸入值)
    //  原回[]之整數寫法無效值(''、[]、null、undefined、0等)與缺切分數量改為throw; 設定物件無效維持throw, {}(原回[])併入此類
    it(`should throw invalid opt when input ${JSON.stringify(arr)}, ''`, function() {
        throwsMsg(() => arrSep(arr, ''), MSG_OPT)
    })

    it(`should throw invalid opt when input ${JSON.stringify(arr)}, []`, function() {
        throwsMsg(() => arrSep(arr, []), MSG_OPT)
    })

    it(`should throw invalid opt.numCount or opt.numGroup when input ${JSON.stringify(arr)}, {}`, function() {
        throwsMsg(() => arrSep(arr, {}), MSG_OPT_OBJ)
    })

    it(`should throw invalid opt when input ${JSON.stringify(arr)}, null`, function() {
        throwsMsg(() => arrSep(arr, null), MSG_OPT)
    })

    it(`should throw invalid opt when input ${JSON.stringify(arr)}, undefined`, function() {
        throwsMsg(() => arrSep(arr, undefined), MSG_OPT)
    })

    it(`should throw invalid arr when input ''`, function() {
        throwsMsg(() => arrSep(''), MSG_ARR)
    })

    it(`should throw invalid opt when input [] (opt not given, even though arr is empty)`, function() {
        throwsMsg(() => arrSep([]), MSG_OPT)
    })

    it(`should throw invalid arr when input {}`, function() {
        throwsMsg(() => arrSep({}), MSG_ARR)
    })

    it(`should throw invalid arr when input null`, function() {
        throwsMsg(() => arrSep(null), MSG_ARR)
    })

    it(`should throw invalid arr when input undefined`, function() {
        throwsMsg(() => arrSep(undefined), MSG_ARR)
    })

    it(`should throw invalid arr when input NaN`, function() {
        throwsMsg(() => arrSep(NaN), MSG_ARR)
    })

    describe(`required parameters arr and opt (ws286e)`, function() {

        let a3 = [1, 2, 3]

        // 表列: ('x',2)、([1,2,3])、([1,2,3],0)、([1,2,3],{})、([]) → throw; ([],2) → [] 不變; ({numGroup:0})型之無效設定已throw維持
        it(`should throw when input 'x', 2`, function() {
            throwsMsg(() => arrSep('x', 2), MSG_ARR)
        })

        it(`should throw when input [1, 2, 3] (opt not given)`, function() {
            throwsMsg(() => arrSep([1, 2, 3]), MSG_OPT)
        })

        it(`should throw when input [1, 2, 3], 0`, function() {
            throwsMsg(() => arrSep([1, 2, 3], 0), MSG_OPT)
        })

        it(`should throw when input [1, 2, 3], {}`, function() {
            throwsMsg(() => arrSep([1, 2, 3], {}), MSG_OPT_OBJ)
        })

        it(`should throw when input [] (opt not given)`, function() {
            throwsMsg(() => arrSep([]), MSG_OPT)
        })

        it(`should still throw when input [1, 2, 3], { numGroup: 0 } (unchanged)`, function() {
            throwsMsg(() => arrSep([1, 2, 3], { numGroup: 0 }), MSG_OPT_OBJ)
        })

        it(`should return [] (no throw) when input [], 2`, function() {
            assert.strict.deepStrictEqual(arrSep([], 2), [])
        })

        // 空陣列為合法資料, 切分數量有效則回傳[](三種寫法), 每次回傳新陣列
        it(`should return [] for an empty array in all valid forms and return a new array each call`, function() {
            let a = []
            for (let o of [2, '2', { numCount: 2 }, { numGroup: 2 }, { numCount: '3', numGroup: 0 }]) {
                let r1 = arrSep(a, o)
                let r2 = arrSep(a, o)
                assert.strict.deepStrictEqual(r1, [])
                assert.notStrictEqual(r1, r2)
            }
        })

        // 型別檢測與arr有無資料無關: arr為空陣列時, 無效切分數量一樣throw
        it(`should throw for an empty arr when opt is invalid (type check is independent of data)`, function() {
            throwsMsg(() => arrSep([], 0), MSG_OPT)
            throwsMsg(() => arrSep([], null), MSG_OPT)
            throwsMsg(() => arrSep([], ''), MSG_OPT)
            throwsMsg(() => arrSep([], {}), MSG_OPT_OBJ)
            throwsMsg(() => arrSep([], { numGroup: 0 }), MSG_OPT_OBJ)
            throwsMsg(() => arrSep([], { numCount: 'x', numGroup: -1 }), MSG_OPT_OBJ)
        })

        // 未列之合法呼叫不得改變: 僅含單一廣義無效元素(isearr為false)之陣列維持原行為回傳[](本次不動, 見報告需裁示)
        it(`should keep returning [] for an array of a single iser element (unchanged, not in the confirmed table)`, function() {
            for (let v of [null, undefined, '', {}, [], NaN]) {
                assert.strict.deepStrictEqual(arrSep([v], 2), [])
            }
            assert.strict.deepStrictEqual(arrSep([null, null], 2), [[null, null]])
        })

        // arr非陣列(NON_ARR 21種 + 數字字串), 搭配有效切分數量
        for (let [lb, v] of [...NON_ARR, ['5', 5], [`'5'`, '5']]) {
            it(`should throw invalid arr when arr is ${lb} and opt is 2`, function() {
                throwsMsg(() => arrSep(v, 2), MSG_ARR)
            })
        }

        // 檢測順序: arr先於opt, 兩者皆無效時回報arr
        it(`should report arr first when both arr and opt are invalid`, function() {
            throwsMsg(() => arrSep('x', 0), MSG_ARR)
            throwsMsg(() => arrSep(null, {}), MSG_ARR)
            throwsMsg(() => arrSep(), MSG_ARR)
        })

        // 訊息不回顯輸入值(V20)
        it(`should not echo the input value in the messages`, function() {
            throwsMsgNoLeak(() => arrSep(LEAK, 2), MSG_ARR)
            throwsMsgNoLeak(() => arrSep({ LEAK }, 2), MSG_ARR)
            throwsMsgNoLeak(() => arrSep(a3, LEAK), MSG_OPT)
            throwsMsgNoLeak(() => arrSep(a3, [LEAK]), MSG_OPT)
            throwsMsgNoLeak(() => arrSep(a3, { numCount: LEAK }), MSG_OPT_OBJ)
            throwsMsgNoLeak(() => arrSep(a3, { LEAK }), MSG_OPT_OBJ)
        })

        // 整數寫法(正整數)舊式呼叫維持可用(第223項另案, 不得移除)
        it(`should keep the legacy integer form working (not removed; item 223 is a separate task)`, function() {
            assert.strict.deepStrictEqual(arrSep(a3, 2), [[1, 2], [3]])
            assert.strict.deepStrictEqual(arrSep(a3, '2'), [[1, 2], [3]])
            assert.strict.deepStrictEqual(arrSep(a3, { numCount: 2 }), [[1, 2], [3]])
            assert.strict.deepStrictEqual(arrSep(a3, { numGroup: 2 }), [[1, 3], [2]])
        })

        it(`should not mutate the input array`, function() {
            let a = [1, 2, 3, 4, 5]
            arrSep(a, 2)
            assert.strict.deepStrictEqual(a, [1, 2, 3, 4, 5])
        })

    })

    //第221項已知缺陷先修(ws270): 整數寫法與opt.numCount、opt.numGroup皆改iseint(x, { use: 'count', min: 1 }), 通過後以Number()取值再用於迴圈(修前數字字串與迴圈之+=字串相加而切錯)
    //  Infinity等使迴圈不終止之輸入(含'Infinity'字串)於intInputHang.test.mjs(子行程加逾時)驗, 不在此行程內跑(修前原碼會使行程卡死); 整數寫法本輪不移除(排程第223項日後處理)
    let a8 = [1, 2, 3, 4, 5, 6, 7, 8]
    let by2 = [[1, 2], [3, 4], [5, 6], [7, 8]]
    let g3 = [[1, 4, 7], [2, 5, 8], [3, 6]]

    describe(`valid numeric strings (converted by Number() before the loops)`, function() {

        it(`should return ${JSON.stringify(by2)} when input a8, '2'`, function() {
            assert.strict.deepStrictEqual(arrSep(a8, '2'), by2) // 修前為[[1,2],[]]
        })

        it(`should return ${JSON.stringify(by2)} when input a8, ' 2 '`, function() {
            assert.strict.deepStrictEqual(arrSep(a8, ' 2 '), by2)
        })

        it(`should return ${JSON.stringify(by2)} when input a8, '2.0'`, function() {
            assert.strict.deepStrictEqual(arrSep(a8, '2.0'), by2)
        })

        it(`should return ${JSON.stringify(by2)} when input a8, { numCount: '2' }`, function() {
            assert.strict.deepStrictEqual(arrSep(a8, { numCount: '2' }), by2)
        })

        it(`should return ${JSON.stringify(g3)} when input a8, { numGroup: '3' }`, function() {
            assert.strict.deepStrictEqual(arrSep(a8, { numGroup: '3' }), g3) // 修前numGroup為字串時迴圈與比較失真
        })

        it(`should return the same as the number form for numGroup 3 (number)`, function() {
            assert.strict.deepStrictEqual(arrSep(a8, { numGroup: 3 }), g3)
        })

        it(`should use numGroup when numCount is invalid and numGroup is valid`, function() {
            assert.strict.deepStrictEqual(arrSep(a8, { numCount: 0, numGroup: '3' }), g3)
            assert.strict.deepStrictEqual(arrSep(a8, { numCount: 1.5, numGroup: 3 }), g3)
        })

        it(`should prefer numCount when both are valid`, function() {
            assert.strict.deepStrictEqual(arrSep(a8, { numCount: '2', numGroup: 3 }), by2)
        })

        it(`should return [[...]] (one group) when num is larger than the array length`, function() {
            assert.strict.deepStrictEqual(arrSep(a8, 100), [a8])
            assert.strict.deepStrictEqual(arrSep(a8, '100'), [a8])
        })

        it(`should return [] for an empty array`, function() {
            assert.strict.deepStrictEqual(arrSep([], 2), [])
        })

        it(`should accept the lower bound 1 in all three forms`, function() {
            let by1 = [[1], [2], [3], [4], [5], [6], [7], [8]]
            assert.strict.deepStrictEqual(arrSep(a8, 1), by1)
            assert.strict.deepStrictEqual(arrSep(a8, '1'), by1)
            assert.strict.deepStrictEqual(arrSep(a8, { numCount: 1 }), by1)
            assert.strict.deepStrictEqual(arrSep(a8, { numGroup: 1 }), [a8])
            assert.strict.deepStrictEqual(arrSep(a8, { numGroup: '1' }), [a8])
        })

    })

    describe(`generic invalid values (spec V24 matrix) for the integer form and for each object key`, function() {

        // 修前即不終止者(Infinity、超過個數上限)於intInputHang.test.mjs(子行程)驗, 此處為不致使修前原碼卡死之輸入
        let INVALIDS = [
            ['undefined', undefined],
            ['null', null],
            ['true', true],
            ['false', false],
            [`'true'`, 'true'],
            ['NaN', NaN],
            [`''`, ''],
            [`'   '`, '   '],
            [`'abc'`, 'abc'],
            ['[]', []],
            ['[2]', [2]],
            ['{}', {}],
            ['5n', 5n],
            ['Symbol()', Symbol('x')],
            ['function', () => 2],
        ]
        for (let [label, v] of INVALIDS) {
            // ws286e: 整數寫法之無效值由回傳[]改為throw; 一般物件({})為設定物件, 其numCount與numGroup皆無效, 訊息同設定物件之無效
            it(`should throw when input a8, ${label}`, function() {
                throwsMsg(() => arrSep(a8, v), label === '{}' ? MSG_OPT_OBJ : MSG_OPT)
            })
            it(`should throw when input a8, { numCount: ${label} }`, function() {
                assert.throws(() => arrSep(a8, { numCount: v }), { message: 'invalid opt.numCount or opt.numGroup' })
            })
            it(`should throw when input a8, { numGroup: ${label} }`, function() {
                assert.throws(() => arrSep(a8, { numGroup: v }), { message: 'invalid opt.numCount or opt.numGroup' })
            })
        }

    })

    describe(`invalid num (not iseint count min 1) in the integer form should throw invalid opt (ws286e; originally returned [])`, function() {

        for (let [label, v] of [
            ['0', 0],
            [`'0'`, '0'],
            ['-1', -1],
            [`'-2'`, '-2'],
            ['1.5', 1.5],
            [`'1.5'`, '1.5'],
            [`'0x2'`, '0x2'],
            ['new Number(2)', new Number(2)], // eslint-disable-line no-new-wrappers
            ['2n', 2n],
            ['true', true],
            ['NaN', NaN],
            [`'abc'`, 'abc'],
        ]) {
            it(`should throw when input a8, ${label}`, function() {
                throwsMsg(() => arrSep(a8, v), MSG_OPT)
            })
        }

    })

    describe(`invalid numCount and numGroup in the object form should throw invalid opt.numCount or opt.numGroup`, function() {

        for (let [label, o] of [
            ['{ numCount: 0 }', { numCount: 0 }],
            ['{ numCount: -1 }', { numCount: -1 }],
            ['{ numGroup: 0 }', { numGroup: 0 }],
            ['{ numGroup: 1.5 }', { numGroup: 1.5 }],
            [`{ numCount: '0x2' }`, { numCount: '0x2' }],
            [`{ numGroup: '0x2' }`, { numGroup: '0x2' }],
            ['{ numCount: 1.5 }', { numCount: 1.5 }],
            ['{ numGroup: -1 }', { numGroup: -1 }],
            [`{ numCount: 'abc', numGroup: 'abc' }`, { numCount: 'abc', numGroup: 'abc' }],
            ['{ numCount: new Number(2) }', { numCount: new Number(2) }], // eslint-disable-line no-new-wrappers
            ['{ numGroup: new Number(2) }', { numGroup: new Number(2) }], // eslint-disable-line no-new-wrappers
            ['{ x: 1 }', { x: 1 }],
        ]) {
            it(`should throw when input a8, ${label}`, function() {
                assert.throws(() => arrSep(a8, o), { message: 'invalid opt.numCount or opt.numGroup' })
            })
        }

    })

})
