import { elementScrollTo } from 'seamless-scroll-polyfill/dist/esm/index.js'
import isEle from './isEle.mjs'
import isobj from './isobj.mjs'
import isIE from './isIE.mjs'


/**
 * 前端DOM元素平滑捲動至指定位置
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/domScrollTo.test.mjs Github}
 * @memberOf wsemi
 * @param {Element} ele 輸入Element元素
 * @param {Object} [opt={behavior:'smooth'}] 輸入scrollTo的設定物件，預設{behavior:'smooth'}
 * @example
 * need test in browser
 *
 * let ele = document.querySelector('#id')
 * domScrollTo(ele, {})
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
        elementScrollTo(ele, useOpt) //IE11
    }
    else {
        ele.scrollTo(useOpt)
    }

}


export default domScrollTo

