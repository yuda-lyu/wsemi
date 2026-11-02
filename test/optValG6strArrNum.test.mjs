import assert from 'assert'
import crypto from 'crypto'
import arrAt from '../src/arrAt.mjs'
import arrInsert from '../src/arrInsert.mjs'
import arrPullAt from '../src/arrPullAt.mjs'
import genID from '../src/genID.mjs'
import getErrorMessage from '../src/getErrorMessage.mjs'
import str2sha from '../src/str2sha.mjs'
import randomIntRange from '../src/randomIntRange.mjs'
import randomIntsNdpRange from '../src/randomIntsNdpRange.mjs'
import pseudoRandomIntsNdpRange from '../src/pseudoRandomIntsNdpRange.mjs'
import rang from '../src/rang.mjs'
import arrNorm from '../src/arrNorm.mjs'
import { INVALID, VALID_STR } from './tools/enumInputs.mjs'
import { defineOptParam, INVALID_EINT_EXTRA } from './tools/optValKit.mjs'


//第221項第二批第2輪第2批(ws272b): 陣列、數值、雜湊、隨機、錯誤訊息類函數之數值參數改經isenum／iseint判定
//  規格: dspec〈輸入參數之檢測機制〉K3(opt類遇非預期之輸入視為未給、改用預設)、K4(檢測之值即使用之值)、§7.1、§11(2026-11-02使用者裁定: arrAt之iend無效視為未給; str2sha之n必須參數throw維持; rang之rStart/rEnd必須參數回[])
//  可觀察值: 各probe回傳「該參數實際採用之值」之可觀察結果; 位置參數且函數無opt者無debug警告(noDebug)
//  超大值(Number > 1e5)若被當作有效個數會近乎無限迴圈或耗盡記憶體, 於程序內無法逾時中止, 故程序內矩陣不含, 由intInputHangG6.test.mjs之子行程案例驗證


//huge, Number(v) > 1e5者（含Infinity、'1e400'）, 修前為近乎無限迴圈或巨大範圍
function huge(v) {
    if (typeof v === 'symbol') {
        return false
    }
    try {
        return Number(v) > 1e5
    }
    catch (err) {
        return false
    }
}
const notHuge = ([, v]) => !huge(v)

let EINT_STR = VALID_STR.filter(([, , n]) => Number.isInteger(n))

//bounds, 呼叫f並解析其 vstart > vend 之錯誤訊息, 回傳 [vstart, vend] (實際採用之值); 未拋錯回傳'NOTHROW', 其他錯誤回傳'ERR:訊息'
function bounds(f) {
    try {
        f()
        return 'NOTHROW'
    }
    catch (err) {
        let m = /^vstart\[(.*)\] > vend\[(.*)\]$/.exec(err.message)
        return m ? [Number(m[1]), Number(m[2])] : `ERR:${err.message}`
    }
}

//整數系另有之無效: 小數、精度遺失之字串、非安全整數、超大
const EXTRA_SAFE = [...INVALID_EINT_EXTRA, ['1e21', 1e21], [`'1e21'`, '1e21'], ['-(2 ** 53)', -(2 ** 53)]]

//個數(use: 'count', min: 1)另有之無效: 0、負數、小數、超過個數上限
const EXTRA_COUNT_MIN1 = [
    ['0', 0],
    [`'0'`, '0'],
    ['-1', -1],
    [`'-1'`, '-1'],
    ['1.5', 1.5],
    [`'1.5'`, '1.5'],
    [`'1.0000000000000001'`, '1.0000000000000001'],
    ['-0.5', -0.5],
]


