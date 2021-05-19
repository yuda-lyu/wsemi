import lotrim from 'lodash/trim'
import isestr from './isestr.mjs'


/**
 * 字串頭尾去除空白字串，若字串開頭含有BOM亦可清除，若輸入不是字串時則回傳空字串
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/trim.test.js Github}
 * @memberOf wsemi
 * @param {String} c 輸入字串
 * @returns {String} 回傳去除空白的字串
 * @example
 *
 * console.log(trim(' abc 中 文 '))
 * // => 'abc 中 文'
 *
 * let tr = (c) => {
 *     c = replace(c, '\r\n', '')
 *     c = replace(c, '\r', '')
 *     c = replace(c, '\n', '')
 *     return c
 * }
 *
 * let b64BOM = '77u/YSxiLCzkuK3mlocNCjEsMjMuNDUsImFiYyIsIjY3LjgiDQo='
 * let b64NoBOM = 'YSxiLCzkuK3mlocNCjEsMjMuNDUsImFiYyIsIjY3LjgiDQo='
 * let cBOMCor = `
 * a,b,,中文
 * 1,23.45,"abc","67.8"
 * `
 *
 * let cBOM = b642str(b64BOM)
 * console.log(tr(cBOM) === tr(cBOMCor))
 * // => false
 *
 * let cBOMtrim = trim(cBOM)
 * console.log(tr(cBOMtrim) === tr(cBOMCor))
 * // => true
 *
 * let cNoBOM = b642str(b64NoBOM)
 * console.log(tr(cNoBOM) === tr(cBOMCor))
 * // => true
 *
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
