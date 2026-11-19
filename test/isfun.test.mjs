import assert from 'assert'
import isFunction from 'lodash-es/isFunction.js'
import isfun from '../src/isfun.mjs'
import { nonFunValues, revokedFn } from './tools/caseKit.mjs'
import { hostileValues } from './tools/hostileValues.mjs'


describe(`isfun`, function() {

    it(`should return false when input '2019-01-01'`, function() {
        let r = isfun('2019-01-01')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01'`, function() {
        let r = isfun('2019-21-01')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return true when input function() {}`, function() {
        let r = isfun(function() {})
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input () => {}`, function() {
        let r = isfun(() => {})
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input async function() {}`, function() {
        let r = isfun(async function() {})
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input function* () {}`, function() {
        //改委派lodash之isFunction後generator函數亦為函數; 原以toString標籤判定之實作漏掉此類
        let r = isfun(function* () {})
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input class {}`, function() {
        let r = isfun(class {})
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input a bound function`, function() {
        let f = function() {}
        let r = isfun(f.bind(null))
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return false when input '1.25'`, function() {
        let r = isfun('1.25')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '125'`, function() {
        let r = isfun('125')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input 125`, function() {
        let r = isfun(125)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input -125`, function() {
        let r = isfun(-125)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input 1.25`, function() {
        let r = isfun(1.25)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input -1.25`, function() {
        let r = isfun(-1.25)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '125abc'`, function() {
        let r = isfun('125abc')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input 'abc125'`, function() {
        let r = isfun('abc125')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '12a5'`, function() {
        let r = isfun('12a5')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input ''`, function() {
        let r = isfun('')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input false`, function() {
        let r = isfun(false)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input []`, function() {
        let r = isfun([])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input [{}]`, function() {
        let r = isfun([{}])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input [{ a: 123 }]`, function() {
        let r = isfun([{ a: 123 }])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input ['']`, function() {
        let r = isfun([''])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input ['abc']`, function() {
        let r = isfun(['abc'])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input {}`, function() {
        let r = isfun({})
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input { a: 123 }`, function() {
        let r = isfun({ a: 123 })
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input { a: 123, b: null, c: [45.67] }`, function() {
        let r = isfun({ a: 123, b: null, c: [45.67] })
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input null`, function() {
        let r = isfun(null)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input undefined`, function() {
        let r = isfun(undefined)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input NaN`, function() {
        let r = isfun(NaN)
        assert.strict.deepStrictEqual(r, false)
    })

})


//判斷函數不應拋錯(使用者2026-11-16 批6裁定③; dspec〈輸入參數之檢測機制〉§5.3 C2): isfun本身對已撤銷之Proxy等使lodash isFunction拋錯者回false
//  原內部模組_isFunSafe(test/_isFunSafe.test.mjs)之案移至此, _isFunSafe已移除, 其使用站點改回isfun
describe(`isfun 不拋錯(原_isFunSafe之案, dspec §11 W-15、批6裁定③)`, function() {

    it(`函數(一般、箭頭、async、generator、class、內建)為true`, function() {
        class C {}
        for (let f of [function() {}, () => {}, async () => {}, function* () {}, C, Math.max, Object, class extends C {}]) {
            assert.strict.deepStrictEqual(isfun(f), true)
        }
    })

    it(`非函數(12值)為false: async generator函數維持現行為false; 已撤銷之Proxy(物件與函數)亦為false, 不外拋`, function() {
        //前提: 已撤銷之函數Proxy使lodash之isFunction拋TypeError(若此前提不成立, 此案應先失敗, 避免下方之false只是lodash本身回false)
        assert.strict.throws(() => isFunction(revokedFn()), TypeError)
        for (let [k, v] of nonFunValues()) {
            assert.strict.deepStrictEqual([k, isfun(v)], [k, false])
        }
    })

    it(`async generator函數維持現行(false), 與修前isfun一致`, function() {
        //批6裁定③: async generator 之結果維持現行 isfun
        assert.strict.deepStrictEqual(isfun(async function* () {}), false)
        assert.strict.deepStrictEqual(isFunction(async function* () {}), false)
    })

    it(`回傳值恆為布林值(不回傳truthy之其他值)`, function() {
        for (let v of [function() {}, undefined, null, 0, 'a', {}, [], revokedFn()]) {
            assert.strict.deepStrictEqual(typeof isfun(v), 'boolean')
        }
    })

    it(`惡意值(已撤銷之Proxy、陷阱全拋錯之Proxy、讀取標籤即拋錯之物件)皆回false且不拋錯`, function() {
        for (let h of hostileValues()) {
            let r = null
            assert.doesNotThrow(() => {
                r = isfun(h.value)
            }, h.name)
            assert.strict.deepStrictEqual([h.name, r], [h.name, false])
        }
    })

    it(`有效之函數Proxy(未撤銷)為true`, function() {
        assert.strict.deepStrictEqual(isfun(new Proxy(function() {}, {})), true)
        let r = Proxy.revocable(function() {}, {})
        assert.strict.deepStrictEqual(isfun(r.proxy), true)
        r.revoke()
        assert.strict.deepStrictEqual(isfun(r.proxy), false)
    })

})
