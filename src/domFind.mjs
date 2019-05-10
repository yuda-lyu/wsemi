/**
 * 前端找尋DOM元素
 *
 * @memberOf wsemi
 * @param {String} query 輸入查詢字串
 * @returns {Element} 回傳DOM元素Element
 */
function domFind(query) {
    let r = document.querySelector(query)
    return r
}


export default domFind

