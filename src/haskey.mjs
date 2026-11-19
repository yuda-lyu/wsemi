import isobj from './isobj.mjs'
import isestr from './isestr.mjs'
import isnum from './isnum.mjs'


/**
 * 判斷物件是否有key屬性
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/haskey.test.mjs Github}
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
    if (!isestr(key) && !isnum(key)) {
        return false
    }

    //key in obj會觸發Proxy之has陷阱, 陷阱拋錯者無法判定, 回傳false(判斷函數不拋錯, R-JUDGE-NOTHROW-01)
    try {
        return (key in obj)
    }
    catch (err) {
        return false
    }
}


export default haskey
