import { typedArrayName } from './_slotKind.mjs'


/**
 * 判斷是否為Uint16Array
 *
 * 以內部槽判定(不讀Symbol.toStringTag、不觸發Proxy之陷阱)：偽造Symbol.toStringTag為'Uint16Array'之一般物件為false，被覆寫標籤之真Uint16Array與跨realm(vm、iframe)之真Uint16Array為true
 * 對任何輸入皆不拋錯(含已撤銷之Proxy、讀取內部標籤即拋錯之物件)，判定拋錯者回傳false
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/isu16arr.test.mjs Github}
 * @memberOf wsemi
 * @param {*} v 輸入任意資料
 * @returns {Boolean} 回傳判斷布林值
 * @example
 *
 * console.log(isu16arr(new Uint16Array(1)))
 * // => true
 *
 */
function isu16arr(v) {
    return typedArrayName(v) === 'Uint16Array'
}


export default isu16arr
