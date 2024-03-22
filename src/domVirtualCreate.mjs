import get from 'lodash-es/get.js'
import trim from 'lodash-es/trim.js'
import isnum from './isnum.mjs'
import isfun from './isfun.mjs'
import isestr from './isestr.mjs'
import ispm from './ispm.mjs'
import cdbl from './cdbl.mjs'
import domPrepend from './domPrepend.mjs'
import domRemove from './domRemove.mjs'


/**
 * 前端產生臨時DOM元素為對象並進行客製化處理
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/domVirtualCreate.test.mjs Github}
 * @memberOf wsemi

 * @param {Function} fun 輸入處理函數，函數會傳入臨時產生的DOM元素，處理後例如產生base64圖片，並將其回傳，函數可為sync或async函數
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Number|String} [opt.width=null] 輸入目標DOM元素寬度數字，單位px，預設null
 * @param {Number|String} [opt.height=null] 輸入目標DOM元素高度數字，單位px，預設null
 * @returns {Promise} 回傳Promise，resolve回傳為fun處理後數據，reject回傳錯誤訊息
 * @example
 * need test in browser
 *
 * let fun = (ele) => {
 *     return ele2pic(ele) //use sync or async fun
 * }
 * let pic = await domVirtualCreate(fun, { width: 500, height: 350 })
 *
 */
async function domVirtualCreate(fun, opt = {}) {

    //check
    if (!isfun(fun)) {
        throw new Error('invalid fun')
    }

    //width
    let width = get(opt, 'width')
    if (isestr(width)) {
        width = trim(width)
    }
    else if (isnum(width)) {
        width = cdbl(width)
    }
    else {
        width = null
    }

    //height
    let height = get(opt, 'height')
    if (isestr(height)) {
        height = trim(height)
    }
    else if (isnum(height)) {
        height = cdbl(height)
    }
    else {
        height = null
    }

    //eleTar
    let eleTar = document.createElement('div')
    if (isnum(width)) {
        eleTar.style.width = `${width}px`
    }
    if (isnum(height)) {
        eleTar.style.height = `${height}px`
    }

    //eleIn
    let eleIn = document.createElement('div')
    eleIn.style.position = 'absolute'
    eleIn.style.top = 0
    eleIn.style.left = 0
    eleIn.style.zIndex = -1
    eleIn.appendChild(eleTar)

    //eleOut
    let eleOut = document.createElement('div')
    eleOut.style.position = 'relative'
    eleOut.appendChild(eleIn)

    //elePanel
    let elePanel = document.createElement('div')
    elePanel.style.position = 'fixed'
    elePanel.style.zIndex = -1
    elePanel.appendChild(eleOut)

    //domPrepend, 主要是配合html2canvas截圖機制, 只能塞入至body內最前
    let body = document.querySelector('body')
    domPrepend(body, elePanel)

    //call fun
    let r
    let ofun = fun(eleTar)
    if (ispm(ofun)) {
        r = await ofun
    }
    else {
        r = ofun
    }

    // remove
    // div.remove() //IE11不支援element.remove()
    domRemove(elePanel)

    return r
}


export default domVirtualCreate
