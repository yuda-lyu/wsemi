import { NONE, tryCall, isObjLike, isProxy, ctlToQ } from './_diagKit.mjs'


/**
 * 控制字元之替換：把字串中可使log行重排、換行或隱藏內容之字元換成?，供寫入log前處理外來文字(欄位名、查詢值、權杖露出之頭尾字元等)
 *
 * 規則見sgud/rule/rulebook_diag.md之R-DIAG-01規則16。替換之字元為Unicode類別Cc(C0控制字元U+0000~U+001F、DEL U+007F、C1控制字元U+0080~U+009F)、
 * Cf(格式字元: 雙向覆寫與隔離U+202A~U+202E、U+2066~U+2069，零寬字元U+200B~U+200F、BOM U+FEFF、軟連字號U+00AD等)、Zl(U+2028)、Zp(U+2029)，每個字元(碼位)換成一個?；
 * 與getDiagShape之鍵名、maskDiagToken之頭尾字元為同一規則(單一實作)。一般空白(U+0020、U+00A0等)與其他文字不變，不截長度
 *
 * s為包裝字串者以原始值處理；非字串原樣回傳(不執行其toString)；永不拋錯
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/maskDiagCtrl.test.mjs Github}
 * @memberOf wsemi
 * @param {String} s 輸入字串
 * @returns {String} 回傳替換後字串，輸入非字串時原樣回傳
 * @example
 *
 * console.log(maskDiagCtrl('a\r\nb\u0000c\u007fd'))
 * // => 'a??b?c?d'
 *
 * console.log(maskDiagCtrl('user\u202eexe.txt'))
 * // => 'user?exe.txt'
 *
 * console.log(maskDiagCtrl('中文 ok'))
 * // => '中文 ok'
 *
 */
function maskDiagCtrl(s) {
    try {
        if (typeof s === 'string') {
            return ctlToQ(s)
        }
        if (!isObjLike(s) || isProxy(s)) {
            return s
        }
        let p = tryCall(String.prototype.valueOf, s)
        return p === NONE ? s : ctlToQ(p)
    }
    catch (err) {
        return s
    }
}


export default maskDiagCtrl
