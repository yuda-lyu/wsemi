import isu16arr from './isu16arr.mjs'


/**
 * Uint16Array轉Uint8Array
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/u16arr2u8arr.test.mjs Github}
 * @memberOf wsemi
 * @param {Uint16Array} u16a 輸入Uint16Array
 * @returns {Uint8Array} 回傳Uint8Array
 * @example
 *
 * console.log(u16arr2u8arr(new Uint16Array([66, 97, 115])))
 * // => new Uint8Array([66, 97, 115])
 *
 */
function u16arr2u8arr(u16a) {

    //check
    if (!isu16arr(u16a)) {
        return new Uint8Array()
    }

    return new Uint8Array(u16a)
}


export default u16arr2u8arr
