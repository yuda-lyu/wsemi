/**
 * 前端找尋多DOM元素
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/domFinds.test.mjs Github}
 * @memberOf wsemi
 * @param {String} query 輸入查詢字串
 * @returns {NodeList} 回傳符合之DOM元素集合(document.querySelectorAll之NodeList，非Array，無符合時為空NodeList)
 * @example
 * need test in browser
 *
 * let eles = domFinds('[name="abc"]')
 *
 */
function domFinds(query) {
    let r = document.querySelectorAll(query)
    return r
}


export default domFinds
