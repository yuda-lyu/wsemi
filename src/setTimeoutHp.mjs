import getGlobal from './getGlobal.mjs'
import isWindow from './isWindow.mjs'
import isnum from './isnum.mjs'
import getTimeHp from './getTimeHp.mjs'
import pm2resolve from './pm2resolve.mjs'
import getTrace from './getTrace.mjs'


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
 * @param {Number} [interval=1] 輸入時間間隔，須為正有限數(通常為正整數，數字字串亦可)，單位為毫秒ms，預設1；0、負數、NaN、Infinity、非數字或空白字串等無效值時不啟動，見回傳說明
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Function} [opt.onTrace=null] 輸入觀察回調函數，於內部事件發生當下同步呼叫，傳入一個凍結之事件物件{ type, ... }，供測試以事件(而非等待時間)同步與診斷；type為'start'時為開始計時(無其他欄位)，'fire'時為已距建立達interval而即將調用fun(含elapsed為距建立實際經過之毫秒數，必不小於interval；僅通知一次)，'result'時為該次調用已有結果而即將記錄(含state為'success'、'error'(同步拋錯或Promise被reject，即將console.log記錄)、'cancelled'或'invalid'(fun非函數，即將console.log記錄))；回調不帶接收者呼叫，其拋錯與回傳值皆忽略，不影響計時與調用，預設null
 * @returns {null} 回傳null(無停止函數)。interval為無效值時不啟動計時、不調用fun，以console.log記錄Error('interval is not a positive finite number')一次。fun同步拋錯或其Promise被reject時以console.log記錄而不外拋；fun非函數時到期以console.log記錄Error('fn is not a function')
 * @example
 *
 * let t = setTimeoutHp(() => {
 *     //content
 * }, 1000)
 *
 */
function setTimeoutHp(fun, interval = 1, opt = {}) {

    //interval, 須為正有限數(數字字串亦可), 無效時不啟動並以console.log記錄(同fun非函數之記錄方式)
    let ms = isnum(interval) ? Number(interval) : NaN
    if (!(ms > 0 && Number.isFinite(ms))) {
        logErr(new Error('interval is not a positive finite number'))
        return null
    }
    interval = ms

    //trace, 觀察回調(opt.onTrace), 未給時為null
    let trace = getTrace(opt)

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

            //fire
            if (trace) {
                trace('fire', { elapsed })
            }

            //fun, 同步拋錯與其Promise被reject皆以console.log記錄而不外拋(不產生未處理之rejection), 同debounce
            try {
                pm2resolve(fun)()
                    .then((res) => {
                        if (trace) {
                            trace('result', { state: res.state })
                        }
                        if (res.state === 'error') {
                            logErr(res.msg)
                        }
                    })
            }
            catch (err) {
                if (trace) {
                    trace('result', { state: 'invalid' })
                }
                logErr(err) //fun非函數時pm2resolve同步拋錯
            }

        }

        //continue
        exec(loop)

    }

    //start
    if (trace) {
        trace('start', {})
    }
    exec(loop)

    return null
}


export default setTimeoutHp
