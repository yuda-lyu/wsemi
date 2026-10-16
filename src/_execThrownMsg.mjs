import getErrorMessage from './getErrorMessage.mjs'
import errToStr from './_errToStr.mjs'


/**
 * 執行外部程序之入口讀取呼叫端輸入失敗時之訊息，內部共用不對外
 *
 * 取execSpawnError所得之message；其只得code(呼叫端拋出非Error之值，如字串、null，取不到message而以code代之)時改取getErrorMessage，為空退_errToStr，保留拋出值之文字(R-EXEC-FAIL-01之13)
 *
 * 使用端: execCli、execCliSession、execCliJsonRpc、execProcess之入口catch
 *
 * @param {Object} e 輸入execSpawnError之結果物件{ code, message }
 * @param {*} err 輸入捕捉之原始錯誤值
 * @returns {String} 回傳訊息字串
 */
function execThrownMsg(e, err) {
    let m = e.message
    if (m === e.code) {
        m = getErrorMessage(err)
        if (m === '') {
            m = errToStr(err)
        }
    }
    return m
}


export default execThrownMsg
