import { polyfill } from 'seamless-scroll-polyfill'
import isEle from './isEle.mjs'
import isobj from './isobj.mjs'
import isIE from './isIE.mjs'


/**
 * 前端平滑捲動至DOM元素
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/domScrollIntoView.test.mjs Github}
 * @memberOf wsemi
 * @param {Element} ele 輸入Element元素
 * @param {Object} [opt={behavior:'smooth'}] 輸入scrollIntoView的設定物件，預設{behavior:'smooth'}
 * @example
 * need test in browser
 *
 * let ele = document.querySelector('#id')
 * domScrollIntoView(ele, {})
 *
 */
function domScrollIntoView(ele, opt = {}) {

    //check
    if (!isEle(ele)) {
        return
    }
    if (!isobj(opt)) {
        opt = {}
    }

    //useOpt
    let useOpt = { behavior: 'smooth' }
    useOpt = { ...useOpt, ...opt }

    //call
    if (isIE()) {
        polyfill() //IE11, 不確定是否有偵測不重複加載機制, 為支援IE11暫時這樣處理
        // elementScrollIntoView(ele, useOpt) //IE11
    }
    else {
        // ele.scrollIntoView(useOpt)
    }
    ele.scrollIntoView(useOpt)

}


export default domScrollIntoView

