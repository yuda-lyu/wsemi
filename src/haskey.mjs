import isobj from './isobj.mjs'
import isestr from './isestr.mjs'


/**
 * 判斷物件是否有key屬性
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/haskey.test.js Github}
 * @memberOf wsemi
 * @param {Object} obj 輸入物件
 * @param {String} key 輸入要查找的key字串
 * @returns {Boolean} 回傳判斷布林值
 * @example
 *
 * console.log(haskey({ a: 123, b: 'xyz', c: '45op', d: null }, 'a'))
 * // => true
 *
 */
function haskey(obj, key) {

    //check
    if (!isobj(obj)) {
        return false
    }
    if (!isestr(key)) {
        return false
    }

    return (key in obj)
}


export default haskey
