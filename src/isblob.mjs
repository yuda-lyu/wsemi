/**
 * 前端判斷是否為Blob，NodeJS沒有Blob
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/isblob.test.mjs Github}
 * @memberOf wsemi
 * @param {*} v 輸入任意資料
 * @returns {Boolean} 回傳判斷布林值
 * @example
 * need test in browser
 *
 * let bb = new Blob([new Uint8Array([66, 97, 115])])
 * console.log(isblob(bb))
 * // => true
 *
 */
function isblob(v) {

    let c = Object.prototype.toString.call(v)
    return c === '[object Blob]'
}


export default isblob
