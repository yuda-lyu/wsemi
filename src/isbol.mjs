import isBoolean from 'lodash/isBoolean'


/**
 * 判斷是否為boolean
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/isbol.test.mjs Github}
 * @memberOf wsemi
 * @param {*} v 輸入任意資料
 * @returns {Boolean} 回傳判斷布林值
 * @example
 *
 * console.log(isbol(false))
 * // => true
 *
 */
function isbol(v) {

    return isBoolean(v)
}


export default isbol
