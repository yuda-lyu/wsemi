import each from 'lodash/each'
import get from 'lodash/get'
import iseobj from './iseobj.mjs'
import isearr from './isearr.mjs'


/**
 * 由dt物件提取keys, 僅保留有keys的欄位, 不存在keys的欄位則自動給予空字串
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/dtmapping.test.js Github}
 * @memberOf wsemi
 * @param {Object} dt 輸入資料物件
 * @param {Array} keys 輸入keys值字串陣列
 * @returns {Object} 回傳處理後物件
 * @example
 * console.log(dtmapping({ a: 'a123', b: 234, c: '345' }, ['a', 'b']))
 * // => { a: 'a123', b: 234 }
 *
 * console.log(dtmapping({ a: 'a123', b: 234, c: '345' }, ['a', 'b', 'x']))
 * // => { a: 'a123', b: 234, x: '' }
 */
function dtmapping(dt, keys) {

    //check
    if (!iseobj(dt)) {
        return {}
    }
    if (!isearr(keys)) {
        return {}
    }

    let r = {}
    each(keys, function(key) {
        r[key] = get(dt, key)
    })

    return r
}


export default dtmapping
