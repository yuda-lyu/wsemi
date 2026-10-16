import isstr from './isstr.mjs'


/**
 * 判斷是否為有效字串
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/isestr.test.mjs Github}
 * @memberOf wsemi
 * @param {*} v 輸入任意資料
 * @returns {Boolean} 回傳判斷布林值，包裝物件依其原始值判定
 * @example
 *
 * console.log(isestr('1.25'))
 * // => true
 *
 * console.log(isestr(125))
 * // => false
 *
 * console.log(isestr(''))
 * // => false
 *
 */
function isestr(v) {

    //check
    if (isstr(v)) {
        if (v.length > 0) { //以length判定, 包裝物件(new String)與原始值同義, 不可用v !== ''(new String('')不全等於'')
            return true
        }
    }
    return false
}


export default isestr
