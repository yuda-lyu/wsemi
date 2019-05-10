import isBoolean from 'lodash/isBoolean'


/**
 * 判斷是否為boolean
 *
 * @memberOf wsemi
 * @param {*} v 輸入任意資料
 * @returns {Boolean} 回傳判斷布林值
 */
function isbol(v) {

    return isBoolean(v)
}


export default isbol
