import isobj from './isobj.mjs'


/**
 * 判斷是否為空物件
 *
 * @export
 * @param {*} v 輸入任意資料
 * @returns {Boolean} 回傳判斷布林值
 */
export default function isobj0(v) {

    if (isobj(v)) {
        for (let k in v) {
            return false
        }
        return true
    }
    return false
}
