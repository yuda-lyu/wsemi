/**
 * 前端找尋DOM元素
 *
 * @export
 * @param {String} query 輸入查詢字串
 * @returns {Element} 回傳DOM元素Element
 */
export default function domFind(query) {
    let r = document.querySelector(query)
    return r
}
