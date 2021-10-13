import isnum from './isnum.mjs'
import isfun from './isfun.mjs'
import ispm from './ispm.mjs'
import cdbl from './cdbl.mjs'
import domPrepend from './domPrepend.mjs'
import domRemove from './domRemove.mjs'


/**
 * 前端產生臨時DOM元素為對象並進行客製化處理
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/domVirtualCreate.test.mjs Github}
 * @memberOf wsemi
 * @param {Number} [w=600] 輸入目標DOM元素寬度數字，單位px，預設600
 * @param {Number} [h=400] 輸入目標DOM元素高度數字，單位px，預設400
 * @param {Function} fun 輸入處理函數，函數會傳入臨時產生的DOM元素，處理後例如產生base64圖片，並將其回傳，函數可為sync或async函數
 * @returns {Promise} 回傳Promise，resolve回傳為fun處理後數據，reject回傳錯誤訊息
 * @example
 * need test in browser
 *
 * let fun = (ele) => {
 *     return ele2pic(ele) //use sync or async fun
 * }
 * let pic = await domVirtualCreate(500, 350, fun)
 *
 */
async function domVirtualCreate(w = 600, h = 400, fun) {

    //check w,h
    if (!isnum(w)) {
        w = 600
    }
    w = cdbl(w)
    if (!isnum(h)) {
        h = 400
    }
    h = cdbl(h)

    //check fun
    if (!isfun(fun)) {
        throw new Error('invalid fun')
    }

    //eleTar
    let eleTar = document.createElement('div')
    eleTar.style.width = `${w}px`
    eleTar.style.height = `${h}px`

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
