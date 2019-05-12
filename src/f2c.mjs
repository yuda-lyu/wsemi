import isfun from './isfun.mjs'
import cstr from './cstr.mjs'
import trim from './trim.mjs'


/**
 * 函數內註解轉字串
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/f2c.test.js Github}
 *
 * @example
 *
 * @memberOf wsemi
 * @param {Function} c 輸入函數
 * @returns {String} 回傳字串
 */
function f2c(f) {

    //check
    if (!isfun(f)) {
        return ''
    }

    let cont = cstr(f)
    let r = cont.substring(cont.indexOf('/*') + 3, cont.lastIndexOf('*/'))
    r = trim(r)

    return r
}


export default f2c

