import isarr from './isarr.mjs'
import isearr from './isearr.mjs'
import dtpick from './dtpick.mjs'


/**
 * 由ltdt陣列各元素物件提取指定keys欄位出來成為新的物件陣列，僅保留有keys的欄位，若不存在欄位就不提取
 *
 * 逐列依dtpick之規則(只取自有可列舉欄位、__proto__以一般欄位寫入、值為undefined之欄位保留)；結果列數恆等於ltdt之長度，非物件之列(含null、字串、陣列)以空物件{}佔位
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/ltdtpick.test.mjs Github}
 * @memberOf wsemi
 * @param {Array} ltdt 輸入要被提取的任意資料陣列，各元素需為物件，否則提取後為空物件；非陣列或空陣列回傳空陣列[]
 * @param {Array} keys 輸入要提取欄位集合的字串陣列，非有效陣列回傳空陣列[]
 * @returns {Array} 回傳提取的物件資料陣列
 * @example
 *
 * let r = [
 *     { a: 'a123', b: 123, c: 'abc' },
 *     { a: '1b23', b: 456, c: '123XYZ' },
 *     { a: '12c3', b: 789.0123, c: null }
 * ]
 *
 * console.log(ltdtpick(r, ['a', 'b']))
 * // => [
 * //     { a: 'a123', b: 123 },
 * //     { a: '1b23', b: 456 },
 * //     { a: '12c3', b: 789.0123 }
 * // ]
 *
 * console.log(ltdtpick(r, ['a', 'c', 'x']))
 * // => [
 * //     { a: 'a123', c: 'abc' },
 * //     { a: '1b23', c: '123XYZ' },
 * //     { a: '12c3', c: null }
 * // ]
 *
 * console.log(ltdtpick([{}], ['a']))
 * // => [{}] (列數不變)
 *
 * console.log(ltdtpick([null], ['a']))
 * // => [{}] (非物件列以{}佔位)
 *
 */
function ltdtpick(ltdt, keys) {

    //check, 參數層: 非陣列或空陣列回傳空陣列; 元素層: 只有一個無效元素([{}]、[null])亦逐列處理, 列數不變(使用者2026-11-14, 第430項第二批)
    if (!isarr(ltdt)) {
        return []
    }
    if (!isearr(keys)) {
        return []
    }

    //逐列(以索引迴圈, 空洞亦佔一列)
    let r = []
    for (let i = 0; i < ltdt.length; i++) {
        r.push(dtpick(ltdt[i], keys))
    }

    return r
}


export default ltdtpick
