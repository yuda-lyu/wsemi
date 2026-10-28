import cst from './_const.mjs'
import get from 'lodash-es/get.js'
import genPm from './genPm.mjs'
import ispm from './ispm.mjs'
import isestr from './isestr.mjs'
import isp0int from './isp0int.mjs'
import getTrace from './getTrace.mjs'


/**
 * 為Promise添加逾時限制
 *
 * 以Promise.race令pm與計時器競速，pm先完成則原樣回傳其resolve或reject之結果，逾時則reject一個Error
 * 該Error之message為'timeout[ms數ms]'(有label時置於前綴)，並帶有code為'TIMEOUT'與timeout為逾時毫秒數等欄位，供呼叫端辨別為逾時而非pm自身之錯誤
 * 注意JavaScript無法中止已啟動之Promise，逾時僅代表不再等待其結果，pm內之工作仍會繼續執行至自然結束，若需一併中止內部工作(如子進程)須由pm自行處理
 * 本函數為async function，參數錯誤亦以reject傳出而非同步throw，故可與逾時錯誤一併由.catch或try/catch接住
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/pmTimeout.test.mjs Github}
 * @memberOf wsemi
 * @param {Promise} pm 輸入Promise物件，非Promise時reject錯誤'invalid pm'
 * @param {Integer} ms 輸入逾時毫秒數，須為非負整數，為0代表下一輪事件迴圈即逾時，其餘reject錯誤'invalid ms[ms數]'
 * @param {Object} [opt={}] 輸入設定物件
 * @param {String} [opt.label=''] 輸入識別字串，將置於逾時錯誤訊息之前綴以利辨識來源，非有效字串時回退為空字串，預設''
 * @param {Function} [opt.onTrace=null] 輸入觀察回調函數，於內部事件發生當下同步呼叫，傳入一個凍結之事件物件{ type, ... }，供測試以事件(而非等待時間)同步與診斷；type為'start'時為已啟動逾時計時器(含ms為夾至上限後之逾時毫秒數)，'timeout'時為逾時計時器已到期而即將reject逾時錯誤(含ms)，'settle'時為本函數即將resolve或reject(含by為'pm'代表pm先完成、'timeout'代表逾時勝出、'invalid'代表輸入檢核失敗，ok為pm先完成時是否resolve，逾時與檢核失敗皆為false)；每次呼叫恰通知一次settle，檢核失敗時不通知start與timeout；回調不帶接收者呼叫，其拋錯與回傳值皆忽略，不影響逾時判定，預設null
 * @returns {Promise} 回傳Promise，pm先完成則resolve或reject其結果，逾時則reject一個code為'TIMEOUT'之Error
 * @example
 * //need test in nodejs
 *
 * async function test() {
 *
 *     //pm先完成則原樣回傳其結果
 *     let r1 = await pmTimeout(delay(10).then(() => 'ok'), 1000)
 *     console.log('r1', r1)
 *     // => r1 ok
 *
 *     //逾時則reject一個code為'TIMEOUT'之Error
 *     try {
 *         await pmTimeout(delay(3000), 100)
 *     }
 *     catch (err) {
 *         console.log('r2', err.message, err.code, err.timeout)
 *         // => r2 timeout[100ms] TIMEOUT 100
 *     }
 *
 *     //有label時置於訊息前綴
 *     try {
 *         await pmTimeout(delay(3000), 100, { label: 'fetchUser' })
 *     }
 *     catch (err) {
 *         console.log('r3', err.message)
 *         // => r3 fetchUser timeout[100ms]
 *     }
 *
 *     //pm自身之reject原樣傳出, 其code非'TIMEOUT'故可與逾時區分
 *     try {
 *         await pmTimeout(Promise.reject(new Error('mine')), 1000)
 *     }
 *     catch (err) {
 *         console.log('r4', err.message, err.code)
 *         // => r4 mine undefined
 *     }
 *
 * }
 * test()
 *     .catch((err) => {
 *         console.log(err)
 *     })
 *
 */
async function pmTimeout(pm, ms, opt = {}) {

    //trace, 觀察回調(opt.onTrace), 未給時為null
    let trace = getTrace(opt)

    //check, pm與ms給錯視為程式撰寫錯誤
    //本函數為async function, 故此處throw會轉為reject傳出, 與pm*家族之錯誤傳遞管道一致(見pmSeries/pmChain)
    if (!ispm(pm)) {
        if (trace) {
            trace('settle', { by: 'invalid', ok: false })
        }
        throw new Error(`invalid pm`)
    }

    //check
    if (!isp0int(ms)) {
        if (trace) {
            trace('settle', { by: 'invalid', ok: false })
        }
        throw new Error(`invalid ms[${ms}]`)
    }

    //夾至計時器上限, 見_const.mjs
    ms = Math.min(ms, cst.TIMER_TIME_MAX)

    //label
    let label = get(opt, 'label', null)
    if (!isestr(label)) {
        label = ''
    }

    //msgErr, label為空時不加前綴, 避免訊息出現多餘之前導空白
    let msgErr = `timeout[${ms}ms]`
    if (isestr(label)) {
        msgErr = `${label} ${msgErr}`
    }

    //timeout, 計時器用Promise, 逾時即reject
    let t
    let timeout = genPm()
    let byTimeout = false //僅trace時用, 逾時計時器是否已到期
    let pmOk = null //僅trace時用, pm自身是否resolve
    if (trace) {
        pm.then(() => {
            pmOk = true
        }, () => {
            pmOk = false
        })
    }
    t = setTimeout(() => {
        if (trace) {
            byTimeout = true
            trace('timeout', { ms })
        }
        let e = new Error(msgErr)
        e.code = 'TIMEOUT' //供呼叫端辨別為逾時而非pm自身之錯誤
        e.timeout = ms
        timeout.reject(e)
    }, ms)
    if (trace) {
        trace('start', { ms })
    }

    //race, 先完成者勝出
    //無論勝負皆須clearTimeout: pm先完成時若不清除, 計時器會持續佔住event loop而延後process結束
    //pm逾時落敗後其自身之reject仍由Promise.race內部掛載之handler接住, 不會產生unhandled rejection
    let r = Promise.race([pm, timeout])
        .finally(() => {
            clearTimeout(t)
            if (trace) {
                trace('settle', { by: byTimeout ? 'timeout' : 'pm', ok: byTimeout ? false : pmOk === true })
            }
        })

    return r
}


export default pmTimeout
