/**
 * 判斷是否為undefined
 *
 * @export
 * @param {*} v 輸入任意資料
 * @returns {Boolean} 回傳判斷布林值
 */
export default function isundefined(v) {

    let c = Object.prototype.toString.call(v)
    return c === '[object Undefined]'
}

