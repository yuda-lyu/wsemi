import assert from 'assert'
import vm from 'vm'
import isnull from '../src/isnull.mjs'
import isundefined from '../src/isundefined.mjs'
import isbigint from '../src/isbigint.mjs'
import isab from '../src/isab.mjs'
import isu8arr from '../src/isu8arr.mjs'
import isu16arr from '../src/isu16arr.mjs'
import { hostileValues } from './tools/hostileValues.mjs'


//第552項(排程第492項第10批): 以內部標籤判型之判斷函數可被偽造Symbol.toStringTag之物件通過 → 比照isstr改用語言原生判定
//  isnull(v === null)、isundefined(v === undefined)、isbigint(typeof v === 'bigint', 包裝物件Object(1n)為false)、
//  isab、isu8arr、isu16arr(內部槽: ArrayBuffer.prototype.byteLength存取器、%TypedArray%.prototype[Symbol.toStringTag]存取器; 跨realm之真實例仍為true)
//  isarr、isobj、isblob、isfile維持標籤判定(下游有依賴現行語意, 停於該函數待裁示, 見報告〈下游盤點〉)
//  對任何輸入皆不拋錯(dspec〈輸入參數之檢測機制〉§5.3 C2)
//  期望值皆手寫


//forged, 偽造Symbol.toStringTag為name之一般物件(含以getter提供者)
let forged = (name) => ({ [Symbol.toStringTag]: name })
let forgedGetter = (name) => ({
    get [Symbol.toStringTag]() {
        return name
    },
})

//retag, 覆寫真實例之Symbol.toStringTag(自有屬性)
let retag = (v, name) => {
    Object.defineProperty(v, Symbol.toStringTag, { value: name })
    return v
}


describe(`第552項: isnull、isundefined(語言原生判定)`, function() {

    it(`isnull: 只有null為true`, function() {
        assert.strict.deepStrictEqual(isnull(null), true)
        for (let v of [undefined, 0, '', false, NaN, {}, [], () => {}, Symbol('s'), 0n, new Date(0)]) {
            assert.strict.deepStrictEqual(isnull(v), false, String(typeof v))
        }
    })

    it(`isnull: 偽造Symbol.toStringTag為'Null'之物件為false(原為true)`, function() {
        assert.strict.deepStrictEqual(isnull(forged('Null')), false)
        assert.strict.deepStrictEqual(isnull(forgedGetter('Null')), false)
        assert.strict.deepStrictEqual(isnull(Object.create(null, { [Symbol.toStringTag]: { value: 'Null' } })), false)
    })

    it(`isundefined: 只有undefined為true`, function() {
        assert.strict.deepStrictEqual(isundefined(undefined), true)
        assert.strict.deepStrictEqual(isundefined(undefined), true)
        for (let v of [null, 0, '', false, NaN, {}, [], () => {}, Symbol('s'), 0n]) {
            assert.strict.deepStrictEqual(isundefined(v), false, String(typeof v))
        }
    })

    it(`isundefined: 偽造Symbol.toStringTag為'Undefined'之物件為false(原為true)`, function() {
        assert.strict.deepStrictEqual(isundefined(forged('Undefined')), false)
        assert.strict.deepStrictEqual(isundefined(forgedGetter('Undefined')), false)
    })

})


describe(`第552項: isbigint(只收原始BigInt)`, function() {

    it(`原始BigInt為true; 其他原始值為false`, function() {
        assert.strict.deepStrictEqual([isbigint(0n), isbigint(123n), isbigint(BigInt('9007199254740993')), isbigint(-5n)], [true, true, true, true])
        for (let v of [0, 123, '123', null, undefined, true, Symbol('s'), {}, []]) {
            assert.strict.deepStrictEqual(isbigint(v), false, String(typeof v))
        }
    })

    it(`BigInt包裝物件Object(1n)為false(原為true); 偽造標籤為'BigInt'之物件為false(原為true)`, function() {
        assert.strict.deepStrictEqual(isbigint(Object(1n)), false)
        assert.strict.deepStrictEqual(isbigint(Object(BigInt(5))), false)
        assert.strict.deepStrictEqual(isbigint(forged('BigInt')), false)
        assert.strict.deepStrictEqual(isbigint(forgedGetter('BigInt')), false)
    })

})


describe(`第552項: isab(內部槽)`, function() {

    it(`真ArrayBuffer為true(含不同長度、長度0、被覆寫標籤者、跨realm者); SharedArrayBuffer與其他型別為false`, function() {
        assert.strict.deepStrictEqual([isab(new ArrayBuffer(0)), isab(new ArrayBuffer(8))], [true, true])
        assert.strict.deepStrictEqual(isab(retag(new ArrayBuffer(2), 'Foo')), true) //真實例改標籤: 原為false
        assert.strict.deepStrictEqual(isab(vm.runInNewContext('new ArrayBuffer(4)')), true) //跨realm
        assert.strict.deepStrictEqual(isab(new SharedArrayBuffer(4)), false)
        for (let v of [new Uint8Array(2), new DataView(new ArrayBuffer(2)), Buffer.alloc(2), null, undefined, 5, 'ab', {}, []]) {
            assert.strict.deepStrictEqual(isab(v), false)
        }
    })

    it(`偽造Symbol.toStringTag為'ArrayBuffer'之物件與Proxy包裝之ArrayBuffer為false(原為true)`, function() {
        assert.strict.deepStrictEqual(isab(forged('ArrayBuffer')), false)
        assert.strict.deepStrictEqual(isab(forgedGetter('ArrayBuffer')), false)
        assert.strict.deepStrictEqual(isab(new Proxy(new ArrayBuffer(4), {})), false)
        assert.strict.deepStrictEqual(isab(Object.create(ArrayBuffer.prototype)), false) //原型為ArrayBuffer.prototype但無內部槽
    })

})


