/**
 * 前端html字串反編碼
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/htmlDecode.test.mjs Github}
 * @memberOf wsemi
 * @param {String} str 輸入編碼後html字串
 * @returns {String} 回傳html字串
 * @example
 * need test in browser
 *
 */
function htmlDecode(str) {
    let ele = document.createElement('span')
    ele.appendChild(document.createTextNode(str))
    return ele.innerHTML
}


export default htmlDecode
