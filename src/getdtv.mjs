import get from 'lodash/get'
import iseobj from './iseobj.mjs'
import isestr from './isestr.mjs'
//import haskey from './haskey.mjs'


/**
 * 取得dt內key對應value
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/getdtv.test.js Github}
 * @memberOf wsemi
 * @param {Object} dt 輸入物件
 * @param {String} key 輸入要找的key值字串
 * @returns {*} 回傳任意資料
 * @example
 * getdtv({ a: 123, b: 'xyz', c: '45op', d: null }, 'a')
 * // => 123
 */
function getdtv(dt, key) {

    //check
    if (!iseobj(dt)) {
        return ''
    }
    if (!isestr(key)) {
        return ''
    }

    // if (haskey(dt, key)) {
    //     return dt[key]
    // }
    //return ''

    return get(dt, key, '')
}


export default getdtv