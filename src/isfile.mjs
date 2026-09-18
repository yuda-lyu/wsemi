/**
 * 判斷是否為File，瀏覽器與NodeJS(20以上)皆有File；File為Blob之子型別，isblob對File亦回傳true，須區分兩者時用本函數
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
