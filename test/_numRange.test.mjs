import assert from 'assert'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import numRange from '../src/_numRange.mjs'
import cst from '../src/_const.mjs'


//規格: 主控dspec〈輸入參數之檢測機制〉§7.1 兩表, 以及〈兩函數共通〉「範圍表集中於單一模組, 計時上限取自_const.mjs之TIMER_TIME_MAX, 不另寫數字」

describe(`_numRange`, function() {

    //述語R1: isenum之use範圍表(5種)逐項鎖定
    it(`should lock ENUM_USE ranges (isenum §7.1 table)`, function() {
        let r = {}
        for (let k of Object.keys(numRange.ENUM_USE)) {
            r[k] = { ...numRange.ENUM_USE[k] }
        }
        let rr = {
            positive: { gt: 0 },
            nonnegative: { min: 0 },
            timer: { min: 0, max: 2147483647 },
            ratio: { min: 0, max: 1 },
            percent: { min: 0, max: 100 },
        }
        assert.strict.deepStrictEqual(r, rr)
    })

    //述語R2: iseint之use範圍表(12種)逐項鎖定
    it(`should lock EINT_USE ranges (iseint §7.1 table)`, function() {
        let r = {}
        for (let k of Object.keys(numRange.EINT_USE)) {
            r[k] = { ...numRange.EINT_USE[k] }
        }
        let rr = {
            safe: { min: -9007199254740991, max: 9007199254740991 },
            count: { min: 0, max: 4294967295 },
            index: { min: 0, max: 4294967294 },
            timer: { min: 0, max: 2147483647 },
            port: { min: 1, max: 65535 },
            byte: { min: 0, max: 255 },
            int32: { min: -2147483648, max: 2147483647 },
            uint32: { min: 0, max: 4294967295 },
            digits: { min: 0, max: 100 },
            radix: { min: 2, max: 36 },
            year: { min: 0, max: 9999 },
            timestamp: { min: -62167219200000, max: 253402300799999 },
        }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should have exactly 5 isenum uses and 12 iseint uses in documented order`, function() {
        assert.strict.deepStrictEqual(numRange.ENUM_USE_NAMES, ['positive', 'nonnegative', 'timer', 'ratio', 'percent'])
        assert.strict.deepStrictEqual(numRange.EINT_USE_NAMES, ['safe', 'count', 'index', 'timer', 'port', 'byte', 'int32', 'uint32', 'digits', 'radix', 'year', 'timestamp'])
    })

    //述語R3: 計時上限取自_const.mjs之TIMER_TIME_MAX
    it(`should take timer upper bound from cst.TIMER_TIME_MAX (value)`, function() {
        assert.strict.deepStrictEqual(numRange.ENUM_USE.timer.max, cst.TIMER_TIME_MAX)
        assert.strict.deepStrictEqual(numRange.EINT_USE.timer.max, cst.TIMER_TIME_MAX)
        assert.strict.deepStrictEqual(cst.TIMER_TIME_MAX, 2147483647)
    })

    it(`should write timer upper bound as cst.TIMER_TIME_MAX in source, not a literal number`, function() {
        let fp = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', '_numRange.mjs')
        let lines = fs.readFileSync(fp, 'utf8').split(/\r?\n/)
        let ts = lines.filter((s) => /^\s*timer\s*:/.test(s))
        assert.strict.deepStrictEqual(ts.length, 2) //isenum與iseint各一
        for (let s of ts) {
            let code = s.split('//')[0]
            assert.strict.deepStrictEqual(code.includes('cst.TIMER_TIME_MAX'), true)
            assert.strict.deepStrictEqual(/\d{6,}/.test(code), false)
        }
        assert.strict.deepStrictEqual(/import cst from '\.\/_const\.mjs'/.test(lines.join('\n')), true)
    })

    //述語R4: 表為凍結之無原型物件, use為'constructor'等不會誤中
    it(`should be frozen null-prototype tables so that inherited names are not uses`, function() {
        for (let t of [numRange.ENUM_USE, numRange.EINT_USE]) {
            assert.strict.deepStrictEqual(Object.getPrototypeOf(t), null)
            assert.strict.deepStrictEqual(Object.isFrozen(t), true)
            for (let k of Object.keys(t)) {
                assert.strict.deepStrictEqual(Object.isFrozen(t[k]), true)
            }
            for (let name of ['constructor', 'toString', 'hasOwnProperty', '__proto__', 'valueOf']) {
                assert.strict.deepStrictEqual(t[name], undefined)
            }
        }
    })

    //述語R5: 各use範圍自身一致(含端點之整數)
    it(`should have consistent relations between iseint ranges`, function() {
        let t = numRange.EINT_USE
        assert.strict.deepStrictEqual(t.index.max, t.count.max - 1) //索引上限2^32-2
        assert.strict.deepStrictEqual(t.count.max, 2 ** 32 - 1)
        assert.strict.deepStrictEqual(t.uint32.max, 2 ** 32 - 1)
        assert.strict.deepStrictEqual(t.int32.min, -(2 ** 31))
        assert.strict.deepStrictEqual(t.int32.max, 2 ** 31 - 1)
        assert.strict.deepStrictEqual(t.safe.max, Number.MAX_SAFE_INTEGER)
        assert.strict.deepStrictEqual(t.safe.min, Number.MIN_SAFE_INTEGER)
        for (let k of Object.keys(t)) {
            assert.strict.deepStrictEqual(Number.isSafeInteger(t[k].min) && Number.isSafeInteger(t[k].max), true)
            assert.strict.deepStrictEqual(t[k].min <= t[k].max, true)
        }
    })

    it(`should map timestamp range to year 0000-01-01 ~ 9999-12-31 UTC`, function() {
        let t = numRange.EINT_USE.timestamp
        let d0 = new Date(0)
        d0.setUTCFullYear(0, 0, 1)
        d0.setUTCHours(0, 0, 0, 0)
        assert.strict.deepStrictEqual(t.min, d0.getTime())
        assert.strict.deepStrictEqual(new Date(t.max).toISOString(), '9999-12-31T23:59:59.999Z')
        assert.strict.deepStrictEqual(new Date(t.max + 1).toISOString(), '+010000-01-01T00:00:00.000Z')
    })

})
