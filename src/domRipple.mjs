import get from 'lodash-es/get.js'
import isestr from './isestr.mjs'
import isEle from './isEle.mjs'
import isenum from './isenum.mjs'
import cdbl from './cdbl.mjs'
import domRemove from './domRemove.mjs'
import optVal from './_optVal.mjs'


//timeDuration: opt類參數, 有效整數且為正數計時毫秒(iseint, use: 'timer', min: 1; 交給setTimeout), 非預期(含Infinity、超出計時器上限)改用預設1000
let RULE_TIME_DURATION = { fn: 'domRipple', name: 'opt.timeDuration', kind: 'eint', chk: { use: 'timer', min: 1 } }


/**
 * 前端針對DOM元素設定點擊Ripple效果
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/domRipple.test.mjs Github}
 * @memberOf wsemi
 * @param {HTMLElement} ele 輸入dom，非元素則不動作(不拋錯)
 * @param {Object} event 輸入dom點擊事件，須為物件且clientX與clientY為有效數字(有限數字或十進位數字字串，去頭尾空白後取值；NaN、Infinity、'0x10'、null、布林、包裝物件皆非有效數字)，判定通過後以cdbl轉為數字再使用；否則拋出Error('invalid event: must be an event object with valid clientX and clientY')，訊息不含輸入值，先於任何DOM變動(不改寫ele.style)；ele與event皆無效時ele優先(不動作、不拋錯)
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Integer} [opt.timeDuration=1000] 輸入Ripple效果持續時間整數，須為1至2147483647之有效整數(數字字串亦可)，單位為毫秒ms，預設1000；非預期(0、負數、小數、Infinity、超過2147483647、'0x10'、包裝物件、非數字等)視為未給而改用預設1000，不報錯、不夾至上限
 * @param {String} [opt.color='rgba(255, 255, 255, 0.5)'] 輸入Ripple顏色字串，預設'rgba(255, 255, 255, 0.5)'
 * @param {Boolean} [opt.debug=false] 輸入是否於opt.timeDuration為非預期之輸入時輸出警告布林值，須為true才生效，警告為固定詞彙(不含輸入值)，同一行程只警告一次，預設false
 * @param {Function} [opt.funLog=null] 輸入警告輸出函數，格式為(msg, { fn, reason, key })=>{}，未給則用console.warn，預設null
 * @example
 * need test in browser
 *
 * let ele = document.querySelector('#id')
 * ele.addEventListener('click', (e)=>{
 *     domRipple(e.currentTarget,e)
 * })
 *
 */
function domRipple(ele, event, opt = {}) {

    //timeDuration, 有效則取Number(v), 非預期(含Infinity、超出計時器上限)改用預設
    let timeDuration = optVal(get(opt, 'timeDuration', null), 1000, RULE_TIME_DURATION, opt)

    //color
    let color = get(opt, 'color', null)
    if (!isestr(color)) {
        color = 'rgba(255, 255, 255, 0.5)'
    }

    //check
    if (!isEle(ele)) {
        return
    }

    //check event, 必須參數且會改動畫面: 須為物件且clientX、clientY為有效數字, 否則拋錯, 先於任何DOM變動(V17; 原先改寫ele.style後才讀event.clientX拋原生TypeError, 或寫入'NaNpx')
    //  clientX、clientY依序各讀一次, 檢測之值即使用之值(判定通過後以cdbl轉為數字); 讀取拋錯(拋錯之getter、已撤銷之Proxy)視為無效
    let clientX = null
    let clientY = null
    try {
        if (typeof event === 'object' && event !== null) {
            clientX = event.clientX
            if (isenum(clientX)) {
                clientY = event.clientY
            }
        }
    }
    catch (err) {
        clientX = null
    }
    if (!isenum(clientX) || !isenum(clientY)) {
        throw new Error('invalid event: must be an event object with valid clientX and clientY')
    }
    clientX = cdbl(clientX)
    clientY = cdbl(clientY)

    //更改元素style
    ele.style.position = 'relative' //得要讓ripple的absolute能生效
    ele.style.overflow = 'hidden' //讓ripple的效果不會溢出dom範圍

    //let
    let rect = ele.getBoundingClientRect()
    let left = clientX - rect.left
    let top = clientY - rect.top

    //diameter
    let diameter = Math.max(ele.clientWidth, ele.clientHeight) * 2 //半徑為最大長寬, 直徑為半徑*2

    //eleRipple
    let eleRipple = document.createElement('div')
    eleRipple.style.width = `${diameter}px`
    eleRipple.style.height = `${diameter}px`
    eleRipple.style.transition = `all ${timeDuration / 1000}s linear`
    eleRipple.style.position = 'absolute'
    eleRipple.style.zIndex = 1
    eleRipple.style.left = `${left}px`
    eleRipple.style.top = `${top}px`
    eleRipple.style.borderRadius = '50%'
    eleRipple.style.transformOrigin = 'center'
    eleRipple.style.transform = 'translate(-50%,-50%) scale(0)'
    eleRipple.style.background = color
    eleRipple.style.userSelect = 'none'
    eleRipple.style.pointerEvents = 'none'
    ele.appendChild(eleRipple)
    // console.log('eleRipple',eleRipple)

    //add effect
    setTimeout(() => {
        eleRipple.style.transform = 'translate(-50%,-50%) scale(2)'
        eleRipple.style.opacity = 0
    }, 1)

    //remove
    setTimeout(() => {
        domRemove(eleRipple)
    }, timeDuration)

}


export default domRipple
