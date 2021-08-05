import isu8arr from './isu8arr.mjs'
import u8arr2b64 from './u8arr2b64.mjs'
import b642str from './b642str.mjs'


/**
 * Uint8Array轉字串
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/u8arr2str.test.mjs Github}
 * @memberOf wsemi
 * @param {Uint8Array} u8a 輸入Uint8Array
 * @returns {String} 回傳一般字串
 * @example
 *
 * console.log(u8arr2str(new Uint8Array([116, 101, 115, 116, 228, 184, 173, 230, 150, 135])))
 * // => test中文
 *
 */
function u8arr2str(u8a) {

    //check
    if (!isu8arr(u8a)) {
        return ''
    }

    //r
    let r
    try {
        r = b642str(u8arr2b64(u8a))
    }
    catch (err) {
        return ''
    }

    return r
}


export default u8arr2str
