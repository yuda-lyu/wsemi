import each from 'lodash/each'
import get from 'lodash/get'
import isobj from './isobj.mjs'
import isearr from './isearr.mjs'
import haskey from './haskey.mjs'


/**
 * 由dt物件提取指定keys欄位出來成為新物件，僅保留有keys的欄位，若不存在欄位就不提取
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/dtpick.test.mjs Github}
 * @memberOf wsemi
 * @param {Object} dt 輸入資料物件
 * @param {Array} keys 輸入要提取欄位集合的字串陣列
 * @returns {Object} 回傳處理後物件
 * @example
 *
 * console.log(dtpick({ a: 'a123', b: 234, c: '345' }, ['a', 'b']))
 * // => { a: 'a123', b: 234 }
 *
 * console.log(dtpick({ a: 'a123', b: 234, c: '345' }, ['a', 'b', 'x']))
 * // => { a: 'a123', b: 234 }
 *
 */
function dtpick(dt, keys) {

    //check
    if (!isobj(dt)) {
        return {}
    }
    if (!isearr(keys)) {
        return {}
    }

    let r = {}
    each(keys, function(key) {
        if (haskey(dt, key)) {
            r[key] = get(dt, key)
        }
    })

    return r
}


export default dtpick
