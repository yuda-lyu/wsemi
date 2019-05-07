/**
 * 前端找尋多DOM元素
 *
 * @export
 * @param {String} query 輸入查詢字串
 * @returns {Array} 回傳DOM元素Element陣列
 */
export default function domFinds(query) {
    let r = document.querySelectorAll(query)
    return r
}
