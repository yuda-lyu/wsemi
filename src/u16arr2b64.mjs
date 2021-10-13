import isu16arr from './isu16arr.mjs'
import u16arr2u8arr from './u16arr2u8arr.mjs'
import u8arr2b64 from './u8arr2b64.mjs'


/**
 * Uint16Array轉base64字串
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/u16arr2b64.test.mjs Github}
 * @memberOf wsemi
 * @param {Uint16Array} u16a 輸入Uint16Array
 * @returns {String} 回傳base64字串
 * @example
 *
 * console.log(u16arr2b64(new Uint16Array([1, 2.3, '45', 'abc'])))
 * // => 'AQItAA=='
 *
 */
function u16arr2b64(u16a) {

    //check
    if (!isu16arr(u16a)) {
        return ''
    }

    return u8arr2b64(u16arr2u8arr(u16a))
}


export default u16arr2b64
