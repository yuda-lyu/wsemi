/**
 * 判斷是否為函數
 *
 * @memberOf wsemi
 * @param {*} v 輸入任意資料
 * @returns {Boolean} 回傳判斷布林值
 */
function isfun(v) {

    let c = Object.prototype.toString.call(v)
    return c === '[object Function]'
}


export default isfun
