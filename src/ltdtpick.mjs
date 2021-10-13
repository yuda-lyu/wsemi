import map from 'lodash/map'
import isearr from './isearr.mjs'
import dtpick from './dtpick.mjs'


/**
 * 由ltdt陣列各元素物件提取指定keys欄位出來成為新的物件陣列，僅保留有keys的欄位，若不存在欄位就不提取
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/ltdtpick.test.mjs Github}
 * @memberOf wsemi
 * @param {Array} ltdt 輸入要被提取的任意資料陣列，各元素需為物件，否則提取後為空物件
 * @param {Array} keys 輸入要提取欄位集合的字串陣列
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
 */
function ltdtpick(ltdt, keys) {

    //check
    if (!isearr(ltdt)) {
        return []
    }
    if (!isearr(keys)) {
        return []
    }

    let r = map(ltdt, (dt) => {
        return dtpick(dt, keys)
    })

    return r
}


export default ltdtpick
