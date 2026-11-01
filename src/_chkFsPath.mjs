/**
 * fs系函數之路徑參數檢查，內部共用不對外(R-FS-INVALID-PATH-01)
 *
 * 路徑須為非空字串且不含NUL字元；不符者為「無效」，與「存在與否」分開判定，故不得走到fs.statSync等再被當成「不存在」而回成功
 * 回傳之說明字串不帶輸入值(Node之錯誤訊息會回顯輸入值，且含NUL之字串會原樣帶入)，格式依輸入規格V19: `invalid <名稱>: must be <種類描述>`
 *
 * @param {*} v 輸入路徑值
 * @param {String} name 輸入參數名稱，如'pah'、'fp'、'fd'、'fpSrc'
 * @returns {String|null} 有效回傳null，無效回傳說明字串
 */
function chkFsPath(v, name) {
    if (typeof v !== 'string' || v === '') {
        return `invalid ${name}: must be a non-empty string`
    }
    if (v.includes('\0')) {
        return `invalid ${name}: must not contain a NUL character`
    }
    return null
}


export default chkFsPath
