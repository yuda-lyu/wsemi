import { isArrayBuffer } from './_slotKind.mjs'


/**
 * 判斷是否為ArrayBuffer
 *
 * 以內部槽判定(不讀Symbol.toStringTag、不觸發Proxy之陷阱)：偽造Symbol.toStringTag為'ArrayBuffer'之一般物件為false，被覆寫標籤之真ArrayBuffer與跨realm(vm、iframe)之真ArrayBuffer為true；SharedArrayBuffer為false
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
    return isArrayBuffer(v)
}


export default isab
