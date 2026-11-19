/**
 * 取得值之內部標籤字串(內部共用不對外)，即Object.prototype.toString.call(v)之安全版
 *
 * 判斷類函數(isobj、isarr、isnull等)之共同底層：判斷類函數對任何輸入皆不得拋錯(dspec〈輸入參數之檢測機制〉§5.3 C2)，
 * 而Object.prototype.toString.call對已撤銷之Proxy、陷阱拋錯之Proxy、讀取Symbol.toStringTag即拋錯之物件會拋TypeError或原錯誤，故判定拋錯者回傳空字串(無法判定型別，各判斷函數視為不符)
 * 只用於判定型別，不用於取得值內容
 *
 * @param {*} v 輸入任意值
 * @returns {String} 回傳內部標籤字串，如'[object Object]'；判定拋錯時回傳''
 */
function tagOf(v) {
    try {
        return Object.prototype.toString.call(v)
    }
    catch (err) {
        return ''
    }
}


export default tagOf
