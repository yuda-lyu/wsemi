import get from 'lodash/get'
import cdbl from 'wsemi/src/cdbl.mjs'


/**
 * 前端DOM元素fadeIn效果
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/domFadeIn.test.js Github}
 * @memberOf wsemi
 * @param {HTMLElement} ele 輸入取得dom函數
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Number} [opt.duration=1000] 輸入動畫持續時間毫秒整數，預設1000
 * @param {Number} [opt.delay=0] 輸入動畫延遲啟動時間毫秒整數，預設0
 * @param {Number} [opt.opacityIni=0] 輸入初始透明度浮點數，介於0至1之間，預設0
 * @example
 *
 * domFadeIn(document.querySelector('#id'))
 *
 * domFadeIn(document.querySelector('#id'), { duration: 500, delay: 100, opacityIni: 0.2 })
 *
 */
function domFadeIn(ele, opt = {}) {

    //duration
    let duration = get(opt, 'duration', 1000)
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

    //更新週期(ms)
    let ss = 10

    //每次調整opacity
    let s = ss / duration

    //timer
    setTimeout(() => {
        let t = setInterval(() => {
            ele.style.opacity = useOpacity
            if (useOpacity >= 1) {
                clearInterval(t)
            }
            useOpacity += s
            if (useOpacity > 1) {
                useOpacity = 1
            }
        }, ss)
    }, delay)

}


export default domFadeIn
