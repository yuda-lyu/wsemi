import { writeXlsx } from 'hucre/xlsx'
import diagIfAsked from './_diagIfAsked.mjs'


/**
 * 將活頁簿寫成Excel位元組(內部共用不對外)，寫檔器拒絕(如分頁名含Excel禁用字元)時不外傳原錯誤，改回固定訊息之{ error }
 *
 * 寫檔器之錯誤訊息會帶出分頁名稱等輸入內容(如'Sheet name "x:y" contains ":"')，依V20不得回顯於回傳值；
 * 診斷經diagIfAsked(opt.logDetail、opt.funLog)，bAlways為false(預設)時未要求則靜默，為true時預設輸出固定詞彙label與安全摘要
 *
 * @param {Object} wb 輸入活頁簿物件{ sheets }
 * @param {String} label 輸入診斷之固定詞彙標籤字串
 * @param {String} msg 輸入失敗時回傳之固定訊息字串
 * @param {Object} [opt={}] 輸入診斷設定物件，取opt.logDetail與opt.funLog，預設{}
 * @param {Boolean} [bAlways=false] 輸入是否預設即輸出診斷布林值，預設false
 * @returns {Promise} 回傳Promise，resolve成功時為Uint8Array，失敗時為{ error: msg }
 */
async function writeXlsxSafe(wb, label, msg, opt = {}, bAlways = false) {
    try {
        return await writeXlsx(wb)
    }
    catch (err) {
        diagIfAsked(opt, label, err, bAlways)
        return {
            error: msg,
        }
    }
}


export default writeXlsxSafe
