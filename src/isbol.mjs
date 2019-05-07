import isBoolean from 'lodash/isBoolean'


/**
 * 判斷是否為boolean
 *
 * @export
 * @param {*} v 輸入任意資料
 * @returns {Boolean} 回傳判斷布林值
 */
export default function isbol(v) {

    return isBoolean(v)
}

