/**
 * 前端判斷瀏覽器是否為IE
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/isIE.test.mjs Github}
 * @memberOf wsemi
 * @returns {Boolean} 回傳判斷布林值，非瀏覽器環境(無navigator)回傳false
 * @example
 *
 * console.log(isIE())
 * // => true
 *
 */
function isIE() {

    //check, 未宣告之全域直接讀取為ReferenceError(Node 21以前無navigator), 故須以typeof防護; 有navigator而無字串userAgent者亦非目標環境
    if (typeof navigator === 'undefined' || !navigator || typeof navigator.userAgent !== 'string') {
        return false
    }

    let b = (navigator.userAgent.toLowerCase().match(/rv:([\d.]+)\) like gecko/)) !== null
    return b
}


export default isIE
