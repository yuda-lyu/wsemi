import assert from 'assert'
import cbol from '../src/cbol.mjs'
import { hostileValues } from './tools/hostileValues.mjs'


//cbol依B2轉換(使用者2026-11-16「W-21, 1至3都甲」; dspec〈輸入參數之檢測機制〉§3.3 B2、§11 C1／C2之定義①):
//  只把true、false、'true'、'false'(去頭尾空白後須全小寫)轉為對應布林, 其餘一律false(布林與數字不互轉)
describe(`cbol`, function() {

    it(`should return true when input true`, function() {
        let r = cbol(true)
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return false when input false`, function() {
        let r = cbol(false)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input 0`, function() {
        let r = cbol(0)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input 1 (numbers are not converted to boolean; was true before W-21)`, function() {
        //B2: 布林與數字不互轉; 修前cbol(1)為true
        let r = cbol(1)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return true when input 'true'`, function() {
        let r = cbol('true')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return false when input 'false'`, function() {
        let r = cbol('false')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input 'tRuE', 'TRUE', 'True', 'FALSE' (must be all lowercase; was true before W-21)`, function() {
        //B2: 去頭尾空白後須全小寫; 修前'tRuE'、'TRUE'、'True'為true
        for (let v of ['tRuE', 'TRUE', 'True', 'tRUE', 'FALSE', 'False']) {
            assert.strict.deepStrictEqual([v, cbol(v)], [v, false])
        }
    })

    it(`should trim leading and trailing whitespace before comparing: ' true ' is true, ' false ' is false`, function() {
        //B2: 去頭尾空白(含tab、換行、不換行空白)後比對
        for (let v of [' true ', '\ttrue\n', '\r\ntrue', 'true ', ' true', ' true ', '﻿true﻿', ' true　']) {
            assert.strict.deepStrictEqual([v, cbol(v)], [v, true])
        }
        for (let v of [' false ', '\tfalse\n']) {
            assert.strict.deepStrictEqual([v, cbol(v)], [v, false])
        }
    })

    it(`should return false when a string has interior whitespace or extra characters ('tr ue', 'true1', 'truee', 'yes', 'y', '1', 'abc', '')`, function() {
        for (let v of ['tr ue', 'true1', 'truee', 'xtrue', 'yes', 'y', 'Y', 'on', '1', '0', 'abc', '', ' ', 'null', 'undefined']) {
            assert.strict.deepStrictEqual([v, cbol(v)], [v, false])
        }
    })

    it(`should return false for every other number (2, -1, 1.5, NaN, Infinity) and BigInt, Symbol`, function() {
        for (let v of [2, -1, 1.5, NaN, Infinity, -Infinity, 1n, Symbol('true')]) {
            assert.strict.deepStrictEqual([String(typeof v), cbol(v)], [String(typeof v), false])
        }
    })

    it(`should return false when input [], {}, ['true'], function, null, undefined`, function() {
        for (let v of [[], {}, ['true'], [true], { a: true }, function() {}, null, undefined]) {
            assert.strict.deepStrictEqual(cbol(v), false)
        }
    })

    it(`should never call valueOf or toString of the input (an object whose toString gives 'true' is false)`, function() {
        let o = {
            toString() {
                throw new Error('toString must not be called')
            },
            valueOf() {
                throw new Error('valueOf must not be called')
            },
        }
        assert.strict.deepStrictEqual(cbol(o), false)
        assert.strict.deepStrictEqual(cbol({ toString: () => 'true' }), false)
    })

    it(`should always return a primitive boolean`, function() {
        for (let v of [true, false, 'true', 'false', 1, 0, 'x', null, undefined, {}, [], new Boolean(true), new String('true')]) { // eslint-disable-line no-new-wrappers
            assert.strict.deepStrictEqual(typeof cbol(v), 'boolean')
        }
    })

    it(`should not throw and give false for hostile inputs (revoked Proxy, throwing getters or traps)`, function() {
        for (let h of hostileValues()) {
            let r = null
            assert.doesNotThrow(() => {
                r = cbol(h.value)
            }, h.name)
            assert.strict.deepStrictEqual([h.name, r], [h.name, false])
        }
    })

})


/* eslint-disable no-new-wrappers */ //本段刻意建立包裝物件以驗R-WRAPPER-01
describe(`cbol 包裝物件(R-WRAPPER-01, W-20: 轉型函數照舊拆包)`, function() {

    it(`should return primitive false when input new Boolean(false)`, function() {
        //W-20: 轉型函數照舊拆包, 不回包裝物件本身(new Boolean(false)為truthy); JSDoc「恆回傳原始布林值」
        let r = cbol(new Boolean(false))
        assert.strict.deepStrictEqual(typeof r, 'boolean')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return primitive true when input new Boolean(true)`, function() {
        //W-20: 轉型函數照舊拆包, 回傳原始布林; JSDoc「恆回傳原始布林值」
        let r = cbol(new Boolean(true))
        assert.strict.deepStrictEqual(typeof r, 'boolean')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should convert the wrapper of a string by its primitive value: new String('true') and new String(' true ') are true, new String('abc'), new String('TRUE'), new String('false') are false`, function() {
        //W-20: 轉型函數照舊拆包, 字串包裝同原始字串之B2規則(cbol('true')為true、cbol('TRUE')為false)
        assert.strict.deepStrictEqual(cbol(new String('true')), true)
        assert.strict.deepStrictEqual(cbol(new String(' true ')), true)
        assert.strict.deepStrictEqual(cbol(new String('abc')), false)
        assert.strict.deepStrictEqual(cbol(new String('TRUE')), false)
        assert.strict.deepStrictEqual(cbol(new String('false')), false)
    })

    it(`should return false when input new Number(1) (numbers are not converted, same as cbol(1))`, function() {
        //B2: 數字不轉布林, 包裝數字亦然(拆包後同cbol(1)為false)
        assert.strict.deepStrictEqual(cbol(new Number(1)), false)
        assert.strict.deepStrictEqual(cbol(new Number(0)), false)
    })

    it(`should return primitive false without throwing when input a frozen object spoofing Symbol.toStringTag as Boolean`, function() {
        //JSDoc「恆回傳原始布林值」: 偽造標籤之物件無內部槽, 不算包裝物件, 非布林故為false且不拋錯
        let r = null
        assert.doesNotThrow(() => {
            r = cbol(Object.freeze({ [Symbol.toStringTag]: 'Boolean' }))
        })
        assert.strict.deepStrictEqual(typeof r, 'boolean')
        assert.strict.deepStrictEqual(r, false)
        assert.strict.deepStrictEqual(cbol({ [Symbol.toStringTag]: 'String' }), false)
    })

})
