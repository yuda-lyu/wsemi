import domFinds from './domFinds.mjs'


/**
 * 前端找尋DOM元素並刪除
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/domRemove.test.js Github}
 *
 * @example
 *
 * @memberOf wsemi
 * @param {String} query 輸入查詢字串
 */
function domRemove(query) {

    function remove(ele) {
        ele.parentNode.removeChild(ele)
    }

    //find
    let rs = domFinds(query)

    //remove
    rs.forEach(function(ele) {
        remove(ele)
    })

}


export default domRemove
