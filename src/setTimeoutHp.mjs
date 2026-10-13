import getGlobal from './getGlobal.mjs'
import isWindow from './isWindow.mjs'
import getTimeHp from './getTimeHp.mjs'
import pm2resolve from './pm2resolve.mjs'


//logErr, 記錄本身亦可能拋錯(如值之util.inspect.custom會拋), 須包try
function logErr(err) {
    try {
        console.log(err)
    }
    catch (e) {}
}


/**
 * 高精度setTimeoutHp
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/setTimeoutHp.test.mjs Github}
 * @memberOf wsemi
 * @param {Function} fun 輸入調用函數
 * @param {Integer} interval 輸入時間間隔正整數，單位為毫秒ms，預設1
 * @returns {null} 回傳null(無停止函數)。fun同步拋錯或其Promise被reject時以console.log記錄而不外拋
 * @example
 *
 * let t = setTimeoutHp(() => {
 *     //content
 * }, 1000)
 *
 */
function setTimeoutHp(fun, interval = 1) {

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

            //stop
            running = false

            //fun, 同步拋錯與其Promise被reject皆以console.log記錄而不外拋(不產生未處理之rejection), 同debounce
            try {
                pm2resolve(fun)()
                    .then((res) => {
                        if (res.state === 'error') {
                            logErr(res.msg)
                        }
                    })
            }
            catch (err) {
                logErr(err) //fun非函數時pm2resolve同步拋錯
            }

        }

        //continue
        exec(loop)

    }

    //start
    exec(loop)

    return null
}


export default setTimeoutHp
