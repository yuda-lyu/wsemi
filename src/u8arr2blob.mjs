
/**
 * Unit8Array資料轉Blob資料
 *
 * @memberOf wsemi
 * @param {Unit8Array} u8a 輸入Unit8Array資料
 * @returns {Blob} 回傳Blob資料
 */
function u8arr2blob(u8a) {
    return new Blob([u8a])
}


export default u8arr2blob
