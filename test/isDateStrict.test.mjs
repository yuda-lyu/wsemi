import assert from 'assert'
import vm from 'vm'
import isDate from '../src/isDate.mjs'
import isday from '../src/isday.mjs'
import istime from '../src/istime.mjs'
import istimems from '../src/istimems.mjs'
import istimeTZ from '../src/istimeTZ.mjs'
import istimemsTZ from '../src/istimemsTZ.mjs'
import { hostileValues } from './tools/hostileValues.mjs'


//isDate收嚴(使用者2026-11-16「W-21, 1至3都甲」; dspec〈輸入參數之檢測機制〉§11 C1／C2之定義②):
//  有效之Date物件, 或通過isday／istime／istimems／istimeTZ／istimemsTZ任一之字串; 不收數字; 不存在之日期與非規格格式為false; 無效之Date為false
describe(`isDate 收嚴(W-21②)`, function() {

    //五種標準格式各2案(含閏日、年0000、毫秒、Z、±HH:mm)
    let okStrs = [
        ['isday', '2019-01-01'],
        ['isday', '2020-02-29'],
        ['isday', '0000-01-01'],
        ['istime', '2019-01-01T12:34:56'],
        ['istime', '2020-02-29T23:59:59'],
        ['istimems', '2019-01-01T12:34:56.789'],
        ['istimems', '2019-01-01T00:00:00.000'],
        ['istimeTZ', '2019-01-01T12:34:56+08:00'],
        ['istimeTZ', '2019-01-01T12:34:56Z'],
        ['istimemsTZ', '2019-01-01T12:34:56.789+08:00'],
        ['istimemsTZ', '2019-01-01T12:34:56.789Z'],
        ['istimemsTZ', '2019-12-31T23:59:59.999-05:30'],
    ]
    let fns = { isday, istime, istimems, istimeTZ, istimemsTZ }

    it(`should return true for a string that passes the matching one of isday, istime, istimems, istimeTZ, istimemsTZ`, function() {
        for (let [fn, s] of okStrs) {
            //前提: 該字串確實通過對應之判斷函數(規格句: 通過其中任一之字串)
            assert.strict.deepStrictEqual([fn, s, fns[fn](s)], [fn, s, true])
            assert.strict.deepStrictEqual([s, isDate(s)], [s, true])
        }
    })

    it(`should return true if and only if the string passes at least one of the five judge functions (agrees with them over a mixed axis)`, function() {
        let axis = [
            ...okStrs.map((x) => x[1]),
            '2026-02-30', '2026-13-01', '2026-00-10', '2019-02-29', '2026-11-31', '2026/11/16', '2026.11.16', '2019', '2019-01', '2019-1-1', '19-01-01', 'Nov 16 2026', '2019-01-01T12', '2019-01-01T12:34', '2019-01-01 12:34:56',
            '2019-01-01T12:34:56.78', '2019-01-01T12:34:56.7891', '2019-01-01T24:00:00', '2019-01-01T12:60:00', '2019-01-01T12:34:56+25:00', '2019-01-01T12:34:56A', 'Invalid Date', '', ' ', '0', '125', '-1.25', '1546300800000', 'true', 'null', ' 2019-01-01', '2019-01-01 ',
        ]
        let nTrue = 0
        for (let s of axis) {
            let want = isday(s) || istime(s) || istimems(s) || istimeTZ(s) || istimemsTZ(s)
            nTrue += want ? 1 : 0
            assert.strict.deepStrictEqual([s, isDate(s)], [s, want])
        }
        //鑑別力前提: 軸上有真有假
        assert.strict.ok(nTrue >= okStrs.length && nTrue < axis.length)
    })

    it(`should return false for a nonexistent date or time even in standard format ('2026-02-30', '2019-02-29', '2026-13-01', '2026-11-31')`, function() {
        for (let s of ['2026-02-30', '2019-02-29', '2026-13-01', '2026-00-10', '2026-11-31', '2019-01-01T24:00:00', '2019-01-01T12:60:00', '2019-01-01T12:34:60', '2019-02-30T12:34:56+08:00', '2019-02-30T12:34:56.789Z']) {
            assert.strict.deepStrictEqual([s, isDate(s)], [s, false])
        }
    })

    it(`should return false for non-standard formats ('2026/11/16', '2019', '2019-01', 'Nov 16 2026', ISO without seconds)`, function() {
        //修前: new Date(s)可解析者(如'2019'、'2019-01'、'2019-01-01T12:34')皆為true
        for (let s of ['2026/11/16', '2026.11.16', '2019', '2019-01', '2019Z', '2019-01Z', '2019-01-01Z', '2019-1-1', 'Nov 16 2026', 'Mon Nov 16 2026', '2019-01-01T12:34', '2019-01-01T12:34Z', '2019-01-01 12:34:56', '2019-01-01T12:34:56.78', '2019-01-01T12:34:56.7891Z', ' 2019-01-01', '2019-01-01 ']) {
            assert.strict.deepStrictEqual([s, isDate(s)], [s, false])
        }
    })

    it(`should return false for every number (the millisecond timestamp has its own judge); was true before W-21`, function() {
        //規格句: 不收數字(毫秒時間戳另以數值判斷)
        for (let v of [0, 1, 125, -125, 1.25, 1546300800000, Date.now(), 2019, NaN, Infinity, -Infinity]) {
            assert.strict.deepStrictEqual([String(v), isDate(v)], [String(v), false])
        }
    })

    it(`should return false for numeric strings ('0', '125', '-1.25', '1546300800000'); was true before W-21`, function() {
        for (let s of ['0', '125', '-125', '1.25', '-1.25', '1546300800000', '2019.5']) {
            assert.strict.deepStrictEqual([s, isDate(s)], [s, false])
        }
    })

    it(`should return true for a valid Date object and false for an invalid Date (Invalid Date)`, function() {
        assert.strict.deepStrictEqual(isDate(new Date('2019-01-01T12:34:56Z')), true)
        assert.strict.deepStrictEqual(isDate(new Date(0)), true)
        assert.strict.deepStrictEqual(isDate(new Date(-62198755200000)), true)
        assert.strict.deepStrictEqual(isDate(new Date(8.64e15)), true)
        //規格句: 無效之Date為false; 修前new Date('x')為false(instanceof Date且非NaN才true), 本案鎖住不退步
        assert.strict.deepStrictEqual(isDate(new Date('x')), false)
        assert.strict.deepStrictEqual(isDate(new Date(NaN)), false)
        assert.strict.deepStrictEqual(isDate(new Date(8.64e15 + 1)), false)
    })

    it(`should treat a Date of another realm (vm) and a Date subclass by its internal slot`, function() {
        assert.strict.deepStrictEqual(isDate(vm.runInNewContext('new Date(2019, 0, 1)')), true)
        assert.strict.deepStrictEqual(isDate(vm.runInNewContext('new Date(NaN)')), false)
        class MyDate extends Date {}
        assert.strict.deepStrictEqual(isDate(new MyDate(2019, 0, 1)), true)
        assert.strict.deepStrictEqual(isDate(new MyDate(NaN)), false)
    })

    it(`should return false for an object that merely spoofs Date (Symbol.toStringTag 'Date', Date.prototype, getTime method, Proxy of a Date)`, function() {
        let spoof = { [Symbol.toStringTag]: 'Date', getTime: () => 1 }
        assert.strict.deepStrictEqual(isDate(spoof), false)
        assert.strict.deepStrictEqual(isDate(Object.create(Date.prototype)), false)
        assert.strict.deepStrictEqual(isDate(new Proxy(new Date(0), {})), false)
        assert.strict.deepStrictEqual(isDate({ valueOf: () => 0 }), false)
    })

    it(`should return false for a wrapper object (W-20: judge functions only accept primitives), new String('2019-01-01') included`, function() {
        // eslint-disable-next-line no-new-wrappers
        for (let v of [new String('2019-01-01'), new String('2019-01-01T12:34:56Z'), new String(''), new Number(0), new Number(1546300800000), new Boolean(true)]) {
            assert.strict.deepStrictEqual(isDate(v), false)
        }
    })

    it(`should return false for null, undefined, boolean, function, array, plain object, Symbol, BigInt`, function() {
        for (let v of [null, undefined, true, false, function() {}, () => new Date(), [], [new Date(0)], ['2019-01-01'], {}, { a: 1 }, Symbol('x'), 10n]) {
            assert.strict.deepStrictEqual(isDate(v), false)
        }
    })

    it(`should not throw and give false for hostile inputs (revoked Proxy, throwing traps or getters), also with onlyCheckDateObject`, function() {
        for (let h of hostileValues()) {
            for (let opt of [undefined, { onlyCheckDateObject: true }]) {
                let r = null
                assert.doesNotThrow(() => {
                    r = isDate(h.value, opt)
                }, h.name)
                assert.strict.deepStrictEqual([h.name, r], [h.name, false])
            }
        }
    })

    it(`should treat an unreadable opt (revoked Proxy, throwing traps) as not given`, function() {
        for (let h of hostileValues()) {
            let r = null
            assert.doesNotThrow(() => {
                r = isDate('2019-01-01', h.value)
            }, h.name)
            assert.strict.deepStrictEqual([h.name, r], [h.name, true])
            assert.strict.deepStrictEqual([h.name, isDate(new Date('x'), h.value)], [h.name, false])
        }
    })

})


