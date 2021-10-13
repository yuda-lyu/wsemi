import isab from './isab.mjs'
import isblob from './isblob.mjs'
import isu8arr from './isu8arr.mjs'
import isu16arr from './isu16arr.mjs'


/**
 * 計算Uint8Array(Nodejs,Browser)或Buffer(Nodejs)的大小
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/getBufferSize.test.mjs Github}
 * @memberOf wsemi
 * @param {Unit8Array|Buffer} buf 傳入Uint8Array(Nodejs,Browser)或Buffer(Nodejs)
 * @returns {Integer} 回傳Uint8Array(Nodejs,Browser)或Buffer(Nodejs)的大小
 * @example
 *
 * let u8a = new Uint8Array([1, 2, 3, 123])
 * console.log(getBufferSize(u8a))
 * // => 4
 *
 * let buf = Buffer.alloc(8)
 * console.log(getBufferSize(buf))
 * // => 8
 *
 */
function getBufferSize(buf) {

    //check
    if (isab(buf) || isblob(buf) || isu8arr(buf) || isu16arr(buf)) {
    }
    else {
        return null
    }

    //byteLength
    try {
        if (buf.byteLength) {
            return buf.byteLength
        }
    }
    catch (err) {}

    //length
    try {
        if (buf.length) {
            return buf.length
        }
    }
    catch (err) {}

    //size
    try {
        if (buf.size) {
            return buf.size
        }
    }
    catch (err) {}

    return null

}


export default getBufferSize
