/**
 * 判斷是否為字串
 *
 * @export
 * @param {*} v 輸入任意資料
 * @returns {Boolean} 回傳判斷布林值
 */
export default function isstr(v) {

    let c = Object.prototype.toString.call(v)
    return c === '[object String]'
}
