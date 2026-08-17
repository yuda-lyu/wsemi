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
 * @returns {String} 回傳經SHA512轉換後字串，str非有效字串時回傳空字串
 * @example
 *
 * console.log(str2sha512('test中文'))
 * // => 'ab43333a01571e767a2eb15460c270fa123964c121b88c73e274a211d6e2cf98b10d89220e8d04e2fc573354da93400f3255e94d445dc956e177aa4201a4fc30'
 *
 */
function str2sha512(str, base64 = false) {
    return str2sha(str, 512, base64)
}


export default str2sha512
