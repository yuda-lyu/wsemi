import domFind from './domFind.mjs'
import isstr from './isstr.mjs'


/**
 * 前端找尋DOM元素並插入節點、元素或文字等
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/domAppend.test.js Github}
 * @memberOf wsemi
 * @param {String} query 輸入查詢字串
 * @param {*} item 輸入要插入節點、元素或文字等內容
 * @example
 * let html = '<div>abc</div>'
 * domAppend('#id',html)
 */
function domAppend(query, item) {
    let r = domFind(query)
    if (isstr(item)) {
        r.insertAdjacentHTML('beforeend', item) //'beforeend': 在 element 裡面，最後一個子元素之後
    }
    else {
        r.appendChild(item)
    }
}


export default domAppend
