/**
 * 判斷是否為Uint8Array
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/isu8arr.test.mjs Github}
 * @memberOf wsemi
 * @param {*} v 輸入任意資料
 * @returns {Boolean} 回傳判斷布林值
 * @example
 *
 * console.log(isu8arr(new Uint8Array(1)))
 * // => true
 *
 */
function isu8arr(v) {

    let c = Object.prototype.toString.call(v)
    return c === '[object Uint8Array]'
}


export default isu8arr
