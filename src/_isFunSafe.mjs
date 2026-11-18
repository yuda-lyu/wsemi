import isfun from './isfun.mjs'


/**
 * 判斷是否為函數，判定本身拋錯(如已撤銷之Proxy使lodash之isFunction拋TypeError)視為非函數，內部共用不對外
 *
 * 供計時與流程函數(setTimeoutHp、setIntervalHp、cacheBd、pmHook、pmHookReject、pmQueue、pmThrottle、pmKeyMutex)檢測呼叫端傳入之函數參數：
 * 無效時依各函數之失敗通道回報(同步拋錯或reject)，不得因判定拋出原生錯誤而改變通道或洩漏內部錯誤訊息；判定規則同isfun(async generator函數為false)
 *
 * @param {*} v 輸入任意值
 * @returns {Boolean} 回傳是否為函數，判定拋錯時回傳false
 */
function isFunSafe(v) {
    try {
        return isfun(v) === true
    }
    catch (err) {
        return false
    }
}


export default isFunSafe
