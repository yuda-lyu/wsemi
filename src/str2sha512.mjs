import get from 'lodash-es/get.js'
import isbol from './isbol.mjs'
import str2sha from './str2sha.mjs'


//crypto-js沒有支援chunk或stream機制, 無法處理大量資料


/**
 * 一般字串轉SHA512字串
 * Secure Hash Algorithm 512位
 *
 * 內部調用str2sha並固定n為512
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/str2sha512.test.mjs Github}
 * @memberOf wsemi
 * @param {String} str 輸入一般字串，非有效字串時回傳空字串
 * @param {Boolean} [base64=false] 輸入是否轉為base64字串，非布林值時回退為false，預設為false
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Boolean} [opt.returnWithStateAndMsg=false] 輸入是否回傳含狀態與訊息物件布林值，若為true則回傳{ state, msg }物件，state為'success'或'error'，msg於success時為回傳結果、於error時為錯誤訊息字串，預設false
 * @returns {String|Object} 回傳經SHA512轉換後字串，str非有效字串時回傳空字串；若opt.returnWithStateAndMsg為true則回傳{ state, msg }物件
 * @example
 *
 * console.log(str2sha512('test中文'))
 * // => 'ab43333a01571e767a2eb15460c270fa123964c121b88c73e274a211d6e2cf98b10d89220e8d04e2fc573354da93400f3255e94d445dc956e177aa4201a4fc30'
 *
 */
function str2sha512(str, base64 = false, opt = {}) {

    //returnWithStateAndMsg
    let returnWithStateAndMsg = get(opt, 'returnWithStateAndMsg', null)
    if (!isbol(returnWithStateAndMsg)) {
        returnWithStateAndMsg = false
    }

    //非opt-in模式時原樣委派, 維持既有行為(含n無效時之拋錯契約)
    if (!returnWithStateAndMsg) {
        return str2sha(str, 512, base64)
    }

    //內部一律以returnWithStateAndMsg取狀態, 錯誤訊息前置來源函數名以利分辨是哪一步出錯
    let r = str2sha(str, 512, base64, { returnWithStateAndMsg: true })
    if (r.state === 'error') {
        return {
            state: 'error',
            msg: `str2sha: ${r.msg}`,
        }
    }

    return r
}


export default str2sha512
