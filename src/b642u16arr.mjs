import isstr from './isstr.mjs'
import b642u8arr from './b642u8arr.mjs'
import u8arr2u16arr from './u8arr2u16arr.mjs'


/**
 * base64字串轉Uint16Array
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/b642u16arr.test.js Github}
 * @memberOf wsemi
 * @param {String} b64 輸入base64字串
 * @returns {Array} 回傳Uint16Array
 * @example
 * console.log(b642u16arr('AQItAA=='))
 * // => new Uint16Array([1, 2.3, '45', 'abc'])
 */
function b642u16arr(b64) {

    //check
    if (!isstr(b64)) {
        return new Uint16Array()
    }

    let u8a = b642u8arr(b64)
    let u16a = u8arr2u16arr(u8a)

    return u16a
}


export default b642u16arr
