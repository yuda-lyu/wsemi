/* eslint-disable no-extend-native, no-new-wrappers, no-loss-of-precision -- 測試刻意以包裝物件、暫時汙染原型(finally還原)與解析時失精度之字面值驗證判斷函數 */
import assert from 'assert'
import vm from 'vm'
import iseint from '../src/iseint.mjs'
import isint from '../src/isint.mjs'
import { resetWarned, capture, stubWarn, sameAs } from './tools/numOptKit.mjs'


//規格: 主控dspec〈輸入參數之檢測機制〉§7.1(iseint 判定、opt.use 表、例、〈兩函數共通〉、〈精度之處理〉)、K6(BigInt 與超出安全整數)、§5.3 C2/C11(判斷類、設定拋錯)、§6 V19/V20
//述語編號: I1 true例; I2 false例; I3 永不拋錯且不呼叫被檢測值之方法; I4 字串精度(有效數字比對); I5 快路徑邊界; I6 use 12種; I7 min/max; I8 opt非預期之輸入視為未給(改用預設、不拋錯); I9 opt.debug警告(固定詞彙、不含值、每行程一次); I10 與isint之差異; I11 JSDoc例


const MAX = Number.MAX_SAFE_INTEGER

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


describe(`iseint`, function() {

    describe(`I1 true examples`, function() {
        let ts = [
            0, -0, 1, -1, 125, -125, 8080, 2 ** 31, 2 ** 32, 2 ** 52, 1e15, -1e15, MAX, -MAX, Number.MIN_SAFE_INTEGER,
            4503599627370496.5, //限制①: 字面值解析時已捨去小數, 現值即為整數
            '0', '-0', '+0', '125', '-125', '+125', ' 12 ', '\t12\n', ' 12 ', '﻿12', '00012', '000000000000000',
            '1.0', '12.000', '1.5e1', '1E2', '+1.0e+1', '120e-1', '0.1e1', '.5e1', '5.e0', '1e15', '10e14', '0.0', '0e5', '0.0e999999999999', '-0.0', '-0e-400',
            '9007199254740991', '-9007199254740991', '9007199254740991.0', '90071992547409910e-1', '9007199254740991.000000000000', '0009007199254740991',
            '999999999999999', '+999999999999999', '-999999999999999', '1000000000000000',
        ]
        for (let v of ts) {
            it(`should return true when input ${lab(v)}`, function() {
                assert.strict.deepStrictEqual(iseint(v), true)
            })
        }
    })

    describe(`I2 false examples`, function() {
        let fs_ = [
            1.25, -1.25, 0.5, 1e-300, 5e-324, NaN, Infinity, -Infinity, 2 ** 53, -(2 ** 53), 2 ** 60, 1e21, Number.MAX_VALUE, MAX + 1, -MAX - 1,
            '1.25', '-1.25', '0.5', '1.5', '12e-1', '1e-1', '1e-400', '1e400', '1e21', '1e16', '1.5e-5',
            '9007199254740992', '-9007199254740992', '9007199254740993', '9007199254740991.5', '9007199254740991.0000000001', '10000000000000000',
            '1.0000000000000001', '4503599627370496.5', '4503599627370497.5', '1.00000000000000001', '0.99999999999999999999',
            'Infinity', '-Infinity', 'NaN', '0x10', '0b11', '0o7', '1,234', '1_000', '１２３', '', ' ', '   ', '-', 'NP', 'N/A', 'abc', '12abc', 'e5', '1e', '+', '.', '1 2', '--1', '1.2.3',
            null, undefined, true, false, 10n, 0n, -5n, Symbol('x'), new Number(5), new String('5'), Object(5n),
            [5], [], ['5'], {}, { valueOf: () => 5 }, { toString: () => '5' }, new Date(5), function() {}, () => 5, Object.create(null),
        ]
        for (let v of fs_) {
            it(`should return false when input ${lab(v)}`, function() {
                assert.strict.deepStrictEqual(iseint(v), false)
            })
        }
    })

    describe(`I3 never throws and never calls methods of the tested value`, function() {

        it(`should not call valueOf/toString/Symbol.toPrimitive/getters of objects`, function() {
            let calls = []
            let o = {
                valueOf() {
                    calls.push('valueOf')
                    return 5
                },
                toString() {
                    calls.push('toString')
                    return '5'
                },
                [Symbol.toPrimitive]() {
                    calls.push('toPrimitive')
                    return 5
                },
                get length() {
                    calls.push('length')
                    return 1
                },
            }
            assert.strict.deepStrictEqual(iseint(o), false)
            assert.strict.deepStrictEqual(iseint(o, { use: 'port' }), false)
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
            }
            assert.strict.deepStrictEqual(iseint(o), false)
            assert.strict.deepStrictEqual(iseint(o, { use: 'port' }), false)
        })

        it(`should not touch traps of a Proxy`, function() {
            let traps = []
            let h = new Proxy({}, {
                get(t, k) {
                    traps.push(String(k))
                    throw new Error('trap')
                },
            })
            for (let p of [new Proxy({}, h), new Proxy(function() {}, h), new Proxy([], h)]) {
                assert.strict.deepStrictEqual(iseint(p), false)
                assert.strict.deepStrictEqual(iseint(p, { min: 0 }), false)
            }
            assert.strict.deepStrictEqual(traps, [])
        })

        it(`should return false for a revoked Proxy and another-realm wrapper`, function() {
            let r = Proxy.revocable({}, {})
            r.revoke()
            assert.strict.deepStrictEqual(iseint(r.proxy), false)
            assert.strict.deepStrictEqual(iseint(vm.runInNewContext('new Number(5)')), false)
        })

        it(`should not be affected by a patched Number.prototype / String.prototype`, function() {
            let ov = Number.prototype.valueOf
            let sv = String.prototype.valueOf
            Number.prototype.valueOf = function() {
                return NaN
            }
            String.prototype.valueOf = function() {
                return 'x'
            }
            try {
                assert.strict.deepStrictEqual(iseint(5), true)
                assert.strict.deepStrictEqual(iseint('5'), true)
                assert.strict.deepStrictEqual(iseint('1.5e1'), true)
            }
            finally {
                Number.prototype.valueOf = ov
                String.prototype.valueOf = sv
            }
        })

        it(`should return a boolean for every input without throwing (type matrix)`, function() {
            let vs = [0, '0', '', null, undefined, NaN, {}, [], true, 1n, Symbol('s'), () => 1, new Date(), new Number(1), '9007199254740993']
            for (let v of vs) {
                for (let o of [undefined, null, {}, { use: 'port' }, { min: 0, max: 1 }]) {
                    assert.strict.deepStrictEqual(typeof iseint(v, o), 'boolean')
                }
            }
        })

    })

    describe(`I4 precision of strings (significant digit comparison, Joi extractSignificantDigits)`, function() {
        //[輸入, 預期, 說明]
        let tbl = [
            ['1.0', true, '尾零'],
            ['12.000', true, '尾零'],
            ['1.5e1', true, '指數'],
            ['00012', true, '前導零'],
            ['12e0', true, ''],
            ['1200e-2', true, '指數與尾零'],
            ['0.00012e5', true, '12'],
            ['1.0000000000000001', false, '轉為1, 遺失'],
            ['1.00000000000000001', false, ''],
            ['1.000000000000000', true, '15位小數全零'],
            ['1.0000000000000000', true, '16位小數全零(值不變)'],
            ['4503599627370496.5', false, '2^52+0.5, 轉為4503599627370496'],
            ['4503599627370496.0', true, ''],
            ['9007199254740993', false, '2^53+1, 非安全整數'],
            ['9007199254740991.5', false, '轉為2^53'],
            ['9007199254740991.0000000001', false, '遺失'],
            ['9007199254740991', true, ''],
            ['-9007199254740991', true, ''],
            ['-9007199254740993', false, ''],
            ['1e-400', false, '下溢(isenum 即擋)'],
            ['0.000000000000000000001e21', true, '1'],
            ['123456789012345.6', false, '非整數'],
            ['123456789012345.0', true, '15位整數加.0'],
            ['1234567890123456.0', true, '16位整數加.0'],
            ['12345678901234567', false, '17位整數, 超過安全整數'],
            ['0.30000000000000004', false, '非整數'],
            ['100e-2', true, '1'],
            ['1000000000000000e-15', true, '1'],
            ['1000000000000001e-15', false, '1.000000000000001'],
            ['5e-1', false, '0.5'],
            ['0.1e1', true, '1'],
        ]
        for (let [v, rr, memo] of tbl) {
            it(`should return ${rr} when input ${lab(v)} ${memo}`, function() {
                assert.strict.deepStrictEqual(iseint(v), rr)
            })
        }

        it(`numbers: only Number.isSafeInteger decides (no cdbl/toFinite/toInteger)`, function() {
            for (let v of [2 ** 53, 2 ** 53 + 2, 2 ** 60, 1e21, 1e300, Number.MAX_VALUE, -(2 ** 53), Infinity]) {
                assert.strict.deepStrictEqual(iseint(v), false, lab(v))
            }
            for (let v of [2 ** 53 - 1, -(2 ** 53 - 1), 2 ** 52, 1e15]) {
                assert.strict.deepStrictEqual(iseint(v), true, lab(v))
            }
        })
    })

    describe(`I5 fast path boundary (15-digit pure integer strings)`, function() {
        let tbl = [
            ['999999999999999', true],
            ['-999999999999999', true],
            ['+999999999999999', true],
            ['000000000000000', true],
            ['0000000000000012', true], //16字元, 走慢路徑
            ['1000000000000000', true], //16位, 走慢路徑
            ['9007199254740991', true], //16位, 走慢路徑
            ['9007199254740992', false], //16位, 走慢路徑, 非安全
            ['9007199254740993', false], //16位, 不得因15位快路徑而誤判
            ['-9007199254740993', false],
            ['9999999999999999', false], //16位9, 轉為1e16
            ['+9007199254740991', true],
            ['+1000000000000000', true], //17字元
            ['  999999999999999  ', true], //去空白後走快路徑
            ['\n12\n', true],
        ]
        for (let [v, rr] of tbl) {
            it(`should return ${rr} when input ${lab(v)}`, function() {
                assert.strict.deepStrictEqual(iseint(v), rr)
            })
        }
        it(`fast path result equals slow path semantics for all 1~15 digit strings (sampled)`, function() {
            for (let d = 1; d <= 15; d++) {
                let s = '9'.repeat(d)
                assert.strict.deepStrictEqual(iseint(s), true)
                assert.strict.deepStrictEqual(iseint('-' + s), true)
                assert.strict.deepStrictEqual(iseint(s + '.0'), true)
                assert.strict.deepStrictEqual(iseint(s + '.1'), false)
            }
        })
    })

    describe(`I5b long strings are handled in linear time`, function() {
        it(`should reject/accept long digit strings quickly`, function() {
            let t0 = Date.now()
            assert.strict.deepStrictEqual(iseint('1'.repeat(50000) + 'x'), false)
            assert.strict.deepStrictEqual(iseint('1'.repeat(50000)), false) //轉換後為Infinity
            assert.strict.deepStrictEqual(iseint('0'.repeat(50000) + '5'), true) //前導零
            assert.strict.deepStrictEqual(iseint('5' + '0'.repeat(50000) + 'e-50000'), true) //尾零加指數
            assert.strict.deepStrictEqual(iseint('1.' + '0'.repeat(50000)), true) //小數全零
            assert.strict.deepStrictEqual(iseint('1.' + '0'.repeat(50000) + '1'), false)
            let dt = Date.now() - t0
            assert.strict.deepStrictEqual(dt < 500, true, `elapsed ${dt}ms`)
        })
    })

    describe(`I6 opt.use (12 uses: lower bound, upper bound, one step outside each)`, function() {
        //[use, 下界, 上界]
        let tbl = [
            ['safe', -MAX, MAX],
            ['count', 0, 4294967295],
            ['index', 0, 4294967294],
            ['timer', 0, 2147483647],
            ['port', 1, 65535],
            ['byte', 0, 255],
            ['int32', -2147483648, 2147483647],
            ['uint32', 0, 4294967295],
            ['digits', 0, 100],
            ['radix', 2, 36],
            ['year', 0, 9999],
            ['timestamp', -62167219200000, 253402300799999],
        ]
        for (let [use, lo, hi] of tbl) {
            it(`use '${use}': ${lo} ~ ${hi}`, function() {
                //數字
                assert.strict.deepStrictEqual(iseint(lo, { use }), true, `lo ${lo}`)
                assert.strict.deepStrictEqual(iseint(hi, { use }), true, `hi ${hi}`)
                assert.strict.deepStrictEqual(iseint(lo - 1, { use }), false, `lo-1 ${lo - 1}`)
                assert.strict.deepStrictEqual(iseint(hi + 1, { use }), false, `hi+1 ${hi + 1}`)
                //字串(含頭尾空白、小數零)
                assert.strict.deepStrictEqual(iseint(String(lo), { use }), true)
                assert.strict.deepStrictEqual(iseint(` ${hi} `, { use }), true)
                assert.strict.deepStrictEqual(iseint(`${lo}.0`, { use }), true)
                assert.strict.deepStrictEqual(iseint(String(lo - 1), { use }), false)
                assert.strict.deepStrictEqual(iseint(String(hi + 1), { use }), false)
                //一般判斷: 中間值、非整數、非有效數字
                let mid = Math.floor((lo + hi) / 2)
                assert.strict.deepStrictEqual(iseint(mid, { use }), true)
                assert.strict.deepStrictEqual(iseint(mid + 0.5, { use }), false) //端點+0.5在大數時會被捨入為整數, 故取中間值
                assert.strict.deepStrictEqual(iseint(Infinity, { use }), false)
                assert.strict.deepStrictEqual(iseint(NaN, { use }), false)
                assert.strict.deepStrictEqual(iseint(10n, { use }), false)
                assert.strict.deepStrictEqual(iseint('abc', { use }), false)
                assert.strict.deepStrictEqual(iseint(null, { use }), false)
            })
        }

        it(`use 'safe' (default) equals no opt: lower/upper bounds are safe integers`, function() {
            assert.strict.deepStrictEqual(iseint(MAX, { use: 'safe' }), true)
            assert.strict.deepStrictEqual(iseint(MAX + 1, { use: 'safe' }), false)
            assert.strict.deepStrictEqual(iseint(MAX, {}), true)
            assert.strict.deepStrictEqual(iseint(MAX + 1, {}), false)
            assert.strict.deepStrictEqual(iseint('9007199254740993', { use: 'safe' }), false)
        })

        it(`spec examples`, function() {
            assert.strict.deepStrictEqual(iseint(2147483648, { use: 'timer' }), false)
            assert.strict.deepStrictEqual(iseint(10n), false)
            assert.strict.deepStrictEqual(iseint('8080', { use: 'port' }), true)
            assert.strict.deepStrictEqual(iseint(1, { use: 'timer', min: 1 }), true)
            assert.strict.deepStrictEqual(iseint(0, { use: 'timer', min: 1 }), false)
        })

        it(`use 'port': 0 is excluded; min:0 does not widen it; use 'safe' with min/max can accept 0`, function() {
            assert.strict.deepStrictEqual(iseint(0, { use: 'port' }), false)
            assert.strict.deepStrictEqual(iseint(0, { use: 'port', min: 0 }), false) //取交集
            assert.strict.deepStrictEqual(iseint(0, { use: 'safe', min: 0, max: 65535 }), true)
            assert.strict.deepStrictEqual(iseint(65536, { use: 'safe', min: 0, max: 65535 }), false)
        })

        it(`use 'timer': -0 and '0' are accepted; huge and overflow values are not`, function() {
            assert.strict.deepStrictEqual(iseint(-0, { use: 'timer' }), true)
            assert.strict.deepStrictEqual(iseint('0', { use: 'timer' }), true)
            assert.strict.deepStrictEqual(iseint(2 ** 32 + 5000, { use: 'timer' }), false)
            assert.strict.deepStrictEqual(iseint(1.5, { use: 'timer' }), false) //不要求整數者用isenum
        })

        it(`use 'index' vs 'count' differ by exactly one at the top`, function() {
            assert.strict.deepStrictEqual(iseint(4294967294, { use: 'index' }), true)
            assert.strict.deepStrictEqual(iseint(4294967295, { use: 'index' }), false)
            assert.strict.deepStrictEqual(iseint(4294967295, { use: 'count' }), true)
            assert.strict.deepStrictEqual(iseint(4294967296, { use: 'count' }), false)
        })

        it(`use null/undefined means not given (default safe)`, function() {
            assert.strict.deepStrictEqual(iseint(MAX, { use: null }), true)
            assert.strict.deepStrictEqual(iseint(MAX + 1, { use: undefined }), false)
        })
    })

    describe(`I7 opt.min / opt.max (intersected with use)`, function() {

        it(`min and max are inclusive`, function() {
            assert.strict.deepStrictEqual(iseint(5, { min: 5 }), true)
            assert.strict.deepStrictEqual(iseint(4, { min: 5 }), false)
            assert.strict.deepStrictEqual(iseint(5, { max: 5 }), true)
            assert.strict.deepStrictEqual(iseint(6, { max: 5 }), false)
            assert.strict.deepStrictEqual(iseint('5', { min: 5, max: 5 }), true)
            assert.strict.deepStrictEqual(iseint(-5, { min: -10, max: -1 }), true)
            assert.strict.deepStrictEqual(iseint(0, { min: -10, max: -1 }), false)
        })

        it(`min/max are intersected with use (stricter wins, never widened)`, function() {
            assert.strict.deepStrictEqual(iseint(1023, { use: 'port', min: 1024 }), false)
            assert.strict.deepStrictEqual(iseint(1024, { use: 'port', min: 1024 }), true)
            assert.strict.deepStrictEqual(iseint(8081, { use: 'port', max: 8080 }), false)
            assert.strict.deepStrictEqual(iseint(8080, { use: 'port', max: 8080 }), true)
            assert.strict.deepStrictEqual(iseint(70000, { use: 'port', max: 100000 }), false)
            assert.strict.deepStrictEqual(iseint(-1, { use: 'count', min: -10 }), false)
            assert.strict.deepStrictEqual(iseint(300, { use: 'byte', max: 1000 }), false)
            assert.strict.deepStrictEqual(iseint(MAX, { use: 'safe', max: MAX }), true)
        })

        it(`min/max may be numeric strings (converted by Number after trimming)`, function() {
            assert.strict.deepStrictEqual(iseint(5, { min: '5', max: ' 5 ' }), true)
            assert.strict.deepStrictEqual(iseint(6, { min: '5', max: ' 5 ' }), false)
            assert.strict.deepStrictEqual(iseint(5, { min: '5.0', max: '5e0' }), true)
        })

        it(`min/max may be the safe integer extremes`, function() {
            assert.strict.deepStrictEqual(iseint(MAX, { min: MAX, max: MAX }), true)
            assert.strict.deepStrictEqual(iseint(-MAX, { min: -MAX, max: -MAX }), true)
            assert.strict.deepStrictEqual(iseint(MAX - 1, { min: MAX, max: MAX }), false)
        })

        it(`empty intersection of use with explicit bounds drops the explicit bounds (range falls back to use)`, function() {
            //dspec 7.1: 範圍為空時相關鍵皆視為未給(use保留), 見I8之等效表
            assert.strict.deepStrictEqual(iseint(300, { use: 'byte', min: 300 }), false)
            assert.strict.deepStrictEqual(iseint(200, { use: 'byte', min: 300 }), true)
            assert.strict.deepStrictEqual(iseint(5, { use: 'port', max: 0 }), true)
            assert.strict.deepStrictEqual(iseint(70000, { use: 'port', min: 70000 }), false)
            assert.strict.deepStrictEqual(iseint(8080, { use: 'port', min: 70000 }), true)
        })

        it(`min = max single point range`, function() {
            assert.strict.deepStrictEqual(iseint(7, { min: 7, max: 7 }), true)
            assert.strict.deepStrictEqual(iseint(8, { min: 7, max: 7 }), false)
            assert.strict.deepStrictEqual(iseint(6, { min: 7, max: 7 }), false)
        })

    })

    describe(`I8 unexpected opt is treated as not given (defaults), never throws; I9 no value in warnings`, function() {
        //探測值: 能區分各鍵與各use是否生效
        let probes = [5, -5, 0, 1, 100, 255, 256, 300, 1024, 8080, 65535, 65536, 70000, 2147483647, 2147483648, 4294967296, MAX, MAX + 1, '7', '8080', '300', ' 12 ', '1.0', '9007199254740993', 1.5, 'abc', '', NaN, Infinity, null, undefined, 10n, {}]

        let noObj = [
            ['opt is a number', 5],
            ['opt is 0', 0],
            ['opt is false', false],
            ['opt is an empty string', ''],
            ['opt is a string', 'port'],
            ['opt is true', true],
            ['opt is an array', []],
            ['opt is an array with items', ['port']],
            ['opt is a function', function() {}],
            ['opt is a Map', new Map()],
            ['opt is a Date', new Date()],
            ['opt is a class instance', new (class A {})()],
            ['opt inherits use from a non-Object.prototype prototype', Object.create({ use: 'port' })],
            ['opt is a Number wrapper', new Number(1)],
            ['opt is a BigInt', 1n],
            ['opt is a Symbol', Symbol('s')],
            //非一般物件但帶有宣告鍵之自有屬性: 仍整份視為{}(不讀其鍵)
            ['opt is an array with own declared keys', Object.assign([], { min: 3, use: 'port', debug: true })],
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
                sameAs(iseint, opt, {}, probes, title)
            })
        }

        it(`should treat opt as {} when opt is a throwing Proxy / revoked Proxy / has a throwing Symbol.toStringTag`, function() {
            let p = new Proxy({ use: 'port' }, {
                ownKeys() {
                    throw new Error('trap')
                },
                getPrototypeOf() {
                    throw new Error('trap')
                },
            })
            sameAs(iseint, p, {}, probes, 'proxy')
            let r = Proxy.revocable({ use: 'port' }, {})
            r.revoke()
            sameAs(iseint, r.proxy, {}, probes, 'revoked')
            let t = {
                use: 'port',
                get [Symbol.toStringTag]() {
                    throw new Error('tag')
                },
            }
            sameAs(iseint, t, {}, probes, 'toStringTag')
        })

        let rows = [
            //未宣告之鍵: 忽略(iseint 無 gt、lt)
            ['misspelled key mim', { mim: 1 }, {}],
            ['misspelled key Max', { Max: 1 }, {}],
            ['gt is not declared for iseint', { gt: 100 }, {}],
            ['lt is not declared for iseint', { lt: 5 }, {}],
            ['unknown key beside a valid use', { use: 'port', useless: 1 }, { use: 'port' }],
            ['unknown key with undefined value', { foo: undefined }, {}],
            ['own __proto__ key (JSON.parse)', JSON.parse('{"__proto__":{"use":"port"}}'), {}],
            ['key is not identifier-like', { 'a b': 1 }, {}],
            ['key is too long', { ['a'.repeat(100)]: 1 }, {}],
            //use 非表內之值: 改用預設 'safe'
            ['use is unknown', { use: 'x' }, {}],
            ['use is an isenum use (positive)', { use: 'positive' }, {}],
            ['use is an isenum use (ratio)', { use: 'ratio' }, {}],
            ['use is constructor', { use: 'constructor' }, {}],
            ['use is __proto__', { use: '__proto__' }, {}],
            ['use is toString', { use: 'toString' }, {}],
            ['use is hasOwnProperty', { use: 'hasOwnProperty' }, {}],
            ['use is empty string', { use: '' }, {}],
            ['use differs by case', { use: 'Port' }, {}],
            ['use has surrounding space', { use: ' port ' }, {}],
            ['use is a String object', { use: new String('port') }, {}],
            ['use is a number', { use: 1 }, {}],
            ['use is an array', { use: ['port'] }, {}],
            ['invalid use keeps other valid keys', { use: 'x', min: 3 }, { min: 3 }],
            ['invalid use (isenum use) keeps max', { use: 'positive', max: 10 }, { max: 10 }],
            //min、max 非有效整數(安全整數): 該鍵視為未給
            ['min is not an integer', { min: 1.5 }, {}],
            ['min is a non-numeric string', { min: 'a' }, {}],
            ['min is an empty string', { min: '' }, {}],
            ['min is NaN', { min: NaN }, {}],
            ['min is Infinity', { min: Infinity }, {}],
            ['min is a non-safe integer', { min: 2 ** 53 }, {}],
            ['min is a non-safe integer string', { min: '9007199254740993' }, {}],
            ['min is a negative non-safe integer', { min: -(2 ** 53) }, {}],
            ['min is a BigInt', { min: 1n }, {}],
            ['min is a boolean', { min: true }, {}],
            ['min is a Number object', { min: new Number(1) }, {}],
            ['min is "1.5"', { min: '1.5' }, {}],
            ['min is an imprecise string', { min: '1.0000000000000001' }, {}],
            ['max is not an integer', { max: 2.5 }, {}],
            ['max is a non-safe integer', { max: 1e21 }, {}],
            ['max is an object', { max: {} }, {}],
            ['invalid min keeps valid max', { min: 1.5, max: 10 }, { max: 10 }],
            ['invalid max keeps valid min', { max: 2.5, min: 2 }, { min: 2 }],
            ['invalid bounds keep a valid use', { use: 'port', min: 'a', max: {} }, { use: 'port' }],
            //範圍為空: min、max 皆視為未給(use 保留)
            ['min > max', { min: 5, max: 4 }, {}],
            ['min > max (strings)', { min: '5', max: '4' }, {}],
            ['min > max with use', { use: 'port', min: 100, max: 50 }, { use: 'port' }],
            //與 use 之交集為空: 同上
            ['byte with min 300', { use: 'byte', min: 300 }, { use: 'byte' }],
            ['port with max 0', { use: 'port', max: 0 }, { use: 'port' }],
            ['port with min 70000', { use: 'port', min: 70000 }, { use: 'port' }],
            ['index with max -1', { use: 'index', max: -1 }, { use: 'index' }],
            ['digits with min 101', { use: 'digits', min: 101 }, { use: 'digits' }],
            ['radix with max 1', { use: 'radix', max: 1 }, { use: 'radix' }],
            ['empty-after-use also drops a valid max', { use: 'byte', min: 300, max: 400 }, { use: 'byte' }],
            //debug、funLog 非預期: 靜默
            ['debug is a string', { debug: 'true', use: 'port' }, { use: 'port' }],
            ['funLog is not a function', { funLog: 5, max: 3 }, { max: 3 }],
        ]
        for (let [title, opt, eff] of rows) {
            it(`should behave as ${JSON.stringify(eff)} when ${title}`, function() {
                resetWarned()
                sameAs(iseint, opt, eff, probes, title)
            })
        }

        it(`should treat a throwing getter as not given (and keep the other keys)`, function() {
            let opt = {
                get min() {
                    throw new Error('boom SECRET')
                },
                max: 3,
            }
            sameAs(iseint, opt, { max: 3 }, probes, 'getter')
            let opt2 = {
                get use() {
                    throw new Error('x')
                },
                get debug() {
                    throw new Error('y')
                },
                min: 3,
            }
            sameAs(iseint, opt2, { min: 3 }, probes, 'getters')
        })

        it(`should be usable as an array callback inside a wrapper, and directly (index is not an opt)`, function() {
            assert.strict.deepStrictEqual(['1', '2.5', 'a', '3', '1e21'].filter((v) => iseint(v)), ['1', '3'])
            assert.strict.deepStrictEqual(['1', '2.5', 'a', '3', '1e21'].filter(iseint), ['1', '3'])
            assert.strict.deepStrictEqual([1, 2, 3].every(iseint), true)
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
                for (let v of [1, 'a', null, {}, [], 1n, Symbol('v'), '9007199254740993']) {
                    assert.strict.deepStrictEqual(typeof iseint(v, o), 'boolean')
                }
            }
        })

    })

    describe(`I8b valid opt shapes`, function() {

        it(`opt undefined/null/{} equal no opt`, function() {
            for (let v of [1, '1', 'abc', NaN, null, 1.5, MAX, MAX + 1, '9007199254740993', 10n]) {
                let r0 = iseint(v)
                assert.strict.deepStrictEqual(iseint(v, undefined), r0)
                assert.strict.deepStrictEqual(iseint(v, null), r0)
                assert.strict.deepStrictEqual(iseint(v, {}), r0)
                assert.strict.deepStrictEqual(iseint(v, { use: undefined, min: null, max: undefined }), r0)
            }
        })

        it(`should accept null-prototype opt, frozen opt and another-realm opt`, function() {
            let o = Object.create(null)
            o.use = 'port'
            assert.strict.deepStrictEqual(iseint(80, o), true)
            assert.strict.deepStrictEqual(iseint(0, o), false)
            let f = Object.freeze({ use: 'byte', min: 10 })
            assert.strict.deepStrictEqual(iseint(10, f), true)
            assert.strict.deepStrictEqual(iseint(9, f), false)
            assert.strict.deepStrictEqual(f, { use: 'byte', min: 10 })
            let x = vm.runInNewContext('({ use: "byte" })')
            assert.strict.deepStrictEqual(iseint(255, x), true)
            assert.strict.deepStrictEqual(iseint(256, x), false)
        })

        it(`should read each key once`, function() {
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
            assert.strict.deepStrictEqual(iseint(5, opt), true)
            assert.strict.deepStrictEqual(n, 11)
        })

    })

    describe(`I9 opt.debug warnings (K3): fixed vocabulary, no value, once per process`, function() {
        beforeEach(function() {
            resetWarned()
        })

        it(`should warn per cause with the exact message and info (funLog)`, function() {
            let use = `'safe', 'count', 'index', 'timer', 'port', 'byte', 'int32', 'uint32', 'digits', 'radix', 'year', 'timestamp'`
            let tbl = [
                [{ mim: 1 }, `[wsemi iseint] invalid opt.mim: unknown option, ignored`, { fn: 'iseint', reason: 'unknown', key: 'mim' }],
                [{ gt: 1 }, `[wsemi iseint] invalid opt.gt: unknown option, ignored`, { fn: 'iseint', reason: 'unknown', key: 'gt' }],
                [{ 'a b': 1 }, `[wsemi iseint] invalid opt: unknown option, ignored`, { fn: 'iseint', reason: 'unknown', key: '' }],
                [{ use: 'x' }, `[wsemi iseint] invalid opt.use: must be one of ${use}, using default 'safe'`, { fn: 'iseint', reason: 'use', key: 'use' }],
                [{ use: 'positive' }, `[wsemi iseint] invalid opt.use: must be one of ${use}, using default 'safe'`, { fn: 'iseint', reason: 'use', key: 'use' }],
                [{ min: 1.5 }, `[wsemi iseint] invalid opt.min: must be a safe integer, ignored`, { fn: 'iseint', reason: 'bound', key: 'min' }],
                [{ max: 'a' }, `[wsemi iseint] invalid opt.max: must be a safe integer, ignored`, { fn: 'iseint', reason: 'bound', key: 'max' }],
                [{ min: 5, max: 4 }, `[wsemi iseint] invalid opt: range is empty, min/max ignored`, { fn: 'iseint', reason: 'empty', key: '' }],
                [{ use: 'byte', min: 300 }, `[wsemi iseint] invalid opt: range is empty, min/max ignored`, { fn: 'iseint', reason: 'empty', key: '' }],
                [{
                    get min() {
                        throw new Error('x')
                    }
                }, `[wsemi iseint] invalid opt.min: cannot be read, ignored`, { fn: 'iseint', reason: 'read', key: 'min' }],
            ]
            for (let [opt, msg, info] of tbl) {
                resetWarned()
                let { funLog, logs } = capture()
                let o = Object.defineProperties({}, Object.getOwnPropertyDescriptors(opt))
                o.debug = true
                o.funLog = funLog
                let r = iseint(1, o)
                assert.strict.deepStrictEqual(typeof r, 'boolean')
                assert.strict.deepStrictEqual(logs.length, 1, msg)
                assert.strict.deepStrictEqual(logs[0].msg, msg)
                assert.strict.deepStrictEqual(logs[0].info, info)
            }
        })

        it(`should be silent when debug is not exactly true`, function() {
            for (let d of [undefined, null, false, 0, 1, 'true', {}, [], new Boolean(true)]) {
                let { funLog, logs } = capture()
                let { warns } = stubWarn(() => iseint(1, { debug: d, funLog, mim: 1, use: 'x', min: 1.5 }))
                assert.strict.deepStrictEqual(logs, [], `debug=${String(d)}`)
                assert.strict.deepStrictEqual(warns, [], `debug=${String(d)}`)
            }
        })

        it(`should not warn for a valid opt even with debug`, function() {
            let { funLog, logs } = capture()
            let { warns } = stubWarn(() => iseint(1, { debug: true, funLog, use: 'port', min: 1, max: 100 }))
            assert.strict.deepStrictEqual(logs, [])
            assert.strict.deepStrictEqual(warns, [])
        })

        it(`should use console.warn when funLog is missing and dedupe per process`, function() {
            let { warns } = stubWarn(() => {
                iseint(1, { debug: true, min: 1.5 })
                iseint(1, { debug: true, min: 2.5 })
                iseint(1, { debug: true, max: 1.5 })
            })
            assert.strict.deepStrictEqual(warns, [`[wsemi iseint] invalid opt.min: must be a safe integer, ignored`, `[wsemi iseint] invalid opt.max: must be a safe integer, ignored`])
        })

        it(`should warn even when v is invalid (opt is checked independently of v)`, function() {
            let { funLog, logs } = capture()
            let r = iseint('abc', { debug: true, funLog, min: 1.5 })
            assert.strict.deepStrictEqual(r, false)
            assert.strict.deepStrictEqual(logs.length, 1)
            assert.strict.deepStrictEqual(logs[0].info.reason, 'bound')
        })

        it(`should ignore an outlet that throws and still return the right result`, function() {
            let r = iseint(80, {
                debug: true,
                use: 'port',
                min: 'a',
                funLog() {
                    throw new Error('outlet SECRET')
                },
            })
            assert.strict.deepStrictEqual(r, true)
        })

        it(`should never put any value into the warnings (message and info)`, function() {
            let secret = 'SECRET-TOKEN-123'
            let { funLog, logs } = capture()
            iseint(1, { debug: true, funLog, min: secret, max: { toString: () => secret }, use: secret, [secret]: 1, [secret + 'a'.repeat(100)]: 1 })
            assert.strict.deepStrictEqual(logs.length > 0, true)
            for (let { msg, info } of logs) {
                assert.strict.deepStrictEqual(msg.includes('SECRET'), false, msg)
                assert.strict.deepStrictEqual(JSON.stringify(info).includes('SECRET'), false, msg)
            }
        })

    })

    describe(`I10 difference from isint`, function() {
        let tbl = [
            [Infinity, true, false],
            [-Infinity, true, false],
            ['Infinity', true, false],
            ['0x10', true, false],
            [2 ** 60, true, false],
            [1e21, true, false],
            [new Number(5), true, false],
            ['1e400', true, false],
            ['9007199254740993', true, false],
            [125, true, true],
            ['125', true, true],
            [1.25, false, false],
            ['-', false, false],
        ]
        for (let [v, a, b] of tbl) {
            it(`isint(${lab(v)}) is ${a}; iseint is ${b}`, function() {
                assert.strict.deepStrictEqual(isint(v), a)
                assert.strict.deepStrictEqual(iseint(v), b)
            })
        }
    })

    describe(`I11 JSDoc examples`, function() {
        it(`should match the examples in JSDoc`, function() {
            assert.strict.deepStrictEqual(iseint(125), true)
            assert.strict.deepStrictEqual(iseint('125'), true)
            assert.strict.deepStrictEqual(iseint(' 12 '), true)
            assert.strict.deepStrictEqual(iseint('1.0'), true)
            assert.strict.deepStrictEqual(iseint('1.5e1'), true)
            assert.strict.deepStrictEqual(iseint(1.25), false)
            assert.strict.deepStrictEqual(iseint(Infinity), false)
            assert.strict.deepStrictEqual(iseint(10n), false)
            assert.strict.deepStrictEqual(iseint('9007199254740993'), false)
            assert.strict.deepStrictEqual(iseint('1.0000000000000001'), false)
            assert.strict.deepStrictEqual(iseint('8080', { use: 'port' }), true)
            assert.strict.deepStrictEqual(iseint(0, { use: 'port' }), false)
            assert.strict.deepStrictEqual(iseint(2147483648, { use: 'timer' }), false)
            assert.strict.deepStrictEqual(iseint(1, { use: 'timer', min: 1 }), true)
            assert.strict.deepStrictEqual(iseint(4294967294, { use: 'index' }), true)
            assert.strict.deepStrictEqual(iseint(4294967295, { use: 'index' }), false)
            assert.strict.deepStrictEqual(iseint(5, { use: 'abc' }), true)
            assert.strict.deepStrictEqual(iseint(5, { use: 'byte', min: 300 }), true)
            assert.strict.deepStrictEqual(['1', '2.5', 'a', '3'].filter((v) => iseint(v)), ['1', '3'])
        })
    })

})
