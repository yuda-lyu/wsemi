import get from 'lodash/get'
import ispint from './ispint.mjs'
import evem from './evem.mjs'
import isfun from './isfun.mjs'


/**
 * 前端偵測DOM元素resize、resizeWithWindow與display事件，其中resizeWithWindow為dom resize與window resize皆會觸發的事件
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/domDetect.test.js Github}
 * @memberOf wsemi
 * @param {Function} f 輸入取得dom函數
 * @param {Integer} [opt.timeInterval=20] 輸入定期偵測時間整數，預設20毫秒
 * @param {Integer} [opt.tolerancePixel=1] 輸入容許誤差整數，單位px，預設1
 * @example
 *
 * //監聽dom
 * let de = domDetect(() => {
 *     return document.querySelector('#id')
 * })
 * de.on('resize', (s) => {
 *     console.log('resize', s)
 * })
 * de.on('resizeWithWindow', (s) => {
 *     console.log('resizeWithWindow', s)
 * })
 * de.on('display', (s) => {
 *     console.log('display', s)
 * })
 *
 * //釋放監聽
 * de.clear()
 *
 */
function domDetect(f, opt = {}) {

    //timeInterval
    let timeInterval = get(opt, 'timeInterval', null)
    if (!ispint(timeInterval)) {
        timeInterval = 20
    }

    //tolerancePixel
    let tolerancePixel = get(opt, 'tolerancePixel', null)
    if (!ispint(tolerancePixel)) {
        tolerancePixel = 1
    }

    //ev
    let ev = evem()

    //timer, s
    let timer
    let s = {
        offsetWidth: 0,
        offsetHeight: 0,
    }

    //check
    if (!isfun(f)) {
        console.log('invalid f', f)
        return null
    }

    //setInterval
    timer = setInterval(() => {

        //execute
        let p = f()

        //check
        if (p) {

            //new size
            let snew = {
                offsetWidth: p.offsetWidth,
                offsetHeight: p.offsetHeight,
            }

            //detect
            let bw = Math.abs(s.offsetWidth - snew.offsetWidth) > tolerancePixel
            let bh = Math.abs(s.offsetHeight - snew.offsetHeight) > tolerancePixel
            if (bw || bh) {
                let sold = { ...s }
                setTimeout(() => { //emit觸發事件為同步, 用setTimeout脫勾

                    //detect resize
                    if (snew.offsetWidth > 0 && snew.offsetHeight > 0) {
                        ev.emit('resize', { sold, snew, ele: p })
                        ev.emit('resizeWithWindow', { sold, snew, ele: p, from: 'dom' })
                    }

                    //detect display
                    if (s.offsetWidth === 0 && s.offsetHeight === 0 && (snew.offsetWidth > 0 || snew.offsetHeight > 0)) {
                        ev.emit('display', { mode: 'show', ele: p })
                    }
                    if ((s.offsetWidth > 0 || s.offsetHeight > 0) && snew.offsetWidth === 0 && snew.offsetHeight === 0) {
                        ev.emit('display', { mode: 'hide', ele: p })
                    }

                }, 1)
            }

            //save
            s = snew

        }


    }, timeInterval)

    //fWindowResize
    let fWindowResize = (e) => {
        ev.emit('resizeWithWindow', { snew: s, from: 'window' })
    }
    window.addEventListener('resize', fWindowResize)

    //clear
    ev.clear = () => {
        clearInterval(timer)
        window.removeEventListener('resize', fWindowResize)
    }

    return ev
}


export default domDetect
