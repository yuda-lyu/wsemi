import isError from 'lodash-es/isError.js'


/**
 * 判斷是否為錯誤
 *
 * 對任何輸入皆不拋錯(含已撤銷之Proxy、讀取內部標籤即拋錯之物件)，lodash之isError判定拋錯者回傳false
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
    try {
        return isError(v) === true
    }
    catch (err) {
        return false
    }
}


export default isErr
