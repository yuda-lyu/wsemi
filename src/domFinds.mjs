/**
 * 前端找尋多DOM元素
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/domFinds.test.js Github}
 *
 * @example
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
