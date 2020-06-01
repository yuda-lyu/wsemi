import map from 'lodash/map'
import isearr from './isearr.mjs'
import dtmapping from './dtmapping.mjs'


/**
 * 由ltdt陣列各元素物件提取指定keys欄位出來成為新的物件陣列，若物件不存在keys的欄位時，則會自動填入指定數據def
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/ltdtmapping.test.js Github}
 * @memberOf wsemi
 * @param {Array} ltdt 輸入要被提取的任意資料陣列，各元素需為物件，否則提取後為空物件
 * @param {Array} keys 輸入要提取欄位集合的字串陣列
 * @param {*} [def=''] 輸入若無提取欄位時所給予的預設值，預設為''
 * @returns {Array} 回傳提取的物件資料陣列
 * @example
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
 */
function ltdtmapping(ltdt, keys, def = '') {

    //check
    if (!isearr(ltdt)) {
        return []
    }
    if (!isearr(keys)) {
        return []
    }

    let r = map(ltdt, (dt) => {
        return dtmapping(dt, keys, def)
    })

    return r
}


export default ltdtmapping
