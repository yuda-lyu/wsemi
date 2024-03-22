import each from 'lodash-es/each.js'
import get from 'lodash-es/get.js'
import isearr from './isearr.mjs'


/**
 * 由dt物件提取指定keys欄位出來成為新物件，若物件不存在keys的欄位時，則會自動填入指定數據def
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/dtmapping.test.mjs Github}
 * @memberOf wsemi
 * @param {Object} dt 輸入資料物件
 * @param {Array} keys 輸入要提取欄位集合的字串陣列
 * @param {*} [def=''] 輸入若無提取欄位時所給予的預設值，預設為''
 * @returns {Object} 回傳處理後物件
 * @example
 *
 * console.log(dtmapping({ a: 'a123', b: 234, c: '345' }, ['a', 'b']))
 * // => { a: 'a123', b: 234 }
 *
 * console.log(dtmapping({ a: 'a123', b: 234, c: '345' }, ['a', 'b', 'x']))
 * // => { a: 'a123', b: 234, x: '' }
 *
 */
function dtmapping(dt, keys, def = '') {

    //check
    // if (!iseobj(dt)) { //不能跳出, 要支援對空物件與keys直接產生新物件
    //     return {}
    // }
    if (!isearr(keys)) {
        return {}
    }

    let r = {}
    each(keys, function(key) {
        r[key] = get(dt, key, def)
    })

    return r
}


export default dtmapping
