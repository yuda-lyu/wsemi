import { polyfill } from 'seamless-scroll-polyfill'
import isEle from './isEle.mjs'
import isIE from './isIE.mjs'
import { BEHAVIORS, ALIGNS, isOptObj, readEnum } from './_scrollOpt.mjs'


/**
 * 前端平滑捲動至元素，讓指定元素出現在可視範圍中，為自動捲動父容器
 *
 * opt逐鍵檢測(使用者2026-11-16/主控W-05)：只取behavior、block、inline三個鍵，其餘未知鍵不轉交給原生scrollIntoView；各鍵只認原始字串且為原生值域之成員，非預期(null、非字串、包裝物件、值域外之字串如'SMOOTH'、讀取拋錯)視為未給(K3)：behavior改用預設'smooth'，block與inline不傳(由瀏覽器用其預設'start'與'nearest')，不報錯
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/domScrollIntoView.test.mjs Github}
 * @memberOf wsemi
 * @param {Element} ele 輸入Element元素，非元素則不動作
 * @param {Object} [opt={}] 輸入設定物件，非一般物件視為{}，預設{}
 * @param {String} [opt.behavior='smooth'] 輸入捲動方式字串，可為'auto'、'instant'、'smooth'，非預期視為未給，預設'smooth'
 * @param {String} [opt.block] 輸入垂直對齊字串，可為'start'、'center'、'end'、'nearest'，非預期視為未給(瀏覽器預設'start')
 * @param {String} [opt.inline] 輸入水平對齊字串，可為'start'、'center'、'end'、'nearest'，非預期視為未給(瀏覽器預設'nearest')
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
    if (!isOptObj(opt)) {
        opt = {}
    }

    //useOpt, 逐鍵檢測, 不直通未知鍵; behavior為undefined(未給或非預期)不覆蓋預設'smooth'
    let useOpt = { behavior: 'smooth' }
    let behavior = readEnum(opt, 'behavior', BEHAVIORS)
    if (behavior !== undefined) {
        useOpt.behavior = behavior
    }
    let block = readEnum(opt, 'block', ALIGNS)
    if (block !== undefined) {
        useOpt.block = block
    }
    let inline = readEnum(opt, 'inline', ALIGNS)
    if (inline !== undefined) {
        useOpt.inline = inline
    }

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

