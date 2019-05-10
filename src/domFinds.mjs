/**
 * 前端找尋多DOM元素
 *
 * @memberOf wsemi
 * @param {String} query 輸入查詢字串
 * @returns {Array} 回傳DOM元素Element陣列
 */
function domFinds(query) {
    let r = document.querySelectorAll(query)
    return r
}


export default domFinds
