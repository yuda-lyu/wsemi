/**
 * 判斷是否為Uint16Array
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/isu16arr.test.js Github}
 * @memberOf wsemi
 * @param {*} v 輸入任意資料
 * @returns {Boolean} 回傳判斷布林值
 * @example
 *
 * console.log(isu16arr(new Uint16Array(1)))
 * // => true
 *
 */
function isu16arr(v) {

    let c = Object.prototype.toString.call(v)
    return c === '[object Uint16Array]'
}


export default isu16arr
