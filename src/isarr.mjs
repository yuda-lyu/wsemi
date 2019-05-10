/**
 * 判斷是否為陣列
 *
 * @memberOf wsemi
 * @param {*} v 輸入任意資料
 * @returns {Boolean} 回傳判斷布林值
 */
function isarr(v) {

    let c = Object.prototype.toString.call(v)
    return c === '[object Array]'
}


export default isarr
