/**
 * 判斷是否為函數
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/isfun.test.js Github}
 * @memberOf wsemi
 * @param {*} v 輸入任意資料
 * @returns {Boolean} 回傳判斷布林值
 * @example
 * isfun('1.25')
 * // => false
 * isfun(function() {})
 * // => true
 */
function isfun(v) {

    let c = Object.prototype.toString.call(v)
    return c === '[object Function]'
}


export default isfun
