/**
 * 對原生Promise預先掛上無作用之拒絕處理，使其標記為已處理，內部共用不對外
 *
 * 用於接收先行產生之Promise陣列而依序或限量取用者(pmSeries、pmMap未給fun時)：排在後面之Promise先reject時，若尚未被取用即成為未處理之rejection(Node預設即結束行程)，預先標記後其結果仍由原流程取用
 *
 * 只處理原生Promise(含子類別)，以Promise.prototype.then.call執行，不呼叫一般thenable之then(避免觸發其副作用)，任何拋錯皆忽略
 *
 * @param {*} v 輸入任意值
 */
function pmMarkHandled(v) {
    try {
        if (v instanceof Promise) {
            Promise.prototype.then.call(v, undefined, () => {})
        }
    }
    catch (err) {}
}


export default pmMarkHandled
