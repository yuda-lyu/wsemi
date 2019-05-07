import domFinds from './domFinds.mjs'


/**
 * 前端找尋DOM元素並刪除
 *
 * @export
 * @param {String} query 輸入查詢字串
 */
export default function domRemove(query) {

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
