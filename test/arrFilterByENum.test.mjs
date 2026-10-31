import assert from 'assert'
import arrFilterByENum from '../src/arrFilterByENum.mjs'
import arrFilterByNum from '../src/arrFilterByNum.mjs'
import { INVALID, VALID_STR } from './tools/enumInputs.mjs'


//dspec §11(使用者2026-10-31): 「arrFilterByNum 就是基於isnum去判斷 arrFilterByPnum 就是基於ispnum, 應該需創建 arrFilterByENum, 就是基於 isenum」
//  介面與輸出比照arrFilterByNum: 輸入陣列、回傳新陣列、元素已轉為數值; 判定改為isenum(§3.1數字字串、§7.1有效數字)
describe(`arrFilterByENum`, function() {

    it(`should return the same as arrFilterByNum for plain numbers and decimal numeric strings`, function() {
        let arr = ['abc', '-2.2', '-1.1', -1.1, -1, -0.5, 0, '0', 0.5, 1, 1.1, '1.1', '2.2', 'xyz']
        let rr = [-2.2, -1.1, -1.1, -1, -0.5, 0, 0, 0.5, 1, 1.1, 1.1, 2.2]
        assert.strict.deepStrictEqual(arrFilterByENum(arr), rr)
        assert.strict.deepStrictEqual(arrFilterByENum(arr), arrFilterByNum(arr))
    })

    it(`should keep order and duplicates, and convert numeric strings with surrounding whitespace and scientific notation (K4)`, function() {
        assert.strict.deepStrictEqual(arrFilterByENum([' 12 ', '1.2e-5', '+5.', '1E+1', '-.5', '00012', 5, 5, '\t30\n']), [12, 0.000012, 5, 10, -0.5, 12, 5, 5, 30])
    })

    it(`should return -0 as a number 0 equal value and keep negative numbers and zero`, function() {
        assert.strict.deepStrictEqual(arrFilterByENum([-3, 0, '0', '-0']), [-3, 0, 0, -0])
    })

    //對應規格 §3.1、§7.1: 下列為isnum為true、isenum為false者, arrFilterByNum會保留而arrFilterByENum不保留
    it(`should drop what isnum accepts but isenum rejects (Infinity, '0x10', '1e400', '1e-400', wrapper objects)`, function() {
        let bad = [Infinity, -Infinity, 'Infinity', '-Infinity', '0x10', '0b11', '0o7', '1e400', '-1e400', '1e-400', new Number(30), new String('30')] // eslint-disable-line no-new-wrappers
        assert.strict.deepStrictEqual(arrFilterByENum([1, ...bad, 2]), [1, 2])
        //對照: arrFilterByNum仍基於isnum, 不改
        assert.ok(arrFilterByNum([1, ...bad, 2]).length > 2)
    })

    //對應規格 §7.2 測試矩陣: 共用30項無效輸入皆不保留
    for (let [lb, v] of INVALID) {
        it(`should drop invalid element ${lb}`, function() {
            assert.strict.deepStrictEqual(arrFilterByENum([7, v, 8]), [7, 8])
            assert.strict.deepStrictEqual(arrFilterByENum([v]), [])
        })
    }

    //共用有效字串矩陣: 轉為數值
    for (let [lb, s, n] of VALID_STR) {
        it(`should keep valid numeric string ${lb} as number ${n}`, function() {
            assert.strict.deepStrictEqual(arrFilterByENum([s]), [n])
        })
    }

    //輸入不是陣列時回傳[](比照arrFilterByNum)
    for (let [lb, v] of [[`''`, ''], ['{}', {}], ['null', null], ['undefined', undefined], ['NaN', NaN], ['5', 5], [`'5'`, '5'], ['true', true], ['[] (empty)', []], [`{ length: 1, 0: 1 }`, { length: 1, 0: 1 }]]) {
        it(`should return [] when input ${lb}`, function() {
            assert.strict.deepStrictEqual(arrFilterByENum(v), [])
        })
    }

    it(`should not mutate the input array and should return a new array`, function() {
        let arr = ['1', 2, 'x']
        let r = arrFilterByENum(arr)
        assert.strict.deepStrictEqual(arr, ['1', 2, 'x'])
        assert.notStrictEqual(r, arr)
    })

    it(`should treat sparse array holes as invalid`, function() {
        let arr = [1, , 3] // eslint-disable-line no-sparse-arrays
        assert.strict.deepStrictEqual(arrFilterByENum(arr), [1, 3])
    })

    it(`should not pass lodash index/array into isenum opt (array of numeric strings keeps all)`, function() {
        assert.strict.deepStrictEqual(arrFilterByENum(['1', '2', '3']), [1, 2, 3])
    })

})
