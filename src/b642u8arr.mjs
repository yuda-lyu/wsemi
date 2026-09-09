import encbase64 from 'crypto-js/enc-base64.js'
import get from 'lodash-es/get.js'
import isbol from './isbol.mjs'
import isstr from './isstr.mjs'


//crypto-js沒有支援chunk或stream機制, 無法處理大量資料


//本函數之驗證與解碼語意對齊RFC 4648與TC39之proposal-arraybuffer-base64(已進ES2026), 等同Uint8Array.fromBase64之預設模式(alphabet: 'base64'、lastChunkHandling: 'loose')
//nodejs 25起原生內建Uint8Array.fromBase64, 屆時本函數之驗證與解碼段可整段換為: return Uint8Array.fromBase64(b64), 並以try catch接住其SyntaxError轉為本函數之失敗回傳; 現行nodejs 24尚無此API故自行實作
//驗證規則取自規範並以core-js之規範實作對拍, 見test/b642u8arr.test.mjs之[oracle]案


//reWhitespace, 規範所定之ASCII空白: TAB(0x09)、LF(0x0A)、FF(0x0C)、CR(0x0D)、SPACE(0x20)
//RFC 4648與TC39之Uint8Array.fromBase64皆規定解碼前忽略此類空白, 折行之base64(MIME/PEM)方能正確解出
let reWhitespace = /[\t\n\f\r ]/g

//reB64, base64字母表, padding僅可出現於末端且至多2個
//RFC 4648 §3.3為MUST等級: 含字母表外之字元一律拒絕, 否則忽略非法字元會形成隱蔽通道、可繞過字串相等比較, 亦可能觸發實作缺陷
let reB64 = /^[A-Za-z0-9+/]*={0,2}$/

//rePadTail, 取末端連續padding
let rePadTail = /=+$/


/**
 * base64字串轉Uint8Array
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/b642u8arr.test.mjs Github}
 * @memberOf wsemi
 * @param {String} b64 輸入base64字串
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Boolean} [opt.returnWithStateAndMsg=false] 輸入是否回傳含狀態與訊息物件布林值，若為true則回傳{ state, msg }物件，state為'success'或'error'，msg於success時為回傳結果、於error時為錯誤訊息字串，預設false
 * @returns {Uint8Array|Object} 回傳Uint8Array，輸入非字串或非合法base64時回傳空Uint8Array；若opt.returnWithStateAndMsg為true則回傳{ state, msg }物件
 * @example
 *
 * console.log(b642u8arr('AQItAA=='))
 * // => new Uint8Array([1, 2.3, '45', 'abc'])
 *
 */
function b642u8arr(b64, opt = {}) {

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
            return new Uint8Array()
        }
    }

    //check
    if (!isstr(b64)) {
        return retError('invalid b64')
    }

    //注意: Nodejs 25起原生內建Uint8Array.fromBase64, 待升版後再改用

    //b64c, 先剝除ASCII空白再驗證; 底層crypto-js對字母表外之字元查表得undefined並當成0位元, 不剝不驗則空白與非法字元皆會靜默解出錯誤位元組
    let b64c = b64.replace(reWhitespace, '')

    //check, 字母表與padding位置
    if (!reB64.test(b64c)) {
        return retError('invalid b64, contains characters outside the base64 alphabet or misplaced padding')
    }

    //check, 長度與padding數須配對; 末段採loose(即Uint8Array.fromBase64之預設, 允許末段2或3字元不補padding), 但長度模4為1之末段一律無效
    let nPad = b64c.length - b64c.replace(rePadTail, '').length
    let nBody = b64c.length - nPad
    let mod = nBody % 4
    if (nPad === 0 && mod === 1) {
        return retError(`invalid b64, the last chunk has only 1 character[${b64c.length}]`)
    }
    if (nPad === 1 && mod !== 3) {
        return retError(`invalid b64, malformed padding, 1 padding requires the last chunk to have 3 characters`)
    }
    if (nPad === 2 && mod !== 2) {
        return retError(`invalid b64, malformed padding, 2 paddings require the last chunk to have 2 characters`)
    }

    //u8a, 須攔截非預期錯誤, 否則會外拋至呼叫端
    let u8a = null
    try {

        let wa = encbase64.parse(b64c)

        //words, sigBytes
        let words = wa.words
        let sigBytes = wa.sigBytes

        //u8a
        u8a = new Uint8Array(sigBytes)
        for (let i = 0; i < sigBytes; i++) {
            let byte = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff
            u8a[i] = byte
        }

    }
    catch (err) {
        return retError(err.toString())
    }

    if (returnWithStateAndMsg) {
        return {
            state: 'success',
            msg: u8a,
        }
    }
    else {
        return u8a
    }
}


export default b642u8arr
