import Evem from './evem.mjs'
import isfun from './isfun.mjs'


/**
 * 前端偵測DOM元素resize與display事件
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/domDetect.test.js Github}
 * @memberOf wsemi
 * @param {Function} f 輸入取得dom函數
 * @param {Integer} [ms=20] 輸入偵測頻率整數，預設20毫秒
 * @example
 * need test in browser
 */
function domDetect(f, ms = 20) {
    let ev = new Evem()
    let timer
    let s = {
        clientWidth: 0,
        clientHeight: 0,
    }

    //check
    if (!isfun(f)) {
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
                clientWidth: p.clientWidth,
                clientHeight: p.clientHeight,
            }

            //detect
            if (s.clientWidth !== snew.clientWidth || s.clientHeight !== snew.clientHeight) {
                let sold = { ...s }
                setTimeout(() => { //emit觸發事件為同步, 用setTimeout脫勾

                    //detect resize
                    if (snew.clientWidth > 0 && snew.clientHeight > 0) {
                        ev.emit('resize', { sold, snew, ele: p })
                    }

                    //detect display
                    if (s.clientWidth === 0 && s.clientHeight === 0 && (snew.clientWidth > 0 || snew.clientHeight > 0)) {
                        ev.emit('display', { mode: 'show', ele: p })
                    }
                    if ((s.clientWidth > 0 || s.clientHeight > 0) && snew.clientWidth === 0 && snew.clientHeight === 0) {
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
