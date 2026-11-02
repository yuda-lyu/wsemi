import assert from 'assert'
import bufWrite from '../src/bufWrite.mjs'
import bufRead from '../src/bufRead.mjs'
import bufWriteDbl from '../src/bufWriteDbl.mjs'
import bufReadDbl from '../src/bufReadDbl.mjs'


//bufWrite/bufRead之IEEE754編碼(ws272b; 使用者2026-11-02定A: value照IEEE754原樣編碼; ws270回報: eLen大於30位移溢位)
//  規格: dspec〈輸入參數之檢測機制〉§11「bufWrite之value」: number型別照原樣編碼(±Infinity、NaN寫出正確位元樣式, 與Node之Buffer.writeFloatLE/writeDoubleLE一致), 字串只收十進位(isenum, '0x10'不收), 成功回true、失敗回null
//  標準浮點: (mLen 23, nBytes 4)為單精度, (mLen 52, nBytes 8)為雙精度; 以Node之Buffer為獨立對照(原生IEEE754寫讀), 非自家輸出之快照


const hex = (b) => Buffer.from(b).toString('hex')

//與Node之Buffer寫入結果逐位元組比對用之標準值集合: 含±0、±Infinity、NaN、次正規數、最大最小有限值
const VALUES = [
    0, -0, 1, -1, 0.5, 1.5, -2.5, 3.14159, 0.1, 0.2, 0.3, 1447656645380,
    Infinity, -Infinity, NaN,
    Number.MAX_VALUE, -Number.MAX_VALUE, Number.MIN_VALUE, -Number.MIN_VALUE, Number.EPSILON,
    Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER,
    2.2250738585072014e-308, 2.225073858507201e-308, 1e-300, 1e300,
    //單精度邊界: 最大有限、溢位為Infinity、最小正規、最小次正規、次正規邊界、比最小次正規小一半(捨入至偶數)
    3.4028234663852886e38, 3.4028235677973366e38, 1e39, -1e39, 1.1754943508222875e-38, 1.401298464324817e-45, 7e-46, 1e-45, 2e-45,
    //單精度捨入: 恰在兩可表示值正中間(捨入至偶數)與其鄰近
    16777216, 16777217, 16777218, 16777219, 33554435, 1 + Math.pow(2, -24), 1 + Math.pow(2, -24) + Math.pow(2, -40), 1 + 3 * Math.pow(2, -24),
]

const label = (v) => (Object.is(v, -0) ? '-0' : String(v))

//nextUp, 雙精度之下一個可表示值(以BigUint64位元運算, 與被測碼無關)
function nextUp(x) {
    let b = Buffer.alloc(8)
    b.writeDoubleBE(x)
    let n = b.readBigUInt64BE(0)
    if (x === 0) {
        return Number.MIN_VALUE
    }
    n = x > 0 ? n + 1n : n - 1n
    b.writeBigUInt64BE(n)
    return b.readDoubleBE(0)
}

//refEncode, 獨立之參考編碼器(BigInt): 對「恰可表示」之正規數v(有限、非零, 尾數位數不超過mLen)編碼為nBytes位元組(大端), 供非標準(mLen, nBytes)之位元樣式核對
function refEncode(v, mLen, nBytes) {
    let eLen = BigInt(nBytes * 8 - mLen - 1)
    let bias = (1n << (eLen - 1n)) - 1n
    let sign = v < 0 ? 1n : 0n
    let a = Math.abs(v)
    let e = 0
    while (a >= 2) {
        a /= 2
        e++
    }
    while (a < 1) {
        a *= 2
        e--
    }
    //a在[1,2), 小數部分乘以2^mLen須為整數
    let frac = BigInt(Math.round((a - 1) * Math.pow(2, 30))) //先取30位元, 以BigInt補足至mLen位(測試值之小數位數不超過30)
    let m = mLen >= 30 ? frac << BigInt(mLen - 30) : frac >> BigInt(30 - mLen)
    let bits = (sign << BigInt(nBytes * 8 - 1)) | ((BigInt(e) + bias) << BigInt(mLen)) | m
    let out = Buffer.alloc(nBytes)
    for (let i = nBytes - 1; i >= 0; i--) {
        out[i] = Number(bits & 0xffn)
        bits >>= 8n
    }
    return out
}


