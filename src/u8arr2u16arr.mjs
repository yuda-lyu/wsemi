import isu8arr from './isu8arr.mjs'


/**
 * Uint8Array轉Uint16Array
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/u8arr2u16arr.test.js Github}
 * @memberOf wsemi
 * @param {Array} u8a 輸入Uint8Array
 * @returns {Array} 回傳Uint16Array
 * @example
 * console.log(u8arr2u16arr(new Uint8Array([66, 97, 115])))
 * // => new Uint16Array([66, 97, 115])
 */
function u8arr2u16arr(u8a) {

    //check
    if (!isu8arr(u8a)) {
        return new Uint16Array()
    }

    return new Uint16Array(u8a)
}


export default u8arr2u16arr
