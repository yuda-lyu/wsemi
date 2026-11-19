import isFunction from 'lodash-es/isFunction.js'


/**
 * 判斷是否為函數
 *
 * 委派lodash之isFunction，一般函數、箭頭函數、async函數、generator函數與class皆為true；async generator函數(async function*)於lodash 4判為false，屬其已知限制
 * 對任何輸入皆不拋錯：已撤銷之Proxy、讀取內部標籤即拋錯之物件使lodash之isFunction拋出TypeError時，一律回傳false(判斷函數不應拋錯，dspec〈輸入參數之檢測機制〉§5.3 C2)
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/isfun.test.mjs Github}
 * @memberOf wsemi
 * @param {*} v 輸入任意資料
 * @returns {Boolean} 回傳判斷布林值，判定拋錯(如已撤銷之Proxy)時回傳false
 * @example
 *
 * console.log(isfun('1.25'))
 * // => false
 *
 * console.log(isfun(function() {}))
 * // => true
 *
 * let r = Proxy.revocable(function() {}, {})
 * r.revoke()
 * console.log(isfun(r.proxy))
 * // => false (已撤銷之Proxy, 不拋錯)
 *
 */
function isfun(v) {
    try {
        return isFunction(v) === true
    }
    catch (err) {
        return false
    }
}


export default isfun
