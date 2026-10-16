/**
 * 判定是否為真Error，內部共用不對外
 *
 * 真Error為instanceof Error(含子類別、DOMException、Error之Proxy、以Error.prototype為原型者)或Error.isError為真(以內部槽判定，含跨realm之Error)；執行環境無Error.isError時，以未帶Symbol.toStringTag者之內部標籤為'[object Error]'或'[object DOMException]'判跨realm之Error(帶Symbol.toStringTag者其標籤可偽裝，不據以判定)
 *
 * 不用lodash isError: 其對「非plain而帶字串name、message」之物件亦為真，會把恰帶此二欄之一般資料類別(聊天訊息、驗證項目等)壓成字串而遺失其餘欄位
 *
 * 使用端: _realErrorToStr(序列化時把真Error轉為'名稱: 訊息'字串，供obj2stru8arr、obj2str之replacer)
 *
 * 刻意不匯入任何模組: 本模組供基礎轉換函數使用, 有匯入即可能形成循環匯入
 *
 * @param {*} v 輸入任意資料
 * @returns {Boolean} 回傳是否為真Error
 */
function isRealError(v) {
    if (v === null || typeof v !== 'object') {
        return false
    }
    if (v instanceof Error) {
        return true
    }
    if (typeof Error.isError === 'function') {
        return Error.isError(v)
    }
    if (Symbol.toStringTag in v) {
        return false
    }
    let tag = Object.prototype.toString.call(v)
    return tag === '[object Error]' || tag === '[object DOMException]'
}


export default isRealError
