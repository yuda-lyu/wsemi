import isError from 'lodash-es/isError.js'


/**
 * 判斷是否為錯誤
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/isErr.test.mjs Github}
 * @memberOf wsemi
 * @param {*} v 輸入任意資料
 * @returns {Boolean} 回傳判斷布林值
 * @example
 *
 * console.log(isErr(new Error))
 * // => true
 *
 */
function isErr(v) {
    return isError(v)
}


export default isErr
