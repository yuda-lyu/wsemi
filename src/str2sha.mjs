import SHA1 from 'crypto-js/sha1.js'
import SHA224 from 'crypto-js/sha224.js'
import SHA256 from 'crypto-js/sha256.js'
import SHA384 from 'crypto-js/sha384.js'
import SHA512 from 'crypto-js/sha512.js'
import encb64 from 'crypto-js/enc-base64.js'
import enchex from 'crypto-js/enc-hex.js'
import get from 'lodash-es/get.js'
import isbol from './isbol.mjs'
import isestr from './isestr.mjs'
import ispint from './ispint.mjs'
import cint from './cint.mjs'
import haskey from './haskey.mjs'


//crypto-js沒有支援chunk或stream機制, 無法處理大量資料


//kpSha, 可用之n與其對應之演算法, 即SHA-1與SHA-2系列(SHA-224/SHA-256/SHA-384/SHA-512)
//n為演算法名稱之數字, 除SHA-1之1為版本號(實際輸出160位元)外, 其餘皆為輸出位元數
//crypto-js雖另有SHA-3, 但其為獨立演算法族且輸出位元數與SHA-2重疊(如256), 併入將使n產生歧義故不納入
let kpSha = {
    1: SHA1,
    224: SHA224,
    256: SHA256,
    384: SHA384,
    512: SHA512,
}


/**
 * 一般字串轉SHA字串
 * Secure Hash Algorithm n位
 *
 * n僅可為1、224、256、384、512，分別對應SHA-1、SHA-224、SHA-256、SHA-384、SHA-512
 * 其中SHA-1之1為演算法版本號而非輸出位元數(實際輸出160位元)，且已被證實可構造碰撞，僅適用於非資安用途之校驗
 * n為其餘值時視為程式撰寫錯誤而擲出錯誤，非正整數擲出'n is not a positive integer'，正整數但不在可用範圍則擲出'invalid n[n]'
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/str2sha.test.mjs Github}
 * @memberOf wsemi
 * @param {String} str 輸入一般字串，非有效字串時回傳空字串
 * @param {Number} n 輸入演算法位數，僅可為1、224、256、384、512，其餘一律擲出錯誤，但opt.returnWithStateAndMsg為true時改以error狀態回報而不擲出
 * @param {Boolean} [base64=false] 輸入是否轉為base64字串，非布林值時回退為false，預設為false
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Boolean} [opt.returnWithStateAndMsg=false] 輸入是否回傳含狀態與訊息物件布林值，若為true則回傳{ state, msg }物件，state為'success'或'error'，msg於success時為回傳結果、於error時為錯誤訊息字串，預設false
 * @returns {String|Object} 回傳經SHA-n轉換後字串，str非有效字串時回傳空字串；若opt.returnWithStateAndMsg為true則回傳{ state, msg }物件
 * @example
 *
 * console.log(str2sha('test中文', 1))
 * // => 'ecabf586cef0d3b11c56549433ad50b81110a836'
 *
 * console.log(str2sha('test中文', 224))
 * // => 'c9b3eebeae6fe7e42cd9680475787a77e234bce0abb8d599d995b2a6'
 *
 * console.log(str2sha('test中文', 256))
 * // => '8af7c7959618cc0900be74a52eee44aca05aeb72525864dc7ae25d31761beb65'
 *
 * console.log(str2sha('test中文', 384))
 * // => '219ece10ffe81c179511d4ffa43a0c75bbee737acdd18ee11839a1def78a4e10c94186ef8483fce85d0589bcbddf632e'
 *
 * console.log(str2sha('test中文', 512))
 * // => 'ab43333a01571e767a2eb15460c270fa123964c121b88c73e274a211d6e2cf98b10d89220e8d04e2fc573354da93400f3255e94d445dc956e177aa4201a4fc30'
 *
 * console.log(str2sha('test中文', 256, true))
 * // => 'ivfHlZYYzAkAvnSlLu5ErKBa63JSWGTceuJdMXYb62U='
 *
 * try {
 *     str2sha('test中文', 160) //160為SHA-1之輸出位元數而非其演算法名稱, 不可用
 * }
 * catch (err) {
 *     console.log(err.message)
 *     // => invalid n[160]
 * }
 *
 * try {
 *     str2sha('test中文', 'abc')
 * }
 * catch (err) {
 *     console.log(err.message)
 *     // => n is not a positive integer
 * }
 *
 */
function str2sha(str, n, base64 = false, opt = {}) {

    //returnWithStateAndMsg
    let returnWithStateAndMsg = get(opt, 'returnWithStateAndMsg', null)
    if (!isbol(returnWithStateAndMsg)) {
        returnWithStateAndMsg = false
    }

    //retError
    let retError = (msg) => {
        if (returnWithStateAndMsg) {
            return {
                state: 'error',
                msg,
            }
        }
        else {
            return ''
        }
    }

    //check
    if (!isestr(str)) {
        return retError('invalid str')
    }

    //check n, 須為正整數
    //此檢核須置於haskey之前: haskey內部為key in obj而含原型鏈, 'toString'等鍵會誤判為存在
    //n無效屬呼叫端之程式錯誤, 預設模式維持拋錯之既有契約; 僅returnWithStateAndMsg時改以error狀態回報, 以與該模式「不拋錯」之語意一致
    if (!ispint(n)) {
        if (returnWithStateAndMsg) {
            return retError('n is not a positive integer')
        }
        throw new Error(`n is not a positive integer`)
    }
    n = cint(n)

    //check n, 須為kpSha內可用之n
    if (!haskey(kpSha, n)) {
        if (returnWithStateAndMsg) {
            return retError(`invalid n[${n}]`)
        }
        throw new Error(`invalid n[${n}]`)
    }

    //check
    if (!isbol(base64)) {
        base64 = false
    }

    //c, 須攔截非預期錯誤(如crypto-js對過大資料拋錯), 否則會外拋至呼叫端
    let c = ''
    try {
        let fnSha = kpSha[n]
        let o = fnSha(str)
        if (base64) {
            c = o.toString(encb64)
        }
        else {
            c = o.toString(enchex)
        }
    }
    catch (err) {
        return retError(err.toString())
    }

    if (returnWithStateAndMsg) {
        return {
            state: 'success',
            msg: c,
        }
    }
    else {
        return c
    }
}


export default str2sha
