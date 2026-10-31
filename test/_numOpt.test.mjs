/* eslint-disable no-new-wrappers -- 測試刻意以包裝物件驗證非一般物件之opt */
import assert from 'assert'
import parseNumOpt from '../src/_numOpt.mjs'
import { resetWarned, capture, stubWarn } from './tools/numOptKit.mjs'


//規格: 主控dspec〈輸入參數之檢測機制〉K3(非預期之輸入視為未給、改用預設; opt.debug警告)、§4 V4~V7、V11、§6 V20、§7.1〈isenum 之範圍〉〈iseint〉
//以自訂宣告表直接測試共用解析(isenum/iseint 之真表只含部分鍵: 如 ENUM_USE 無 lt、EINT_USE 無 gt/lt, 此處補足合併邏輯之各鍵)

function mkSpec(extra = {}) {
    let table = Object.create(null)
    table.a = { lt: 10 }
    table.b = { gt: 2, lt: 8 }
    table.c = { min: 1, max: 9 }
    table.d = { min: 3, max: 4, gt: 0, lt: 100 }
    return {
        fn: 'fnx',
        keys: new Set(['use', 'min', 'max', 'gt', 'lt', 'debug', 'funLog']),
        table,
        names: ['a', 'b', 'c', 'd'],
        useDef: null,
        check: (v) => (typeof v === 'number' && Number.isFinite(v)) || (typeof v === 'string' && v.trim() !== '' && Number.isFinite(Number(v))),
        desc: 'a test number',
        boundKeys: 'min/max/gt/lt',
        ...extra,
    }
}

const INF = Infinity

