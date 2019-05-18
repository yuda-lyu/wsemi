import lotrim from 'lodash/trim'
import isestr from './isestr.mjs'


/**
 * 字串頭尾去除空白字串
 * 若輸入不是字串時則回傳空字串
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/trim.test.js Github}
 * @memberOf wsemi
 * @param {String} c 輸入字串
 * @returns {String} 回傳去除空白的字串
 * @example
 * trim(' abc 中 文 ')
 * // => 'abc 中 文'
 */
function trim(c) {

    //check
    if (!isestr(c)) {
        return ''
    }

    let r = lotrim(c)

    return r
}


export default trim