//--- genID(len, opt類位置參數, 預設32) ---
describe('optVal genID', function() {

    defineOptParam({
        fn: 'genID',
        name: 'len',
        def: 32,
        probe: (v) => genID(v).length,
        invalid: INVALID.filter(notHuge),
        extraInvalid: EXTRA_COUNT_MIN1,
        valid: [
            ['1', 1, 1],
            ['8', 8, 8],
            [`'8'`, '8', 8],
            [`' 12 '`, ' 12 ', 12],
            [`'1e1'`, '1e1', 10],
            ['64', 64, 64],
            ['1000', 1000, 1000],
        ],
        noDebug: true,
    })

    it(`should return id strings of [0-9A-Za-z] with the length given (value used is the converted one)`, function() {
        assert.ok(/^[0-9A-Za-z]{8}$/.test(genID(8)))
        assert.ok(/^[0-9A-Za-z]{8}$/.test(genID('8')))
        assert.ok(/^[0-9A-Za-z]{32}$/.test(genID()))
        assert.ok(/^[0-9A-Za-z]{32}$/.test(genID('0x4')))
    })

})


//--- rang(rStart, rEnd, num) ---
describe('optVal rang', function() {

    defineOptParam({
        fn: 'rang',
        name: 'num',
        def: 2,
        probe: (v) => rang(0, 10, v).length - 1,
        invalid: INVALID.filter(notHuge),
        extraInvalid: EXTRA_COUNT_MIN1,
        valid: [
            ['1', 1, 1],
            ['4', 4, 4],
            [`'4'`, '4', 4],
            [`' 5 '`, ' 5 ', 5],
            [`'1e1'`, '1e1', 10],
            ['10', 10, 10],
            ['1000', 1000, 1000],
        ],
        noDebug: true,
    })

    it(`should split by the converted num (a numeric string num must not break the arithmetic)`, function() {
        assert.strict.deepStrictEqual(rang(0, 10, '4'), [0, 2.5, 5, 7.5, 10])
        assert.strict.deepStrictEqual(rang(0, 10, 4), [0, 2.5, 5, 7.5, 10])
        assert.strict.deepStrictEqual(rang(0, 10), [0, 5, 10])
        assert.strict.deepStrictEqual(rang(0, 10, 3), [0, 3.3333333333333335, 6.666666666666667, 10])
        assert.strict.deepStrictEqual(rang(0, 10, 10), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    })

    //rStart、rEnd為必須參數, 無效回傳[]（失敗通道維持, dspec §11）
    for (let [name, f] of [['rStart', (v) => rang(v, 10)], ['rEnd', (v) => rang(0, v)]]) {
        for (let [label, v] of INVALID) {
            it(`should return [] when ${name} is ${label}`, function() {
                let r
                assert.doesNotThrow(() => {
                    r = f(v)
                })
                assert.strict.deepStrictEqual(r, [])
            })
        }
        it(`should accept ${name} as a valid numeric string and use the converted value`, function() {
            for (let [, s, n] of VALID_STR) {
                let r = name === 'rStart' ? rang(s, 10) : rang(0, s)
                let exp = name === 'rStart' ? rang(n, 10) : rang(0, n)
                assert.strict.deepStrictEqual(r, exp)
                assert.strict.deepStrictEqual(r.length, 3)
            }
        })
    }

    it(`should return [] when rStart or rEnd is not given`, function() {
        assert.strict.deepStrictEqual(rang(), [])
        assert.strict.deepStrictEqual(rang(1), [])
    })

})


//--- randomIntRange(vstart, vend) ---
describe('optVal randomIntRange', function() {

    let fn = randomIntRange
    let validStart = [...EINT_STR, ['0', 0, 0], ['-5', -5, -5], [`'-5'`, '-5', -5], ['MAX_SAFE', Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER]]
    let validEnd = [...EINT_STR, ['0', 0, 0], ['-5', -5, -5], [`'-5'`, '-5', -5], ['-MAX_SAFE', -Number.MAX_SAFE_INTEGER, -Number.MAX_SAFE_INTEGER]]

    defineOptParam({
        fn: 'randomIntRange',
        name: 'vstart',
        def: 0,
        probe: (v) => {
            let r = bounds(() => fn(v, -Number.MAX_SAFE_INTEGER))
            return Array.isArray(r) ? r[0] : r
        },
        valid: validStart,
        extraInvalid: EXTRA_SAFE,
        noDebug: true,
    })

    defineOptParam({
        fn: 'randomIntRange',
        name: 'vend',
        def: 100,
        probe: (v) => {
            let r = bounds(() => fn(Number.MAX_SAFE_INTEGER, v))
            return Array.isArray(r) ? r[1] : r
        },
        valid: validEnd,
        extraInvalid: EXTRA_SAFE,
        noDebug: true,
    })

    it(`should return an integer within [0, 100] by default and for an unexpected vend such as Infinity (formerly a non-integer like 3.6e307)`, function() {
        for (let i = 0; i < 200; i++) {
            for (let r of [fn(), fn(0, Infinity), fn(0, '0x10'), fn(0, 1.5), fn(-Infinity, 100)]) {
                assert.ok(Number.isInteger(r) && r >= 0 && r <= 100, String(r))
            }
        }
    })

    it(`should return an integer within [vstart, vend] for valid numeric strings (value used is the converted one)`, function() {
        for (let i = 0; i < 200; i++) {
            let r = fn('5', ' 7 ')
            assert.ok(Number.isInteger(r) && r >= 5 && r <= 7, String(r))
        }
        assert.strict.deepStrictEqual(fn(3, 3), 3)
        assert.strict.deepStrictEqual(fn('3', '3'), 3)
    })

    it(`should throw vstart[..] > vend[..] when vstart > vend (kept)`, function() {
        assert.throws(() => fn(5, 4), { message: 'vstart[5] > vend[4]' })
        assert.throws(() => fn('5', '4'), { message: 'vstart[5] > vend[4]' })
    })

})


//--- randomIntsNdpRange、pseudoRandomIntsNdpRange(vstart, vend, n) ---
for (let [name, fn] of [['randomIntsNdpRange', randomIntsNdpRange], ['pseudoRandomIntsNdpRange', pseudoRandomIntsNdpRange]]) {

    describe(`optVal ${name}`, function() {

        let validStart = [...EINT_STR, ['0', 0, 0], ['-5', -5, -5], [`'-5'`, '-5', -5], ['MAX_SAFE', Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER]]
        let validEnd = [...EINT_STR, ['0', 0, 0], ['-5', -5, -5], [`'-5'`, '-5', -5], ['-MAX_SAFE', -Number.MAX_SAFE_INTEGER, -Number.MAX_SAFE_INTEGER]]

        defineOptParam({
            fn: name,
            name: 'vstart',
            def: 0,
            probe: (v) => {
                let r = bounds(() => fn(v, -Number.MAX_SAFE_INTEGER))
                return Array.isArray(r) ? r[0] : r
            },
            valid: validStart,
            extraInvalid: EXTRA_SAFE,
            noDebug: true,
        })

        //超大vend若被當作有效值會建立巨大範圍而卡死, 程序內矩陣不含, 改由子行程案例驗證
        defineOptParam({
            fn: name,
            name: 'vend',
            def: 100,
            probe: (v) => {
                let r = bounds(() => fn(Number.MAX_SAFE_INTEGER, v))
                return Array.isArray(r) ? r[1] : r
            },
            valid: validEnd,
            invalid: INVALID.filter(notHuge),
            extraInvalid: EXTRA_SAFE.filter(notHuge),
            noDebug: true,
        })

        //n: 個數1~4294967295, 實際採用之n以回傳陣列長度觀察(長度為min(n, vend - vstart + 1)), 取vend 100故最長101
        defineOptParam({
            fn: name,
            name: 'n',
            def: 1,
            probe: (v) => fn(0, 100, v).length,
            valid: [
                ...EINT_STR.filter(([, , n]) => n >= 1),
                ['1', 1, 1],
                ['3', 3, 3],
                [`' 7 '`, ' 7 ', 7],
                ['101', 101, 101],
                ['4294967295 (count max, capped by the range size)', 4294967295, 101],
            ],
            extraInvalid: [...EXTRA_COUNT_MIN1, ['4294967296', 4294967296], [`'4294967296'`, '4294967296']],
            noDebug: true,
        })

        it(`should return distinct integers within [vstart, vend] for numeric string arguments (value used is the converted one)`, function() {
            let rs = fn('3', ' 8 ', '6')
            assert.strict.deepStrictEqual(rs.length, 6)
            assert.strict.deepStrictEqual(new Set(rs).size, 6)
            for (let r of rs) {
                assert.ok(Number.isInteger(r))
            }
        })

        it(`should throw vstart[..] > vend[..] when vstart > vend (kept)`, function() {
            assert.throws(() => fn(5, 4), { message: 'vstart[5] > vend[4]' })
        })

    })

}


//--- arrAt(vall, istart, iend) ---
describe('optVal arrAt', function() {

    let ARR = [10, 20, 30, 40, 50]

    //istart為必須參數, 無效回傳[]（失敗通道維持）
    for (let [label, v] of [...INVALID, ...EXTRA_SAFE, ['-1', -1], [`'-1'`, '-1'], ['1.5', 1.5], ['4294967295 (over index max)', 4294967295]]) {
        it(`should return [] when istart is ${label}`, function() {
            let r
            assert.doesNotThrow(() => {
                r = arrAt(ARR, v)
            })
            assert.strict.deepStrictEqual(r, [])
        })
    }

    it(`should use the converted istart for numeric strings`, function() {
        assert.strict.deepStrictEqual(arrAt(ARR, '1'), [20])
        assert.strict.deepStrictEqual(arrAt(ARR, ' 1 '), [20])
        assert.strict.deepStrictEqual(arrAt(ARR, '0'), [10])
        assert.strict.deepStrictEqual(arrAt(ARR, 4), [50])
        assert.strict.deepStrictEqual(arrAt(ARR, 5), [])
    })

    //iend為opt類參數(JSDoc [iend=null]), 無效視為未給, 只取istart一筆（使用者2026-11-02）
    defineOptParam({
        fn: 'arrAt',
        name: 'iend',
        def: [20],
        probe: (v) => arrAt(ARR, 1, v),
        extraInvalid: [
            ['-1', -1],
            [`'-1'`, '-1'],
            ['-10', -10],
            ['1.5', 1.5],
            [`'1.5'`, '1.5'],
            ['4294967295 (over index max)', 4294967295],
        ],
        valid: [
            ['1', 1, [20]],
            ['2', 2, [20, 30]],
            [`'2'`, '2', [20, 30]],
            [`' 3 '`, ' 3 ', [20, 30, 40]],
            [`'3.0'`, '3.0', [20, 30, 40]],
            ['4', 4, [20, 30, 40, 50]],
            ['5 (valid index but beyond the array)', 5, []],
        ],
        noDebug: true,
    })

    it(`should return only the istart item when iend is not given (kept) and the range when given`, function() {
        assert.strict.deepStrictEqual(arrAt(ARR, 1), [20])
        assert.strict.deepStrictEqual(arrAt(ARR, 1, 3), [20, 30, 40])
        assert.strict.deepStrictEqual(arrAt([1, 2, 3, '4', 5, 'abc'], 1, 4), [2, 3, '4', 5])
        assert.strict.deepStrictEqual(arrAt(ARR, 1, 10), [])
        assert.strict.deepStrictEqual(arrAt(ARR, 10, 12), [])
    })

})


//--- arrInsert(arr, ind, items) ---
describe('optVal arrInsert', function() {

    let ARR = [1, 2.5, '123']

    //ind為必須參數, 無效回傳原陣列（失敗通道維持）
    let INVALID_IND = [...INVALID, ...EXTRA_SAFE, ['-1', -1], [`'-1'`, '-1'], ['1.5', 1.5], ['4294967295 (over index max)', 4294967295], ['4 (valid index but larger than the length)', 4], [`'4'`, '4']]
    for (let [label, v] of INVALID_IND) {
        it(`should return the original array (same reference) when ind is ${label}`, function() {
            let r
            assert.doesNotThrow(() => {
                r = arrInsert(ARR, v, 'abc')
            })
            assert.strict.deepStrictEqual(r === ARR, true)
            assert.strict.deepStrictEqual(ARR, [1, 2.5, '123'])
        })
    }

    it(`should insert at the converted ind for valid numeric strings and numbers`, function() {
        assert.strict.deepStrictEqual(arrInsert(ARR, 0, 'abc'), ['abc', 1, 2.5, '123'])
        assert.strict.deepStrictEqual(arrInsert(ARR, '1', 'abc'), [1, 'abc', 2.5, '123'])
        assert.strict.deepStrictEqual(arrInsert(ARR, ' 1 ', 'abc'), [1, 'abc', 2.5, '123'])
        assert.strict.deepStrictEqual(arrInsert(ARR, '1.0', 'abc'), [1, 'abc', 2.5, '123'])
        assert.strict.deepStrictEqual(arrInsert(ARR, 3, 'abc'), [1, 2.5, '123', 'abc'])
        assert.strict.deepStrictEqual(arrInsert(ARR, '3', ['x', 'y']), [1, 2.5, '123', 'x', 'y'])
        assert.strict.deepStrictEqual(arrInsert([], 0, 'abc'), ['abc'])
        assert.strict.deepStrictEqual(ARR, [1, 2.5, '123'])
    })

    it(`should return [] when arr is not an array (kept)`, function() {
        assert.strict.deepStrictEqual(arrInsert(null, 0, 'abc'), [])
        assert.strict.deepStrictEqual(arrInsert('abc', 0, 'abc'), [])
    })

})


//--- arrPullAt(vall, vpull) ---
describe('optVal arrPullAt', function() {

    let ARR = [1, 2, 3, 4, 5, 'abc']

    //單值vpull為必須參數, 無效回傳原陣列（同一參考, 失敗通道維持）; 陣列型之輸入另見下方「陣列分支」
    let INVALID_SINGLE = [...INVALID.filter(([, v]) => !Array.isArray(v)), ...EXTRA_SAFE, ['-1', -1], [`'-1'`, '-1'], ['1.5', 1.5], ['4294967295 (over index max)', 4294967295]]
    for (let [label, v] of INVALID_SINGLE) {
        it(`should return the original array (same reference) when vpull is the single value ${label}`, function() {
            let r
            assert.doesNotThrow(() => {
                r = arrPullAt(ARR, v)
            })
            assert.strict.deepStrictEqual(r === ARR, true)
            assert.strict.deepStrictEqual(ARR, [1, 2, 3, 4, 5, 'abc'])
        })
    }

    it(`should pull the converted single index for valid numbers and numeric strings`, function() {
        assert.strict.deepStrictEqual(arrPullAt(ARR, 0), [2, 3, 4, 5, 'abc'])
        assert.strict.deepStrictEqual(arrPullAt(ARR, '1'), [1, 3, 4, 5, 'abc'])
        assert.strict.deepStrictEqual(arrPullAt(ARR, ' 5 '), [1, 2, 3, 4, 5])
        assert.strict.deepStrictEqual(arrPullAt(ARR, 99), [1, 2, 3, 4, 5, 'abc']) //有效索引但超過長度: 無可移除
        assert.strict.deepStrictEqual(ARR, [1, 2, 3, 4, 5, 'abc'])
    })

    //陣列分支: 有效索引照常移除, 無效索引略過（不可經cint變成0而誤刪第0項; 使用者2026-11-02/清單§8第9項）
    describe('array branch: invalid indexes are skipped, valid ones are pulled', function() {
        let cases = [
            [`['x']`, ['x'], [1, 2, 3]],
            [`['x', 1]`, ['x', 1], [1, 3]],
            [`[1, 'x']`, [1, 'x'], [1, 3]],
            [`[null, 1]`, [null, 1], [1, 3]],
            [`[undefined, 1]`, [undefined, 1], [1, 3]],
            [`[true, 1]`, [true, 1], [1, 3]],
            [`[{}, 1]`, [{}, 1], [1, 3]],
            [`[[], 1]`, [[], 1], [1, 3]],
            [`['', 1]`, ['', 1], [1, 3]],
            [`[' ', 1]`, [' ', 1], [1, 3]],
            [`[-1, 1]`, [-1, 1], [1, 3]],
            [`[1.5, 1]`, [1.5, 1], [1, 3]],
            [`['1.5', 1]`, ['1.5', 1], [1, 3]],
            [`[Infinity, 1]`, [Infinity, 1], [1, 3]],
            [`[-Infinity, 1]`, [-Infinity, 1], [1, 3]],
            [`[NaN, 1]`, [NaN, 1], [1, 3]],
            [`['0x1', 2]`, ['0x1', 2], [1, 2]],
            [`['Infinity', 2]`, ['Infinity', 2], [1, 2]],
            [`[new Number(0), 2]`, [new Number(0), 2], [1, 2]], // eslint-disable-line no-new-wrappers
            [`[4294967295, 2]`, [4294967295, 2], [1, 2]],
            [`[2 ** 53, 2]`, [2 ** 53, 2], [1, 2]],
            [`['abc', 'def']`, ['abc', 'def'], [1, 2, 3]],
            [`[0, 2]`, [0, 2], [2]],
            [`['0', ' 2 ']`, ['0', ' 2 '], [2]],
            [`['1', 1]`, ['1', 1], [1, 3]],
        ]
        for (let [label, vp, exp] of cases) {
            it(`should return ${JSON.stringify(exp)} when input [1, 2, 3], ${label}`, function() {
                let arr = [1, 2, 3]
                assert.strict.deepStrictEqual(arrPullAt(arr, vp), exp)
                assert.strict.deepStrictEqual(arr, [1, 2, 3]) //不改動原陣列
            })
        }

        it(`arrPullAt([1, 2, 3], ['x']) must not drop the first item (formerly [2, 3])`, function() {
            assert.strict.deepStrictEqual(arrPullAt([1, 2, 3], ['x']), [1, 2, 3])
        })

        it(`should keep the documented examples`, function() {
            assert.strict.deepStrictEqual(arrPullAt([1, 2, 3, 4, 5, 'abc'], [0, 2]), [2, 4, 5, 'abc'])
            assert.strict.deepStrictEqual(arrPullAt([1, 2, 3, '4', 5, 'abc'], [1, 3]), [1, 3, 5, 'abc'])
            assert.strict.deepStrictEqual(arrPullAt([1, 2, 3, '4', 5, 'abc'], [4, 7]), [1, 2, 3, '4', 'abc'])
        })

        it(`should return the original array for an empty pull array and [] for an invalid vall (kept)`, function() {
            let arr = [1, 2, 3]
            assert.strict.deepStrictEqual(arrPullAt(arr, []), [1, 2, 3])
            assert.strict.deepStrictEqual(arrPullAt(null, 1), [])
            assert.strict.deepStrictEqual(arrPullAt('abc', [0]), [])
        })
    })

})


//--- str2sha(str, n, base64, opt) ---
describe('optVal str2sha', function() {

    let SHA256_ABC = 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'
    const MSG = 'n is not a positive integer'

    //n為必須參數: 無效throw MSG（訊息不帶值）; returnWithStateAndMsg時改回error狀態
    let INVALID_N = [...INVALID, ...EXTRA_SAFE, ['0', 0], [`'0'`, '0'], ['-1', -1], ['1.5', 1.5], [`'1.5'`, '1.5'], [`'toString'`, 'toString'], [`'constructor'`, 'constructor']]
    for (let [label, v] of INVALID_N) {
        it(`should throw '${MSG}' when n is ${label}, and report the error state with returnWithStateAndMsg`, function() {
            assert.throws(() => str2sha('abc', v), (err) => {
                assert.strict.deepStrictEqual(err.message, MSG)
                return true
            })
            let r
            assert.doesNotThrow(() => {
                r = str2sha('abc', v, false, { returnWithStateAndMsg: true })
            })
            assert.strict.deepStrictEqual(r, { state: 'error', msg: MSG })
        })
    }

    it(`should accept n as a valid positive integer (number or decimal numeric string) and use the converted value`, function() {
        for (let n of [256, '256', ' 256 ', '256.0', '2.56e2']) {
            assert.strict.deepStrictEqual(str2sha('abc', n), SHA256_ABC)
        }
        assert.strict.deepStrictEqual(str2sha('abc', 1), 'a9993e364706816aba3e25717850c26c9cd0d89d')
        assert.strict.deepStrictEqual(str2sha('abc', '1'), 'a9993e364706816aba3e25717850c26c9cd0d89d')
    })

    //獨立對照: Node crypto（非自家輸出之快照）
    it(`should equal Node crypto for every n in 1, 224, 256, 384, 512 (number and numeric string n, hex and base64)`, function() {
        const ALG = { 1: 'sha1', 224: 'sha224', 256: 'sha256', 384: 'sha384', 512: 'sha512' }
        for (let s of ['abc', 'test中文', 'x'.repeat(1000)]) {
            for (let [n, alg] of Object.entries(ALG)) {
                let hex = crypto.createHash(alg).update(s, 'utf8').digest('hex')
                let b64 = crypto.createHash(alg).update(s, 'utf8').digest('base64')
                assert.strict.deepStrictEqual(str2sha(s, Number(n)), hex, `${alg} number`)
                assert.strict.deepStrictEqual(str2sha(s, n), hex, `${alg} string`)
                assert.strict.deepStrictEqual(str2sha(s, ` ${n} `), hex, `${alg} padded string`)
                assert.strict.deepStrictEqual(str2sha(s, Number(n), true), b64, `${alg} base64`)
            }
        }
    })

    it(`should throw the fixed message (without the value) for a valid positive integer outside 1, 224, 256, 384, 512`, function() {
        //主控2026-11-02判定(ws272c): 訊息不帶輸入值(dspec K9/V20), 與pmTimeout同
        let msg = 'invalid n: must be one of 1, 224, 256, 384, 512'
        assert.throws(() => str2sha('abc', 160), { message: msg })
        assert.throws(() => str2sha('abc', '160'), { message: msg })
        assert.throws(() => str2sha('abc', 2), { message: msg })
        assert.strict.deepStrictEqual(str2sha('abc', 160, false, { returnWithStateAndMsg: true }), { state: 'error', msg })
    })

    it(`the n error message should not carry an unexpected input value`, function() {
        let secret = 'SECRET-VALUE-123'
        assert.throws(() => str2sha('abc', secret), (err) => {
            assert.ok(!err.message.includes(secret), err.message)
            return true
        })
    })

    it(`should return '' for an invalid str before checking n (kept)`, function() {
        assert.strict.deepStrictEqual(str2sha('', 256), '')
        assert.strict.deepStrictEqual(str2sha(null, 'abc'), '')
    })

})


//--- getErrorMessage(err, opt) 之 levelCauseMax、levelJsonMax、lengthMessageMax ---
describe('optVal getErrorMessage', function() {

    function chain(n) {
        let e = new Error('m' + (n - 1))
        for (let i = n - 2; i >= 0; i--) {
            e = new Error('m' + i, { cause: e })
        }
        return e
    }
    function deep(n) {
        let o = { v: 1 }
        for (let i = 0; i < n; i++) {
            o = { a: o }
        }
        return o
    }
    let ECHAIN = chain(30)
    let EDEEP = deep(15)
    let ELONG = new Error('x'.repeat(200))

    //共同: 個數1~4294967295以內; 非預期（含0、負數、小數、Infinity、'0x10'、包裝物件、超過個數上限）改用預設
    let EXTRA_NEAR = [...EXTRA_COUNT_MIN1, ['4294967296', 4294967296], [`'4294967296'`, '4294967296'], ['2 ** 53', 2 ** 53]]

    defineOptParam({
        fn: 'getErrorMessage',
        name: 'opt.levelCauseMax',
        def: 9, //預設8層cause + 最外層共9段
        probe: (v, extra) => getErrorMessage(ECHAIN, { useCause: true, levelCauseMax: v, ...extra }).split(' <- ').length,
        extraInvalid: EXTRA_NEAR,
        valid: [
            ['1', 1, 2],
            ['3', 3, 4],
            [`'3'`, '3', 4],
            [`' 3 '`, ' 3 ', 4],
            ['20', 20, 21],
        ],
    })

    defineOptParam({
        fn: 'getErrorMessage',
        name: 'opt.levelJsonMax',
        def: 6,
        probe: (v, extra) => {
            let r = getErrorMessage(EDEEP, { levelJsonMax: v, ...extra })
            return (r.match(/\{/g) || []).length
        },
        extraInvalid: EXTRA_NEAR,
        valid: [
            ['1', 1, 1],
            ['3', 3, 3],
            [`'3'`, '3', 3],
            [`' 3 '`, ' 3 ', 3],
            ['10', 10, 10],
        ],
    })

    defineOptParam({
        fn: 'getErrorMessage',
        name: 'opt.lengthMessageMax',
        def: 200, //預設0代表不限制長度, 故原訊息200字元
        probe: (v, extra) => getErrorMessage(ELONG, { lengthMessageMax: v, ...extra }).length,
        extraInvalid: [['-1', -1], [`'-1'`, '-1'], ['1.5', 1.5], [`'1.5'`, '1.5'], ['-0.5', -0.5]],
        valid: [
            ['0 (no limit)', 0, 200],
            [`'0'`, '0', 200],
            ['10', 10, 10],
            [`'10'`, '10', 10],
            [`' 50 '`, ' 50 ', 50],
            ['150', 150, 150],
            ['300 (longer than the message)', 300, 200],
        ],
    })

    it(`should not throw and use the defaults when opt itself is unexpected (null, string, number, array)`, function() {
        for (let opt of [null, 'abc', 123, [], true]) {
            let r
            assert.doesNotThrow(() => {
                r = getErrorMessage(new Error('x'), opt)
            })
            assert.strict.deepStrictEqual(r, 'x')
        }
    })

    it(`should keep returning a string for any err (kept)`, function() {
        for (let e of [null, undefined, 123, 'abc', {}, [], Symbol('x'), new Error('m')]) {
            assert.strict.deepStrictEqual(typeof getErrorMessage(e), 'string')
        }
    })

})


//--- arrNorm(vec, opt) 之 :56 一致性(r為arrProduct自算結果, 改用isenum判定) ---
describe('arrNorm result check by isenum (consistency; no observable difference expected)', function() {

    it(`should return the norm for ordinary vectors`, function() {
        assert.strict.deepStrictEqual(arrNorm([3, 4]), 5)
        assert.strict.deepStrictEqual(arrNorm([1, 2, 3, 4]), 5.477225575051661)
        assert.strict.deepStrictEqual(arrNorm([3, '-', 4]), 5)
        assert.strict.deepStrictEqual(arrNorm(['3', ' 4 ']), 5)
    })

    it(`should return null when the sum of squares overflows to Infinity (not Infinity)`, function() {
        assert.strict.deepStrictEqual(arrNorm([1e200, 1e200]), null)
        assert.strict.deepStrictEqual(arrNorm([Number.MAX_VALUE, Number.MAX_VALUE]), null)
    })

    it(`should return null when the sum of squares is 0 and null for a non-array (kept)`, function() {
        assert.strict.deepStrictEqual(arrNorm([0, 0]), null)
        assert.strict.deepStrictEqual(arrNorm(null), null)
        assert.strict.deepStrictEqual(arrNorm('abc'), null)
    })

    it(`should throw when the vector has no valid number (kept)`, function() {
        assert.throws(() => arrNorm(['abc']), { message: 'invalid vec: must contain a valid number' })
        assert.throws(() => arrNorm([]), { message: 'invalid vec: must contain a valid number' })
    })

})
