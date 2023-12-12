import get from 'lodash-es/get'
import cdbl from './cdbl.mjs'
import isEle from './isEle.mjs'
import isnum from './isnum.mjs'
import genID from './genID.mjs'


/**
 * 前端DOM元素fadeIn效果
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/domFadeIn.test.mjs Github}
 * @memberOf wsemi
 * @param {HTMLElement} ele 輸入取得dom函數
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Number} [opt.duration=500] 輸入動畫持續時間毫秒整數，預設500
 * @param {Number} [opt.delay=0] 輸入動畫延遲啟動時間毫秒整數，預設0
 * @param {Number} [opt.opacityIni=0] 輸入初始透明度浮點數，介於0至1之間，預設0
 * @example
 * need test in browser
 *
 * domFadeIn(document.querySelector('#id'))
 *
 * domFadeIn(document.querySelector('#id'), { duration: 500, delay: 100, opacityIni: 0.2 })
 *
 */
function domFadeIn(ele, opt = {}) {

    //check
    if (!isEle(ele)) {
        return
    }

    //duration
    let duration = get(opt, 'duration', 500)
    duration = cdbl(duration)
    if (duration < 0) {
        duration = 1000
    }

    //delay
    let delay = get(opt, 'delay', 0)
    delay = cdbl(delay)
    if (delay < 0) {
        delay = 0
    }

    //useOpacity
    let useOpacity = get(opt, 'opacityIni', 0)
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

            //check tag
            let tagTemp = ele.getAttribute('dom-fade-tag')
            if (tagTemp !== tag) {
                clearInterval(t) //只停掉timer, 由後續觸發的timer控制
            }

            //update
            ele.style.opacity = useOpacity

            //clear
            if (useOpacity >= 1) {
                clearInterval(t)
                ele.removeAttribute('dom-fade-tag')
            }

            //add
            useOpacity += s
            if (useOpacity > 1) {
                useOpacity = 1
            }

        }, ss)
    }, delay)

}


export default domFadeIn
