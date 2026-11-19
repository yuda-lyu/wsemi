import tagOf from './_tagOf.mjs'


/**
 * 判斷是否為ArrayBuffer
 *
 * 對任何輸入皆不拋錯(含已撤銷之Proxy、讀取內部標籤即拋錯之物件)，判定拋錯者回傳false
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/isab.test.mjs Github}
 * @memberOf wsemi
 * @param {*} v 輸入任意資料
 * @returns {Boolean} 回傳判斷布林值
 * @example
 *
 * console.log(isab(new ArrayBuffer(1)))
 * // => true
 *
 */
function isab(v) {
    let c = tagOf(v)
    return c === '[object ArrayBuffer]'
}


export default isab
