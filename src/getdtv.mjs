import isobj from './isobj.mjs'
import haskey from './haskey.mjs'


/**
 * 取得dt內key對應value
 *
 * @export
 * @param {Object} dt 輸入物件
 * @param {String} key 輸入要找的key值字串
 * @returns {*} 回傳任意資料
 */
export default function getdtv(dt, key) {

    //check
    if (!isobj(dt)) {
        return ''
    }

    if (haskey(dt, key)) {
        return dt[key]
    }
    return ''
}
