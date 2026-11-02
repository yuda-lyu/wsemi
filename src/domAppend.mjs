import isstr from './isstr.mjs'
import isEle from './isEle.mjs'


/**
 * 前端於DOM元素內最後處插入元素或Html文字等
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/domAppend.test.mjs Github}
 * @memberOf wsemi
 * @param {HTMLElement} eleParent 輸入目標DOM元素，非元素則拋錯
 * @param {HTMLElement|String} itemChild 輸入要插入DOM元素或Html文字等內容，非字串亦非元素則拋錯
 * @throws {Error} eleParent非元素拋出Error('invalid eleParent: must be an element')，itemChild非字串亦非元素拋出Error('invalid itemChild: must be a string or an element')，皆先於任何DOM變動，訊息不含輸入值
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
        throw new Error('invalid eleParent: must be an element')
    }

    if (isstr(itemChild)) {
        eleParent.insertAdjacentHTML('beforeend', itemChild) //'beforeend': 在 element 裡面，最後一個子元素之後
    }
    else if (isEle(itemChild)) {
        eleParent.appendChild(itemChild)
    }
    else {
        throw new Error('invalid itemChild: must be a string or an element')
    }

}


export default domAppend
