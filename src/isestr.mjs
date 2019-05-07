import isstr from './isstr.mjs'


/**
 * 判斷是否為有效字串
 *
 * @export
 * @param {*} v 輸入任意資料
 * @returns {Boolean} 回傳判斷布林值
 */
export default function isestr(v) {

    //check
    if (isstr(v)) {
        if (v !== '') {
            return true
        }
    }
    return false
}
