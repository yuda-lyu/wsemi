import assert from 'assert'
import arrAdd from '../src/arrAdd.mjs'
import arrMulti from '../src/arrMulti.mjs'
import arrAccum from '../src/arrAccum.mjs'
import arrProduct from '../src/arrProduct.mjs'
import arrNorm from '../src/arrNorm.mjs'
import { INVALID, VALID_STR } from './tools/enumInputs.mjs'
import { defineOptParam } from './tools/optValKit.mjs'


let isErr = (msg) => {
    return (err) => {
        assert.strict.deepStrictEqual(err instanceof Error, true)
        assert.strict.deepStrictEqual(err.message, msg)
        return true
    }
}


//排程第221項第二批 D: 廣義數字陣列計算之opt.base與「每個輸入陣列至少1個有效數字」(dspec §11 第221項待決第15項, 使用者2026-10-31)
//  「arrMulti 時會需要給基準值……這些函數, 把基準值也給與 opt.base」
//  「基於廣義數字之陣列, 於計算處理時, 就僅針對[有效數字類]去處理, 但至少要有1個[有效數字類], 若0個那就是報錯」
//  「若傳入多個廣義數字之陣列, 每個陣列各自至少 1 個」
//  適用: arrAdd(base 0)、arrMulti(1)、arrAccum(0)、arrProduct(0, 呼叫arrMulti時傳base: 0)、arrNorm(0, 呼叫arrProduct時傳base: 0)
//  opt.base以isenum判定, 非預期依K3改用預設(opt.debug警告); 不定參數函數以「最後一個參數為一般物件(非陣列)即為opt」辨識
describe(`opt.base 與每個陣列至少1個有效數字(第221項第二批 第15項)`, function() {

    //opt.base之案例(以可觀察的有效基準值表示): 非有效數字元素'-'以base代入
    let VALID_BASE = [
        [`0`, 0, 0],
        [`5`, 5, 5],
        [`-3`, -3, -3],
        [`2.5`, 2.5, 2.5],
        [`' 7 '`, ' 7 ', 7],
        [`'1e1'`, '1e1', 10],
        [`'+5.'`, '+5.', 5],
    ]

    describe(`arrAdd`, function() {
        defineOptParam({
            fn: 'arrAdd',
            name: 'opt.base',
            def: 0,
            probe: (v, o = {}) => arrAdd(['-', 1], [0, 3], { base: v, ...o })[0], //'-'以base代入, 0為有效數字
            valid: VALID_BASE,
        })

        it(`should substitute base for every non valid element (default 0)`, function() {
            assert.strict.deepStrictEqual(arrAdd([1, '-', null, 4], [10, 20, 30, undefined]), [11, 20, 30, 4])
            assert.strict.deepStrictEqual(arrAdd([1, '-'], [10, 20], { base: 5 }), [11, 25])
            assert.strict.deepStrictEqual(arrAdd(['-', 1], ['NP', 2], { base: 5 }), [10, 3]) //同位置皆非有效數字: 每個元素各以base代入
        })

        it(`should treat the last plain object as opt, but not arrays or non objects`, function() {
            assert.strict.deepStrictEqual(arrAdd([1], [2], { base: 9 }), [3])
            assert.strict.deepStrictEqual(arrAdd([1], [2], {}), [3])
            assert.strict.deepStrictEqual(arrAdd([1], [2], 'x'), []) //非陣列非物件之尾端參數仍視為第3個參數, 容器處置不變
            assert.strict.deepStrictEqual(arrAdd({ base: 1 }), []) //opt之外不足2個陣列
            assert.strict.deepStrictEqual(arrAdd([1], { base: 1 }), [])
        })

        it(`should treat a trailing undefined or null as opt not given (not as the Nth array)`, function() {
            // 主控裁定(wsemi221b報告§8.2第15項): 呼叫端寫arrAdd(a, b, opt)而opt可能未定義時, 尾端undefined/null視為未給opt, 不當成第3個陣列(原回[]之靜默空結果)
            assert.strict.deepStrictEqual(arrAdd([1], [2], undefined), [3])
            assert.strict.deepStrictEqual(arrAdd([1], [2], null), [3])
            assert.strict.deepStrictEqual(arrAdd([1, '-'], [10, 20], undefined), arrAdd([1, '-'], [10, 20]))
            assert.strict.deepStrictEqual(arrAdd([1, '-'], [10, 20], null), arrAdd([1, '-'], [10, 20]))
            //只略過最後一個: 其前之undefined/null仍是陣列參數位置, 容器處置不變(非陣列回[])
            assert.strict.deepStrictEqual(arrAdd([1], [2], undefined, undefined), [])
            assert.strict.deepStrictEqual(arrAdd([1], undefined, [2]), [])
            assert.strict.deepStrictEqual(arrAdd([1], null, [2]), [])
            //opt不在最後一個位置(其後仍有undefined, 或其前有undefined)時不是opt: 物件占陣列位置, 容器處置不變(非陣列回[])
            assert.strict.deepStrictEqual(arrAdd([1], [2], { base: 5 }, undefined), [])
            assert.strict.deepStrictEqual(arrAdd([1], [2], undefined, { base: 5 }), [])
            //略過後陣列參數不足2個: 容器處置不變
            assert.strict.deepStrictEqual(arrAdd([1], undefined), [])
            assert.strict.deepStrictEqual(arrAdd(undefined), [])
            assert.strict.deepStrictEqual(arrAdd(), [])
            //略過後仍須每個陣列至少1個有效數字
            assert.throws(() => arrAdd(['-'], [1], undefined), isErr('invalid arrs[0]: must contain a valid number'))
        })

        it(`should throw with the index when an array has no valid number (even empty), after container checks`, function() {
            assert.throws(() => arrAdd(['-'], [1]), isErr('invalid arrs[0]: must contain a valid number'))
            assert.throws(() => arrAdd([1], ['NP']), isErr('invalid arrs[1]: must contain a valid number'))
            assert.throws(() => arrAdd([1], [2], [null]), isErr('invalid arrs[2]: must contain a valid number'))
            assert.throws(() => arrAdd([], []), isErr('invalid arrs[0]: must contain a valid number'))
            //容器先檢查: 長度不同/非陣列/少於2個時仍回[], 不throw
            assert.strict.deepStrictEqual(arrAdd(['-', '-'], [1]), [])
            assert.strict.deepStrictEqual(arrAdd(['-'], 'x'), [])
            assert.strict.deepStrictEqual(arrAdd(['-']), [])
            //訊息不帶值
            assert.throws(() => arrAdd(['SECRET-xyz'], [1]), (err) => !err.message.includes('SECRET'))
        })
    })

    describe(`arrMulti`, function() {
        defineOptParam({
            fn: 'arrMulti',
            name: 'opt.base',
            def: 1,
            probe: (v, o = {}) => arrMulti(['-', 1], [1, 3], { base: v, ...o })[0], //'-'以base代入
            valid: VALID_BASE,
        })

        it(`should substitute base for every non valid element (default 1)`, function() {
            assert.strict.deepStrictEqual(arrMulti([2, '-', null, 4], [10, 20, 30, undefined]), [20, 20, 30, 4])
            assert.strict.deepStrictEqual(arrMulti([2, '-'], [10, 20], { base: 0 }), [20, 0])
            assert.strict.deepStrictEqual(arrMulti(['-', 2], ['NP', 3], { base: 3 }), [9, 6])
        })

        it(`should treat a trailing undefined or null as opt not given (not as the Nth array)`, function() {
            // 主控裁定(wsemi221b報告§8.2第15項), 同arrAdd
            assert.strict.deepStrictEqual(arrMulti([2], [3], undefined), [6])
            assert.strict.deepStrictEqual(arrMulti([2], [3], null), [6])
            assert.strict.deepStrictEqual(arrMulti([2, '-'], [10, 20], undefined), arrMulti([2, '-'], [10, 20]))
            assert.strict.deepStrictEqual(arrMulti([2], [3], undefined, undefined), [])
            assert.strict.deepStrictEqual(arrMulti([2], undefined, [3]), [])
            assert.strict.deepStrictEqual(arrMulti([2], undefined), [])
            assert.throws(() => arrMulti(['-'], [1], null), isErr('invalid arrs[0]: must contain a valid number'))
        })

        it(`should throw with the index when an array has no valid number (even empty)`, function() {
            assert.throws(() => arrMulti(['-'], [1]), isErr('invalid arrs[0]: must contain a valid number'))
            assert.throws(() => arrMulti([1], [2], ['abc']), isErr('invalid arrs[2]: must contain a valid number'))
            assert.throws(() => arrMulti([], []), isErr('invalid arrs[0]: must contain a valid number'))
            assert.strict.deepStrictEqual(arrMulti(['-', '-'], [1]), [])
        })
    })

    describe(`arrAccum`, function() {
        defineOptParam({
            fn: 'arrAccum',
            name: 'opt.base',
            def: 0,
            probe: (v, o = {}) => arrAccum(['-', 1], { base: v, ...o })[0],
            valid: VALID_BASE,
        })

        it(`should keep one output per input with markers replaced by base (spec example)`, function() {
            assert.strict.deepStrictEqual(arrAccum([1, '2', '-', 3]), [1, 3, 3, 6]) //標記不再變成''
            assert.strict.deepStrictEqual(arrAccum([1, '2', '-', 3], { base: 10 }), [1, 3, 13, 16])
            assert.strict.deepStrictEqual(arrAccum(['-', 1, 2]), [0, 1, 3])
        })

        it(`should throw when no valid number or return [] when not an array`, function() {
            assert.throws(() => arrAccum(['-', 'NP']), isErr('invalid vec: must contain a valid number'))
            assert.throws(() => arrAccum([]), isErr('invalid vec: must contain a valid number'))
            for (let v of ['', null, undefined, {}, 5, 'abc', NaN]) {
                assert.strict.deepStrictEqual(arrAccum(v), [])
            }
            assert.throws(() => arrAccum(['SECRET-xyz']), (err) => !err.message.includes('SECRET'))
        })
    })

    describe(`arrProduct`, function() {
        defineOptParam({
            fn: 'arrProduct',
            name: 'opt.base',
            def: 0,
            probe: (v, o = {}) => arrProduct(['-', 1], [1, 1], { base: v, ...o }) - 1, //位置0: base * 1, 位置1: 1 * 1 = 1, 減去位置1即得base
            valid: VALID_BASE,
        })

        it(`should default opt.base to 0 so that non valid pairs contribute nothing (spec examples)`, function() {
            assert.strict.deepStrictEqual(arrProduct([1, 2, 3], [4, '-', 6]), 22) //使用者範例: 1*4 + 2*0 + 3*6
            assert.strict.deepStrictEqual(arrProduct([1, 2, 3], [4, '-', 6], { base: 1 }), 24)
            assert.strict.deepStrictEqual(arrProduct([1, '2', null, null], [0.1, 0.1, 0.1, null]), 0.1 + 0.2) //第3位置null與第4位置皆為0
            assert.strict.deepStrictEqual(arrProduct([1, 'a'], [2, 'b'], [4, '5']), 8)
            assert.strict.deepStrictEqual(arrProduct(['-', 2], [3, 5]), 10)
        })

        it(`should treat a trailing undefined or null as opt not given (not as the Nth array)`, function() {
            // 主控裁定(wsemi221b報告§8.2第15項), 同arrAdd; 原arrProduct(a, b, undefined)回null
            assert.strict.deepStrictEqual(arrProduct([1, 2], [3, 4], undefined), 11)
            assert.strict.deepStrictEqual(arrProduct([1, 2], [3, 4], null), 11)
            assert.strict.deepStrictEqual(arrProduct([1, 2, 3], [4, '-', 6], undefined), arrProduct([1, 2, 3], [4, '-', 6]))
            assert.strict.deepStrictEqual(arrProduct([1, 2], [3, 4], undefined, undefined), null)
            assert.strict.deepStrictEqual(arrProduct([1, 2], undefined, [3, 4]), null)
            assert.strict.deepStrictEqual(arrProduct([1, 2], undefined), null)
            assert.throws(() => arrProduct(['-'], [1], undefined), isErr('invalid arrs[0]: must contain a valid number'))
        })

        it(`should throw with the index when an array has no valid number`, function() {
            assert.throws(() => arrProduct(['-'], ['NP']), isErr('invalid arrs[0]: must contain a valid number'))
            assert.throws(() => arrProduct([1], ['NP']), isErr('invalid arrs[1]: must contain a valid number'))
            assert.throws(() => arrProduct([], []), isErr('invalid arrs[0]: must contain a valid number'))
        })

        it(`should keep container handling returning null`, function() {
            assert.strict.deepStrictEqual(arrProduct(), null)
            assert.strict.deepStrictEqual(arrProduct([1, 2]), null)
            assert.strict.deepStrictEqual(arrProduct([1, 2], [3]), null)
            assert.strict.deepStrictEqual(arrProduct([1], { base: 1 }), null)
            assert.strict.deepStrictEqual(arrProduct([1], 'x'), null)
        })
    })

    describe(`arrNorm`, function() {
        defineOptParam({
            fn: 'arrNorm',
            name: 'opt.base',
            def: 1,
            probe: (v, o = {}) => arrNorm(['-', 1], { base: v, ...o }), //sqrt(base^2 + 1)
            valid: VALID_BASE.map(([lb, v, n]) => [lb, v, Math.sqrt(n * n + 1)]),
        })

        it(`should default opt.base to 0 (spec examples)`, function() {
            assert.strict.deepStrictEqual(arrNorm([3, '-', 4]), 5)
            assert.strict.deepStrictEqual(arrNorm([1, '2', null, null]), Math.sqrt(5))
            assert.strict.deepStrictEqual(arrNorm([3, '-', 4], { base: 12 }), Math.sqrt(9 + 144 + 16))
        })

        it(`should throw when no valid number (['abc'], []) and return null for non arrays or zero`, function() {
            assert.throws(() => arrNorm(['abc']), isErr('invalid vec: must contain a valid number'))
            assert.throws(() => arrNorm([]), isErr('invalid vec: must contain a valid number'))
            for (let v of ['', null, undefined, {}, 5, NaN]) {
                assert.strict.deepStrictEqual(arrNorm(v), null)
            }
            assert.strict.deepStrictEqual(arrNorm([0, '-']), null) //平方和為0, 舊有行為不變
        })
    })

    //共用輸入矩陣: 每個函數之陣列元素 × 30項無效輸入 × 9項有效字串(§7.2、V24)
    describe(`element matrix`, function() {
        for (let [lb, v] of INVALID) {
            it(`should substitute base for element ${lb} in arrAdd/arrMulti/arrAccum/arrProduct/arrNorm`, function() {
                assert.strict.deepStrictEqual(arrAdd([1, v], [2, 3]), [3, 3])
                assert.strict.deepStrictEqual(arrMulti([2, v], [3, 4]), [6, 4])
                assert.strict.deepStrictEqual(arrAccum([1, v, 2]), [1, 1, 3])
                assert.strict.deepStrictEqual(arrProduct([2, v], [3, 4]), 6)
                assert.strict.deepStrictEqual(arrNorm([3, v, 4]), 5)
            })
            it(`should throw when the only element is ${lb}`, function() {
                assert.throws(() => arrAdd([v], [1]), isErr('invalid arrs[0]: must contain a valid number'))
                assert.throws(() => arrMulti([v], [1]), isErr('invalid arrs[0]: must contain a valid number'))
                assert.throws(() => arrAccum([v]), isErr('invalid vec: must contain a valid number'))
                assert.throws(() => arrProduct([v], [1]), isErr('invalid arrs[0]: must contain a valid number'))
                assert.throws(() => arrNorm([v]), isErr('invalid vec: must contain a valid number'))
            })
        }
        for (let [lb, s, n] of VALID_STR) {
            it(`should use numeric string ${lb} as number ${n} (K4)`, function() {
                assert.strict.deepStrictEqual(arrAdd([s], [0]), [n])
                assert.strict.deepStrictEqual(arrMulti([s], [1]), [n])
                assert.strict.deepStrictEqual(arrAccum([s]), [n])
                assert.strict.deepStrictEqual(arrProduct([s], [2]), n * 2)
                assert.strict.deepStrictEqual(arrNorm([s]), n === 0 ? null : Math.sqrt(n * n))
            })
        }
    })

})
