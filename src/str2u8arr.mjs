import isestr from './isestr.mjs'
import str2b64 from './str2b64.mjs'
import b642u8arr from './b642u8arr.mjs'


/**
 * 字串轉Uint8Array
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/str2u8arr.test.js Github}
 * @memberOf wsemi
 * @param {String} str 輸入一般字串
 * @returns {Uint8Array} 回傳Uint8Array
 * @example
 *
 * console.log(str2u8arr('test中文'))
 * // => Uint8Array [116, 101, 115, 116, 228, 184, 173, 230, 150, 135]
 *
 */
function str2u8arr(str) {

    //check
    if (!isestr(str)) {
        return new Uint8Array()
    }

    //r
    let r
    try {
        r = b642u8arr(str2b64(str))
    }
    catch (err) {
        return new Uint8Array()
    }

    return r
}


export default str2u8arr
