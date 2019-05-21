/**
 * 前端html字串編碼
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/htmlEncode.test.js Github}
 * @memberOf wsemi
 * @param {String} str 輸入html字串
 * @returns {String} 回傳編碼後html字串
 * @example
 * need test in browser
 */
function htmlEncode(str) {
    let ele = document.createElement('span')
    ele.appendChild(document.createTextNode(str))
    return ele.innerHTML
}


export default htmlEncode
