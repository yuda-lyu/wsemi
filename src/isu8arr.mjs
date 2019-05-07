/**
 * 判斷是否為Uint8Array
 *
 * @export
 * @param {*} v 輸入任意資料
 * @returns {Boolean} 回傳判斷布林值
 */
export default function isu8arr(v) {

    let c = Object.prototype.toString.call(v)
    return c === '[object Uint8Array]'
}
