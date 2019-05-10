/**
 * 判斷是否為物件
 *
 * @memberOf wsemi
 * @param {*} v 輸入任意資料
 * @returns {Boolean} 回傳判斷布林值
 */
function isobj(v) {

    let c = Object.prototype.toString.call(v)
    return c === '[object Object]'
}


export default isobj
