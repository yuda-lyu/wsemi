import isab from './isab.mjs'


/**
 * ArrayBuffer資料轉Unit8Array資料
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/ab2u8arr.test.js Github}
 * @memberOf wsemi
 * @param {ArrayBuffer} ab 輸入ArrayBuffer資料
 * @returns {Unit8Array} 回傳Unit8Array資料
 * @example
 * let ab = (new Uint8Array([66, 97, 115])).buffer
 * ab2u8arr(ab)
 * // => new Uint8Array([66, 97, 115])
 */
function ab2u8arr(ab) {

    //check
    if (!isab(ab)) {
        return new Uint8Array()
    }

    let u8a = new Uint8Array(ab)

    return u8a
}


export default ab2u8arr