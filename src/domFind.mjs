/**
 * 前端找尋DOM元素
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/domFind.test.js Github}
 * @memberOf wsemi
 * @param {String} query 輸入查詢字串
 * @returns {Element} 回傳DOM元素Element
 * @example
 * need test in browser
 * 
 */
function domFind(query) {
    let r = document.querySelector(query)
    return r
}


export default domFind

