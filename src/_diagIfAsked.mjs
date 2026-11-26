import getDiag from './getDiag.mjs'
import pickDiagOpt from './pickDiagOpt.mjs'


/**
 * 將失敗之診斷經getDiag(opt)之出口輸出(內部共用不對外)，供「回傳值已改為固定訊息、不帶輸入值(V20)」之函數保留診斷細節
 *
 * 原生錯誤之訊息會帶出輸入內容(循環參照之構造器名與屬性名、寫檔器之分頁名稱、呼叫端toJSON所拋之文字等)，故不得出現於回傳值；
 * 診斷經getDiag(opt)之出口(R-DIAG-01)：opt.logDetail為true時輸出遮罩後之細節，opt.funLog為函數時只交給它；
 * bAlways為false(預設)時，opt未給funLog亦未開logDetail則不輸出任何診斷(同原本之靜默)，為true時預設輸出固定詞彙label與安全摘要{ errType, errCode }
 * 永不拋錯(opt不可讀、funLog拋錯皆吞)
 *
 * @param {Object} opt 輸入診斷設定物件，取opt.logDetail與opt.funLog
 * @param {String} label 輸入診斷之固定詞彙標籤字串
 * @param {*} err 輸入捕捉到之錯誤(任意值)
 * @param {Boolean} [bAlways=false] 輸入是否預設即輸出診斷布林值，預設false
 * @returns {undefined} 無回傳值
 */
function diagIfAsked(opt, label, err, bAlways = false) {
    try {
        let o = pickDiagOpt(opt)
        if (bAlways || o.funLog !== null || o.logDetail) {
            let diag = getDiag(o)
            diag(label, diag.brief(err), () => err)
        }
    }
    catch (e) {
        //診斷不得使呼叫端失敗
    }
}


export default diagIfAsked