//opt.onlyCheckDateObject之既有語意核對(W-21②「既有語意另於實作時核對」): 與修前相同者鎖住, 唯一差異為偽造內部標籤者(修前true, 修後false)
describe(`isDate opt.onlyCheckDateObject(既有語意核對)`, function() {

    let opt = { onlyCheckDateObject: true }

    it(`should return true for any Date object including Invalid Date and a Date of another realm, same as before`, function() {
        assert.strict.deepStrictEqual(isDate(new Date('2019-01-01T12:34:56Z'), opt), true)
        assert.strict.deepStrictEqual(isDate(new Date('x'), opt), true)
        assert.strict.deepStrictEqual(isDate(new Date(NaN), opt), true)
        assert.strict.deepStrictEqual(isDate(vm.runInNewContext('new Date(2019, 0, 1)'), opt), true)
        assert.strict.deepStrictEqual(isDate(vm.runInNewContext('new Date(NaN)'), opt), true)
    })

    it(`should return false for strings, numbers and every other value without parsing them, same as before`, function() {
        for (let v of ['2019-01-01', '2019-01-01T12:34:56Z', 1546300800000, '1546300800000', 0, '', null, undefined, NaN, true, {}, [], function() {}]) {
            assert.strict.deepStrictEqual([String(v), isDate(v, opt)], [String(v), false])
        }
    })

    it(`should return false for an object that merely spoofs Symbol.toStringTag as Date (judged by the internal slot; was true when judged by Object.prototype.toString)`, function() {
        //唯一差異(JSDoc已寫明): 修前以Object.prototype.toString.call判定, 偽造標籤之一般物件為true; 修後以內部槽判定而為false
        assert.strict.deepStrictEqual(isDate({ [Symbol.toStringTag]: 'Date' }, opt), false)
        assert.strict.deepStrictEqual(isDate(Object.create(Date.prototype), opt), false)
    })

    it(`should fall back to the default behavior when opt.onlyCheckDateObject is not a boolean (a wrapper new Boolean(true) is not a boolean, W-20)`, function() {
        // eslint-disable-next-line no-new-wrappers
        for (let o of [{ onlyCheckDateObject: new Boolean(true) }, { onlyCheckDateObject: 'true' }, { onlyCheckDateObject: 1 }, { onlyCheckDateObject: null }]) {
            assert.strict.deepStrictEqual(isDate('2019-01-01', o), true)
            assert.strict.deepStrictEqual(isDate(new Date('x'), o), false)
        }
    })

})
