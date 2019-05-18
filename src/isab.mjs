/**
 * 判斷是否為ArrayBuffer
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/isab.test.js Github}
 * @memberOf wsemi
 * @param {*} v 輸入任意資料
 * @returns {Boolean} 回傳判斷布林值
 * @example
 * isab(new ArrayBuffer(1))
 * // => true
 */
function isab(v) {

    let c = Object.prototype.toString.call(v)
    return c === '[object ArrayBuffer]'
}


export default isab
