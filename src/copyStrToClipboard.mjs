import get from 'lodash/get'
import isstr from './isstr.mjs'
import isEle from './isEle.mjs'
import domIsFocused from './domIsFocused.mjs'


/**
 * 複製字串至剪貼簿
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/copyStrToClipboard.test.mjs Github}
 * @memberOf wsemi
 * @param {String} str 輸入欲複製至剪貼簿的字串
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {HTMLElement} [opt.eleParent=document.body] 輸入臨時插入的父層元素，因例如於鎖定焦點(focus)的區域內要複製字串，會因臨時創建的textarea元素無法聚焦導致無法複製至剪貼簿，故得由外部傳入可聚焦的父層元素供創建textarea之用，預設document.body
 * @returns {String} 回傳字串，若成功則為空字串，若失敗則回傳錯誤訊息
 * @example
 *
 * copyStrToClipboard('The Woodman(樵夫) set to work at once, and so...')
 *
 * let ele = document.querySelector('#id')
 * copyStrToClipboard('The Woodman(樵夫) set to work at once, and so...', { eleParent: ele })
 *
 */
function copyStrToClipboard(str, opt = {}) {

    //check
    if (!isstr(str)) {
        return 'invalid input'
    }

    //eleParent
    let eleParent = get(opt, 'eleParent')
    if (!isEle(eleParent)) {
        eleParent = document.body
    }

    //創造textarea儲存字串並選擇
    let ele = document.createElement('textarea')
    ele.style.position = 'fixed'
    ele.style.left = 0
    ele.style.top = 0
    ele.style.zIndex = -1 //100000
    ele.style.background = 'transparent'
    ele.style.color = 'transparent'
    ele.value = str
    eleParent.appendChild(ele)
    ele.select()

    //check
    if (!domIsFocused(ele)) {
        return 'ele can not be focusd'
    }

    //copy
    try {
        document.execCommand('copy')
    }
    catch (err) {
        return 'can not copy str to clipboard'
    }

    //removeChild
    eleParent.removeChild(ele)

    return ''
}


export default copyStrToClipboard
