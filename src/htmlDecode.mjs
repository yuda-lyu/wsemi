import isestr from './isestr.mjs'
import pickOpt from './_pickOpt.mjs'
import { decode } from 'he'


/**
 * Html特殊字元(Html entities)字串反編碼
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/htmlDecode.test.mjs Github}
 * @memberOf wsemi
 * @param {String} str 輸入編碼後html字串
 * @param {Object} [opt={}] 輸入設定物件，傳給he套件之decode(可用鍵為isAttributeValue、strict，見he套件說明；同he只認自有鍵)，讀取拋錯(已撤銷之Proxy、存取器拋錯)者視為未給，預設{}
 * @returns {String} 回傳html字串
 * @example
 *
 * console.log(htmlDecode('foo&#x26;bar'))
 * // => foo&bar
 *
 * console.log(htmlDecode('foo &#xA9; bar &#x2260; baz &#x1D306; qux'))
 * // => foo © bar ≠ baz 𝌆 qux
 *
 * console.log(htmlDecode('&#x3C;img src=&#x22;x&#x22;&#x22; onerror=&#x22;prompt(1)&#x22;&#x3E;'))
 * // => <img src="x"" onerror="prompt(1)">
 *
 */
function htmlDecode(str, opt = {}) {

    //check
    if (!isestr(str)) {
        return ''
    }

    //opt, 取快照: 只含he之可用鍵(同he以自有鍵判定), 讀取拋錯(已撤銷之Proxy、getter拋錯、陷阱拋錯)之opt或其鍵視為未給, 不拋錯(he以Object.hasOwn讀opt, 對已撤銷之Proxy會拋錯)
    let optSnap = pickOpt(opt, ['isAttributeValue', 'strict'], [], true)

    //decode
    let r = decode(str, optSnap)

    return r
}


export default htmlDecode
