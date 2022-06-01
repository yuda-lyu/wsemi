import { polyfill } from 'seamless-scroll-polyfill'
import isEle from './isEle.mjs'
import isobj from './isobj.mjs'
import isIE from './isIE.mjs'


/**
 * 前端DOM元素平滑捲動至指定位置。
 *
 * 在多層DOM中用scrollIntoView捲動可能失效，此時需針對指定元素取得offsetTop，並由父層scrollTo到指定元素。
 *
 * 需注意指定元素取得offsetTop是針對可定位之父層，若無定位則為body。若發現可定位父層非可捲動父層，可將該父層給予position:relative，此可將父層轉為可定位元素，進而使可定位父層等同於可捲動父層，進而使指定元素取得之offsetTop可用於父層scrollTo。
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
        polyfill() //IE11, 不確定是否有偵測不重複加載機制, 為支援IE11暫時這樣處理
        // elementScrollTo(ele, useOpt) //IE11
    }
    else {
        // ele.scrollTo(useOpt)
    }
    ele.scrollTo(useOpt)

}


export default domScrollTo

