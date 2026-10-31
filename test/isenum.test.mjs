/* eslint-disable no-extend-native, no-new-wrappers, no-loss-of-precision -- 測試刻意以包裝物件、暫時汙染原型(finally還原)與解析時失精度之字面值驗證判斷函數 */
import assert from 'assert'
import vm from 'vm'
import isenum from '../src/isenum.mjs'
import iseint from '../src/iseint.mjs'
import isnum from '../src/isnum.mjs'
import { resetWarned, capture, stubWarn, sameAs } from './tools/numOptKit.mjs'


//規格: 主控dspec〈輸入參數之檢測機制〉§7.1(isenum 判定表、〈isenum 之範圍〉、〈兩函數共通〉)、§3.1(數字字串之格式)、§5.3 C2(判斷類)、§6 V19/V20(訊息格式、不帶值)
//述語編號: E1 true例; E2 false例; E3 永不拋錯且不呼叫被檢測值之方法; E4 下溢; E5 min/max/gt/lt; E6 use; E7 opt非預期之輸入視為未給(改用預設、不拋錯); E8 opt.debug警告(固定詞彙、不含值、每行程一次、funLog／console.warn); E10 與isnum之差異; E11 JSDoc例(E9 效能路徑記於帳本, 見rulebook_judge.md)


function nextUp(x) {
    if (x === 0) {
        return Number.MIN_VALUE
    }
    let f = new Float64Array([x])
    let b = new BigInt64Array(f.buffer)
    b[0] += x > 0 ? 1n : -1n
    return f[0]
}

function nextDown(x) {
    return -nextUp(-x)
}

function lab(v) {
    if (typeof v === 'symbol') {
        return 'Symbol()'
    }
    if (typeof v === 'bigint') {
        return `${v}n`
    }
    if (typeof v === 'string') {
        return JSON.stringify(v)
    }
    if (typeof v === 'function') {
        return 'function'
    }
    if (typeof v === 'number') {
        return Object.is(v, -0) ? '-0' : String(v)
    }
    return Object.prototype.toString.call(v)
}


