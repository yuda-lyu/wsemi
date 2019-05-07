import isfun from './isfun.mjs'
import cstr from './cstr.mjs'
import trim from './trim.mjs'


/**
 * 函數內註解轉字串
 *
 * @export
 * @param {Function} c 輸入函數
 * @returns {String} 回傳字串
 */
export default function f2c(f) {

    //check
    if (!isfun(f)) {
        return ''
    }

    let cont = cstr(f)
    let r = cont.substring(cont.indexOf('/*') + 3, cont.lastIndexOf('*/'))
    r = trim(r)

    return r
}
