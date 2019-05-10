/**
 * 判斷是否為數字
 *
 * @memberOf wsemi
 * @param {*} v 輸入任意資料
 * @returns {Boolean} 回傳判斷布林值
 */
function isnbr(v) {

    let c = Object.prototype.toString.call(v)
    return c === '[object Number]'
}


export default isnbr
