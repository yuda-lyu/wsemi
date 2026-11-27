import get from 'lodash-es/get.js'
import round from 'lodash-es/round.js'
import isbol from './isbol.mjs'
import isnum from './isnum.mjs'
import cdbl from './cdbl.mjs'
import unbox from './_unbox.mjs'
import pickOpt from './_pickOpt.mjs'
import diagIfAsked from './_diagIfAsked.mjs'


/**
 * 數字或字串四捨五入轉整數
 * 若輸入非數字則回傳0
 * 轉型函數照舊拆包: 包裝物件new Number(1)、new String('1')先取出原始值再轉換(判斷函數isnum只收原始值，轉型函數不受影響)
 *
 * 注意: 超出安全整數範圍(絕對值大於Number.MAX_SAFE_INTEGER)之數值轉換後會失真(如cint(2 ** 60)為1152921504606847000，已非原值；字串'9007199254740993'轉為9007199254740992)，本函數行為不改。
 * 要精確、可安全計算之整數，請先以iseint判斷(iseint(v)為true者其安全整數轉換無損，字串並檢查精度遺失)，再以cint轉換；亦可用opt.useClampSafe鉗制或opt.useLimitSafe視為錯誤
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/cint.test.mjs Github}
 * @memberOf wsemi
 * @param {Number|String} v 輸入數字或字串
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Boolean} [opt.useClampSafe=false] 輸入是否鉗制至安全整數範圍布林值，若為true則四捨五入後之整數超出安全整數範圍時取邊界值，大於Number.MAX_SAFE_INTEGER者取Number.MAX_SAFE_INTEGER、小於Number.MIN_SAFE_INTEGER者取Number.MIN_SAFE_INTEGER，預設false
 * @param {Boolean} [opt.useLimitSafe=false] 輸入是否限制須為安全整數布林值，若為true則四捨五入後之整數超出安全整數範圍(即Number.isSafeInteger為false，含Infinity、-Infinity與絕對值大於Number.MAX_SAFE_INTEGER者)時視為錯誤，預設false。與opt.useClampSafe同時為true時因已先鉗制至安全整數範圍故不會觸發
 * @param {Boolean} [opt.returnWithStateAndMsg=false] 輸入是否回傳含狀態與訊息物件布林值，若為true則回傳{ state, msg }物件，state為'success'或'error'，msg於success時為回傳結果、於error時為錯誤訊息字串，預設false。預設false時錯誤仍以拋出錯誤表達，行為不變
 * @param {Boolean} [opt.logDetail=false] 輸入轉換失敗時是否輸出遮罩後之細節布林值(經getDiag之出口)，須為true才生效，msg(含預設模式拋出之Error之訊息)為固定詞彙(不含原生錯誤之文字)，預設false(靜默)
 * @param {Function} [opt.funLog=null] 輸入轉換失敗時之診斷輸出函數，格式為(label, safe, detail)=>{}，給予時診斷交給它(label為'[wsemi cint] can not convert v to integer'，同getDiag)，預設null
 * @returns {Integer} 回傳四捨五入後整數；若opt.returnWithStateAndMsg為true則回傳{ state, msg }物件
 * @example
 *
 * console.log(cint('1.5'))
 * // => 2
 *
 * console.log(cint('-1.5'))
 * // => -1
 *
 * console.log(cint(Infinity))
 * // => 1.7976931348623157e+308
 *
 * console.log(cint(Infinity, { useClampSafe: true }))
 * // => 9007199254740991
 *
 * console.log(cint(-Infinity, { useClampSafe: true }))
 * // => -9007199254740991
 *
 * try {
 *     cint(Infinity, { useLimitSafe: true })
 * }
 * catch (err) {
 *     console.log(err.message)
 *     // => invalid v: must be a safe integer
 * }
 *
 * console.log(cint(Infinity, { useLimitSafe: true, returnWithStateAndMsg: true }))
 * // => { state: 'error', msg: 'invalid v: must be a safe integer' }
 *
 * console.log(cint('1.5', { returnWithStateAndMsg: true }))
 * // => { state: 'success', msg: 2 }
 *
 */
function cint(v, opt = {}) {

    //opt, 取快照: 讀取拋錯(已撤銷之Proxy、getter拋錯、陷阱拋錯)之opt或其鍵視為未給, 不拋錯(C1: 轉型函數無法轉型回預設值, 不拋錯)
    //optRaw, 診斷出口(diagIfAsked)須讀原opt之logDetail、funLog(快照只含業務鍵與惰性之debug、funLog)
    let optRaw = opt
    opt = pickOpt(opt, ['useClampSafe', 'useLimitSafe', 'returnWithStateAndMsg'])

    //useClampSafe
    let useClampSafe = get(opt, 'useClampSafe', null)
    if (!isbol(useClampSafe)) {
        useClampSafe = false
    }

    //useLimitSafe
    let useLimitSafe = get(opt, 'useLimitSafe', null)
    if (!isbol(useLimitSafe)) {
        useLimitSafe = false
    }

    //returnWithStateAndMsg
    let returnWithStateAndMsg = get(opt, 'returnWithStateAndMsg', null)
    if (!isbol(returnWithStateAndMsg)) {
        returnWithStateAndMsg = false
    }

    //retSuccess
    let retSuccess = (v) => {
        if (returnWithStateAndMsg) {
            return {
                state: 'success',
                msg: v,
            }
        }
        else {
            return v
        }
    }

    //retError, 預設模式沿用既有之拋出錯誤, 不改變既有行為
    let retError = (msg) => {
        if (returnWithStateAndMsg) {
            return {
                state: 'error',
                msg,
            }
        }
        else {
            throw new Error(msg)
        }
    }

    //拆包, 轉型函數照舊轉換包裝物件(isnum只收原始值)
    v = unbox(v)

    //check
    if (!isnum(v)) {
        return retSuccess(0)
    }

    //r, 須攔截cdbl與round之非預期錯誤, 否則returnWithStateAndMsg為true時仍會外拋至呼叫端
    let r = null
    try {

        v = cdbl(v)

        r = round(v)

        //clamp, 須於round之後鉗制, 因cdbl對Infinity與超出範圍數值會轉為Number.MAX_VALUE, 其必超出安全整數範圍而取得邊界值
        if (useClampSafe) {
            if (r > Number.MAX_SAFE_INTEGER) {
                r = Number.MAX_SAFE_INTEGER
            }
            else if (r < Number.MIN_SAFE_INTEGER) {
                r = Number.MIN_SAFE_INTEGER
            }
        }

    }
    catch (err) {
        //訊息為固定詞彙(V19、V20, 不轉出原生錯誤之文字; 預設模式拋出之Error亦同), 細節經opt之診斷出口(預設靜默)
        diagIfAsked(optRaw, '[wsemi cint] can not convert v to integer', err)
        return retError('can not convert v to integer')
    }

    //check, 須於round之後檢查r而非之前檢查v, 因v為四捨五入前之數值可為小數(如1.5), 對其取Number.isSafeInteger必為false而誤報; 且useClampSafe為true時r已被鉗制至安全整數範圍, 故此處不會觸發
    if (useLimitSafe) {
        if (!Number.isSafeInteger(Number(r))) {
            return retError(`invalid v: must be a safe integer`) //V20: 不帶v之值
        }
    }

    //check -0
    if (String(r) === '0') {
        r = 0
    }

    return retSuccess(r)
}


export default cint
