/**
 * 前端判斷瀏覽器是否為IE
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/isIE.test.mjs Github}
 * @memberOf wsemi
 * @returns {Boolean} 回傳判斷布林值
 * @example
 *
 * console.log(isIE())
 * // => true
 *
 */
function isIE() {
    let b = (navigator.userAgent.toLowerCase().match(/rv:([\d.]+)\) like gecko/)) !== null
    return b
}


export default isIE
