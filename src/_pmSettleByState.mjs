/**
 * 依pmConvertResolve之結果(state與msg)決定Promise之resolve或reject，內部共用，不對外
 *
 * state為success則resolve(msg)，為cancelled則reject({ reason: 'cancelled' })，其餘reject(msg)
 *
 * 使用端: pmQueue、pmThrottle、pmInvResolve，三者之取消一律以{ reason: 'cancelled' }傳出，不得以pmConvertResolve之msg(空字串)傳出
 *
 * @param {Object} pm 輸入genPm產生之Promise物件
 * @param {String} state 輸入狀態字串
 * @param {*} msg 輸入訊息
 */
function pmSettleByState(pm, state, msg) {
    if (state === 'success') {
        pm.resolve(msg)
    }
    else if (state === 'cancelled') {
        pm.reject({ reason: 'cancelled' })
    }
    else {
        pm.reject(msg)
    }
}


export default pmSettleByState
