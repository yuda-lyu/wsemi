import getGlobal from './getGlobal.mjs'
import isWindow from './isWindow.mjs'
import getTimeHp from './getTimeHp.mjs'


/**
 * 高精度setInterval
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/setIntervalHp.test.mjs Github}
 * @memberOf wsemi
 * @param {Function} fun 輸入調用函數
 * @param {Integer} interval 輸入時間間隔正整數，單位ms，預設1
 * @returns {Function} 回傳停止函數，輸入為非同步函數與其輸入，會推入佇列後並循序等待執行，回傳為Promise，resolve回傳成功結果而reject回傳失敗訊息
 * @example
 *
 * let i = 0
 * let t = setIntervalHp(() => {
 *     i++
 *     //content
 *     if (i > 10) {
 *         t()
 *     }
 * }, 50)
 *
 */
function setIntervalHp(fun, interval = 1) {

    //g
    let g = getGlobal()

    //iswin
    let iswin = isWindow()

    //exec
    let execNode = (fun) => {
        g.setTimeout(fun, 1)
    }
    let execBrowser = (fun) => {
        g.requestAnimationFrame(fun)
    }
    let exec = null
    if (iswin) {
        exec = execBrowser
    }
    else {
        exec = execNode
    }

    //gtm
    let gtm = getTimeHp()

    //running
    let running = true

    //startTime
    let startTime = gtm()
    // console.log('startTime', startTime)

    //loop
    let loop = () => {

        //check
        if (!running) {
            return
        }

        //currentTime
        let currentTime = gtm()
        // console.log('currentTime', currentTime)

        //elapsed
        let elapsed = currentTime - startTime

        //check
        if (elapsed >= interval) {

            //fun
            try {
                fun()
            }
            catch (err) {
                console.log(err)
            }

            //update
            startTime = gtm()

        }

        //continue
        exec(loop)

    }

    //start
    exec(loop)

    //stop
    let stop = () => {
        running = false
    }

    return stop
}


export default setIntervalHp
