import { isObjLike } from './_diagKit.mjs'


//readOpt, 讀設定之一個鍵(各自try; 讀取拋錯或非物件為undefined; 同getDiag之讀法)
let readOpt = (o, k) => {
    try {
        if (!isObjLike(o)) {
            return undefined
        }
        return o[k]
    }
    catch (err) {
        return undefined
    }
}


/**
 * 自使用端之設定物件取診斷輸出之兩鍵：回傳只含{ logDetail, funLog }之新物件，供套件把其建構選項之診斷設定併入evEmit、evEmitDelay之opt(如{ tag: '套件名', ...pickDiagOpt(opt) })或交給getDiag，不整包轉傳使用端設定(避免funSettle、funEmit、tag等鍵被使用端設定覆蓋)
 *
 * 規則見sgud/rule/rulebook_diag.md之R-DIAG-01規則18。讀法同getDiag：各鍵讀取一次、各自try(讀取拋錯、opt非物件或為undefined、null皆視為未給)；logDetail須===true才為true，其餘為false；funLog須為函數才保留(原參照，含genDiagFunLog所產生帶noDetail者)，其餘為null；
 * 非預期之值改用預設而不報錯(同opt之規則K3)；不改寫輸入、不讀其他鍵、永不拋錯
 *
 * 只取值、不驗證：套件若要於建構時對型別不合之logDetail、funLog拋錯(既有之自寫取值函數有此行為者)，須自行另驗，本函數只取代「取兩鍵」之部分；未給之鍵回預設值(false、null)而非undefined，交給getDiag、evEmit時效果與未給相同
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/pickDiagOpt.test.mjs Github}
 * @memberOf wsemi
 * @param {Object} opt 輸入使用端之設定物件，讀其logDetail與funLog
 * @returns {Object} 回傳物件{ logDetail, funLog }，logDetail為布林值，funLog為函數或null
 * @example
 *
 * let fl = (label, safe, detail) => {}
 * console.log(pickDiagOpt({ logDetail: true, funLog: fl, tag: 'x', other: 1 }))
 * // => { logDetail: true, funLog: [Function: fl] }
 *
 * console.log(pickDiagOpt({ logDetail: 'yes', funLog: 'no' }), pickDiagOpt(undefined))
 * // => { logDetail: false, funLog: null } { logDetail: false, funLog: null }
 *
 * //併入evEmit之opt
 * //evEmit(ev, 'change', [data], { tag: 'w-xxx', ...pickDiagOpt(opt) })
 *
 */
function pickDiagOpt(opt) {
    let logDetail = readOpt(opt, 'logDetail') === true
    let funLog = readOpt(opt, 'funLog')
    return { logDetail, funLog: typeof funLog === 'function' ? funLog : null }
}


export default pickDiagOpt
