import assert from 'assert'
import vm from 'vm'
import unbox from '../src/_unbox.mjs'
import tagOf from '../src/_tagOf.mjs'
import { hostileValues } from './tools/hostileValues.mjs'


/* eslint-disable no-new-wrappers */ //本檔刻意建立包裝物件以驗W-20之拆包與標籤判定
//內部模組_unbox(轉型函數專用之拆包)與_tagOf(安全取內部標籤): 供cdbl、cint、cstr、cbol與判斷函數共用(W-20、批6裁定③)
describe(`_unbox(內部: 轉型函數專用之拆包, dspec §11 W-20)`, function() {

    it(`should unwrap String, Number and Boolean wrapper objects to their primitive values by the internal slot`, function() {
        assert.strict.deepStrictEqual([unbox(new String('a')), unbox(new String('')), unbox(new Number(1.5)), unbox(new Number(NaN)), unbox(new Boolean(false)), unbox(new Boolean(true))], ['a', '', 1.5, NaN, false, true])
        assert.strict.deepStrictEqual([typeof unbox(new String('a')), typeof unbox(new Number(1)), typeof unbox(new Boolean(false))], ['string', 'number', 'boolean'])
    })

    it(`should unwrap a wrapper of another realm (vm)`, function() {
        assert.strict.deepStrictEqual(unbox(vm.runInNewContext('new String("x")')), 'x')
        assert.strict.deepStrictEqual(unbox(vm.runInNewContext('new Number(7)')), 7)
        assert.strict.deepStrictEqual(unbox(vm.runInNewContext('new Boolean(true)')), true)
    })

    it(`should return primitives, null and undefined as they are (the fast path)`, function() {
        for (let v of ['a', '', 0, 1.5, NaN, Infinity, true, false, null, undefined, 10n]) {
            assert.strict.deepStrictEqual(Object.is(unbox(v), v), true)
        }
        let s = Symbol('x')
        assert.strict.deepStrictEqual(unbox(s), s)
    })

    it(`should return a non-wrapper object as it is (same reference), including a function, an array and a Date`, function() {
        let f = function() {}
        for (let v of [{}, [], f, new Date(0), /a/, new Map(), Object.create(null)]) {
            assert.strict.deepStrictEqual(unbox(v) === v, true)
        }
    })

    it(`should not treat an object that merely spoofs Symbol.toStringTag as a wrapper (no internal slot), and never throw on it`, function() {
        for (let t of ['String', 'Number', 'Boolean']) {
            let o = { [Symbol.toStringTag]: t, valueOf: () => 1, toString: () => 'x' }
            assert.strict.deepStrictEqual(unbox(o) === o, true)
            let fz = Object.freeze({ [Symbol.toStringTag]: t })
            assert.strict.deepStrictEqual(unbox(fz) === fz, true)
        }
    })

    it(`should never call valueOf or toString of the input (the internal slot only)`, function() {
        let w = new Number(5)
        w.valueOf = () => {
            throw new Error('valueOf must not be called')
        }
        w.toString = () => {
            throw new Error('toString must not be called')
        }
        assert.strict.deepStrictEqual(unbox(w), 5)
    })

    it(`should not throw for hostile inputs (revoked Proxy, throwing traps and getters) and return them as they are`, function() {
        for (let h of hostileValues()) {
            let r
            assert.doesNotThrow(() => {
                r = unbox(h.value)
            }, h.name)
            assert.strict.deepStrictEqual([h.name, r === h.value], [h.name, true])
        }
    })

})


describe(`_tagOf(內部: Object.prototype.toString.call之安全版, 批6裁定③)`, function() {

    it(`should give the same string as Object.prototype.toString.call for ordinary values`, function() {
        for (let v of ['a', 1, true, null, undefined, {}, [], function() {}, new Date(0), /a/, new Map(), new Uint8Array(1), new ArrayBuffer(1), 10n, Symbol('x'), new Error('x'), Promise.resolve(1)]) {
            assert.strict.deepStrictEqual(tagOf(v), Object.prototype.toString.call(v))
        }
        assert.strict.deepStrictEqual([tagOf({}), tagOf([]), tagOf(null), tagOf(undefined), tagOf('a')], ['[object Object]', '[object Array]', '[object Null]', '[object Undefined]', '[object String]'])
    })

    it(`should give '' instead of throwing when the tag can not be read (revoked Proxy, throwing traps, Symbol.toStringTag getter that throws)`, function() {
        for (let h of hostileValues().filter((x) => x.unjudgeable)) {
            let r
            assert.doesNotThrow(() => {
                r = tagOf(h.value)
            }, h.name)
            assert.strict.deepStrictEqual([h.name, r], [h.name, ''])
        }
    })

    it(`should keep reading the tag of an object whose other keys throw (only the tag read matters)`, function() {
        for (let h of hostileValues().filter((x) => !x.unjudgeable)) {
            assert.strict.deepStrictEqual([h.name, tagOf(h.value)], [h.name, Object.prototype.toString.call(h.value)])
        }
    })

})
