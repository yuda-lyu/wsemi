import tagOf from './_tagOf.mjs'


/**
 * 判斷是否為陣列
 *
 * 對任何輸入皆不拋錯(含已撤銷之Proxy、讀取內部標籤即拋錯之物件)，判定拋錯者回傳false
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/isarr.test.mjs Github}
 * @memberOf wsemi
 * @param {*} v 輸入任意資料
 * @returns {Boolean} 回傳判斷布林值
 * @example
 *
 * console.log(isarr([]))
 * // => true
 *
 * console.log(isarr([{}]))
 * // => true
 *
 */
function isarr(v) {
    let c = tagOf(v)
    return c === '[object Array]'
}


export default isarr
