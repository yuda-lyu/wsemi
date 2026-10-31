import getGlobal from './getGlobal.mjs'
import isWindow from './isWindow.mjs'
import getTimeHp from './getTimeHp.mjs'
import pm2resolve from './pm2resolve.mjs'
import getTrace from './getTrace.mjs'
import optVal from './_optVal.mjs'


//interval: opt類參數, 有效數字且為正數(isenum, use: 'positive', 大於0, 不設上限: 本函數以hrtime加setTimeout(loop, 1)輪詢, interval只與經過時間比較、不交給原生計時器, 故無2147483647之技術限制), 非預期(含0、負數、Infinity、NaN)改用預設1
let RULE_INTERVAL = { fn: 'setIntervalHp', name: 'interval', kind: 'enum', chk: { use: 'positive' } }


//logErr, 記錄本身亦可能拋錯(如值之util.inspect.custom會拋), 須包try
function logErr(err) {
    try {
        console.log(err)
    }
    catch (e) {}
}


/**
 * 高精度setInterval
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/setIntervalHp.test.mjs Github}
 * @memberOf wsemi
 * @param {Function} fun 輸入調用函數
 * @param {Number|String} [interval=1] 輸入時間間隔，單位為毫秒ms，opt類參數(有效數字，大於0，可帶小數，數字字串亦可，去頭尾空白後取值；不設上限，因本函數不交給原生計時器)，非預期之輸入(非有效數字、0、負數、NaN、Infinity、'0x10'、空白字串、包裝物件等)視為未給而改用預設1毫秒並照常啟動，不夾至上限、不報錯、不記錄，預設1
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Boolean} [opt.debug=false] 輸入是否於interval為非預期之輸入而改用預設時輸出警告，非布林視為false，警告為固定詞彙(不含傳入之值)，同一參數每個行程只警告一次，預設false
 * @param {Function} [opt.funLog=null] 輸入警告出口函數，以(msg, { fn, reason, key })呼叫，未給則用console.warn，預設null
 * @param {Function} [opt.onTrace=null] 輸入觀察回調函數，於內部事件發生當下同步呼叫，傳入一個凍結之事件物件{ type, ... }，供測試以事件(而非等待時間)同步與診斷；type為'start'時為開始計時(無其他欄位)，'fire'時為已距上次調用(首次為建立)達interval而即將調用fun(含n為第幾次調用，由1起算，elapsed為距上次調用(首次為建立)實際經過之毫秒數，必不小於interval)，'result'時為該次調用已有結果而即將記錄(含n為對應之fire次數，state為'success'、'error'(同步拋錯或Promise被reject，即將console.log記錄)、'cancelled'或'invalid'(fun非函數，即將console.log記錄))，'stop'時為呼叫停止函數(僅首次通知)；停止後不再通知(含停止前已調用而尚未有結果者)；回調不帶接收者呼叫，其拋錯與回傳值皆忽略，不影響計時與調用，預設null
 * @returns {Function} 回傳停止函數，呼叫後不再調用fun。fun同步拋錯或其Promise被reject時以console.log記錄而不外拋，不影響後續調用；fun非函數時每次到期皆以console.log記錄Error('fn is not a function')，直至呼叫停止函數。到期即調用fun，不等待前一次調用之Promise完成(與原生setInterval相同)，故fun為非同步函數且執行時間長於interval時，各次調用會重疊執行，須避免重疊者請於fun內自行處理(如以旗標略過)
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
function setIntervalHp(fun, interval = 1, opt = {}) {

    //interval, opt類參數(預設1), 須為有效數字且大於0(不設上限, 不交給原生計時器), 非預期(含0、負數、Infinity)視為未給、改用預設1並照常啟動
    interval = optVal(interval, 1, RULE_INTERVAL, opt)

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

    //nFire, 已通知之調用次數, 僅trace時使用
    let nFire = 0

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

            //n, 本次調用之序號, 僅trace時使用
            let n = 0
            if (trace) {
                nFire++
                n = nFire
                trace('fire', { n, elapsed })
            }

            //fun, 同步拋錯與其Promise被reject皆以console.log記錄而不外拋(不產生未處理之rejection), 同debounce
            try {
                pm2resolve(fun)()
                    .then((res) => {
                        if (trace && running) {
                            trace('result', { n, state: res.state })
                        }
                        if (res.state === 'error') {
                            logErr(res.msg)
                        }
                    })
            }
            catch (err) {
                if (trace && running) {
                    trace('result', { n, state: 'invalid' })
                }
                logErr(err) //fun非函數時pm2resolve同步拋錯
            }

            //update
            startTime = gtm()

        }

        //continue
        exec(loop)

    }

    //start
    if (trace) {
        trace('start', {})
    }
    exec(loop)

    //stop
    let stop = () => {
        if (trace && running) {
            trace('stop', {})
        }
        running = false
    }

    return stop
}


export default setIntervalHp
