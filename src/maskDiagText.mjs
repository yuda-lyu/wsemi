import { NONE, tryCall, isObjLike, isProxy, pickList, getCtx, maskStr, optMode, markDropped } from './_diagKit.mjs'


/**
 * 文字遮罩：把字串中之憑證以***取代，供診斷輸出與對外錯誤值使用
 *
 * 規則見sgud/rule/rulebook_diag.md之R-DIAG-01。全部規則在原文上求命中區間、相交者合併後一次取代(不依序取代，故自訂樣式與已知秘密跨界重疊、長短秘密首尾重疊皆無殘留片段)：
 * ①已知秘密(secrets之全部出現處，含彼此重疊者；百分比編碼之十六進位大小寫不分)；②網址帳密scheme://帳密@(帳密含@時取至最後一個@，不跨空白、/、?、#，引號亦屬帳密段；寧可多遮緊湊JSON之片段)；
 * ③憑證鍵值對(鍵名password、passwd、pwd、secret、token、authorization、api-key、x-api-key、__sysToken__不分大小寫，後接:或=，值可為雙引號、單引號、跳脫之雙引號、陣列或無引號，只遮值)與獨立之Bearer憑證；④opt.patterns所宣告之樣式
 *
 * 長度：超過20000字元者先截至「20000＋最長秘密長度＋1024」再遮(跨截點之秘密在窗內被遮)，只輸出原文位置20000之前之內容(起於截點前之遮罩照輸出；以原文位置計，遮後變短亦不輸出截點後之原文)並接…(len=原長)
 *
 * secrets可為字串陣列(包裝字串解包，其他原始值與物件之項略過)或getDiagSecrets之結果(取其detail清單)，無法使用者(可偵測之Proxy、存取器之項、可偵測之Proxy之項、來源無法讀取之getDiagSecrets結果〔含其複製之副本〕、型別不合)回傳***(fail-closed)；
 * s為包裝字串者以原始值處理；清單可用時非字串原樣回傳(本函數只處理文字，物件請用maskDiagCopy或maskDiagErr)，清單無法使用時不論輸入型別皆回傳***；永不拋錯(內部失敗回***)
 *
 * opt.patterns為陣列，每項為具名樣式名稱(pragmaKey、fsPathTail、receivedTail、mdbUrl、mongoHostEcho)或樣式物件{ re, group, when, scope, detailOnly }：
 * re為RegExp(自動加g與d旗標，旗標以內建getter讀取)；group為要遮之群組名或索引(陣列者取第一個有參與比對者，未給為整段)；when(match)為同步判定是否遮(於取得區間之後呼叫，拋錯視為要遮)；
 * scope為'message'者只作用於第一個「換行加4空白at 」之前；detailOnly為true者只用於診斷輸出(路徑類樣式；對外錯誤值之遮罩不用，fsPathTail、receivedTail即是)
 *
 * 已知限制: 未登錄之秘密只依網址帳密、鍵值對與Bearer之樣式盡力遮罩；鍵值對之鍵名為子字串比對(如mytoken=亦遮)
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/maskDiagText.test.mjs Github}
 * @memberOf wsemi
 * @param {String} s 輸入字串
 * @param {Array|Object} [secrets=[]] 輸入秘密清單陣列，或getDiagSecrets回傳之物件(取detail)，預設[]
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Array} [opt.patterns=[]] 輸入套件樣式陣列，預設[]
 * @returns {String} 回傳遮罩後字串，輸入非字串時原樣回傳(清單無法使用時為***)
 * @example
 *
 * console.log(maskDiagText('connect postgres://u1:pw1234@db:5432/a failed', ['pw1234']))
 * // => 'connect postgres://***@db:5432/a failed'
 *
 * console.log(maskDiagText('{"password":"x9","n":1} Bearer abc.def'))
 * // => '{"password":"***","n":1} Bearer ***'
 *
 * console.log(maskDiagText(`PRAGMA key='k1'`, [], { patterns: ['pragmaKey'] }))
 * // => "PRAGMA key='***'"
 *
 */
function maskDiagText(s, secrets, opt) {
    let ctx
    try {
        ctx = getCtx(pickList(secrets, 'detail'), opt, optMode(opt)) //清單無法使用者不論輸入型別皆fail-closed
    }
    catch (err) {
        markDropped(s) //輸入不交出: 原生Promise標記已處理
        return '***'
    }
    if (typeof s !== 'string') {
        if (!isObjLike(s) || isProxy(s)) {
            return s
        }
        let p = tryCall(String.prototype.valueOf, s)
        if (p === NONE) {
            return s
        }
        s = p
    }
    try {
        return maskStr(s, ctx)
    }
    catch (err) {
        return '***'
    }
}


export default maskDiagText
