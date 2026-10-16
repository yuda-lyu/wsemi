import binstr from './binstr.mjs'


/**
 * 前端判斷是否為開發階段
 * 主要判斷location.href內是否含有localhost
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/isDev.test.mjs Github}
 * @memberOf wsemi
 * @returns {Boolean} 回傳是否為開發階段，非瀏覽器環境(無location)回傳false
 * @example
 * need test in browser
 *
 * console.log(isDev())
 * // => true or false
 *
 */
function isDev() {

    //check, 未宣告之全域直接讀取為ReferenceError, 故須以typeof防護(Web Worker亦有location, 不可改用isWindow)
    if (typeof location !== 'undefined' && location) {
        return binstr(location.href, 'localhost')
    }

    return false
}


export default isDev
