import assert from 'assert'
import arrSep from '../src/arrSep.mjs'
import { NON_ARR, LEAK, throwsMsg, throwsMsgNoLeak } from './tools/diffInputKit.mjs'


//ws492h(第492項第7批): W-16乙(arr為第1參數, 非陣列回[], 不拋錯, 不檢查opt)、W-19(單一空元素視為一個元素)、W-07(numCount、numGroup改iseint use:'count' min:1並維持二擇一必給V10, 舊式整數opt依原則14移除, 第223項併結)
//  對應規格: dspec〈輸入參數之檢測機制〉§11「C7結構運算之第1參數(使用者2026-11-16 W-16:乙)」、V10(跨鍵依賴)、V19(訊息格式)、V20(不回顯輸入值)、處理原則14(自有套件不做舊版相容)
const MSG_OPT = 'invalid opt: must be an object with numCount or numGroup'
const MSG_OPT_OBJ = 'invalid opt: must be an object with numCount or numGroup' //ws492j V19: opt為物件而兩鍵皆無效時與非物件opt統一為同一則訊息(原'invalid opt.numCount or opt.numGroup')


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
    it(`should return ${JSON.stringify(o[k])} when input ${JSON.stringify(arr)}, { numCount: 2 }`, function() {
        k = 0
        let r = arrSep(arr, { numCount: 2 })
        assert.strict.deepStrictEqual(r, o[k])
    })

    k = 1
    o[k] = [
        ['a', 123, 'xyz'],
        [5.678, null, 'd'],
        [[], { x: 'x1', y: 'y1' }]
    ]
    it(`should return ${JSON.stringify(o[k])} when input ${JSON.stringify(arr)}, { numCount: 3 }`, function() {
        k = 1
        let r = arrSep(arr, { numCount: 3 })
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
    it(`should return ${JSON.stringify(o[k])} when input ${JSON.stringify(arr)}, { numGroup: 5 }`, function() {
        k = 3
        let r = arrSep(arr, { numGroup: 5 })
        assert.strict.deepStrictEqual(r, o[k])
    })

    //W-07: 舊式整數寫法arrSep(arr, 3)已移除(原則14: 自有套件不做舊版相容; 下游0站點), 整數opt一律throw, 訊息指出須為設定物件
    describe(`the legacy integer form is removed (W-07, principle 14): opt must be an object`, function() {

        for (let [label, v] of [
            ['2', 2],
            ['3', 3],
            ['1', 1],
            [`'2'`, '2'],
            [`' 2 '`, ' 2 '],
            ['100', 100],
            ['0', 0],
            ['-1', -1],
            ['1.5', 1.5],
            ['Infinity', Infinity],
            ['NaN', NaN],
            ['2n', 2n],
            ['new Number(2)', new Number(2)], // eslint-disable-line no-new-wrappers
            [`''`, ''],
            [`'abc'`, 'abc'],
            ['true', true],
            ['false', false],
            ['null', null],
            ['undefined', undefined],
            ['[]', []],
            ['[2]', [2]],
            ['Symbol()', Symbol('x')],
            ['function', () => 2],
        ]) {
            it(`should throw invalid opt (not an object) when input a valid arr, ${label}`, function() {
                throwsMsg(() => arrSep(arr, v), MSG_OPT)
                throwsMsg(() => arrSep([], v), MSG_OPT) //型別檢測與arr有無資料無關
                throwsMsg(() => arrSep([null], v), MSG_OPT)
            })
        }

        it(`should throw invalid opt when opt is not given`, function() {
            throwsMsg(() => arrSep(arr), MSG_OPT)
            throwsMsg(() => arrSep([]), MSG_OPT)
        })

        it(`should give the same result for { numCount: n } as the removed integer form gave`, function() {
            let a3 = [1, 2, 3]
            assert.strict.deepStrictEqual(arrSep(a3, { numCount: 2 }), [[1, 2], [3]])
            assert.strict.deepStrictEqual(arrSep(a3, { numCount: '2' }), [[1, 2], [3]])
            assert.strict.deepStrictEqual(arrSep(a3, { numGroup: 2 }), [[1, 3], [2]])
        })

    })

    //W-16乙: arr為第1參數, 非陣列(含未給)一律回輸出型別之空結果[], 不拋錯, 且不檢查opt(原throw invalid arr)
    describe(`arr is the 1st parameter: a non-array returns [] without throwing and without checking opt (W-16 B)`, function() {

        for (let [lb, v] of [...NON_ARR, ['5', 5], [`'5'`, '5']]) {
            it(`should return [] (no throw) when arr is ${lb}, whatever opt is`, function() {
                let r = arrSep(v, { numCount: 2 })
                assert.strict.deepStrictEqual(r, [])
                assert.ok(Array.isArray(r))
                assert.strict.deepStrictEqual(arrSep(v, 2), [])
                assert.strict.deepStrictEqual(arrSep(v, 0), [])
                assert.strict.deepStrictEqual(arrSep(v, {}), [])
                assert.strict.deepStrictEqual(arrSep(v), [])
            })
        }

        it(`should return [] first (no opt check) when both arr and opt are invalid`, function() {
            assert.strict.deepStrictEqual(arrSep('x', 0), [])
            assert.strict.deepStrictEqual(arrSep(null, {}), [])
            assert.strict.deepStrictEqual(arrSep(), [])
        })

        it(`should not throw nor echo anything for a non-array carrying a leak mark`, function() {
            assert.strict.deepStrictEqual(arrSep(LEAK, { numCount: 2 }), [])
            assert.strict.deepStrictEqual(arrSep({ LEAK }, { numCount: 2 }), [])
        })

    })

    describe(`opt is required when arr is an array (type check is independent of data)`, function() {

        let a3 = [1, 2, 3]

        it(`should throw invalid opt: must be an object with numCount or numGroup when opt is an object without a valid key`, function() {
            throwsMsg(() => arrSep(a3, {}), MSG_OPT_OBJ)
            throwsMsg(() => arrSep([], {}), MSG_OPT_OBJ)
            throwsMsg(() => arrSep(a3, { numGroup: 0 }), MSG_OPT_OBJ)
            throwsMsg(() => arrSep([], { numGroup: 0 }), MSG_OPT_OBJ)
            throwsMsg(() => arrSep([], { numCount: 'x', numGroup: -1 }), MSG_OPT_OBJ)
        })

        it(`should return [] (no throw) when input [], { numCount: 2 } and each call returns a new array`, function() {
            let a = []
            for (let op of [{ numCount: 2 }, { numCount: '2' }, { numGroup: 2 }, { numCount: '3', numGroup: 0 }]) {
                let r1 = arrSep(a, op)
                let r2 = arrSep(a, op)
                assert.strict.deepStrictEqual(r1, [])
                assert.notStrictEqual(r1, r2)
            }
        })

        it(`should not echo the input value in the messages`, function() {
            throwsMsgNoLeak(() => arrSep(a3, LEAK), MSG_OPT)
            throwsMsgNoLeak(() => arrSep(a3, [LEAK]), MSG_OPT)
            throwsMsgNoLeak(() => arrSep(a3, { numCount: LEAK }), MSG_OPT_OBJ)
            throwsMsgNoLeak(() => arrSep(a3, { LEAK }), MSG_OPT_OBJ)
        })

        it(`should not mutate the input array`, function() {
            let a = [1, 2, 3, 4, 5]
            arrSep(a, { numCount: 2 })
            arrSep(a, { numGroup: 2 })
            assert.strict.deepStrictEqual(a, [1, 2, 3, 4, 5])
        })

    })

    //W-19(比照第三批「單一空元素不再當空陣列」): 僅含單一空元素([null]、[undefined]、['']、[{}]、[[]]、[NaN])之陣列視為一個元素, 照常切分而保留(原靜默回傳[])
    describe(`an array of a single empty element is one element (W-19)`, function() {

        for (let [lb, v] of [['null', null], ['undefined', undefined], [`''`, ''], ['{}', {}], ['[]', []], ['NaN', NaN]]) {
            it(`should keep [${lb}] as one element in both modes`, function() {
                assert.strict.deepStrictEqual(arrSep([v], { numCount: 2 }), [[v]])
                assert.strict.deepStrictEqual(arrSep([v], { numCount: 1 }), [[v]])
                assert.strict.deepStrictEqual(arrSep([v], { numGroup: 3 }), [[v], [], []])
                assert.strict.deepStrictEqual(arrSep([v], { numGroup: 1 }), [[v]])
            })
        }

        it(`should still split two empty elements normally`, function() {
            assert.strict.deepStrictEqual(arrSep([null, null], { numCount: 2 }), [[null, null]])
            assert.strict.deepStrictEqual(arrSep([null, null], { numCount: 1 }), [[null], [null]])
        })

    })

    //第221項已知缺陷先修(ws270): numCount、numGroup改iseint(x, { use: 'count', min: 1 }), 通過後以Number()取值再用於迴圈(修前數字字串與迴圈之+=字串相加而切錯)
    //  Infinity等使迴圈不終止之輸入(含'Infinity'字串)於intInputHang.test.mjs(子行程加逾時)驗, 不在此行程內跑(修前原碼會使行程卡死)
    let a8 = [1, 2, 3, 4, 5, 6, 7, 8]
    let by2 = [[1, 2], [3, 4], [5, 6], [7, 8]]
    let g3 = [[1, 4, 7], [2, 5, 8], [3, 6]]

    describe(`valid numeric strings (converted by Number() before the loops)`, function() {

        it(`should return ${JSON.stringify(by2)} when input a8, { numCount: '2' }`, function() {
            assert.strict.deepStrictEqual(arrSep(a8, { numCount: '2' }), by2) // 修前為[[1,2],[]]
        })

        it(`should return ${JSON.stringify(by2)} when input a8, { numCount: ' 2 ' }`, function() {
            assert.strict.deepStrictEqual(arrSep(a8, { numCount: ' 2 ' }), by2)
        })

        it(`should return ${JSON.stringify(by2)} when input a8, { numCount: '2.0' }`, function() {
            assert.strict.deepStrictEqual(arrSep(a8, { numCount: '2.0' }), by2)
        })

        it(`should return ${JSON.stringify(g3)} when input a8, { numGroup: '3' }`, function() {
            assert.strict.deepStrictEqual(arrSep(a8, { numGroup: '3' }), g3) // 修前numGroup為字串時迴圈與比較失真
        })

        it(`should return the same as the string form for numGroup 3 (number)`, function() {
            assert.strict.deepStrictEqual(arrSep(a8, { numGroup: 3 }), g3)
        })

        it(`should use numGroup when numCount is invalid and numGroup is valid`, function() {
            assert.strict.deepStrictEqual(arrSep(a8, { numCount: 0, numGroup: '3' }), g3)
            assert.strict.deepStrictEqual(arrSep(a8, { numCount: 1.5, numGroup: 3 }), g3)
        })

        it(`should prefer numCount when both are valid`, function() {
            assert.strict.deepStrictEqual(arrSep(a8, { numCount: '2', numGroup: 3 }), by2)
        })

        it(`should return [[...]] (one group) when numCount is larger than the array length`, function() {
            assert.strict.deepStrictEqual(arrSep(a8, { numCount: 100 }), [a8])
            assert.strict.deepStrictEqual(arrSep(a8, { numCount: '100' }), [a8])
        })

        it(`should return [] for an empty array`, function() {
            assert.strict.deepStrictEqual(arrSep([], { numCount: 2 }), [])
        })

        it(`should accept the lower bound 1 in both keys`, function() {
            let by1 = [[1], [2], [3], [4], [5], [6], [7], [8]]
            assert.strict.deepStrictEqual(arrSep(a8, { numCount: 1 }), by1)
            assert.strict.deepStrictEqual(arrSep(a8, { numCount: '1' }), by1)
            assert.strict.deepStrictEqual(arrSep(a8, { numGroup: 1 }), [a8])
            assert.strict.deepStrictEqual(arrSep(a8, { numGroup: '1' }), [a8])
        })

        it(`should read each key only once (the checked value is the used value, K4)`, function() {
            let reads = { numCount: 0, numGroup: 0 }
            let op = {}
            let getCount = () => {
                reads.numCount++
                return reads.numCount === 1 ? '2' : 'x' //第二次讀取即不同值: 檢測之值與使用之值須為同一次讀取
            }
            let getGroup = () => {
                reads.numGroup++
                return 3
            }
            Object.defineProperty(op, 'numCount', { get: getCount })
            Object.defineProperty(op, 'numGroup', { get: getGroup })
            assert.strict.deepStrictEqual(arrSep(a8, op), by2)
            assert.strict.strictEqual(reads.numCount, 1)
            assert.strict.strictEqual(reads.numGroup, 0) //numCount有效時不讀numGroup
        })

    })

    describe(`generic invalid values (spec V24 matrix) for each object key`, function() {

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
            ['0', 0],
            [`'0'`, '0'],
            ['-1', -1],
            [`'-2'`, '-2'],
            ['1.5', 1.5],
            [`'1.5'`, '1.5'],
            [`'0x2'`, '0x2'],
            ['new Number(2)', new Number(2)], // eslint-disable-line no-new-wrappers
            ['4294967296', 4294967296], //超過個數上限(use: 'count')
        ]
        for (let [label, v] of INVALIDS) {
            it(`should throw when input a8, { numCount: ${label} }`, function() {
                assert.throws(() => arrSep(a8, { numCount: v }), { message: MSG_OPT_OBJ })
            })
            it(`should throw when input a8, { numGroup: ${label} }`, function() {
                assert.throws(() => arrSep(a8, { numGroup: v }), { message: MSG_OPT_OBJ })
            })
        }

        for (let [label, op] of [
            ['{ numCount: 0 }', { numCount: 0 }],
            ['{ numGroup: 0 }', { numGroup: 0 }],
            ['{ numGroup: 1.5 }', { numGroup: 1.5 }],
            [`{ numCount: 'abc', numGroup: 'abc' }`, { numCount: 'abc', numGroup: 'abc' }],
            ['{ numGroup: new Number(2) }', { numGroup: new Number(2) }], // eslint-disable-line no-new-wrappers
            ['{ x: 1 }', { x: 1 }],
        ]) {
            it(`should throw when input a8, ${label}`, function() {
                assert.throws(() => arrSep(a8, op), { message: MSG_OPT_OBJ })
            })
        }

    })

    it(`should accept the upper bound 4294967295 of use count for numCount (one group)`, function() {
        assert.strict.deepStrictEqual(arrSep([1, 2, 3], { numCount: 4294967295 }), [[1, 2, 3]])
    })

    describe(`JSDoc states the removal of the integer form and W-16/W-19 (V23)`, function() {

        it(`should document the object-only opt and the empty result for a non-array arr`, async function() {
            let { readFileSync } = await import('node:fs')
            let { fileURLToPath } = await import('node:url')
            let { dirname, join } = await import('node:path')
            let src = readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../src/arrSep.mjs'), 'utf8')
            assert.ok(src.indexOf('舊式整數寫法arrSep(arr, 3)已移除') >= 0)
            assert.ok(src.indexOf(`invalid opt: must be an object with numCount or numGroup`) >= 0)
            assert.ok(src.indexOf('非陣列(含未給、null、字串、物件等)回傳空陣列[]') >= 0)
            assert.ok(src.indexOf('單一空元素') >= 0)
            assert.ok(src.indexOf('must be a positive integer or an object') < 0) //舊訊息不再出現
        })

    })

})