describe(`第552項: isu8arr、isu16arr(內部槽)`, function() {

    it(`isu8arr: 真Uint8Array與Node之Buffer、子類別、被覆寫標籤者、跨realm者為true`, function() {
        class MyU8 extends Uint8Array {}
        assert.strict.deepStrictEqual([isu8arr(new Uint8Array(0)), isu8arr(new Uint8Array(3)), isu8arr(Buffer.from('abc')), isu8arr(new MyU8(2))], [true, true, true, true])
        assert.strict.deepStrictEqual(isu8arr(retag(new Uint8Array(2), 'Foo')), true) //原為false
        assert.strict.deepStrictEqual(isu8arr(vm.runInNewContext('new Uint8Array(3)')), true)
    })

    it(`isu8arr: 其他型別陣列、ArrayBuffer、DataView與一般值為false; 偽造標籤與Proxy包裝者為false(原偽造標籤為true)`, function() {
        for (let v of [new Uint8ClampedArray(2), new Int8Array(2), new Uint16Array(2), new ArrayBuffer(2), new DataView(new ArrayBuffer(2)), null, undefined, 5, 'x', {}, []]) {
            assert.strict.deepStrictEqual(isu8arr(v), false)
        }
        assert.strict.deepStrictEqual(isu8arr(forged('Uint8Array')), false)
        assert.strict.deepStrictEqual(isu8arr(forgedGetter('Uint8Array')), false)
        assert.strict.deepStrictEqual(isu8arr(new Proxy(new Uint8Array(2), {})), false)
        assert.strict.deepStrictEqual(isu8arr(Object.create(Uint8Array.prototype)), false)
    })

    it(`isu16arr: 真Uint16Array、子類別、被覆寫標籤者、跨realm者為true; 其他為false; 偽造標籤與Proxy包裝者為false(原偽造標籤為true)`, function() {
        class MyU16 extends Uint16Array {}
        assert.strict.deepStrictEqual([isu16arr(new Uint16Array(0)), isu16arr(new Uint16Array(3)), isu16arr(new MyU16(2))], [true, true, true])
        assert.strict.deepStrictEqual(isu16arr(retag(new Uint16Array(2), 'Foo')), true)
        assert.strict.deepStrictEqual(isu16arr(vm.runInNewContext('new Uint16Array(3)')), true)
        for (let v of [new Uint8Array(2), Buffer.alloc(2), new Int16Array(2), new ArrayBuffer(2), null, undefined, {}, []]) {
            assert.strict.deepStrictEqual(isu16arr(v), false)
        }
        assert.strict.deepStrictEqual(isu16arr(forged('Uint16Array')), false)
        assert.strict.deepStrictEqual(isu16arr(new Proxy(new Uint16Array(2), {})), false)
    })

})


describe(`第552項: 六個函數對hostileValues全集(19值)不拋錯且皆為false`, function() {

    let fns = [['isnull', isnull], ['isundefined', isundefined], ['isbigint', isbigint], ['isab', isab], ['isu8arr', isu8arr], ['isu16arr', isu16arr]]
    for (let [name, f] of fns) {
        it(`${name}(惡意值) 不拋錯、回傳false`, function() {
            for (let h of hostileValues()) {
                let r
                assert.doesNotThrow(() => {
                    r = f(h.value)
                }, h.name)
                assert.ok(r === false, `${name}(${h.name}) must be false`)
            }
        })
    }

    it(`模組載入後全域之Object.prototype.toString、ArrayBuffer.prototype、Uint8Array.prototype被覆寫不影響判定(內建存取器於載入時取得)`, function() {
        let savedTs = Object.prototype.toString
        let dAb = Object.getOwnPropertyDescriptor(ArrayBuffer.prototype, 'byteLength')
        let pTa = Object.getPrototypeOf(Uint8Array.prototype)
        let dTa = Object.getOwnPropertyDescriptor(pTa, Symbol.toStringTag)
        let r = null
        try {
            Object.prototype.toString = () => '[object X]' // eslint-disable-line no-extend-native
            Object.defineProperty(ArrayBuffer.prototype, 'byteLength', { get: () => 0, configurable: true }) // eslint-disable-line no-extend-native
            Object.defineProperty(pTa, Symbol.toStringTag, { get: () => 'Fake', configurable: true })
            r = [isab(new ArrayBuffer(1)), isab({}), isu8arr(new Uint8Array(1)), isu16arr(new Uint16Array(1)), isu8arr({})]
        }
        finally {
            Object.prototype.toString = savedTs // eslint-disable-line no-extend-native
            Object.defineProperty(ArrayBuffer.prototype, 'byteLength', dAb) // eslint-disable-line no-extend-native
            Object.defineProperty(pTa, Symbol.toStringTag, dTa)
        }
        assert.strict.deepStrictEqual(r, [true, false, true, true, false])
    })

})
