
/**
 * Unit8Array資料轉Blob資料
 *
 * @export
 * @param {Unit8Array} u8a 輸入Unit8Array資料
 * @returns {Blob} 回傳Blob資料
 */
export default function u8arr2blob(u8a) {
    return new Blob([u8a])
}
