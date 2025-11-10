import { polyfill } from 'seamless-scroll-polyfill'
import isEle from './isEle.mjs'
import isobj from './isobj.mjs'
import isIE from './isIE.mjs'


/**
 * 前端平滑捲動至元素，讓捲動容器元素，捲動到特定座標(left或top)位置
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/domScrollTo.test.mjs Github}
 * @memberOf wsemi
 * @param {Element} ele 輸入Element元素
 * @param {Object} [opt={behavior:'smooth'}] 輸入scrollTo的設定物件，預設{behavior:'smooth'}
 * @example
 * need test in browser
 *
 * let ele = document.querySelector('#id')
 * domScrollTo(ele, { left: 0, top: 100 })
 *
 */
function domScrollTo(ele, opt = {}) {

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
        // elementScrollTo(ele, useOpt) //IE11
    }
    else {
        // ele.scrollTo(useOpt)
    }
    ele.scrollTo(useOpt)

}


export default domScrollTo

