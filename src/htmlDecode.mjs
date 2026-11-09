import isestr from './isestr.mjs'
import { decode } from 'he'


/**
 * Html特殊字元(Html entities)字串反編碼
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/htmlDecode.test.mjs Github}
 * @memberOf wsemi
 * @param {String} str 輸入編碼後html字串
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

    //decode
    let r = decode(str, opt)

    return r
}


export default htmlDecode
