import toLower from 'lodash/toLower'
import trim from 'lodash/trim'
import isbol from './isbol.mjs'
import isestr from './isestr.mjs'


/**
 * 布林值或字串轉布林值
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/cbol.test.js Github}
 * @memberOf wsemi
 * @param {*} v 輸入任意值
 * @returns {Boolean} 回傳布林值
 * @example
 * console.log(cbol(true))
 * // => true
 * console.log(cbol(false))
 * // => false
 * console.log(cbol(0))
 * // => false
 * console.log(cbol(1))
 * // => true
 * console.log(cbol('true'))
 * // => true
 * console.log(cbol('tRuE'))
 * // => true
 * console.log(cbol('TRUE'))
 * // => true
 * console.log(cbol('abc'))
 * // => false
 * console.log(cbol(''))
 * // => false
 * console.log(cbol([]))
 * // => false
 * console.log(cbol({}))
 * // => false
 * console.log(cbol(null))
 * // => false
 * console.log(cbol(undefined))
 * // => false
 */
function cbol(v) {

    //cehck
    if (isbol(v)) {
        return v
    }
    if (v === 0) {
        return false
    }
    if (v === 1) {
        return true
    }

    let r = false
    if (isestr(v)) {
        v = toLower(trim(v))
        if (v === 'true') {
            r = true
        }
    }

    return r
}


export default cbol
