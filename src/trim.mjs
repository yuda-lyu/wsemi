import * as ldtrim from 'lodash/trim'
import isestr from './isestr.mjs'


/**
 * 字串頭尾去除空白字串
 * 若輸入不是字串時則回傳空字串
 * @export
 * @param {String} c 輸入字串
 * @returns {String} 回傳去除空白的字串
 */
export default function trim(c) {

    //check
    if (!isestr(c)) {
        return ''
    }

    let r = ldtrim(c)

    return r
}
