import get from 'lodash-es/get.js'
import round from 'lodash-es/round.js'
import isbol from './isbol.mjs'
import isnum from './isnum.mjs'
import cdbl from './cdbl.mjs'


/**
 * 數字或字串四捨五入轉整數
 * 若輸入非數字則回傳0
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/cint.test.mjs Github}
 * @memberOf wsemi
 * @param {Number|String} v 輸入數字或字串
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Boolean} [opt.useClampSafe=false] 輸入是否鉗制至安全整數範圍布林值，若為true則四捨五入後之整數超出安全整數範圍時取邊界值，大於Number.MAX_SAFE_INTEGER者取Number.MAX_SAFE_INTEGER、小於Number.MIN_SAFE_INTEGER者取Number.MIN_SAFE_INTEGER，預設false
 * @param {Boolean} [opt.useLimitSafe=false] 輸入是否限制須為安全整數布林值，若為true則四捨五入後之整數超出安全整數範圍(即Number.isSafeInteger為false，含Infinity、-Infinity與絕對值大於Number.MAX_SAFE_INTEGER者)時視為錯誤，預設false。與opt.useClampSafe同時為true時因已先鉗制至安全整數範圍故不會觸發
 * @param {Boolean} [opt.returnWithStateAndMsg=false] 輸入是否回傳含狀態與訊息物件布林值，若為true則回傳{ state, msg }物件，state為'success'或'error'，msg於success時為回傳結果、於error時為錯誤訊息字串，預設false。預設false時錯誤仍以拋出錯誤表達，行為不變
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
 *     // => v[1.7976931348623157e+308] is not a safe integer
 * }
 *
 * console.log(cint(Infinity, { useLimitSafe: true, returnWithStateAndMsg: true }))
 * // => { state: 'error', msg: 'v[1.7976931348623157e+308] is not a safe integer' }
 *
 * console.log(cint('1.5', { returnWithStateAndMsg: true }))
 * // => { state: 'success', msg: 2 }
 *
 */
function cint(v, opt = {}) {

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
        return retError(err.toString())
    }

    //check, 須於round之後檢查r而非之前檢查v, 因v為四捨五入前之數值可為小數(如1.5), 對其取Number.isSafeInteger必為false而誤報; 且useClampSafe為true時r已被鉗制至安全整數範圍, 故此處不會觸發
    if (useLimitSafe) {
        if (!Number.isSafeInteger(Number(r))) {
            return retError(`v[${v}] is not a safe integer`)
        }
    }

    //check -0
    if (String(r) === '0') {
        r = 0
    }

    return retSuccess(r)
}


export default cint
