import isstr from './isstr.mjs'
import b642u8arr from './b642u8arr.mjs'


/**
 * base64字串轉Uint16Array
 *
 * 以逐位元組(little-endian)方式解碼，為u16arr2b64之反向；不可經u8arr2u16arr轉換，該函數為逐元素轉換無法還原大於255之元素
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/b642u16arr.test.mjs Github}
 * @memberOf wsemi
 * @param {String} b64 輸入base64字串
 * @returns {Uint16Array} 回傳Uint16Array，輸入非字串或解出之位元組長度非偶數(無法組成Uint16Array)時回傳空Uint16Array
 * @example
 *
 * console.log(b642u16arr('CwBPAAYA'))
 * // => new Uint16Array([11, 79, 6])
 *
 */
function b642u16arr(b64) {

    //check
    if (!isstr(b64)) {
        return new Uint16Array()
    }

    //u8a
    let u8a = b642u8arr(b64)

    //check, 位元組長度須為偶數才能組成Uint16Array
    if (u8a.byteLength % 2 !== 0) {
        return new Uint16Array()
    }

    //u16a, 以位元組重建; b642u8arr產出之Uint8Array其byteOffset為0且涵蓋整個buffer, 故可直接取buffer, 否則須先複製以取得對齊
    let u16a = null
    try {
        let bb = (u8a.byteOffset === 0 && u8a.byteLength === u8a.buffer.byteLength) ? u8a : new Uint8Array(u8a)
        u16a = new Uint16Array(bb.buffer)
    }
    catch (err) {
        return new Uint16Array()
    }

    return u16a
}


export default b642u16arr
