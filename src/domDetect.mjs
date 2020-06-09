import evem from './evem.mjs'
import isfun from './isfun.mjs'


/**
 * 前端偵測DOM元素resize與display事件
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/domDetect.test.js Github}
 * @memberOf wsemi
 * @param {Function} f 輸入取得dom函數
 * @param {Integer} [ms=20] 輸入偵測頻率整數，預設20毫秒
 * @example
 *
 * //監聽dom
 * let de = domDetect(() => {
 *     return document.querySelector('#id')
 * })
 * de.on('resize', (s) => {
 *     console.log('resize', s)
 * })
 * de.on('display', (s) => {
 *     console.log('display', s)
 * })
 *
 * //釋放監聽
 * de.clear()
 *
 */
function domDetect(f, ms = 20) {
    let ev = evem()
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
            if (s.offsetWidth !== snew.offsetWidth || s.offsetHeight !== snew.offsetHeight) {
                let sold = { ...s }
                setTimeout(() => { //emit觸發事件為同步, 用setTimeout脫勾

                    //detect resize
                    if (snew.offsetWidth > 0 && snew.offsetHeight > 0) {
                        ev.emit('resize', { sold, snew, ele: p })
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


    }, ms)

    //clear
    ev.clear = () => {
        clearInterval(timer)
    }

    return ev
}


export default domDetect
