import each from 'lodash-es/each.js'
import isEle from './isEle.mjs'
import isestr from './isestr.mjs'
import domFinds from './domFinds.mjs'


/**
 * 前端找尋DOM元素並刪除
 *
 * 回傳布林值表示是否有元素被移除：已脫離DOM(無父節點)之元素、非元素亦非字串之輸入、選擇器語法錯誤、無符合元素皆不動作、不拋錯，回傳false；輸入為選擇器字串時，符合之元素各自移除，至少移除一個回傳true
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/domRemove.test.mjs Github}
 * @memberOf wsemi
 * @param {String|HTMLElement} inp 輸入查詢字串或dom函數
 * @returns {Boolean} 回傳是否有元素被移除，true為至少移除一個元素，其餘(含元素已脫離DOM、輸入無效、無符合元素)皆為false
 * @example
 * need test in browser
 *
 * let ele = document.querySelector('#id')
 * domRemove(ele)
 * // => true
 *
 * domRemove(ele)
 * // => false (已脫離DOM)
 *
 */
function domRemove(inp) {

    function remove(ele) {
        try {
            let parent = ele.parentNode
            if (!parent) {
                return false
            }
            parent.removeChild(ele)
            return true
        }
        catch (err) {
            return false
        }
    }

    //isEle
    if (isEle(inp)) {
        return remove(inp)
    }

    //query
    if (!isestr(inp)) {
        return false
    }
    let query = inp

    //find
    let rs = domFinds(query)

    //remove
    let b = false
    each(rs, function(ele) {
        if (remove(ele)) {
            b = true
        }
    })

    return b
}


export default domRemove
