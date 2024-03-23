// import isNaN from 'lodash-es/isNaN.js'


/**
 * 判斷是否為NaN
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/isnan.test.mjs Github}
 * @memberOf wsemi
 * @param {*} v 輸入任意資料
 * @returns {Boolean} 回傳判斷布林值
 * @example
 *
 * console.log(isnan(NaN))
 * // => true
 *
 */
function isnan(v) {

    // return isNaN(v)
    return v !== v
}


export default isnan
