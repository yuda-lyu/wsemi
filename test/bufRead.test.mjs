import assert from 'assert'
import bufRead from '../src/bufRead.mjs'


describe(`bufRead`, function() {
    let offset = 0
    let isBE = true
    let mLen = 52
    let nBytes = 8
    let b = new Uint8Array([66, 117, 16, 240, 246, 48, 64, 0])
    let j = 1447656645380

    it(`should return ${j} when input ${b}, ${offset}, ${isBE}, ${mLen}, ${nBytes}`, function() {
        let r = bufRead(b, offset, isBE, mLen, nBytes)
        let rr = j
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return ${j} when input '1.25', ${offset}, ${isBE}, ${mLen}, ${nBytes}`, function() {
        let r = bufRead('1.25', offset, isBE, mLen, nBytes)
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return ${j} when input 2.25, ${offset}, ${isBE}, ${mLen}, ${nBytes}`, function() {
        let r = bufRead(2.25, offset, isBE, mLen, nBytes)
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return ${j} when input '', ${offset}, ${isBE}, ${mLen}, ${nBytes}`, function() {
        let r = bufRead('', offset, isBE, mLen, nBytes)
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return ${j} when input [], ${offset}, ${isBE}, ${mLen}, ${nBytes}`, function() {
        let r = bufRead([], offset, isBE, mLen, nBytes)
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return ${j} when input {}, ${offset}, ${isBE}, ${mLen}, ${nBytes}`, function() {
        let r = bufRead({}, offset, isBE, mLen, nBytes)
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return ${j} when input null, ${offset}, ${isBE}, ${mLen}, ${nBytes}`, function() {
        let r = bufRead(null, offset, isBE, mLen, nBytes)
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return ${j} when input undefined, ${offset}, ${isBE}, ${mLen}, ${nBytes}`, function() {
        let r = bufRead(undefined, offset, isBE, mLen, nBytes)
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return ${j} when input NaN, ${offset}, ${isBE}, ${mLen}, ${nBytes}`, function() {
        let r = bufRead(NaN, offset, isBE, mLen, nBytes)
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return ${j} when input ${b}, null, ${isBE}, ${mLen}, ${nBytes}`, function() {
        let r = bufRead(b, null, isBE, mLen, nBytes)
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return ${j} when input ${b}, ${offset}, null, ${mLen}, ${nBytes}`, function() {
        let r = bufRead(b, offset, null, mLen, nBytes)
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return ${j} when input ${b}, ${offset}, ${isBE}, null, ${nBytes}`, function() {
        let r = bufRead(b, offset, isBE, null, nBytes)
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return ${j} when input ${b}, ${offset}, ${isBE}, ${mLen}, null`, function() {
        let r = bufRead(b, offset, isBE, mLen, null)
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    //第221項已知缺陷先修(ws270): offset改iseint(offset, { use: 'index' })、mLen與nBytes改iseint(…, { use: 'count', min: 1 }), 皆以Number()取值;
    //  另檢查offset + nBytes <= buffer.length與mLen < nBytes * 8 - 1(至少留1位元給指數); 無效維持回傳null. bufWrite本輪不動

    //獨立對照: DataView(原生IEEE 754)寫出位元組, bufRead須讀回同值(含-0、次正規數、±Infinity、NaN之位元樣式)
    let same = (r, v) => (Number.isNaN(v) ? Number.isNaN(r) : Object.is(r, v))

    describe(`normal reads should be unchanged (float64 and float32, both endians, with an offset)`, function() {

        let V64 = [0, -0, 1, -1, 1.5, -2.75, Math.PI, 1447656645380, 5e-324, -5e-324, 2.2250738585072014e-308, 1.7976931348623157e308, -1.7976931348623157e308, 1e-310, 123456789.12345679, Infinity, -Infinity, NaN]
        let V32 = [0, -0, 1, -1, 0.5, 1.5, -3.25, 3.4028234663852886e38, 1.401298464324817e-45, 1.1754943508222875e-38, 16777216, Infinity, -Infinity, NaN]

        for (let isBE of [true, false]) {
            for (let off of [0, 3]) {

                it(`float64 isBE=${isBE} offset=${off}`, function() {
                    for (let v of V64) {
                        let u8 = new Uint8Array(off + 8 + 2)
                        new DataView(u8.buffer).setFloat64(off, v, !isBE)
                        let r = bufRead(u8, off, isBE, 52, 8)
                        assert.ok(same(r, v), `float64 ${v} read ${r}`)
                    }
                })

                it(`float32 isBE=${isBE} offset=${off}`, function() {
                    for (let v of V32) {
                        let u8 = new Uint8Array(off + 4 + 2)
                        new DataView(u8.buffer).setFloat32(off, v, !isBE)
                        let r = bufRead(u8, off, isBE, 23, 4)
                        assert.ok(same(r, v), `float32 ${v} read ${r}`)
                    }
                })

            }
        }

        it(`should read a Node Buffer and the exact end (offset + nBytes === length)`, function() {
            let bf = Buffer.alloc(11)
            bf.writeDoubleBE(-Infinity, 3)
            assert.ok(Object.is(bufRead(bf, 3, true, 52, 8), -Infinity))
            let bf2 = Buffer.alloc(4)
            bf2.writeFloatLE(NaN, 0)
            assert.ok(Number.isNaN(bufRead(bf2, 0, false, 23, 4)))
        })

        it(`should accept numeric strings for offset, mLen, nBytes (trimmed, converted by Number())`, function() {
            let u8 = new Uint8Array(12)
            new DataView(u8.buffer).setFloat64(3, 1447656645380, false)
            assert.strict.deepStrictEqual(bufRead(u8, '3', true, '52', '8'), 1447656645380) // 修前offset + i為字串相加, 讀到錯位之位元組
            assert.strict.deepStrictEqual(bufRead(u8, ' 3 ', true, ' 52 ', ' 8 '), 1447656645380)
            assert.strict.deepStrictEqual(bufRead(u8, '3.0', true, '5.2e1', '8.0'), 1447656645380)
        })

    })

    describe(`invalid offset should return null (read range must be inside the buffer)`, function() {

        for (let [label, off] of [
            ['-1', -1],
            ['-8', -8],
            [`'-1'`, '-1'],
            ['1 (1 + 8 > length 8)', 1],
            ['8 (past the end)', 8],
            ['100', 100],
            ['Infinity', Infinity],
            ['-Infinity', -Infinity],
            ['1.5', 1.5],
            [`'0x0'`, '0x0'],
            [`'abc'`, 'abc'],
            ['4294967294 (the largest valid index, beyond the buffer)', 4294967294],
            ['4294967295 (over the index limit)', 4294967295],
            ['2 ** 53', 2 ** 53],
            ['new Number(0)', new Number(0)], // eslint-disable-line no-new-wrappers
            ['0n', 0n],
            ['true', true],
            ['NaN', NaN],
        ]) {
            it(`should return null when offset is ${label}`, function() {
                assert.strict.deepStrictEqual(bufRead(b, off, true, 52, 8), null) // 修前負數與越界之offset讀到undefined而回出失真數值
            })
        }

    })

    describe(`generic invalid values for each numeric parameter should return null (spec V24 matrix)`, function() {

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
            ['[1]', [1]],
            ['{}', {}],
            ['5n', 5n],
            ['Symbol()', Symbol('x')],
            ['function', () => 5],
        ]
        for (let [label, v] of INVALIDS) {
            it(`should return null when offset is ${label}`, function() {
                assert.strict.deepStrictEqual(bufRead(b, v, true, 52, 8), null)
            })
            it(`should return null when mLen is ${label}`, function() {
                assert.strict.deepStrictEqual(bufRead(b, 0, true, v, 8), null)
            })
            it(`should return null when nBytes is ${label}`, function() {
                assert.strict.deepStrictEqual(bufRead(b, 0, true, 52, v), null)
            })
        }

    })

    describe(`invalid nBytes and mLen should return null`, function() {

        // Infinity與超過個數上限之nBytes、mLen使位元組迴圈不終止(修前), 於intInputHang.test.mjs(子行程加逾時)驗, 不在此行程內跑

        for (let [label, mLen, nBytes] of [
            ['nBytes 0', 52, 0],
            ['nBytes -8', 52, -8],
            ['nBytes 9 (offset 0 + 9 > length 8)', 52, 9],
            ['nBytes 1.5', 52, 1.5],
            [`nBytes '0x8'`, 52, '0x8'],
            ['nBytes new Number(8)', 52, new Number(8)], // eslint-disable-line no-new-wrappers
            ['mLen 0', 0, 8],
            ['mLen -1', -1, 8],
            ['mLen 1.5', 1.5, 8],
            [`mLen '0x34'`, '0x34', 8],
            ['mLen new Number(52)', new Number(52), 8], // eslint-disable-line no-new-wrappers
            ['mLen 63 (= nBytes * 8 - 1, no exponent bit)', 63, 8],
            ['mLen 64', 64, 8],
            ['mLen 52 with nBytes 4 (52 >= 31)', 52, 4],
            ['mLen 23 with nBytes 3 (23 >= 23)', 23, 3],
            ['mLen 7 with nBytes 1 (7 >= 7)', 7, 1],
        ]) {
            it(`should return null when ${label}`, function() {
                assert.strict.deepStrictEqual(bufRead(b, 0, true, mLen, nBytes), null)
            })
        }

        it(`should accept the largest mLen that still leaves one exponent bit (nBytes * 8 - 2) while mLen is not above 52`, function() {
            // mLen 6、nBytes 1: eLen = 1
            assert.ok(typeof bufRead(new Uint8Array([0x40]), 0, true, 6, 1) === 'number')
            // mLen 52、nBytes 8: 標準雙精度, eLen = 11; mLen 52、nBytes 7: eLen = 3(mLen上限52)
            assert.ok(typeof bufRead(b, 0, true, 52, 8) === 'number')
            assert.ok(typeof bufRead(b, 0, true, 52, 7) === 'number')
        })

        it(`should return null when mLen is above 52 even though one exponent bit is left (JS number mantissa is 52 bits; ws272c)`, function() {
            // mLen 62、nBytes 8: eLen = 1, 修前回出數值(mLen超過尾數位數時Math.pow(2, e - mLen)下溢而失真), 修後回null
            assert.strict.deepStrictEqual(bufRead(b, 0, true, 62, 8), null)
            assert.strict.deepStrictEqual(bufRead(b, 0, true, 53, 8), null)
        })

    })

})
