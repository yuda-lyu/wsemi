/**
 * 判斷是否為Uint8Array
 *
 * @memberOf wsemi
 * @param {*} v 輸入任意資料
 * @returns {Boolean} 回傳判斷布林值
 */
function isu8arr(v) {

    let c = Object.prototype.toString.call(v)
    return c === '[object Uint8Array]'
}


export default isu8arr
