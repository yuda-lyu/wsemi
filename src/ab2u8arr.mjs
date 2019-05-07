
/**
 * ArrayBuffer資料轉Unit8Array資料
 *
 * @export
 * @param {ArrayBuffer} ab 輸入ArrayBuffer資料
 * @returns {Unit8Array} 回傳Unit8Array資料
 */
export default function ab2u8arr(ab) {
    let l = ab.length
    let u8a = new Uint8Array(l)
    for (let i = 0; i < l; i++) {
        u8a[i] = ab.charCodeAt(i)
    }
    return u8a
}
