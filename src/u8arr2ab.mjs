import isu8arr from './isu8arr.mjs'


/**
 * Uint8Array轉ArrayBuffer
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/u8arr2ab.test.mjs Github}
 * @memberOf wsemi
 * @param {Uint8Array} u8a 輸入Uint8Array
 * @returns {ArrayBuffer} 回傳ArrayBuffer
 * @example
 *
 * console.log(u8arr2ab(new Uint8Array([66, 97, 115])))
 * // (new Uint8Array([66, 97, 115])).buffer
 *
 */
function u8arr2ab(u8a) {

    //check
    if (!isu8arr(u8a)) {
        return new ArrayBuffer()
    }

    let ab = u8a.buffer
    return ab
}


export default u8arr2ab
