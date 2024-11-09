import isestr from './isestr.mjs'
import he from 'he'


/**
 * Html特殊字元(Html entities)字串編碼
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/htmlEncode.test.mjs Github}
 * @memberOf wsemi
 * @param {String} str 輸入html字串
 * @returns {String} 回傳編碼後html字串
 * @example
 *
 * console.log(htmlEncode('foo&bar'))
 * // => oo&#x26;bar
 *
 * console.log(htmlEncode('foo © bar ≠ baz 𝌆 qux'))
 * // => foo &#xA9; bar &#x2260; baz &#x1D306; qux
 *
 * console.log(htmlEncode('<img src="x"" onerror="prompt(1)">'))
 * // => &#x3C;img src=&#x22;x&#x22;&#x22; onerror=&#x22;prompt(1)&#x22;&#x3E;
 *
 */
function htmlEncode(str, opt = {}) {

    //check
    if (!isestr(str)) {
        return ''
    }

    //encode
    let r = he.encode(str, opt)

    return r
}


export default htmlEncode