describe(`bufWrite/bufRead IEEE754`, function() {

    describe(`standard double (mLen 52, nBytes 8) written bytes equal Node Buffer.writeDouble*`, function() {
        for (let v of VALUES) {
            for (let isBE of [true, false]) {
                it(`should write the same bytes as Node when value ${label(v)}, ${isBE ? 'BE' : 'LE'}`, function() {
                    let nb = Buffer.alloc(8)
                    if (isBE) {
                        nb.writeDoubleBE(v)
                    }
                    else {
                        nb.writeDoubleLE(v)
                    }
                    let b = Buffer.alloc(8)
                    let ret = bufWrite(v, b, 0, isBE, 52, 8)
                    assert.strict.deepStrictEqual(ret, true)
                    assert.strict.deepStrictEqual(hex(b), hex(nb))
                })
            }
        }
    })

    describe(`standard float (mLen 23, nBytes 4) written bytes equal Node Buffer.writeFloat*`, function() {
        for (let v of VALUES) {
            for (let isBE of [true, false]) {
                it(`should write the same bytes as Node when value ${label(v)}, ${isBE ? 'BE' : 'LE'}`, function() {
                    let nb = Buffer.alloc(4)
                    if (isBE) {
                        nb.writeFloatBE(v)
                    }
                    else {
                        nb.writeFloatLE(v)
                    }
                    let b = Buffer.alloc(4)
                    let ret = bufWrite(v, b, 0, isBE, 23, 4)
                    assert.strict.deepStrictEqual(ret, true)
                    assert.strict.deepStrictEqual(hex(b), hex(nb))
                })
            }
        }
    })

    describe(`standard read equals Node Buffer.read*`, function() {
        for (let v of VALUES) {
            for (let isBE of [true, false]) {
                it(`should read the same value as Node (double) when value ${label(v)}, ${isBE ? 'BE' : 'LE'}`, function() {
                    let nb = Buffer.alloc(8)
                    if (isBE) {
                        nb.writeDoubleBE(v)
                    }
                    else {
                        nb.writeDoubleLE(v)
                    }
                    let exp = isBE ? nb.readDoubleBE(0) : nb.readDoubleLE(0)
                    let r = bufRead(nb, 0, isBE, 52, 8)
                    assert.ok(Object.is(r, exp) || (Number.isNaN(r) && Number.isNaN(exp)), `${r} vs ${exp}`)
                })
                it(`should read the same value as Node (float) when value ${label(v)}, ${isBE ? 'BE' : 'LE'}`, function() {
                    let nb = Buffer.alloc(4)
                    if (isBE) {
                        nb.writeFloatBE(v)
                    }
                    else {
                        nb.writeFloatLE(v)
                    }
                    let exp = isBE ? nb.readFloatBE(0) : nb.readFloatLE(0)
                    let r = bufRead(nb, 0, isBE, 23, 4)
                    assert.ok(Object.is(r, exp) || (Number.isNaN(r) && Number.isNaN(exp)), `${r} vs ${exp}`)
                })
            }
        }
    })

    describe(`bit patterns of the special values`, function() {
        let cases = [
            ['Infinity', Infinity, '7ff0000000000000', '7f800000'],
            ['-Infinity', -Infinity, 'fff0000000000000', 'ff800000'],
            ['NaN (quiet NaN)', NaN, '7ff8000000000000', '7fc00000'],
            ['-0', -0, '8000000000000000', '80000000'],
            ['0', 0, '0000000000000000', '00000000'],
            ['Number.MIN_VALUE (smallest subnormal)', Number.MIN_VALUE, '0000000000000001', '00000000'],
            ['Number.MAX_VALUE (largest finite)', Number.MAX_VALUE, '7fefffffffffffff', '7f800000'],
            ['1', 1, '3ff0000000000000', '3f800000'],
        ]
        for (let [name, v, dbl, flt] of cases) {
            it(`should write ${name} as double ${dbl} (BE) and float ${flt} (BE)`, function() {
                let b8 = Buffer.alloc(8)
                assert.strict.deepStrictEqual(bufWrite(v, b8, 0, true, 52, 8), true)
                assert.strict.deepStrictEqual(hex(b8), dbl)
                let b4 = Buffer.alloc(4)
                assert.strict.deepStrictEqual(bufWrite(v, b4, 0, true, 23, 4), true)
                assert.strict.deepStrictEqual(hex(b4), flt)
            })
        }
        it(`should write Infinity as 7ff0000000000000, not as Number.MAX_VALUE (7fefffffffffffff), formerly via cdbl`, function() {
            let b = Buffer.alloc(8)
            bufWrite(Infinity, b, 0, true, 52, 8)
            assert.notStrictEqual(hex(b), '7fefffffffffffff')
            assert.strict.deepStrictEqual(hex(b), '7ff0000000000000')
            assert.strict.deepStrictEqual(bufRead(b, 0, true, 52, 8), Infinity)
        })
        it(`should write NaN so that it reads back as NaN (formerly NaN was not written at all)`, function() {
            let b = Buffer.alloc(8)
            assert.strict.deepStrictEqual(bufWrite(NaN, b, 0, true, 52, 8), true)
            assert.ok(Number.isNaN(bufRead(b, 0, true, 52, 8)))
            let b4 = Buffer.alloc(4)
            assert.strict.deepStrictEqual(bufWrite(NaN, b4, 0, false, 23, 4), true)
            assert.ok(Number.isNaN(bufRead(b4, 0, false, 23, 4)))
        })
        it(`should write -0 so that it reads back as -0 (sign kept)`, function() {
            let b = Buffer.alloc(8)
            bufWrite(-0, b, 0, true, 52, 8)
            assert.ok(Object.is(bufRead(b, 0, true, 52, 8), -0))
        })
    })

    describe(`sweeps around the powers of two (normal/subnormal boundaries) equal Node`, function() {
        it(`should equal Node for 2^k and its neighbours for double, k from -1080 to 1030 (12k+ values)`, function() {
            let n = 0
            for (let k = -1080; k <= 1030; k++) {
                let p = Math.pow(2, k)
                for (let v of [p, nextUp(p), -nextUp(-p), -p, -nextUp(p), nextUp(-p)]) {
                    if (!Number.isFinite(v)) {
                        continue
                    }
                    n++
                    let nb = Buffer.alloc(8)
                    nb.writeDoubleLE(v)
                    let b = Buffer.alloc(8)
                    bufWrite(v, b, 0, false, 52, 8)
                    assert.strict.deepStrictEqual(hex(b), hex(nb), `write ${v}`)
                    assert.ok(Object.is(bufRead(nb, 0, false, 52, 8), v), `read ${v}`)
                }
            }
            assert.ok(n > 12000)
        })

        it(`should equal Node for the float32 boundaries, ties and their neighbours, k from -155 to 130`, function() {
            let n = 0
            for (let k = -155; k <= 130; k++) {
                let p = Math.pow(2, k)
                let ulp = Math.pow(2, Math.max(k, -126) - 23)
                for (let v0 of [p, p - ulp / 2, p + ulp / 2, p - ulp / 4, p + ulp / 4, p + ulp * 1.5, p + ulp * 0.5000001, p + ulp * 2.5, Math.fround(p) * 1.0000001]) {
                    for (let v of [v0, -v0]) {
                        n++
                        let nb = Buffer.alloc(4)
                        nb.writeFloatBE(v)
                        let b = Buffer.alloc(4)
                        bufWrite(v, b, 0, true, 23, 4)
                        assert.strict.deepStrictEqual(hex(b), hex(nb), `write ${v}`)
                        assert.ok(Object.is(bufRead(nb, 0, true, 23, 4), nb.readFloatBE(0)), `read ${v}`)
                    }
                }
            }
            assert.ok(n > 5000)
        })

        it(`should equal Node for 20000 pseudo-random doubles and floats (fixed LCG seed) and read back`, function() {
            let s = 12345
            let rnd = () => {
                s = (s * 1103515245 + 12345) % 2147483648
                return s / 2147483648
            }
            for (let i = 0; i < 20000; i++) {
                let sign = rnd() < 0.5 ? -1 : 1
                let v = sign * Math.pow(2, Math.floor(rnd() * 2100 - 1075)) * (1 + rnd())
                let nb = Buffer.alloc(8)
                nb.writeDoubleBE(v)
                let b = Buffer.alloc(8)
                bufWrite(v, b, 0, true, 52, 8)
                assert.strict.deepStrictEqual(hex(b), hex(nb), `double ${v}`)
                assert.ok(Object.is(bufRead(b, 0, true, 52, 8), nb.readDoubleBE(0)), `read double ${v}`)
                let w = sign * Math.pow(2, Math.floor(rnd() * 300 - 150)) * (1 + rnd())
                let nf = Buffer.alloc(4)
                nf.writeFloatLE(w)
                let f = Buffer.alloc(4)
                bufWrite(w, f, 0, false, 23, 4)
                assert.strict.deepStrictEqual(hex(f), hex(nf), `float ${w}`)
                assert.ok(Object.is(bufRead(f, 0, false, 23, 4), nf.readFloatLE(0)), `read float ${w}`)
            }
        })

        it(`should read 20000 pseudo-random float32 bit patterns (including NaN and subnormal) equal to Node`, function() {
            let s = 777
            let rnd = () => {
                s = (s * 1103515245 + 12345) % 2147483648
                return s
            }
            for (let i = 0; i < 20000; i++) {
                let u = ((rnd() << 1) ^ rnd()) >>> 0
                let nb = Buffer.alloc(4)
                nb.writeUInt32BE(u)
                let exp = nb.readFloatBE(0)
                let r = bufRead(nb, 0, true, 23, 4)
                assert.ok(Object.is(r, exp) || (Number.isNaN(r) && Number.isNaN(exp)), `${u.toString(16)}: ${r} vs ${exp}`)
            }
        })
    })

    //ws270回報: eLen = nBytes * 8 - mLen - 1 大於30時 (1 << eLen) 位移溢位而數值失真, 回null
    describe(`exponent bit count eLen = nBytes * 8 - mLen - 1 (ws270 report: eLen above 30 overflows the 32-bit shift)`, function() {

        it(`bufRead should return null for (mLen 1, nBytes 8) (eLen 62)`, function() {
            let b = Buffer.alloc(8)
            b.writeDoubleBE(1.5)
            assert.strict.deepStrictEqual(bufRead(b, 0, true, 1, 8), null)
        })

        it(`bufWrite should return null and write nothing for (mLen 1, nBytes 8) (eLen 62)`, function() {
            let b = Buffer.alloc(8, 0xaa)
            assert.strict.deepStrictEqual(bufWrite(1.5, b, 0, true, 1, 8), null)
            assert.strict.deepStrictEqual(hex(b), 'aaaaaaaaaaaaaaaa')
        })

        for (let [mLen, nBytes] of [[1, 8], [2, 8], [10, 8], [20, 8], [31, 8], [32, 8], [1, 5], [7, 5], [8, 5]]) {
            let eLen = nBytes * 8 - mLen - 1
            it(`eLen ${eLen} (mLen ${mLen}, nBytes ${nBytes}) should be null for both bufRead and bufWrite`, function() {
                assert.ok(eLen > 30)
                let b = Buffer.alloc(8, 0x55)
                assert.strict.deepStrictEqual(bufWrite(1.5, b, 0, true, mLen, nBytes), null)
                assert.strict.deepStrictEqual(hex(b), '5555555555555555')
                assert.strict.deepStrictEqual(bufRead(b, 0, true, mLen, nBytes), null)
            })
        }

        for (let [mLen, nBytes] of [[33, 8], [34, 8], [35, 8], [40, 8], [52, 8], [52, 7], [23, 4], [10, 4], [3, 2], [10, 2], [10, 3], [20, 5], [10, 5], [11, 5]]) {
            let eLen = nBytes * 8 - mLen - 1
            it(`eLen ${eLen} (mLen ${mLen}, nBytes ${nBytes}) should be usable: written values read back equal, BE and LE`, function() {
                assert.ok(eLen >= 1 && eLen <= 30)
                for (let isBE of [true, false]) {
                    //值皆在最小指數範圍(eLen 3時約0.25~16)內
                    for (let v of [0, 1, -1, 1.5, -2.25, 0.375, 3, Infinity, -Infinity]) {
                        let b = Buffer.alloc(8)
                        assert.strict.deepStrictEqual(bufWrite(v, b, 0, isBE, mLen, nBytes), true)
                        let r = bufRead(b, 0, isBE, mLen, nBytes)
                        assert.ok(Object.is(r, v) || (v === 0 && r === 0), `eLen ${eLen} ${v} -> ${r}`)
                    }
                    let b = Buffer.alloc(8)
                    assert.strict.deepStrictEqual(bufWrite(NaN, b, 0, isBE, mLen, nBytes), true)
                    assert.ok(Number.isNaN(bufRead(b, 0, isBE, mLen, nBytes)))
                }
            })
        }

        //eLen為30之邊界: (mLen 33, nBytes 8)寫入位元樣式與獨立參考編碼器(BigInt)一致; 31則為null
        it(`eLen 30 (mLen 33, nBytes 8) should write the bit pattern of an independent BigInt reference, eLen 31 (mLen 32, nBytes 8) should be null`, function() {
            for (let v of [1, 1.5, -2.25, 0.375, 3, 1024.5, 6.5, -0.0625]) {
                let b = Buffer.alloc(8)
                assert.strict.deepStrictEqual(bufWrite(v, b, 0, true, 33, 8), true)
                assert.strict.deepStrictEqual(hex(b), hex(refEncode(v, 33, 8)), `value ${v}`)
                assert.ok(Object.is(bufRead(refEncode(v, 33, 8), 0, true, 33, 8), v))
            }
            assert.strict.deepStrictEqual(bufWrite(1.5, Buffer.alloc(8), 0, true, 32, 8), null)
            assert.strict.deepStrictEqual(bufRead(Buffer.alloc(8), 0, true, 32, 8), null)
        })

        it(`non-standard sizes should equal the independent BigInt reference encoder (BE) and read back`, function() {
            for (let [mLen, nBytes] of [[33, 8], [34, 8], [36, 8], [23, 4], [10, 3], [4, 2], [12, 3]]) {
                for (let v of [1, 1.5, -2.25, 0.375, 3, 6.5, -0.0625, 1.75]) {
                    let b = Buffer.alloc(nBytes)
                    assert.strict.deepStrictEqual(bufWrite(v, b, 0, true, mLen, nBytes), true)
                    assert.strict.deepStrictEqual(hex(b), hex(refEncode(v, mLen, nBytes)), `(${mLen},${nBytes}) value ${v}`)
                    assert.ok(Object.is(bufRead(b, 0, true, mLen, nBytes), v), `(${mLen},${nBytes}) read ${v}`)
                }
            }
        })

        it(`mLen >= nBytes * 8 - 1 (no bit left for the exponent) should be null`, function() {
            for (let [mLen, nBytes] of [[63, 8], [64, 8], [31, 4], [32, 4], [7, 1], [8, 1]]) {
                assert.strict.deepStrictEqual(bufWrite(1, Buffer.alloc(8), 0, true, mLen, nBytes), null)
                assert.strict.deepStrictEqual(bufRead(Buffer.alloc(8), 0, true, mLen, nBytes), null)
            }
        })

    })

    describe(`bufWrite return value and value acceptance (user decision 2026-11-02: success true, failure null)`, function() {

        it(`should return true on success and write the bytes`, function() {
            let b = Buffer.alloc(8)
            let ret = bufWrite(1447656645380, b, 0, true, 52, 8)
            assert.strict.deepStrictEqual(ret, true)
            assert.strict.deepStrictEqual(Array.from(b), [66, 117, 16, 240, 246, 48, 64, 0])
        })

        it(`should accept decimal numeric strings and write the same bytes as the number (value used is the converted one)`, function() {
            for (let [s, n] of [['1.25', 1.25], [' 1.25 ', 1.25], ['-3', -3], ['1e2', 100], ['.5', 0.5], ['+5.', 5], ['00012', 12], ['1.2e-5', 1.2e-5]]) {
                let b1 = Buffer.alloc(8)
                let b2 = Buffer.alloc(8)
                assert.strict.deepStrictEqual(bufWrite(s, b1, 0, true, 52, 8), true)
                assert.strict.deepStrictEqual(bufWrite(n, b2, 0, true, 52, 8), true)
                assert.strict.deepStrictEqual(hex(b1), hex(b2), `'${s}'`)
            }
        })

        //value無效 -> null且不寫入
        let INVALID_VALUE = [
            [`'0x10'`, '0x10'],
            [`'0b11'`, '0b11'],
            [`'0o7'`, '0o7'],
            [`'Infinity'`, 'Infinity'],
            [`'-Infinity'`, '-Infinity'],
            [`'NaN'`, 'NaN'],
            [`'1e400'`, '1e400'],
            [`''`, ''],
            [`'   '`, '   '],
            [`'-'`, '-'],
            [`'NP'`, 'NP'],
            [`'abc'`, 'abc'],
            [`'1,234'`, '1,234'],
            ['null', null],
            ['undefined', undefined],
            ['true', true],
            ['false', false],
            ['[]', []],
            ['[1]', [1]],
            ['{}', {}],
            ['new Number(1)', new Number(1)], // eslint-disable-line no-new-wrappers
            ['1n', 1n],
            ['Symbol()', Symbol('x')],
            ['() => 1', () => 1],
        ]
        for (let [lab, v] of INVALID_VALUE) {
            it(`should return null and leave the buffer untouched when value is ${lab}`, function() {
                let b = Buffer.alloc(8, 0xaa)
                let ret
                assert.doesNotThrow(() => {
                    ret = bufWrite(v, b, 0, true, 52, 8)
                })
                assert.strict.deepStrictEqual(ret, null)
                assert.strict.deepStrictEqual(hex(b), 'aaaaaaaaaaaaaaaa')
            })
        }

        //其餘參數無效 -> null且不寫入
        let INVALID_BUFFER = [['null', null], ['undefined', undefined], ['[]', []], ['{}', {}], ['string', 'abc'], ['number', 5], ['Uint16Array', new Uint16Array(8)], ['ArrayBuffer', new ArrayBuffer(8)]]
        for (let [lab, buf] of INVALID_BUFFER) {
            it(`should return null when buffer is ${lab}`, function() {
                assert.strict.deepStrictEqual(bufWrite(1.5, buf, 0, true, 52, 8), null)
            })
        }

        let INVALID_INT = [
            ['-1', -1],
            ['1.5', 1.5],
            [`'1.5'`, '1.5'],
            ['Infinity', Infinity],
            ['NaN', NaN],
            [`'0x2'`, '0x2'],
            [`''`, ''],
            ['null', null],
            ['undefined', undefined],
            ['true', true],
            ['[]', []],
            ['{}', {}],
            ['new Number(2)', new Number(2)], // eslint-disable-line no-new-wrappers
            ['2 ** 53', 2 ** 53],
        ]
        //mLen、nBytes為Infinity或2 ** 53時, 修前之位移迴圈不終止(for (; mLen >= 8; … mLen -= 8)), 無法在mocha行程內逾時中止, 故由intInputHangG6.test.mjs之子行程案例驗證, 此處不含
        const HANG_BEFORE = ['Infinity', '2 ** 53']
        for (let [lab, v] of INVALID_INT) {
            it(`should return null and leave the buffer untouched when offset is ${lab}`, function() {
                let b = Buffer.alloc(16, 0xaa)
                assert.strict.deepStrictEqual(bufWrite(1.5, b, v, true, 52, 8), null)
                assert.strict.deepStrictEqual(hex(b), 'aa'.repeat(16))
            })
            if (HANG_BEFORE.includes(lab)) {
                continue
            }
            it(`should return null and leave the buffer untouched when mLen is ${lab}`, function() {
                let b = Buffer.alloc(16, 0xaa)
                assert.strict.deepStrictEqual(bufWrite(1.5, b, 0, true, v, 8), null)
                assert.strict.deepStrictEqual(hex(b), 'aa'.repeat(16))
            })
            it(`should return null and leave the buffer untouched when nBytes is ${lab}`, function() {
                let b = Buffer.alloc(16, 0xaa)
                assert.strict.deepStrictEqual(bufWrite(1.5, b, 0, true, 52, v), null)
                assert.strict.deepStrictEqual(hex(b), 'aa'.repeat(16))
            })
        }

        it(`should return null when mLen or nBytes is 0 (minimum 1)`, function() {
            assert.strict.deepStrictEqual(bufWrite(1.5, Buffer.alloc(8), 0, true, 0, 8), null)
            assert.strict.deepStrictEqual(bufWrite(1.5, Buffer.alloc(8), 0, true, 52, 0), null)
        })

        for (let [lab, v] of [['null', null], ['undefined', undefined], ['1', 1], [`'true'`, 'true'], ['{}', {}]]) {
            it(`should return null when isBE is ${lab}`, function() {
                assert.strict.deepStrictEqual(bufWrite(1.5, Buffer.alloc(8), 0, v, 52, 8), null)
            })
        }

        it(`should accept numeric strings for offset, mLen and nBytes (value used is the converted one)`, function() {
            let b = Buffer.alloc(16)
            assert.strict.deepStrictEqual(bufWrite(1.5, b, '4', true, ' 52 ', '8'), true)
            let nb = Buffer.alloc(16)
            nb.writeDoubleBE(1.5, 4)
            assert.strict.deepStrictEqual(hex(b), hex(nb))
            assert.strict.deepStrictEqual(bufRead(b, '4', true, '52', ' 8 '), 1.5)
        })

        it(`should write at the offset only and keep the other bytes`, function() {
            let b = Buffer.alloc(12, 0xff)
            assert.strict.deepStrictEqual(bufWrite(2, b, 2, true, 52, 8), true)
            assert.strict.deepStrictEqual(hex(b), 'ffff' + '4000000000000000' + 'ffff')
            assert.strict.deepStrictEqual(bufRead(b, 2, true, 52, 8), 2)
        })

        it(`should overwrite a previous negative value with a positive one (sign bit cleared)`, function() {
            let b = Buffer.alloc(8)
            bufWrite(-2, b, 0, true, 52, 8)
            assert.strict.deepStrictEqual(bufWrite(2, b, 0, true, 52, 8), true)
            assert.strict.deepStrictEqual(bufRead(b, 0, true, 52, 8), 2)
        })

        it(`should return null for a write beyond the buffer end and leave it untouched (offset + nBytes > length)`, function() {
            let b = Buffer.alloc(8, 0xaa)
            assert.strict.deepStrictEqual(bufWrite(1.5, b, 1, true, 52, 8), null)
            assert.strict.deepStrictEqual(bufWrite(1.5, b, 8, true, 52, 8), null)
            assert.strict.deepStrictEqual(bufWrite(1.5, b, 4294967294, true, 52, 8), null)
            assert.strict.deepStrictEqual(bufWrite(1.5, b, 0, true, 52, 9), null)
            assert.strict.deepStrictEqual(hex(b), 'aaaaaaaaaaaaaaaa')
        })

        it(`should work for a Uint8Array (not only Buffer)`, function() {
            let u = new Uint8Array(8)
            assert.strict.deepStrictEqual(bufWrite(Infinity, u, 0, true, 52, 8), true)
            assert.strict.deepStrictEqual(Array.from(u), [127, 240, 0, 0, 0, 0, 0, 0])
            assert.strict.deepStrictEqual(bufRead(u, 0, true, 52, 8), Infinity)
        })

    })

    describe(`bufWriteDbl and bufReadDbl wrappers`, function() {

        it(`bufWriteDbl should return true on success and null on failure, writing double BE at offset 0 by default`, function() {
            let b = Buffer.alloc(8)
            assert.strict.deepStrictEqual(bufWriteDbl(1447656645380, b), true)
            assert.strict.deepStrictEqual(Array.from(b), [66, 117, 16, 240, 246, 48, 64, 0])
            assert.strict.deepStrictEqual(bufReadDbl(b), 1447656645380)
            assert.strict.deepStrictEqual(bufWriteDbl('0x10', b), null)
            assert.strict.deepStrictEqual(bufWriteDbl(1, Buffer.alloc(4)), null)
            assert.strict.deepStrictEqual(bufWriteDbl(1, null), null)
        })

        it(`bufWriteDbl should write ±Infinity and NaN with the right bit patterns`, function() {
            let b = Buffer.alloc(8)
            assert.strict.deepStrictEqual(bufWriteDbl(Infinity, b), true)
            assert.strict.deepStrictEqual(hex(b), '7ff0000000000000')
            assert.strict.deepStrictEqual(bufWriteDbl(-Infinity, b), true)
            assert.strict.deepStrictEqual(hex(b), 'fff0000000000000')
            assert.strict.deepStrictEqual(bufWriteDbl(NaN, b), true)
            assert.strict.deepStrictEqual(hex(b), '7ff8000000000000')
        })

        it(`bufWriteDbl with (offset, isBE, mLen 23, nBytes 4) should write a float like Node`, function() {
            let b = Buffer.alloc(8)
            assert.strict.deepStrictEqual(bufWriteDbl(3.14159, b, 2, false, 23, 4), true)
            let nb = Buffer.alloc(8)
            nb.writeFloatLE(3.14159, 2)
            assert.strict.deepStrictEqual(hex(b), hex(nb))
            assert.strict.deepStrictEqual(bufReadDbl(b, 2, false, 23, 4), nb.readFloatLE(2))
        })

        it(`the former mLen/nBytes/offset defects: bufWriteDbl with eLen above 30 should return null`, function() {
            assert.strict.deepStrictEqual(bufWriteDbl(1.5, Buffer.alloc(8), 0, true, 1, 8), null)
            assert.strict.deepStrictEqual(bufReadDbl(Buffer.alloc(8), 0, true, 1, 8), null)
        })

    })

    //mLen大於52(超過JS數值之尾數位數, 主控2026-11-02判定ws272c, ws272b回報範圍外第8項): bufRead讀回0(Math.pow(2, e - mLen)下溢)、bufWrite無法精確編碼, 兩者改回null(同eLen大於30之處置);
    //標準(23,4)與(52,8)不變, 且mLen不大於52而eLen在1~30之非標準版面仍可寫讀
    describe(`mLen above 52 (ws272c)`, function() {

        for (let [mLen, nBytes] of [[53, 8], [60, 9], [60, 12], [62, 8], [53, 9], [100, 15], [100, 16], [64, 10], [58, 9], [4294967295, 8]]) {
            it(`(mLen ${mLen}, nBytes ${nBytes}) should be null for both bufRead and bufWrite, and bufWrite should not write`, function() {
                let b = Buffer.alloc(16, 0x77)
                for (let isBE of [true, false]) {
                    assert.strict.deepStrictEqual(bufWrite(2.2250738585072014e-308, b, 0, isBE, mLen, nBytes), null)
                    assert.strict.deepStrictEqual(bufWrite(1.5, b, 0, isBE, mLen, nBytes), null)
                    assert.strict.deepStrictEqual(hex(b), '77'.repeat(16))
                    assert.strict.deepStrictEqual(bufRead(b, 0, isBE, mLen, nBytes), null)
                }
            })
        }

        it(`the audited input: bufWrite(2.2250738585072014e-308, buf, 0, false, 60, 9) then bufRead gave 0 (formerly), now both are null`, function() {
            let b = Buffer.alloc(9)
            assert.strict.deepStrictEqual(bufWrite(2.2250738585072014e-308, b, 0, false, 60, 9), null)
            assert.strict.deepStrictEqual(bufRead(b, 0, false, 60, 9), null)
        })

        it(`mLen 52 with other nBytes (eLen 1 to 30) should stay usable and read back what was written, BE and LE`, function() {
            for (let nBytes of [7, 8, 9, 10, 11, 12]) {
                let eLen = nBytes * 8 - 52 - 1
                if (eLen < 1 || eLen > 30) {
                    continue
                }
                for (let isBE of [true, false]) {
                    for (let v of [0, 1, -1, 1.5, -2.25, 0.375, 3, Infinity, -Infinity]) {
                        let b = Buffer.alloc(16)
                        assert.strict.deepStrictEqual(bufWrite(v, b, 0, isBE, 52, nBytes), true, `nBytes ${nBytes} ${v}`)
                        let r = bufRead(b, 0, isBE, 52, nBytes)
                        assert.ok(Object.is(r, v) || (v === 0 && r === 0), `nBytes ${nBytes} ${v} -> ${r}`)
                    }
                }
            }
        })

        it(`the standard formats (23,4) and (52,8) should give the same bytes as Node's Buffer, unchanged`, function() {
            for (let v of [0, 1, -1.5, 3.14159, Infinity, -Infinity, 1e-300, 1447656645380]) {
                let b8 = Buffer.alloc(8)
                assert.strict.deepStrictEqual(bufWrite(v, b8, 0, true, 52, 8), true)
                let n8 = Buffer.alloc(8)
                n8.writeDoubleBE(v)
                assert.strict.deepStrictEqual(hex(b8), hex(n8), `double ${v}`)
                assert.strict.deepStrictEqual(bufRead(b8, 0, true, 52, 8), v)
                let b4 = Buffer.alloc(4)
                assert.strict.deepStrictEqual(bufWrite(v, b4, 0, false, 23, 4), true)
                let n4 = Buffer.alloc(4)
                n4.writeFloatLE(v)
                assert.strict.deepStrictEqual(hex(b4), hex(n4), `float ${v}`)
            }
        })

    })

})
