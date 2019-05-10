import ab2u8arr from './ab2u8arr.mjs'


/**
 * ArrayBuffer資料轉Blob資料
 *
 * @memberOf wsemi
 * @param {ArrayBuffer} ab 輸入ArrayBuffer資料
 * @returns {Blob} 回傳Blob資料
 */
function ab2blob(ab) {
    let u8a = ab2u8arr(ab)
    return new Blob([u8a])
}


export default ab2blob
