//resKit, blob2*等回傳Promise函數之測試共用輔助(R-TEST-STRUCT-01)
//  原定義於test/blob2b64.test.mjs並由另6個測試檔import: 測試檔(.test.mjs)被他檔import時, ESM模組快取使其頂層之describe只於各行程第一次載入時註冊,
//  mocha --parallel依分派決定同一行程載入哪些檔案, 致該檔之案數於各次全套隨分派而異(22917、22914、22907…)
//  共用者一律置於test/tools/且不帶.test.中綴, 測試檔之間不得互相import


/**
 * 分辨「同步拋錯」「resolve」「reject」三種結果
 * 回傳Promise之函數其失敗一律須走reject: 同步拋錯會使呼叫端之.catch完全接不到(連Promise都還沒回傳), 靜默resolve則使失敗無從辨識
 *
 * @param {Function} fn 輸入呼叫被測函數之函數
 * @returns {Promise} 回傳Promise, resolve { mode: 'throw'|'notPromise'|'resolve'|'reject', msg }
 */
let getRes = async (fn) => {
    let r = null
    try {
        r = fn()
    }
    catch (err) {
        return { mode: 'throw', msg: String((err && err.message) || err) }
    }
    if (r === null || typeof r.then !== 'function') {
        return { mode: 'notPromise', msg: '' }
    }
    return r
        .then((v) => {
            return { mode: 'resolve', msg: v }
        })
        .catch((err) => {
            return { mode: 'reject', msg: String((err && err.message) || err) }
        })
}


export { getRes }
