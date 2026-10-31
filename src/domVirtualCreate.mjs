import get from 'lodash-es/get.js'
import isfun from './isfun.mjs'
import ispm from './ispm.mjs'
import optVal from './_optVal.mjs'
import domPrepend from './domPrepend.mjs'
import domRemove from './domRemove.mjs'


//opt.width, opt.height: opt類參數, 為尺寸(px, 可帶小數), 須為有效數字且大於等於0(isenum, use: 'nonnegative'), 非預期(含負數、Infinity、'0x10'、'50%'等非數字字串、包裝物件等)視為未給(null, 不設定該尺寸), 不報錯
let RULE_WIDTH = { fn: 'domVirtualCreate', name: 'opt.width', kind: 'enum', chk: { use: 'nonnegative' }, defDesc: 'null (not set)' }
let RULE_HEIGHT = { fn: 'domVirtualCreate', name: 'opt.height', kind: 'enum', chk: { use: 'nonnegative' }, defDesc: 'null (not set)' }


/**
 * 前端產生臨時DOM元素為對象並進行客製化處理
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/domVirtualCreate.test.mjs Github}
 * @memberOf wsemi

 * @param {Function} fun 輸入處理函數，函數會傳入臨時產生的DOM元素，處理後例如產生base64圖片，並將其回傳，函數可為sync或async函數
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Number|String} [opt.width=null] 輸入目標DOM元素寬度，單位px，opt類參數(有效數字，大於等於0，可帶小數，數字字串亦可，去頭尾空白後取值)，非預期之輸入(非有效數字、負數、Infinity、'0x10'、'50%'、包裝物件等)視為未給而不設定寬度，不報錯，預設null
 * @param {Number|String} [opt.height=null] 輸入目標DOM元素高度，單位px，規則同opt.width，預設null
 * @param {Boolean} [opt.debug=false] 輸入是否於opt.width或opt.height為非預期之輸入而視為未給時輸出警告，非布林視為false，警告為固定詞彙(不含傳入之值)，同一參數每個行程只警告一次，預設false
 * @param {Function} [opt.funLog=null] 輸入警告出口函數，以(msg, { fn, reason, key })呼叫，未給則用console.warn，預設null
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

    //width, 非預期視為未給(null)
    let width = optVal(get(opt, 'width'), null, RULE_WIDTH, opt)

    //height, 非預期視為未給(null)
    let height = optVal(get(opt, 'height'), null, RULE_HEIGHT, opt)

    //eleTar
    let eleTar = document.createElement('div')
    if (width !== null) {
        eleTar.style.width = `${width}px`
    }
    if (height !== null) {
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

    //domPrepend, 插入最前盡量被遮蔽
    let body = document.querySelector('body')
    domPrepend(body, elePanel)

    //call fun
    //不論fun成功、同步拋錯或其Promise被reject, 皆須移除臨時元素(finally), 否則失敗者之臨時元素殘留於body
    let r
    try {
        let ofun = fun(eleTar)
        if (ispm(ofun)) {
            r = await ofun
        }
        else {
            r = ofun
        }
    }
    finally {
        // remove
        // div.remove() //IE11不支援element.remove()
        //清理本身不得拋錯覆蓋原結果或原錯誤(fun可能已自行移除臨時元素)
        try {
            domRemove(elePanel)
        }
        catch (err) {}
    }

    return r
}


export default domVirtualCreate
