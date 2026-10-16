import toLower from 'lodash-es/toLower.js'
import trim from 'lodash-es/trim.js'
import isbol from './isbol.mjs'
import isestr from './isestr.mjs'


/**
 * 布林值或字串轉布林值
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/cbol.test.mjs Github}
 * @memberOf wsemi
 * @param {*} v 輸入任意值
 * @returns {Boolean} 回傳布林值，恆回傳原始布林值(輸入new Boolean時回傳其原始值而非包裝物件)
 * @example
 *
 * console.log(cbol(true))
 * // => true
 *
 * console.log(cbol(false))
 * // => false
 *
 * console.log(cbol(0))
 * // => false
 *
 * console.log(cbol(1))
 * // => true
 *
 * console.log(cbol('true'))
 * // => true
 *
 * console.log(cbol('tRuE'))
 * // => true
 *
 * console.log(cbol('TRUE'))
 * // => true
 *
 * console.log(cbol('abc'))
 * // => false
 *
 * console.log(cbol(''))
 * // => false
 *
 * console.log(cbol([]))
 * // => false
 *
 * console.log(cbol({}))
 * // => false
 *
 * console.log(cbol(null))
 * // => false
 *
 * console.log(cbol(undefined))
 * // => false
 *
 */
function cbol(v) {

    //cehck
    if (isbol(v)) {
        //包裝物件須回原始值(new Boolean(false)本身為truthy), 以Boolean.prototype.valueOf取得
        //  凍結且偽造Symbol.toStringTag為'Boolean'之物件亦通過isbol, 取原始值時拋錯, 非布林故回false
        try {
            return Boolean.prototype.valueOf.call(v)
        }
        catch (err) {
            return false
        }
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
