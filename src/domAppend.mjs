import isstr from './isstr.mjs'
import isEle from './isEle.mjs'


/**
 * 前端於DOM元素內最後處插入元素或Html文字等
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/domAppend.test.js Github}
 * @memberOf wsemi
 * @param {HTMLElement} eleParent 輸入目標DOM元素
 * @param {HTMLElement|String} itemChild 輸入要插入DOM元素或Html文字等內容
 * @example
 * need test in browser
 *
 * let html = '<div>abc</div>'
 * domAppend(document.querySelector('#id'),html)
 *
 */
function domAppend(eleParent, itemChild) {

    //check
    if (!isEle(eleParent)) {
        return 'invalid eleParent'
    }

    if (isstr(itemChild)) {
        eleParent.insertAdjacentHTML('beforeend', itemChild) //'beforeend': 在 element 裡面，最後一個子元素之後
    }
    else if (isEle(itemChild)) {
        eleParent.appendChild(itemChild)
    }
    else {
        return 'invalid itemChild'
    }

}


export default domAppend
