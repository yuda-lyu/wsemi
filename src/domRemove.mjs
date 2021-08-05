import each from 'lodash/each'
import isEle from './isEle.mjs'
import isestr from './isestr.mjs'
import domFinds from './domFinds.mjs'


/**
 * 前端找尋DOM元素並刪除
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/domRemove.test.mjs Github}
 * @memberOf wsemi
 * @param {String|HTMLElement} inp 輸入查詢字串或dom函數
 * @example
 * need test in browser
 *
 * let ele = document.querySelector('#id')
 * domRemove(ele)
 *
 */
function domRemove(inp) {

    function remove(ele) {
        ele.parentNode.removeChild(ele)
    }

    //isEle
    if (isEle(inp)) {
        let ele = inp
        remove(ele)
        return
    }

    //query
    if (!isestr(inp)) {
        return
    }
    let query = inp

    //find
    let rs = domFinds(query)

    //remove
    each(rs, function(ele) {
        remove(ele)
    })

}


export default domRemove
