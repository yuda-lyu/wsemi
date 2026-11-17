import { polyfill } from 'seamless-scroll-polyfill'
import isEle from './isEle.mjs'
import isIE from './isIE.mjs'
import { BEHAVIORS, isOptObj, readEnum, readNum } from './_scrollOpt.mjs'


/**
 * 前端平滑捲動至元素，讓捲動容器元素，捲動到特定座標(left或top)位置
 *
 * opt逐鍵檢測(使用者2026-11-16/主控W-05)：只取behavior、left、top三個鍵，其餘未知鍵不轉交給原生scrollTo；behavior只認原始字串且為原生值域之成員，非預期(null、非字串、包裝物件、值域外之字串、讀取拋錯)視為未給(K3)而改用預設'smooth'；left與top須為有效數字(有限數字或十進位數字字串，去頭尾空白後取值；NaN、Infinity、'0x10'、null、布林、包裝物件皆非有效數字)，判定通過後以cdbl轉為數字再使用，非預期視為未給(該軸不捲動，不傳給原生API而被轉成0)，不報錯
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/domScrollTo.test.mjs Github}
 * @memberOf wsemi
 * @param {Element} ele 輸入Element元素，非元素則不動作
 * @param {Object} [opt={}] 輸入設定物件，非一般物件視為{}，預設{}
 * @param {String} [opt.behavior='smooth'] 輸入捲動方式字串，可為'auto'、'instant'、'smooth'，非預期視為未給，預設'smooth'
 * @param {Number|String} [opt.left] 輸入水平捲動座標，單位px，須為有效數字，非預期視為未給(該軸維持現狀)
 * @param {Number|String} [opt.top] 輸入垂直捲動座標，單位px，須為有效數字，非預期視為未給(該軸維持現狀)
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
    if (!isOptObj(opt)) {
        opt = {}
    }

    //useOpt, 逐鍵檢測, 不直通未知鍵; behavior為undefined(未給或非預期)不覆蓋預設'smooth'
    let useOpt = { behavior: 'smooth' }
    let behavior = readEnum(opt, 'behavior', BEHAVIORS)
    if (behavior !== undefined) {
        useOpt.behavior = behavior
    }
    let left = readNum(opt, 'left')
    if (left !== undefined) {
        useOpt.left = left
    }
    let top = readNum(opt, 'top')
    if (top !== undefined) {
        useOpt.top = top
    }

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

