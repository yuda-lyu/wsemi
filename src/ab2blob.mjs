import ab2u8arr from './ab2u8arr.mjs'


/**
 * ArrayBuffer資料轉Blob資料
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/ab2blob.test.js Github}
 * @memberOf wsemi
 * @param {ArrayBuffer} ab 輸入ArrayBuffer資料
 * @returns {Blob} 回傳Blob資料
 * @example
 * need test in browser
 *
 * let ab = (new Uint8Array([66, 97, 115])).buffer
 * console.log(ab2blob(ab))
 * // => Blob {size: 3, type: ""}
 *
 */
function ab2blob(ab) {
    let u8a = ab2u8arr(ab)
    return new Blob([u8a])
}


export default ab2blob
