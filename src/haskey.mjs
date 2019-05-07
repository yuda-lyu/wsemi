import isobj from './isobj.mjs'
import isestr from './isestr.mjs'


/**
 * 判斷物件是否有key屬性
 *
 * @export
 * @param {Object} obj 輸入物件
 * @param {String} key 輸入要查找的key字串
 * @returns {Boolean} 回傳判斷布林值
 */
export default function haskey(obj, key) {

    //check
    if (!isobj(obj)) {
        return false
    }
    if (!isestr(key)) {
        return false
    }

    return (key in obj)
}
