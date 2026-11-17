/**
 * 對外函數之注入鍵(fs、path、crypto等Node內建)與呼叫端opt合併，注入鍵給undefined視為未給而取內建，內部共用不對外(R-FS-DEPS-01規則5，W-10)
 *
 * `{ fs, ...opt }`之展開會以opt之undefined蓋掉內建預設；本函數於展開後把值為undefined之注入鍵還原為內建。null、非物件、缺少方法者不處理，仍交Core依相依檢查(fail-closed)回報
 *
 * 展開(含opt之getter、已撤銷之Proxy)可拋錯，呼叫端須置於try內
 *
 * @param {Object} defaults 輸入內建注入物，如{ fs, path, crypto }
 * @param {Object} opt 輸入呼叫端設定物件
 * @returns {Object} 回傳合併後之設定物件
 */
function mergeInject(defaults, opt) {
    let o = { ...defaults, ...opt }
    for (let k of Object.keys(defaults)) {
        if (o[k] === undefined) {
            o[k] = defaults[k]
        }
    }
    return o
}


export default mergeInject
