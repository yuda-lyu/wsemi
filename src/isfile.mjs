/**
 * 前端判斷是否為File，NodeJS沒有File
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/isfile.test.mjs Github}
 * @memberOf wsemi
 * @param {*} v 輸入任意資料
 * @returns {Boolean} 回傳判斷布林值
 * @example
 * need test in browser
 *
 * let fl = 'FILE'
 * console.log(isfile(fl))
 * // => true
 *
 */
function isfile(v) {
    let c = Object.prototype.toString.call(v)
    return c === '[object File]'
}


export default isfile