describe(`isenum`, function() {

    describe(`E1 true examples (§7.1 table)`, function() {
        let ts = [
            0, -0, 1.25, 2 ** 60, -1.25, 1e-300, 5e-324, Number.MAX_VALUE, -Number.MAX_VALUE, Number.MIN_VALUE, Number.MAX_SAFE_INTEGER,
            '123.45', ' 12 ', '+5', '-.5', '5.', '1.2e-5', '1E+5', '0.0', '00012',
            ' 12 ', '\t12\n', '﻿12', '　-3.5 ', '1.7976931348623157e308', '-1.7976931348623157e308',
            '0', '-0', '+0', '.0', '0.', '0e5', '0E-5', '0.000e-400', '0.0e999999999999', '3e-324', '5e-324', '1e308', '1e-323',
            '+.5e+1', '1e0', '1e+0', '123456789012345678901234567890', '0.00000000000000000000001',
        ]
        for (let v of ts) {
            it(`should return true when input ${lab(v)}`, function() {
                assert.strict.deepStrictEqual(isenum(v), true)
            })
        }
    })

    describe(`E2 false examples (§7.1 table)`, function() {
        let fs_ = [
            NaN, Infinity, -Infinity,
            'Infinity', '-Infinity', '+Infinity', 'NaN', 'infinity', '1e400', '-1e400', '1e-400', '-1e-400', '4.9e-325', '1.8e308', '-1.8e308', '2.4e-324',
            '0x10', '0X10', '0b11', '0o7', '1,234', '1_000', '１２３', '١٢٣', '−5', '1e5.5', '0x', '1 2', '1\n2', '--1', '++1', '+-1', '1.2.3', '1e', '1e+', '1e-', 'e5', 'E5', '.', '-.', '+', '-', '+.', '.e5',
            '', ' ', '   ', '\t\n', ' ', '-', 'NP', 'N/A', '<0.5', 'abc', '12abc', 'abc12', '12px', '1/2', '1;2', '(1)', '$1', '1​',
            null, undefined, true, false, 10n, 0n, Symbol('x'),
            new Number(1), new String('1'), new Boolean(true), Object(10n), Object(Symbol('y')),
            [1], [], ['1'], {}, { valueOf: () => 1 }, { toString: () => '1' }, new Date(), new Date(0), /1/, new Map(), new Set([1]), new Uint8Array([1]),
            function() {}, () => 1, class A {}, Object.create(null), Math, JSON,
        ]
        for (let v of fs_) {
            it(`should return false when input ${lab(v)}`, function() {
                assert.strict.deepStrictEqual(isenum(v), false)
            })
        }
    })

    describe(`E3 never throws and never calls methods of the tested value`, function() {

        it(`should not call valueOf/toString/Symbol.toPrimitive/getters of objects`, function() {
            let calls = []
            let o = {
                valueOf() {
                    calls.push('valueOf')
                    return 1
                },
                toString() {
                    calls.push('toString')
                    return '1'
                },
                [Symbol.toPrimitive]() {
                    calls.push('toPrimitive')
                    return 1
                },
                get length() {
                    calls.push('length')
                    return 1
                },
                get then() {
                    calls.push('then')
                    return undefined
                },
            }
            assert.strict.deepStrictEqual(isenum(o), false)
            assert.strict.deepStrictEqual(isenum(o, { min: 0 }), false)
            assert.strict.deepStrictEqual(calls, [])
        })

        it(`should return false for objects whose members throw`, function() {
            let o = {
                get valueOf() {
                    throw new Error('x')
                },
                get toString() {
                    throw new Error('y')
                },
                get [Symbol.toPrimitive]() {
                    throw new Error('z')
                },
            }
            assert.strict.deepStrictEqual(isenum(o), false)
            assert.strict.deepStrictEqual(isenum(o, { use: 'ratio' }), false)
        })

        it(`should not touch traps of a Proxy (object and function)`, function() {
            let traps = []
            let h = new Proxy({}, {
                get(t, k) {
                    traps.push(String(k))
                    throw new Error('trap')
                },
            })
            let p1 = new Proxy({}, h)
            let p2 = new Proxy(function() {}, h)
            let p3 = new Proxy([], h)
            for (let p of [p1, p2, p3]) {
                assert.strict.deepStrictEqual(isenum(p), false)
                assert.strict.deepStrictEqual(isenum(p, { gt: 0 }), false)
            }
            assert.strict.deepStrictEqual(traps, [])
        })

        it(`should return false for a revoked Proxy`, function() {
            let r = Proxy.revocable({}, {})
            r.revoke()
            assert.strict.deepStrictEqual(isenum(r.proxy), false)
        })

        it(`should return false for a Proxy of a number wrapper`, function() {
            let p = new Proxy(new Number(5), {})
            assert.strict.deepStrictEqual(isenum(p), false)
        })

        it(`should return false for an object from another realm`, function() {
            let o = vm.runInNewContext('new Number(5)')
            assert.strict.deepStrictEqual(isenum(o), false)
            assert.strict.deepStrictEqual(isenum(vm.runInNewContext('[1]')), false)
        })

        it(`should not be affected by a patched String.prototype.valueOf / Number.prototype.valueOf`, function() {
            let ov = Number.prototype.valueOf
            let sv = String.prototype.valueOf
            Number.prototype.valueOf = function() {
                return NaN
            }
            String.prototype.valueOf = function() {
                return 'x'
            }
            try {
                assert.strict.deepStrictEqual(isenum(5), true)
                assert.strict.deepStrictEqual(isenum('5'), true)
            }
            finally {
                Number.prototype.valueOf = ov
                String.prototype.valueOf = sv
            }
        })

        it(`should return a boolean for every input without throwing (type matrix)`, function() {
            let vs = [0, '0', '', null, undefined, NaN, {}, [], true, 1n, Symbol('s'), () => 1, new Date(), new Number(1)]
            for (let v of vs) {
                for (let o of [undefined, null, {}, { use: 'ratio' }, { min: 0, max: 1, gt: -1, lt: 2 }]) {
                    let r = isenum(v, o)
                    assert.strict.deepStrictEqual(typeof r, 'boolean')
                }
            }
        })

    })

    describe(`E4 underflow (converted to 0 while mantissa has a non-zero digit)`, function() {
        let tbl = [
            ['1e-400', false],
            ['1e-325', false],
            ['4.9e-325', false],
            ['2.4e-324', false], //小於最小次正規數之一半, 捨入為0
            ['3e-324', true], //捨入至5e-324, 未下溢
            ['4.94e-324', true],
            ['9.9e-400', false],
            ['0.00001e-320', false], //尾數含非零數字, 指數後值<5e-324
            ['0e-400', true], //尾數全零, 真值即為0
            ['0.0e-400', true],
            ['000e5', true],
            ['0', true],
            ['0.000', true],
            ['-0.0e-5', true],
            ['1e-324', false], //Number('1e-324')為0
        ]
        for (let [v, rr] of tbl) {
            it(`should return ${rr} when input ${lab(v)}`, function() {
                assert.strict.deepStrictEqual(isenum(v), rr)
            })
        }
    })

    describe(`E4b format check is linear (no quadratic backtracking)`, function() {
        //規格原式\d+\.?\d*於長串數字後接非法字元時為O(n^2)回溯, 50000位約需數秒; 線性實作約1ms
        it(`should reject a 50000-digit string with a trailing invalid char quickly`, function() {
            let s = '1'.repeat(50000) + 'x'
            let t0 = Date.now()
            let r = isenum(s)
            let dt = Date.now() - t0
            assert.strict.deepStrictEqual(r, false)
            assert.strict.deepStrictEqual(dt < 250, true, `elapsed ${dt}ms`)
        })

        it(`should reject a 50000-digit string with a trailing invalid exponent quickly`, function() {
            let s = '1'.repeat(50000) + 'e+'
            let t0 = Date.now()
            let r = isenum(s)
            let dt = Date.now() - t0
            assert.strict.deepStrictEqual(r, false)
            assert.strict.deepStrictEqual(dt < 250, true, `elapsed ${dt}ms`)
        })

        it(`should reject a 50000-char whitespace + invalid string quickly`, function() {
            let s = ' '.repeat(50000) + 'x'
            let t0 = Date.now()
            let r = isenum(s)
            let dt = Date.now() - t0
            assert.strict.deepStrictEqual(r, false)
            assert.strict.deepStrictEqual(dt < 250, true, `elapsed ${dt}ms`)
        })

        it(`should accept a 100000-digit integer string only when finite (1e5 digits is Infinity)`, function() {
            assert.strict.deepStrictEqual(isenum('1' + '0'.repeat(400)), false)
            assert.strict.deepStrictEqual(isenum('0'.repeat(100000) + '5'), true)
        })
    })

    describe(`E5 opt.min / opt.max / opt.gt / opt.lt`, function() {

        it(`min is inclusive`, function() {
            assert.strict.deepStrictEqual(isenum(5, { min: 5 }), true)
            assert.strict.deepStrictEqual(isenum(nextUp(5), { min: 5 }), true)
            assert.strict.deepStrictEqual(isenum(nextDown(5), { min: 5 }), false)
            assert.strict.deepStrictEqual(isenum('5', { min: 5 }), true)
            assert.strict.deepStrictEqual(isenum('4.9999999999999999', { min: 5 }), true) //字面值轉換後即為5
            assert.strict.deepStrictEqual(isenum('4.999999999999999', { min: 5 }), false)
        })

        it(`max is inclusive`, function() {
            assert.strict.deepStrictEqual(isenum(5, { max: 5 }), true)
            assert.strict.deepStrictEqual(isenum(nextDown(5), { max: 5 }), true)
            assert.strict.deepStrictEqual(isenum(nextUp(5), { max: 5 }), false)
            assert.strict.deepStrictEqual(isenum('5', { max: 5 }), true)
        })

        it(`gt is exclusive (equal end false, slightly larger true, slightly smaller false)`, function() {
            assert.strict.deepStrictEqual(isenum(0, { gt: 0 }), false)
            assert.strict.deepStrictEqual(isenum(-0, { gt: 0 }), false)
            assert.strict.deepStrictEqual(isenum(nextUp(0), { gt: 0 }), true)
            assert.strict.deepStrictEqual(isenum(nextDown(0), { gt: 0 }), false)
            assert.strict.deepStrictEqual(isenum(5, { gt: 5 }), false)
            assert.strict.deepStrictEqual(isenum(nextUp(5), { gt: 5 }), true)
            assert.strict.deepStrictEqual(isenum(nextDown(5), { gt: 5 }), false)
            assert.strict.deepStrictEqual(isenum('5', { gt: 5 }), false)
            assert.strict.deepStrictEqual(isenum('5.0000000000000009', { gt: 5 }), true)
        })

        it(`lt is exclusive (equal end false, slightly smaller true, slightly larger false)`, function() {
            assert.strict.deepStrictEqual(isenum(5, { lt: 5 }), false)
            assert.strict.deepStrictEqual(isenum(nextDown(5), { lt: 5 }), true)
            assert.strict.deepStrictEqual(isenum(nextUp(5), { lt: 5 }), false)
            assert.strict.deepStrictEqual(isenum('5', { lt: 5 }), false)
            assert.strict.deepStrictEqual(isenum(0, { lt: 0 }), false)
            assert.strict.deepStrictEqual(isenum(nextDown(0), { lt: 0 }), true)
        })

        it(`bounds are not limited to safe integers (1e300, 0.001, negative)`, function() {
            assert.strict.deepStrictEqual(isenum(1e300, { max: 1e301 }), true)
            assert.strict.deepStrictEqual(isenum(1e302, { max: 1e301 }), false)
            assert.strict.deepStrictEqual(isenum(0.0005, { min: 0.001 }), false)
            assert.strict.deepStrictEqual(isenum(0.001, { min: 0.001 }), true)
            assert.strict.deepStrictEqual(isenum(-5, { min: -10, max: -1 }), true)
            assert.strict.deepStrictEqual(isenum(-11, { min: -10, max: -1 }), false)
            assert.strict.deepStrictEqual(isenum(Number.MAX_VALUE, { max: Number.MAX_VALUE }), true)
            assert.strict.deepStrictEqual(isenum(-Number.MAX_VALUE, { min: -Number.MAX_VALUE }), true)
        })

        it(`bounds may be numeric strings (converted by Number after trimming)`, function() {
            assert.strict.deepStrictEqual(isenum(5, { min: '5', max: ' 5 ' }), true)
            assert.strict.deepStrictEqual(isenum(6, { min: '5', max: ' 5 ' }), false)
            assert.strict.deepStrictEqual(isenum(5, { gt: '1e-3', lt: '1e3' }), true)
        })

        it(`min/max/gt/lt are intersected`, function() {
            let o = { min: 1, max: 10, gt: 1, lt: 10 }
            assert.strict.deepStrictEqual(isenum(1, o), false)
            assert.strict.deepStrictEqual(isenum(nextUp(1), o), true)
            assert.strict.deepStrictEqual(isenum(nextDown(10), o), true)
            assert.strict.deepStrictEqual(isenum(10, o), false)
            let o2 = { min: 2, gt: 1 } //min較嚴
            assert.strict.deepStrictEqual(isenum(2, o2), true)
            assert.strict.deepStrictEqual(isenum(1.5, o2), false)
            let o3 = { min: 1, gt: 2 } //gt較嚴
            assert.strict.deepStrictEqual(isenum(2, o3), false)
            assert.strict.deepStrictEqual(isenum(nextUp(2), o3), true)
            let o4 = { max: 2, lt: 3 } //max較嚴
            assert.strict.deepStrictEqual(isenum(2, o4), true)
            assert.strict.deepStrictEqual(isenum(2.5, o4), false)
            let o5 = { max: 3, lt: 2 } //lt較嚴
            assert.strict.deepStrictEqual(isenum(2, o5), false)
            assert.strict.deepStrictEqual(isenum(nextDown(2), o5), true)
        })

        it(`a single point range [5, 5] accepts only 5`, function() {
            assert.strict.deepStrictEqual(isenum(5, { min: 5, max: 5 }), true)
            assert.strict.deepStrictEqual(isenum('5.0', { min: 5, max: 5 }), true)
            assert.strict.deepStrictEqual(isenum(nextUp(5), { min: 5, max: 5 }), false)
            assert.strict.deepStrictEqual(isenum(nextDown(5), { min: 5, max: 5 }), false)
        })

        it(`invalid value stays false regardless of range`, function() {
            assert.strict.deepStrictEqual(isenum('abc', { min: 0 }), false)
            assert.strict.deepStrictEqual(isenum(NaN, { min: 0 }), false)
            assert.strict.deepStrictEqual(isenum(Infinity, { min: 0 }), false)
            assert.strict.deepStrictEqual(isenum(Infinity, { max: Number.MAX_VALUE }), false)
            assert.strict.deepStrictEqual(isenum('1e400', { min: 0 }), false)
            assert.strict.deepStrictEqual(isenum('1e-400', { gt: -1 }), false)
        })

    })

    describe(`E6 opt.use (lower bound, upper bound, one step outside each)`, function() {
        //[use, 下界內, 下界外一步, 上界內, 上界外一步] ; null 表無該界
        let tbl = [
            ['positive', nextUp(0), 0, 1e300, null],
            ['nonnegative', 0, nextDown(0), 1e300, null],
            ['timer', 0, nextDown(0), 2147483647, nextUp(2147483647)],
            ['ratio', 0, nextDown(0), 1, nextUp(1)],
            ['percent', 0, nextDown(0), 100, nextUp(100)],
        ]
        for (let [use, lowIn, lowOut, highIn, highOut] of tbl) {
            it(`use '${use}': lower/upper bounds`, function() {
                assert.strict.deepStrictEqual(isenum(lowIn, { use }), true, `lowIn ${lowIn}`)
                assert.strict.deepStrictEqual(isenum(lowOut, { use }), false, `lowOut ${lowOut}`)
                assert.strict.deepStrictEqual(isenum(highIn, { use }), true, `highIn ${highIn}`)
                if (highOut !== null) {
                    assert.strict.deepStrictEqual(isenum(highOut, { use }), false, `highOut ${highOut}`)
                }
                //字串形式相同
                assert.strict.deepStrictEqual(isenum(String(lowIn), { use }), true)
                assert.strict.deepStrictEqual(isenum(String(lowOut), { use }), false)
                assert.strict.deepStrictEqual(isenum(` ${highIn} `, { use }), true)
                if (highOut !== null) {
                    assert.strict.deepStrictEqual(isenum(String(highOut), { use }), false)
                }
            })
        }

        it(`use 'positive': 0, -0, '0', '-0', negatives are false; tiny positives true`, function() {
            for (let v of [0, -0, '0', '-0', '0.0', -1, '-1', -5e-324]) {
                assert.strict.deepStrictEqual(isenum(v, { use: 'positive' }), false, lab(v))
            }
            for (let v of [5e-324, '5e-324', 1e-300, '0.0000001', 1, 1e300]) {
                assert.strict.deepStrictEqual(isenum(v, { use: 'positive' }), true, lab(v))
            }
        })

        it(`use 'nonnegative': -0 and '-0' are accepted`, function() {
            assert.strict.deepStrictEqual(isenum(-0, { use: 'nonnegative' }), true)
            assert.strict.deepStrictEqual(isenum('-0', { use: 'nonnegative' }), true)
            assert.strict.deepStrictEqual(isenum('-0.0e5', { use: 'nonnegative' }), true)
        })

        it(`use 'timer': fractional milliseconds are allowed, huge/overflow values are not`, function() {
            assert.strict.deepStrictEqual(isenum(1.5, { use: 'timer' }), true)
            assert.strict.deepStrictEqual(isenum(2147483647.5, { use: 'timer' }), false)
            assert.strict.deepStrictEqual(isenum(2147483648, { use: 'timer' }), false)
            assert.strict.deepStrictEqual(isenum(2 ** 32 + 5000, { use: 'timer' }), false)
            assert.strict.deepStrictEqual(isenum(1e300, { use: 'timer' }), false)
            assert.strict.deepStrictEqual(isenum(Infinity, { use: 'timer' }), false)
            assert.strict.deepStrictEqual(isenum(-1, { use: 'timer' }), false)
            assert.strict.deepStrictEqual(isenum('2147483647', { use: 'timer' }), true)
            assert.strict.deepStrictEqual(isenum('2147483648', { use: 'timer' }), false)
        })

        it(`use is intersected with min/max/gt/lt`, function() {
            //更嚴者生效
            assert.strict.deepStrictEqual(isenum(0.5, { use: 'ratio', min: 0.6 }), false)
            assert.strict.deepStrictEqual(isenum(0.6, { use: 'ratio', min: 0.6 }), true)
            assert.strict.deepStrictEqual(isenum(0.7, { use: 'ratio', max: 0.6 }), false)
            assert.strict.deepStrictEqual(isenum(0.5, { use: 'ratio', gt: 0.5 }), false)
            assert.strict.deepStrictEqual(isenum(0.5, { use: 'ratio', lt: 0.5 }), false)
            assert.strict.deepStrictEqual(isenum(0.4, { use: 'ratio', lt: 0.5 }), true)
            //較寬者不放寬use
            assert.strict.deepStrictEqual(isenum(1.5, { use: 'ratio', max: 2 }), false)
            assert.strict.deepStrictEqual(isenum(-0.5, { use: 'ratio', min: -1 }), false)
            assert.strict.deepStrictEqual(isenum(0, { use: 'positive', min: -5 }), false)
            assert.strict.deepStrictEqual(isenum(0, { use: 'positive', gt: -5 }), false)
            assert.strict.deepStrictEqual(isenum(3e9, { use: 'timer', max: 1e10 }), false)
            assert.strict.deepStrictEqual(isenum(-1, { use: 'nonnegative', min: -10 }), false)
            //positive(gt 0)與min: 0並用: 仍不含0
            assert.strict.deepStrictEqual(isenum(0, { use: 'positive', min: 0 }), false)
            assert.strict.deepStrictEqual(isenum(1, { use: 'positive', min: 0 }), true)
        })

        it(`empty intersection of use with explicit bounds drops the explicit bounds (range falls back to use)`, function() {
            //dspec 7.1: 範圍為空時相關鍵皆視為未給(use保留), 見E7之等效表
            assert.strict.deepStrictEqual(isenum(5, { use: 'ratio', min: 2 }), false)
            assert.strict.deepStrictEqual(isenum(0.5, { use: 'ratio', min: 2 }), true)
            assert.strict.deepStrictEqual(isenum(-5, { use: 'positive', max: -1 }), false)
            assert.strict.deepStrictEqual(isenum(5, { use: 'positive', max: -1 }), true)
        })

        it(`use null/undefined means not given`, function() {
            assert.strict.deepStrictEqual(isenum(5, { use: null }), true)
            assert.strict.deepStrictEqual(isenum(5, { use: undefined }), true)
            assert.strict.deepStrictEqual(isenum(5, { use: undefined, min: null, max: undefined, gt: null, lt: undefined }), true)
        })

    })

    describe(`E7 unexpected opt is treated as not given (defaults), never throws; E8 no value in warnings`, function() {
        //探測值: 能區分各鍵是否生效(上下界、區間、use各範圍)
        let probes = [5, -5, 0, 0.5, 1, 1.5, 7, 100, 150, 2147483648, 1e300, '7', '0.5', 'abc', '', NaN, Infinity, null, undefined, {}]

        //[說明, 給之opt, 等效之opt(非預期者視為未給後)]
        let noObj = [
            ['opt is a number', 5],
            ['opt is 0', 0],
            ['opt is false', false],
            ['opt is an empty string', ''],
            ['opt is a string', 'ratio'],
            ['opt is true', true],
            ['opt is an array', []],
            ['opt is an array with items', ['ratio']],
            ['opt is a function', function() {}],
            ['opt is a Map', new Map()],
            ['opt is a Date', new Date()],
            ['opt is a class instance', new (class A {})()],
            ['opt inherits use from a non-Object.prototype prototype', Object.create({ use: 'ratio' })],
            ['opt is a Number wrapper', new Number(1)],
            ['opt is a BigInt', 1n],
            ['opt is a Symbol', Symbol('s')],
            //非一般物件但帶有宣告鍵之自有屬性: 仍整份視為{}(不讀其鍵)
            ['opt is an array with own declared keys', Object.assign([], { min: 3, use: 'ratio', debug: true })],
            ['opt is a Map with own declared keys', Object.assign(new Map(), { max: 3 })],
            ['opt is a Date with own declared keys', Object.assign(new Date(), { min: 3 })],
            ['opt is a function with own declared keys', Object.assign(function() {}, { min: 3 })],
            ['opt is a class instance with own declared keys', new (class A {
                constructor() {
                    this.min = 3
                }
            })()],
            ['opt is an object whose prototype is a plain object (own declared keys)', Object.assign(Object.create({}), { min: 3 })],
        ]
        for (let [title, opt] of noObj) {
            it(`should treat opt as {} when ${title}`, function() {
                sameAs(isenum, opt, {}, probes, title)
            })
        }

        it(`should treat opt as {} when opt is a throwing Proxy / revoked Proxy / has a throwing Symbol.toStringTag`, function() {
            let p = new Proxy({ use: 'ratio' }, {
                ownKeys() {
                    throw new Error('trap')
                },
                getPrototypeOf() {
                    throw new Error('trap')
                },
            })
            sameAs(isenum, p, {}, probes, 'proxy')
            let r = Proxy.revocable({ use: 'ratio' }, {})
            r.revoke()
            sameAs(isenum, r.proxy, {}, probes, 'revoked')
            let t = {
                use: 'ratio',
                get [Symbol.toStringTag]() {
                    throw new Error('tag')
                },
            }
            sameAs(isenum, t, {}, probes, 'toStringTag')
        })

        let rows = [
            //未宣告之鍵: 忽略
            ['misspelled key minExlusive', { minExlusive: 1 }, {}],
            ['misspelled key Min', { Min: 1 }, {}],
            ['unknown key beside a valid use', { use: 'ratio', useless: 1 }, { use: 'ratio' }],
            ['unknown key with undefined value', { foo: undefined }, {}],
            ['own __proto__ key (JSON.parse)', JSON.parse('{"__proto__":{"use":"ratio"}}'), {}],
            ['key is not identifier-like', { 'a b': 1 }, {}],
            ['key is too long', { ['a'.repeat(100)]: 1 }, {}],
            //use 非表內之值: 視為未給
            ['use is unknown', { use: 'x' }, {}],
            ['use is an iseint use (port)', { use: 'port' }, {}],
            ['use is safe (iseint default)', { use: 'safe' }, {}],
            ['use is constructor', { use: 'constructor' }, {}],
            ['use is __proto__', { use: '__proto__' }, {}],
            ['use is toString', { use: 'toString' }, {}],
            ['use is hasOwnProperty', { use: 'hasOwnProperty' }, {}],
            ['use is empty string', { use: '' }, {}],
            ['use differs by case', { use: 'Ratio' }, {}],
            ['use has surrounding space', { use: ' ratio ' }, {}],
            ['use is a String object', { use: new String('ratio') }, {}],
            ['use is a number', { use: 1 }, {}],
            ['use is an array', { use: ['ratio'] }, {}],
            ['invalid use keeps other valid keys', { use: 'x', min: 3 }, { min: 3 }],
            //界值非有效數字: 該鍵視為未給
            ['min is a non-numeric string', { min: 'a' }, {}],
            ['min is an empty string', { min: '' }, {}],
            ['min is a marker', { min: '-' }, {}],
            ['min is NaN', { min: NaN }, {}],
            ['min is Infinity', { min: Infinity }, {}],
            ['min is -Infinity', { min: -Infinity }, {}],
            ['min is a BigInt', { min: 1n }, {}],
            ['min is a boolean', { min: true }, {}],
            ['min is a Number object', { min: new Number(1) }, {}],
            ['min is an array', { min: [1] }, {}],
            ['min is hex string', { min: '0x10' }, {}],
            ['max is a non-numeric string', { max: 'a' }, {}],
            ['max is Infinity', { max: Infinity }, {}],
            ['gt is NaN', { gt: NaN }, {}],
            ['gt is a string with underflow', { gt: '1e-400' }, {}],
            ['lt is an object', { lt: {} }, {}],
            ['invalid min keeps valid max', { min: 'a', max: 10 }, { max: 10 }],
            ['invalid max keeps valid min', { max: 'a', min: 2 }, { min: 2 }],
            ['invalid gt keeps valid lt', { gt: NaN, lt: 8 }, { lt: 8 }],
            ['invalid lt keeps valid gt', { lt: 'x', gt: 2 }, { gt: 2 }],
            ['invalid bounds keep a valid use', { use: 'percent', min: 'a', max: {} }, { use: 'percent' }],
            //範圍為空: min、max、gt、lt皆視為未給(use保留)
            ['min > max', { min: 5, max: 4 }, {}],
            ['min > max (strings)', { min: '5', max: '4' }, {}],
            ['gt = lt', { gt: 5, lt: 5 }, {}],
            ['gt > lt', { gt: 6, lt: 5 }, {}],
            ['min = lt', { min: 5, lt: 5 }, {}],
            ['min > lt', { min: 6, lt: 5 }, {}],
            ['gt = max', { gt: 5, max: 5 }, {}],
            ['gt > max', { gt: 6, max: 5 }, {}],
            ['min = max = gt', { min: 5, max: 5, gt: 5 }, {}],
            ['min = max = lt', { min: 5, max: 5, lt: 5 }, {}],
            ['gt = lt = min = max', { gt: 5, lt: 5, min: 5, max: 5 }, {}],
            ['gt, lt adjacent doubles inverted', { gt: nextUp(5), lt: 5 }, {}],
            ['empty bounds drop all four but keep use (ratio)', { use: 'ratio', min: 5, max: 4, gt: 0.1 }, { use: 'ratio' }],
            ['empty bounds drop all four but keep use (timer)', { use: 'timer', gt: 5, lt: 5 }, { use: 'timer' }],
            //與use之交集為空: 同上
            ['ratio with min 2 (empty after use)', { use: 'ratio', min: 2 }, { use: 'ratio' }],
            ['ratio with gt 1 (empty after use)', { use: 'ratio', gt: 1 }, { use: 'ratio' }],
            ['ratio with lt 0 (empty after use)', { use: 'ratio', lt: 0 }, { use: 'ratio' }],
            ['positive with max -1', { use: 'positive', max: -1 }, { use: 'positive' }],
            ['positive with max 0 (gt 0 excludes 0)', { use: 'positive', max: 0 }, { use: 'positive' }],
            ['nonnegative with lt 0', { use: 'nonnegative', lt: 0 }, { use: 'nonnegative' }],
            ['timer with gt over the limit', { use: 'timer', gt: 3e9 }, { use: 'timer' }],
            ['percent with min 100 and gt 100', { use: 'percent', min: 100, gt: 100 }, { use: 'percent' }],
            ['empty-after-use also drops a valid max', { use: 'ratio', min: 2, max: 3 }, { use: 'ratio' }],
            //debug 非布林: 視為false(靜默)
            ['debug is a string', { debug: 'true', use: 'ratio' }, { use: 'ratio' }],
            ['debug is 1', { debug: 1, min: 3 }, { min: 3 }],
            ['funLog is not a function', { funLog: 5, max: 3 }, { max: 3 }],
        ]
        for (let [title, opt, eff] of rows) {
            it(`should behave as ${JSON.stringify(eff)} when ${title}`, function() {
                resetWarned()
                sameAs(isenum, opt, eff, probes, title)
            })
        }

        it(`should treat a throwing getter as not given (and keep the other keys)`, function() {
            let opt = {
                get min() {
                    throw new Error('boom SECRET')
                },
                max: 3,
            }
            sameAs(isenum, opt, { max: 3 }, probes, 'getter')
            let opt2 = {
                get use() {
                    throw new Error('x')
                },
                get debug() {
                    throw new Error('y')
                },
                get funLog() {
                    throw new Error('z')
                },
                min: 3,
            }
            sameAs(isenum, opt2, { min: 3 }, probes, 'getters')
        })

        it(`should be usable as an array callback (index is not an opt)`, function() {
            assert.strict.deepStrictEqual(['1', 'a', '2.5', '', ' 3 ', '0x10', 'Infinity'].filter(isenum), ['1', '2.5', ' 3 '])
            assert.strict.deepStrictEqual([1, 2, 3].every(isenum), true)
            assert.strict.deepStrictEqual([1, 'a', 3].some((v, i, a) => isenum(v, a)), true)
        })

        it(`should never throw for any shape of opt (matrix)`, function() {
            let opts = [undefined, null, 0, 1, '', 'x', true, false, [], [1], {}, { a: 1 }, new Date(), /x/, new Map(), () => 1, Symbol('s'), 1n, Object.create(null), new Proxy({}, {}), { use: Symbol('s') }, { min: Symbol('s') }, {
                min: {
                    valueOf() {
                        throw new Error('x')
                    }
                }
            }, {
                debug: true,
                funLog() {
                    throw new Error('y')
                }
            }]
            for (let o of opts) {
                for (let v of [1, 'a', null, {}, [], 1n, Symbol('v')]) {
                    assert.strict.deepStrictEqual(typeof isenum(v, o), 'boolean')
                }
            }
        })

    })

    describe(`E7b valid opt shapes`, function() {

        it(`opt undefined/null/{} equal no opt`, function() {
            for (let v of [1, '1', 'abc', NaN, null, Infinity, '1e400']) {
                let r0 = isenum(v)
                assert.strict.deepStrictEqual(isenum(v, undefined), r0)
                assert.strict.deepStrictEqual(isenum(v, null), r0)
                assert.strict.deepStrictEqual(isenum(v, {}), r0)
            }
        })

        it(`should accept null-prototype opt`, function() {
            let o = Object.create(null)
            o.use = 'ratio'
            assert.strict.deepStrictEqual(isenum(0.5, o), true)
            assert.strict.deepStrictEqual(isenum(2, o), false)
        })

        it(`should accept a frozen opt and not modify it`, function() {
            let o = Object.freeze({ use: 'ratio', min: 0.2 })
            assert.strict.deepStrictEqual(isenum(0.5, o), true)
            assert.strict.deepStrictEqual(isenum(0.1, o), false)
            assert.strict.deepStrictEqual(o, { use: 'ratio', min: 0.2 })
        })

        it(`should accept a plain object from another realm`, function() {
            let o = vm.runInNewContext('({ use: "ratio" })')
            assert.strict.deepStrictEqual(isenum(0.5, o), true)
            assert.strict.deepStrictEqual(isenum(2, o), false)
            let o2 = vm.runInNewContext('Object.create(null)')
            assert.strict.deepStrictEqual(isenum(2, o2), true)
        })

        it(`should read each key once and be stable over repeated calls`, function() {
            let n = 0
            let opt = {
                get min() {
                    n++
                    return 0
                },
                get max() {
                    n += 10
                    return 10
                },
            }
            assert.strict.deepStrictEqual(isenum(5, opt), true)
            assert.strict.deepStrictEqual(n, 11)
            let o = { use: 'ratio' }
            for (let i = 0; i < 5; i++) {
                assert.strict.deepStrictEqual(isenum(0.5, o), true)
                assert.strict.deepStrictEqual(isenum(1.5, o), false)
            }
            assert.strict.deepStrictEqual(o, { use: 'ratio' })
        })

    })

    describe(`E8 opt.debug warnings (K3): fixed vocabulary, no value, once per process, outlet funLog or console.warn`, function() {
        beforeEach(function() {
            resetWarned()
        })

        it(`should warn per cause with the exact message and info (funLog)`, function() {
            let tbl = [
                [{ minExlusive: 1 }, `[wsemi isenum] invalid opt.minExlusive: unknown option, ignored`, { fn: 'isenum', reason: 'unknown', key: 'minExlusive' }],
                [{ 'a b': 1 }, `[wsemi isenum] invalid opt: unknown option, ignored`, { fn: 'isenum', reason: 'unknown', key: '' }],
                [{ use: 'x' }, `[wsemi isenum] invalid opt.use: must be one of 'positive', 'nonnegative', 'timer', 'ratio', 'percent', ignored`, { fn: 'isenum', reason: 'use', key: 'use' }],
                [{ min: 'a' }, `[wsemi isenum] invalid opt.min: must be a valid number, ignored`, { fn: 'isenum', reason: 'bound', key: 'min' }],
                [{ max: NaN }, `[wsemi isenum] invalid opt.max: must be a valid number, ignored`, { fn: 'isenum', reason: 'bound', key: 'max' }],
                [{ gt: {} }, `[wsemi isenum] invalid opt.gt: must be a valid number, ignored`, { fn: 'isenum', reason: 'bound', key: 'gt' }],
                [{ lt: Infinity }, `[wsemi isenum] invalid opt.lt: must be a valid number, ignored`, { fn: 'isenum', reason: 'bound', key: 'lt' }],
                [{ min: 5, max: 4 }, `[wsemi isenum] invalid opt: range is empty, min/max/gt/lt ignored`, { fn: 'isenum', reason: 'empty', key: '' }],
                [{ use: 'ratio', min: 2 }, `[wsemi isenum] invalid opt: range is empty, min/max/gt/lt ignored`, { fn: 'isenum', reason: 'empty', key: '' }],
                [{
                    get min() {
                        throw new Error('x')
                    }
                }, `[wsemi isenum] invalid opt.min: cannot be read, ignored`, { fn: 'isenum', reason: 'read', key: 'min' }],
            ]
            for (let [opt, msg, info] of tbl) {
                resetWarned()
                let { funLog, logs } = capture()
                let o = Object.defineProperties({}, Object.getOwnPropertyDescriptors(opt)) //保留存取器(不展開以免觸發)
                o.debug = true
                o.funLog = funLog
                let r = isenum(1, o)
                assert.strict.deepStrictEqual(typeof r, 'boolean')
                assert.strict.deepStrictEqual(logs.length, 1, msg)
                assert.strict.deepStrictEqual(logs[0].msg, msg)
                assert.strict.deepStrictEqual(logs[0].info, info)
            }
        })

        it(`should be silent when debug is not exactly true (missing, false, non-boolean) even with funLog`, function() {
            for (let d of [undefined, null, false, 0, 1, 'true', 'yes', {}, [], new Boolean(true)]) {
                let { funLog, logs } = capture()
                let { warns } = stubWarn(() => isenum(1, { debug: d, funLog, minExlusive: 1, use: 'x', min: 'a' }))
                assert.strict.deepStrictEqual(logs, [], `debug=${String(d)}`)
                assert.strict.deepStrictEqual(warns, [], `debug=${String(d)}`)
            }
            let { warns } = stubWarn(() => isenum(1, { minExlusive: 1, use: 'x', min: 'a' }))
            assert.strict.deepStrictEqual(warns, [])
        })

        it(`should not warn for a valid opt even with debug`, function() {
            let { funLog, logs } = capture()
            let { warns } = stubWarn(() => isenum(1, { debug: true, funLog, use: 'ratio', min: 0.1, max: 0.9, gt: 0, lt: 1 }))
            assert.strict.deepStrictEqual(logs, [])
            assert.strict.deepStrictEqual(warns, [])
        })

        it(`should use console.warn when funLog is missing or not a function`, function() {
            for (let f of [undefined, null, 5, 'x', {}]) {
                resetWarned()
                let { warns } = stubWarn(() => isenum(1, { debug: true, funLog: f, min: 'a' }))
                assert.strict.deepStrictEqual(warns, [`[wsemi isenum] invalid opt.min: must be a valid number, ignored`])
            }
        })

        it(`should not use console.warn when funLog is given`, function() {
            let { funLog, logs } = capture()
            let { warns } = stubWarn(() => isenum(1, { debug: true, funLog, min: 'a' }))
            assert.strict.deepStrictEqual(warns, [])
            assert.strict.deepStrictEqual(logs.length, 1)
        })

        it(`should warn once per function, cause and key per process (dedupe)`, function() {
            let { funLog, logs } = capture()
            for (let i = 0; i < 5; i++) {
                isenum(1, { debug: true, funLog, min: 'a' })
            }
            assert.strict.deepStrictEqual(logs.length, 1)
            isenum(1, { debug: true, funLog, max: 'a' }) //另一鍵
            assert.strict.deepStrictEqual(logs.length, 2)
            isenum(1, { debug: true, funLog, use: 'x' }) //另一原因
            assert.strict.deepStrictEqual(logs.length, 3)
            isenum(1, { debug: true, funLog, min: 'b' }) //同鍵同原因, 值不同, 仍視為同一次
            assert.strict.deepStrictEqual(logs.length, 3)
            resetWarned()
            isenum(1, { debug: true, funLog, min: 'a' })
            assert.strict.deepStrictEqual(logs.length, 4)
        })

        it(`should dedupe regardless of the outlet`, function() {
            let { funLog, logs } = capture()
            isenum(1, { debug: true, funLog, min: 'a' })
            let { warns } = stubWarn(() => isenum(1, { debug: true, min: 'a' }))
            assert.strict.deepStrictEqual(logs.length, 1)
            assert.strict.deepStrictEqual(warns, [])
        })

        it(`should keep dedupe independent per function (isenum and iseint)`, function() {
            let { funLog, logs } = capture()
            isenum(1, { debug: true, funLog, min: 'a' })
            iseint(1, { debug: true, funLog, min: 'a' })
            assert.strict.deepStrictEqual(logs.map((x) => x.info.fn), ['isenum', 'iseint'])
        })

        it(`should warn for each cause in key order when several are present`, function() {
            let { funLog, logs } = capture()
            isenum(1, { debug: true, funLog, foo: 1, use: 'x', min: 'a', max: 5, gt: 6 })
            assert.strict.deepStrictEqual(logs.map((x) => x.info.reason + ':' + x.info.key), ['unknown:foo', 'use:use', 'bound:min', 'empty:'])
        })

        it(`should warn even when v is invalid or no value reaches the range check (opt is checked independently of v)`, function() {
            let { funLog, logs } = capture()
            let r = isenum('abc', { debug: true, funLog, min: 'a' })
            assert.strict.deepStrictEqual(r, false)
            assert.strict.deepStrictEqual(logs.length, 1)
        })

        it(`should not warn when opt is not a plain object (debug cannot be read)`, function() {
            let { funLog, logs } = capture()
            let a = Object.assign([], { debug: true, funLog, min: 'a' })
            let { warns } = stubWarn(() => isenum(1, a))
            assert.strict.deepStrictEqual(logs, [])
            assert.strict.deepStrictEqual(warns, [])
        })

        it(`should ignore an outlet that throws and still return the right result`, function() {
            let r = isenum(0.5, {
                debug: true,
                use: 'ratio',
                min: 'a',
                funLog() {
                    throw new Error('outlet SECRET')
                },
            })
            assert.strict.deepStrictEqual(r, true)
            resetWarned()
            let { r: r2 } = stubWarn(() => isenum(0.5, { debug: true, use: 'ratio', min: 'a' }), () => {
                throw new Error('console SECRET')
            })
            assert.strict.deepStrictEqual(r2, true)
        })

        it(`should never put any value into the warnings (message and info)`, function() {
            let secret = 'SECRET-TOKEN-123'
            let { funLog, logs } = capture()
            isenum(1, { 'debug': true, funLog, 'min': secret, 'max': { toString: () => secret }, 'use': secret, [secret]: 1, [secret + 'a'.repeat(100)]: 1, 'gt': 99, 'lt': 1, 'x y': secret })
            assert.strict.deepStrictEqual(logs.length > 0, true)
            for (let { msg, info } of logs) {
                assert.strict.deepStrictEqual(msg.includes('SECRET'), false, msg)
                assert.strict.deepStrictEqual(JSON.stringify(info).includes('SECRET'), false, msg)
                assert.strict.deepStrictEqual(/\d/.test(msg), false, msg) //訊息不含數字(界值、值)
            }
        })

        it(`should cap the number of distinct warnings per process (255 or fewer new ids after reset)`, function() {
            let { funLog, logs } = capture()
            for (let i = 0; i < 400; i++) {
                isenum(1, { debug: true, funLog, ['k' + i]: 1 })
            }
            assert.strict.deepStrictEqual(logs.length, 256)
        })

        it(`should read debug and funLog once each`, function() {
            let n = 0
            let { funLog } = capture()
            isenum(1, {
                get debug() {
                    n++
                    return true
                },
                get funLog() {
                    n += 10
                    return funLog
                },
                min: 'a',
            })
            assert.strict.deepStrictEqual(n, 11)
        })

    })

    describe(`E10 difference from isnum`, function() {
        //isnum為定義上的數字, isenum為對計算有效的數字
        let tbl = [
            [Infinity, true, false],
            [-Infinity, true, false],
            ['Infinity', true, false],
            ['0x10', true, false],
            ['0b11', true, false],
            ['0o7', true, false],
            ['1e400', true, false],
            [new Number(1), true, false],
            ['1e-400', true, false],
            ['1.5', true, true],
            [1.5, true, true],
            ['', false, false],
            ['-', false, false],
        ]
        for (let [v, a, b] of tbl) {
            it(`isnum(${lab(v)}) is ${a}; isenum is ${b}`, function() {
                assert.strict.deepStrictEqual(isnum(v), a)
                assert.strict.deepStrictEqual(isenum(v), b)
            })
        }
    })

    describe(`E11 JSDoc examples`, function() {
        it(`should match the examples in JSDoc`, function() {
            assert.strict.deepStrictEqual(isenum(0), true)
            assert.strict.deepStrictEqual(isenum(' 12 '), true)
            assert.strict.deepStrictEqual(isenum('1.2e-5'), true)
            assert.strict.deepStrictEqual(isenum(Infinity), false)
            assert.strict.deepStrictEqual(isenum('0x10'), false)
            assert.strict.deepStrictEqual(isenum('1e-400'), false)
            assert.strict.deepStrictEqual(isenum(new Number(1)), false)
            assert.strict.deepStrictEqual(isenum('-'), false)
            assert.strict.deepStrictEqual(isenum('0.5', { use: 'ratio' }), true)
            assert.strict.deepStrictEqual(isenum(0, { gt: 0 }), false)
            assert.strict.deepStrictEqual(isenum(1e300, { max: 1e301 }), true)
            assert.strict.deepStrictEqual(isenum(2147483648, { use: 'timer' }), false)
            assert.strict.deepStrictEqual(isenum(2.5, { use: 'positive', max: 10 }), true)
            assert.strict.deepStrictEqual(isenum(5, { min: 'abc' }), true)
            assert.strict.deepStrictEqual(isenum(5, { use: 'ratio', min: 2 }), false)
            assert.strict.deepStrictEqual(['1', 'a', '2.5'].filter(isenum), ['1', '2.5'])
        })

        it(`should document the limitations (③ no tolerance: 0.1 + 0.2 > 0.3)`, function() {
            assert.strict.deepStrictEqual(isenum(0.1 + 0.2, { max: 0.3 }), false)
            assert.strict.deepStrictEqual(isenum(0.1 + 0.2, { max: 0.30000000000000004 }), true)
            //④前導零
            assert.strict.deepStrictEqual(isenum('007'), true)
            //②超過17位有效數字依IEEE 754捨入, 不視為無效
            assert.strict.deepStrictEqual(isenum('0.1234567890123456789012345'), true)
            assert.strict.deepStrictEqual(isenum('1.0000000000000001'), true)
            //①字面值解析時已捨去
            assert.strict.deepStrictEqual(isenum(4503599627370496.5), true)
        })
    })

})
