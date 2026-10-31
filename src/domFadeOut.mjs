import get from 'lodash-es/get.js'
import cdbl from './cdbl.mjs'
import isEle from './isEle.mjs'
import isnum from './isnum.mjs'
import genID from './genID.mjs'
import optVal from './_optVal.mjs'


//opt.duration: opt類參數, 須為有效數字且大於等於0(isenum, use: 'nonnegative', 0為瞬間完成), 非預期(含負數、Infinity、'0x10'、包裝物件等)視為未給、改用預設500, 不報錯
let RULE_DURATION = { fn: 'domFadeOut', name: 'opt.duration', kind: 'enum', chk: { use: 'nonnegative' } }


/**
 * 前端針對DOM元素執行淡出效果
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/domFadeOut.test.mjs Github}
 * @memberOf wsemi
 * @param {HTMLElement} ele 輸入取得dom函數
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Number|String} [opt.duration=500] 輸入動畫持續時間毫秒，opt類參數(有效數字，大於等於0，可帶小數，數字字串亦可，去頭尾空白後取值)，非預期之輸入(非有效數字、負數、Infinity、'0x10'、包裝物件等)視為未給而改用預設，不報錯，預設500
 * @param {Boolean} [opt.debug=false] 輸入是否於opt.duration為非預期之輸入而改用預設時輸出警告，非布林視為false，警告為固定詞彙(不含傳入之值)，同一參數每個行程只警告一次，預設false
 * @param {Function} [opt.funLog=null] 輸入警告出口函數，以(msg, { fn, reason, key })呼叫，未給則用console.warn，預設null
 * @param {Number} [opt.delay=0] 輸入動畫延遲啟動時間毫秒整數，預設0
 * @param {Number} [opt.opacityIni=1] 輸入初始透明度浮點數，介於0至1之間，預設1
 * @example
 * need test in browser
 *
 * domFadeOut(document.querySelector('#id'))
 *
 * domFadeOut(document.querySelector('#id'), { duration: 500, delay: 100, opacityIni: 0.8 })
 *
 */
function domFadeOut(ele, opt = {}) {

    //check
    if (!isEle(ele)) {
        return
    }

    //duration, 非預期(含負數)改用預設500
    let duration = optVal(get(opt, 'duration', 500), 500, RULE_DURATION, opt)

    //delay
    let delay = get(opt, 'delay', 0)
    delay = cdbl(delay)
    if (delay < 0) {
        delay = 0
    }

    //useOpacity
    let useOpacity = get(opt, 'opacityIni', 1)
    useOpacity = cdbl(useOpacity)
    useOpacity = Math.min(Math.max(useOpacity, 0), 1)
    if (isnum(ele.style.opacity)) {
        useOpacity = cdbl(ele.style.opacity)
    }

    //更新週期(ms)
    let ss = 10

    //每次調整opacity
    let s = ss / duration

    //tag
    let tag = `tag-${genID()}`

    //set tag
    ele.setAttribute('dom-fade-tag', tag)

    //timer
    setTimeout(() => {
        let t = setInterval(() => {

            try {

                //check tag
                let tagTemp = ele.getAttribute('dom-fade-tag')
                if (tagTemp !== tag) {
                    clearInterval(t)
                }

                //update
                ele.style.opacity = useOpacity

                //clear
                if (useOpacity <= 0) {
                    clearInterval(t)
                    ele.removeAttribute('dom-fade-tag')
                }

                //add
                useOpacity -= s
                if (useOpacity < 0) {
                    useOpacity = 0
                }

            }
            catch (err) {
                console.log(err)
                clearInterval(t)
            }

        }, ss)
    }, delay)

}


export default domFadeOut