describe(`_numOpt`, function() {

    beforeEach(function() {
        resetWarned()
    })

    describe(`merge of use with explicit bounds (stricter wins)`, function() {

        it(`should return unbounded when opt is empty`, function() {
            assert.strict.deepStrictEqual(parseNumOpt({}, mkSpec()), { min: -INF, max: INF, gt: -INF, lt: INF })
        })

        it(`should take each bound from use when not given`, function() {
            let s = mkSpec()
            assert.strict.deepStrictEqual(parseNumOpt({ use: 'a' }, s), { min: -INF, max: INF, gt: -INF, lt: 10 })
            assert.strict.deepStrictEqual(parseNumOpt({ use: 'b' }, s), { min: -INF, max: INF, gt: 2, lt: 8 })
            assert.strict.deepStrictEqual(parseNumOpt({ use: 'c' }, s), { min: 1, max: 9, gt: -INF, lt: INF })
            assert.strict.deepStrictEqual(parseNumOpt({ use: 'd' }, s), { min: 3, max: 4, gt: 0, lt: 100 })
        })

        it(`lt: smaller of use and explicit`, function() {
            let s = mkSpec()
            assert.strict.deepStrictEqual(parseNumOpt({ use: 'a', lt: 5 }, s).lt, 5)
            assert.strict.deepStrictEqual(parseNumOpt({ use: 'a', lt: 20 }, s).lt, 10)
            assert.strict.deepStrictEqual(parseNumOpt({ use: 'a', lt: 10 }, s).lt, 10)
        })

        it(`gt: larger of use and explicit`, function() {
            let s = mkSpec()
            assert.strict.deepStrictEqual(parseNumOpt({ use: 'b', gt: 5 }, s).gt, 5)
            assert.strict.deepStrictEqual(parseNumOpt({ use: 'b', gt: 1 }, s).gt, 2)
            assert.strict.deepStrictEqual(parseNumOpt({ use: 'b', gt: 2 }, s).gt, 2)
        })

        it(`min: larger of use and explicit`, function() {
            let s = mkSpec()
            assert.strict.deepStrictEqual(parseNumOpt({ use: 'c', min: 5 }, s).min, 5)
            assert.strict.deepStrictEqual(parseNumOpt({ use: 'c', min: -5 }, s).min, 1)
            assert.strict.deepStrictEqual(parseNumOpt({ use: 'c', min: 1 }, s).min, 1)
        })

        it(`max: smaller of use and explicit`, function() {
            let s = mkSpec()
            assert.strict.deepStrictEqual(parseNumOpt({ use: 'c', max: 5 }, s).max, 5)
            assert.strict.deepStrictEqual(parseNumOpt({ use: 'c', max: 50 }, s).max, 9)
            assert.strict.deepStrictEqual(parseNumOpt({ use: 'c', max: 9 }, s).max, 9)
        })

        it(`explicit bounds not covered by use are kept`, function() {
            let s = mkSpec()
            assert.strict.deepStrictEqual(parseNumOpt({ use: 'a', min: -5, max: 7, gt: -9 }, s), { min: -5, max: 7, gt: -9, lt: 10 })
        })

        it(`should return numbers (string bounds are converted, not kept as strings)`, function() {
            let s = mkSpec()
            let r = parseNumOpt({ min: '5', max: ' 40 ', gt: '1e-3', lt: '1e3' }, s)
            assert.strict.deepStrictEqual(r, { min: 5, max: 40, gt: 0.001, lt: 1000 })
            for (let k of ['min', 'max', 'gt', 'lt']) {
                assert.strict.deepStrictEqual(typeof r[k], 'number')
            }
        })

        it(`should use useDef when use is not given, null/undefined or invalid`, function() {
            let s = mkSpec({ useDef: 'c' })
            assert.strict.deepStrictEqual(parseNumOpt({}, s), { min: 1, max: 9, gt: -INF, lt: INF })
            assert.strict.deepStrictEqual(parseNumOpt({ use: null }, s), { min: 1, max: 9, gt: -INF, lt: INF })
            assert.strict.deepStrictEqual(parseNumOpt({ use: undefined }, s), { min: 1, max: 9, gt: -INF, lt: INF })
            assert.strict.deepStrictEqual(parseNumOpt({ use: 'zzz' }, s), { min: 1, max: 9, gt: -INF, lt: INF })
            assert.strict.deepStrictEqual(parseNumOpt({ use: 'a' }, s), { min: -INF, max: INF, gt: -INF, lt: 10 })
        })

        it(`should return a fresh object and not modify opt`, function() {
            let s = mkSpec()
            let o = Object.freeze({ use: 'a', lt: 5 })
            let r1 = parseNumOpt(o, s)
            let r2 = parseNumOpt(o, s)
            assert.strict.notStrictEqual(r1, r2)
            assert.strict.deepStrictEqual(o, { use: 'a', lt: 5 })
        })

    })

    describe(`empty range (explicit bounds, or after intersecting with use): all explicit bounds are dropped, use is kept`, function() {
        let s = mkSpec()
        let emptys = [
            [{ min: 5, max: 4 }, {}],
            [{ gt: 5, lt: 5 }, {}],
            [{ gt: 6, lt: 5 }, {}],
            [{ min: 5, lt: 5 }, {}],
            [{ min: 6, lt: 5 }, {}],
            [{ gt: 5, max: 5 }, {}],
            [{ gt: 6, max: 5 }, {}],
            [{ min: 5, max: 5, gt: 5 }, {}],
            [{ min: 5, max: 5, lt: 5 }, {}],
            [{ min: 1, max: 1, gt: 1, lt: 1 }, {}],
            [{ use: 'c', min: 100 }, { use: 'c' }], //c: max 9
            [{ use: 'c', min: 100, max: 200 }, { use: 'c' }],
            [{ use: 'a', gt: 50 }, { use: 'a' }], //a: lt 10
            [{ use: 'b', max: 2 }, { use: 'b' }], //b: gt 2, lt 8; max 2 與 gt 2 衝突
            [{ use: 'b', min: 8 }, { use: 'b' }], //min 8 與 lt 8 衝突
            [{ use: 'd', min: 5 }, { use: 'd' }], //d: max 4
        ]
        for (let [o, eff] of emptys) {
            it(`should fall back to ${JSON.stringify(eff)} for ${JSON.stringify(o)}`, function() {
                assert.strict.deepStrictEqual(parseNumOpt(o, s), parseNumOpt(eff, s))
            })
        }
        let oks = [
            { min: 5, max: 5 },
            { min: 4, max: 5 },
            { gt: 4, lt: 5 },
            { gt: 4, max: 5 },
            { min: 4, lt: 5 },
            { min: 5, max: 5, gt: 4, lt: 6 },
            { min: -1e300, max: 1e300 },
            { use: 'c', min: 9 }, //剛好單點 [9, 9]
            { use: 'c', max: 1 }, //[1, 1]
            { use: 'b', min: 3, max: 7 },
        ]
        for (let o of oks) {
            it(`should keep a non-empty range ${JSON.stringify(o)}`, function() {
                let r = parseNumOpt(o, s)
                let eff = parseNumOpt({}, s)
                assert.strict.notDeepStrictEqual(r, eff)
            })
        }
        it(`should keep a single-point range as is`, function() {
            assert.strict.deepStrictEqual(parseNumOpt({ min: 5, max: 5 }, s), { min: 5, max: 5, gt: -INF, lt: INF })
            assert.strict.deepStrictEqual(parseNumOpt({ use: 'c', min: 9 }, s), { min: 9, max: 9, gt: -INF, lt: INF })
        })
    })

    describe(`shape of opt and keys`, function() {

        it(`should never throw: non-plain opt is treated as {}`, function() {
            let s = mkSpec()
            let un = { min: -INF, max: INF, gt: -INF, lt: INF }
            for (let o of [5, 0, '', 'x', true, false, [], [1], new Date(), new Map(), () => 1, Symbol('s'), 1n, new Number(1), Object.create({ min: 1 }), new (class A {})()]) {
                assert.strict.deepStrictEqual(parseNumOpt(o, s), un)
            }
        })

        it(`should ignore undefined and null values of declared keys`, function() {
            let s = mkSpec()
            assert.strict.deepStrictEqual(parseNumOpt({ min: undefined, max: null, gt: undefined, lt: null, use: null }, s), { min: -INF, max: INF, gt: -INF, lt: INF })
        })

        it(`should not read undeclared keys (getter on undeclared key is not invoked) and ignore them`, function() {
            let n = 0
            let o = {
                get foo() {
                    n++
                    return 1
                },
                min: 3,
            }
            assert.strict.deepStrictEqual(parseNumOpt(o, mkSpec()), { min: 3, max: INF, gt: -INF, lt: INF })
            assert.strict.deepStrictEqual(n, 0)
        })

        it(`should not read non-enumerable or inherited keys`, function() {
            let o = Object.create(null)
            Object.defineProperty(o, 'min', { value: 5, enumerable: false })
            assert.strict.deepStrictEqual(parseNumOpt(o, mkSpec()), { min: -INF, max: INF, gt: -INF, lt: INF })
        })

        it(`should ignore symbol keys (Object.keys lists string keys only)`, function() {
            let o = { [Symbol('x')]: 1 }
            assert.strict.deepStrictEqual(parseNumOpt(o, mkSpec()), { min: -INF, max: INF, gt: -INF, lt: INF })
        })

        it(`should use the declared key set (a key missing from spec.keys is ignored)`, function() {
            let s = mkSpec({ keys: new Set(['use', 'min', 'max']) })
            assert.strict.deepStrictEqual(parseNumOpt({ gt: 1, min: 2 }, s), { min: 2, max: INF, gt: -INF, lt: INF })
        })

        it(`should use spec.check for bounds (invalid bound is ignored)`, function() {
            let s = mkSpec({ check: (v) => v === 7 })
            assert.strict.deepStrictEqual(parseNumOpt({ min: 7, max: 8 }, s), { min: 7, max: INF, gt: -INF, lt: INF })
        })

        it(`should not call spec.check for undefined/null values and not for use/debug/funLog`, function() {
            let n = 0
            let s = mkSpec({
                check: () => {
                    n++
                    return true
                },
            })
            parseNumOpt({ min: undefined, max: null, use: 'a', debug: true, funLog() {} }, s)
            assert.strict.deepStrictEqual(n, 0)
        })

        it(`should treat a throwing getter as not given`, function() {
            let o = {
                get min() {
                    throw new Error('x')
                },
                max: 3,
            }
            assert.strict.deepStrictEqual(parseNumOpt(o, mkSpec()), { min: -INF, max: 3, gt: -INF, lt: INF })
        })

        it(`should treat opt as {} when Object.keys throws (Proxy, revoked Proxy)`, function() {
            let p = new Proxy({ min: 1 }, {
                ownKeys() {
                    throw new Error('trap')
                },
            })
            assert.strict.deepStrictEqual(parseNumOpt(p, mkSpec()), { min: -INF, max: INF, gt: -INF, lt: INF })
            let r = Proxy.revocable({ min: 1 }, {})
            r.revoke()
            assert.strict.deepStrictEqual(parseNumOpt(r.proxy, mkSpec()), { min: -INF, max: INF, gt: -INF, lt: INF })
        })

    })

    describe(`debug warnings`, function() {

        it(`should emit the fixed message per reason with spec.fn, spec.names, spec.useDef, spec.desc and spec.boundKeys`, function() {
            let s = mkSpec({ useDef: 'c', desc: 'a thing', boundKeys: 'lo/hi' })
            let { funLog, logs } = capture()
            parseNumOpt({ debug: true, funLog, foo: 1, use: 'zzz', min: 'q', gt: 6, lt: 5 }, s)
            assert.strict.deepStrictEqual(logs.map((x) => x.msg), [
                `[wsemi fnx] invalid opt.foo: unknown option, ignored`,
                `[wsemi fnx] invalid opt.use: must be one of 'a', 'b', 'c', 'd', using default 'c'`,
                `[wsemi fnx] invalid opt.min: must be a thing, ignored`,
                `[wsemi fnx] invalid opt: range is empty, lo/hi ignored`,
            ])
            assert.strict.deepStrictEqual(logs.map((x) => x.info), [
                { fn: 'fnx', reason: 'unknown', key: 'foo' },
                { fn: 'fnx', reason: 'use', key: 'use' },
                { fn: 'fnx', reason: 'bound', key: 'min' },
                { fn: 'fnx', reason: 'empty', key: '' },
            ])
        })

        it(`should say 'ignored' for use when the spec has no default use`, function() {
            let { funLog, logs } = capture()
            parseNumOpt({ debug: true, funLog, use: 'zzz' }, mkSpec())
            assert.strict.deepStrictEqual(logs[0].msg, `[wsemi fnx] invalid opt.use: must be one of 'a', 'b', 'c', 'd', ignored`)
        })

        it(`should be silent without debug === true and silent for valid opt`, function() {
            let { funLog, logs } = capture()
            let { warns } = stubWarn(() => {
                parseNumOpt({ funLog, foo: 1, min: 'q' }, mkSpec())
                parseNumOpt({ debug: 'true', funLog, foo: 1, min: 'q' }, mkSpec())
                parseNumOpt({ debug: true, funLog, use: 'a', min: 1, max: 5 }, mkSpec())
            })
            assert.strict.deepStrictEqual(logs, [])
            assert.strict.deepStrictEqual(warns, [])
        })

        it(`should deliver to console.warn when funLog is not a function, and swallow outlet errors`, function() {
            let { warns } = stubWarn(() => parseNumOpt({ debug: true, funLog: 'x', min: 'q' }, mkSpec()))
            assert.strict.deepStrictEqual(warns, [`[wsemi fnx] invalid opt.min: must be a test number, ignored`])
            resetWarned()
            let r = parseNumOpt({
                debug: true,
                min: 'q',
                max: 5,
                funLog() {
                    throw new Error('x')
                },
            }, mkSpec())
            assert.strict.deepStrictEqual(r, { min: -INF, max: 5, gt: -INF, lt: INF })
        })

        it(`should dedupe by function, reason and key, and resetWarned clears it`, function() {
            let { funLog, logs } = capture()
            let s1 = mkSpec()
            let s2 = mkSpec({ fn: 'fny' })
            for (let i = 0; i < 3; i++) {
                parseNumOpt({ debug: true, funLog, min: 'q' }, s1)
            }
            parseNumOpt({ debug: true, funLog, min: 'q' }, s2)
            parseNumOpt({ debug: true, funLog, max: 'q' }, s1)
            assert.strict.deepStrictEqual(logs.length, 3)
            resetWarned()
            parseNumOpt({ debug: true, funLog, min: 'q' }, s1)
            assert.strict.deepStrictEqual(logs.length, 4)
        })

        it(`should cap the number of distinct warnings at 256 per process`, function() {
            let { funLog, logs } = capture()
            for (let i = 0; i < 300; i++) {
                parseNumOpt({ debug: true, funLog, ['k' + i]: 1 }, mkSpec())
            }
            assert.strict.deepStrictEqual(logs.length, 256)
            //已警告者仍去重, 新者不再警告
            parseNumOpt({ debug: true, funLog, k1000: 1 }, mkSpec())
            assert.strict.deepStrictEqual(logs.length, 256)
        })

        it(`should echo a key name only when it is a short identifier`, function() {
            let { funLog, logs } = capture()
            let long = 'a'.repeat(33)
            parseNumOpt({ 'debug': true, funLog, [long]: 1, 'x y': 1, ['a'.repeat(32)]: 1 }, mkSpec())
            let ms = logs.map((x) => x.msg)
            assert.strict.deepStrictEqual(ms.includes(`[wsemi fnx] invalid opt.${'a'.repeat(32)}: unknown option, ignored`), true)
            assert.strict.deepStrictEqual(ms.filter((m) => m === `[wsemi fnx] invalid opt: unknown option, ignored`).length, 1) //長鍵與含空白者同為無鍵名之一則(去重)
            assert.strict.deepStrictEqual(ms.some((m) => m.includes(long)), false)
        })

    })

})
