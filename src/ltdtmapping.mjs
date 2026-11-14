import isarr from './isarr.mjs'
import dtmapping from './dtmapping.mjs'
import _normKey from './_normKey.mjs'


/**
 * 由ltdt陣列各元素物件提取指定keys欄位出來成為新的物件陣列，若物件不存在keys的欄位時，則會自動填入指定數據def
 *
 * 逐列依dtmapping之規則(只取自有可列舉同名欄位、不解析路徑、undefined填入def、__proto__以一般欄位寫入、def為物件時各列各欄各一份複本、def為函數視為null)；
 * 結果列數恆等於ltdt之長度，非物件之列(null、字串、陣列等)以空物件{}佔位(不填入def)，空物件列則各欄位填入def
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/ltdtmapping.test.mjs Github}
 * @memberOf wsemi
 * @param {Array} ltdt 輸入要被提取的任意資料陣列，各元素需為物件，否則提取後為空物件；非陣列或空陣列回傳空陣列[]
 * @param {Array} keys 輸入要提取欄位集合的字串陣列，元素規則同dtmapping；非陣列、空陣列或元素全被略過(如[''])時回傳空陣列[]
 * @param {*} [def=''] 輸入若無提取欄位時所給予的預設值，預設為''
 * @returns {Array} 回傳提取的物件資料陣列
 * @example
 *
 * let r = [
 *     { a: 'a123', b: 123, c: 'abc' },
 *     { a: '1b23', b: 456, c: '123XYZ' },
 *     { a: '12c3', b: 789.0123, c: null }
 * ]
 *
 * console.log(ltdtmapping(r, ['a', 'b']))
 * // => [
 * //     { a: 'a123', b: 123 },
 * //     { a: '1b23', b: 456 },
 * //     { a: '12c3', b: 789.0123 }
 * // ]
 *
 * console.log(ltdtmapping(r, ['a', 'c', 'x']))
 * // => [
 * //     { a: 'a123', c: 'abc', x: '' },
 * //     { a: '1b23', c: '123XYZ', x: '' },
 * //     { a: '12c3', c: null, x: '' }
 * // ]
 *
 * console.log(ltdtmapping([{}], ['a']))
 * // => [{ a: '' }] (列數不變)
 *
 * console.log(ltdtmapping([null], ['a']))
 * // => [{}] (非物件列以{}佔位)
 *
 */
function ltdtmapping(ltdt, keys, def = '') {

    //check, 參數層: 非陣列或空陣列回傳空陣列; 元素層: 只有一個無效元素([{}]、[null])亦逐列處理, 列數不變(使用者2026-11-14, 第430項第二批)
    if (!isarr(ltdt)) {
        return []
    }
    if (!isarr(keys)) {
        return []
    }

    //keys之元素全被略過(如[''])視同keys無效
    let hasKey = false
    for (let i = 0; i < keys.length; i++) {
        if (_normKey(keys[i]) !== null) {
            hasKey = true
            break
        }
    }
    if (!hasKey) {
        return []
    }

    //逐列(以索引迴圈, 空洞亦佔一列), 非物件列由dtmapping回傳{}
    let r = []
    for (let i = 0; i < ltdt.length; i++) {
        r.push(dtmapping(ltdt[i], keys, def))
    }

    return r
}


export default ltdtmapping
