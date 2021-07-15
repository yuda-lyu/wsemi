import isstr from './isstr.mjs'
import isEle from './isEle.mjs'


/**
 * 前端於DOM元素內最前處插入元素或Html文字等
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/domPrepend.test.js Github}
 * @memberOf wsemi
 * @param {HTMLElement} eleParent 輸入目標DOM元素
 * @param {HTMLElement|String} itemChild 輸入要插入DOM元素或Html文字等內容
 * @example
 * need test in browser
 *
 * domPrepend(document.querySelector('#id-parent'),document.querySelector('#id-child'))
 *
 */
function domPrepend(eleParent, itemChild) {

    //check
    if (!isEle(eleParent)) {
        return 'invalid eleParent'
    }

    if (isstr(itemChild)) {
        eleParent.insertAdjacentHTML('afterbegin', itemChild) //'afterbegin': 在 element 裡面，第一個子元素之前
    }
    else if (isEle(itemChild)) {
        eleParent.insertBefore(itemChild, eleParent.firstChild)
    }
    else {
        return 'invalid itemChild'
    }
}


export default domPrepend
