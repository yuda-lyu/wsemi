import { isProxy as isProxyCore } from './_diagKit.mjs'


/**
 * 判斷是否為可偵測之Proxy，供診斷與遮罩相關之判定(不觸發陷阱)使用
 *
 * 規則見sgud/rule/rulebook_diag.md之R-DIAG-01。以util.types.isProxy判定(Node 20.16、22.3起經process.getBuiltinModule取得，含已撤銷之Proxy、以函數為目標之Proxy)，不讀取輸入之任何屬性、不觸發Proxy之陷阱、不拋錯；
 * util.types取不到之環境(瀏覽器、Node<20.16)Proxy不可偵測，恆回傳false(已知限制，同getDiag系列之退路)；非物件與非函數一律為false
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/isProxy.test.mjs Github}
 * @memberOf wsemi
 * @param {*} v 輸入任意資料
 * @returns {Boolean} 回傳判斷布林值
 * @example
 *
 * console.log(isProxy(new Proxy({}, {})))
 * // => true (util.types可用時)
 *
 * console.log(isProxy({}))
 * // => false
 *
 */
function isProxy(v) {
    return isProxyCore(v)
}


export default isProxy
