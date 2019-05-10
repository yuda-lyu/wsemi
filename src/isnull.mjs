/**
 * 判斷是否為null
 *
 * @memberOf wsemi
 * @param {*} v 輸入任意資料
 * @returns {Boolean} 回傳判斷布林值
 */
function isnull(v) {

    let c = Object.prototype.toString.call(v)
    return c === '[object Null]'
}


export default isnull
