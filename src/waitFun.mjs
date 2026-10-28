import cst from './_const.mjs'
import get from 'lodash-es/get.js'
import genPm from './genPm.mjs'
import isfun from './isfun.mjs'
import ispint from './ispint.mjs'
import ispm from './ispm.mjs'
import getTrace from './getTrace.mjs'


/**
 * 等待f函數回傳true
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/waitFun.test.mjs Github}
 * @memberOf wsemi
 * @param {Function} fun 輸入判斷用函數
 * @param {Object} opt 輸入設定物件，預設{}
 * @param {Integer} [opt.attemptNum=200] 輸入最大嘗試次數，為正整數，預設200，以輪詢週期計(立即呼叫不計)，計數超過attemptNum後於該次呼叫完成時仍未成立即reject，故fun最多被呼叫attemptNum+2次(立即1次與輪詢)
 * @param {Integer} [opt.timeInterval=1000] 輸入嘗試時間週期，為正整數，單位為ms，預設1000；每個週期計1次，前一次呼叫未完成時該週期不呼叫fun(輪詢不重疊)但仍計入嘗試次數
 * @param {Function} [opt.onTrace=null] 輸入觀察回調函數，於內部事件發生當下同步呼叫，傳入一個凍結之事件物件{ type, n, ... }，n為當下已計之週期數(立即呼叫為0)，供測試以事件(而非等待時間)同步與診斷；type為'call'時為即將呼叫fun，'result'時為fun已完成(含ok為其回傳是否為true)，'tick'時為每個週期(含busy為前一次呼叫是否仍未完成而本週期不呼叫)，'stop'時為計數超過attemptNum而前一次呼叫仍未完成時停止計時器，'resolve'時為即將resolve，'reject'時為即將reject(含reason為'error'fun拋錯或reject、'exceeded'超過最大嘗試次數、'invalid'fun非函數)；回調不帶接收者呼叫，其拋錯與回傳值皆忽略，不影響輪詢與結果，預設null
 * @returns {Promise} 回傳Promise，resolve回傳為空代表f函數回傳true；fun拋錯或其Promise被reject時(立即呼叫與輪詢皆同)停止輪詢並reject該錯誤，超過最大嘗試次數時reject字串'exceeded attemptNum[最大嘗試次數]'；fun非函數時reject字串'waitfunction需輸入函數f'；fun回傳永不settle之Promise時亦不settle(不再累積呼叫)，計數超過attemptNum後停止計時器(本函數仍不settle，但不使行程無法結束)，需逾時者以pmTimeout包裝
 * @example
 *
 * async function topAsync() {
 *
 *     function test1() {
 *         return new Promise((resolve, reject) => {
 *             let ms = []
 *
 *             let i = 0
 *             waitFun(function() {
 *                 i++
 *                 console.log('waiting: ' + i)
 *                 ms.push('waiting: ' + i)
 *                 return i >= 2
 *             })
 *                 .then(function() {
 *                     console.log('test1 then')
 *                     ms.push('test1 then')
 *                 })
 *
 *             setTimeout(function() {
 *                 resolve(ms)
 *             }, 1100)
 *
 *         })
 *     }
 *     console.log('test1')
 *     let r1 = await test1()
 *     console.log(JSON.stringify(r1))
 *     // test1
 *     // waiting: 1
 *     // waiting: 2
 *     // test1 then
 *     // ["waiting: 1","waiting: 2","test1 then"]
 *
 *     function test2() {
 *         let ms = []
 *         let i = 0
 *
 *         let f = () => {
 *             return new Promise((resolve, reject) => {
 *                 setTimeout(function() {
 *                     i++
 *                     console.log('waiting: ' + i)
 *                     ms.push('waiting: ' + i)
 *                     resolve(i >= 2)
 *                 }, 1100)
 *             })
 *         }
 *
 *         return waitFun(f)
 *             .then(function() {
 *                 console.log('test2 then')
 *                 ms.push('test2 then')
 *                 return ms
 *             })
 *
 *     }
 *     console.log('test2')
 *     let r2 = await test2()
 *     console.log(JSON.stringify(r2))
 *     // test2
 *     // waiting: 1
 *     // waiting: 2
 *     // test2 then
 *     // ["waiting: 1","waiting: 2","test2 then"]
 *
 * }
 * topAsync().catch(() => {})
 *
 */
async function waitFun(fun, opt = {}) {
    let r = null

    //pm
    let pm = genPm()

    //trace, 觀察回調(opt.onTrace), 未給時為null
    let trace = getTrace(opt)

    //check
    if (!isfun(fun)) {
        if (trace) {
            trace('reject', { n: 0, reason: 'invalid' })
        }
        pm.reject('waitfunction需輸入函數f')
        return pm
    }

    //func
    let func = async () => {
        let r = fun()
        if (ispm(r)) {
            r = await r
        }
        return r
    }

    //immediate call
    if (trace) {
        trace('call', { n: 0 })
    }
    try {
        r = await func()
    }
    catch (err) {
        if (trace) {
            trace('reject', { n: 0, reason: 'error' })
        }
        throw err
    }
    if (trace) {
        trace('result', { n: 0, ok: r === true })
    }
    if (r === true) {
        if (trace) {
            trace('resolve', { n: 0 })
        }
        pm.resolve()
        return pm
    }

    //attemptNum
    let attemptNum = get(opt, 'attemptNum', null)
    if (!ispint(attemptNum)) {
        attemptNum = 200
    }

    //timeInterval
    let timeInterval = get(opt, 'timeInterval', null)
    if (!ispint(timeInterval)) {
        timeInterval = 1000
    }
    timeInterval = Math.min(timeInterval, cst.TIMER_TIME_MAX) //夾至計時器上限, 見_const.mjs

    //setInterval, 每個週期計1次; 前一次呼叫未完成時該週期只計次不呼叫fun(輪詢不重疊), 逾次仍於呼叫完成時判定
    let n = 0
    let running = false
    let t = setInterval(async() => {
        n += 1
        //console.log('waitFun: ', n)

        //check
        if (running) {
            if (trace) {
                trace('tick', { n, busy: true })
            }
            if (n > attemptNum) {
                clearInterval(t) //已逾次則停止計時器, 逾次判定仍由執行中之該次呼叫完成時為之; 使fun永不settle時計時器不續跑而行程可自然結束
                if (trace) {
                    trace('stop', { n })
                }
            }
            return
        }
        running = true
        if (trace) {
            trace('tick', { n, busy: false })
            trace('call', { n })
        }

        //輪詢中fun拋錯或其Promise被reject, 同立即呼叫之處理: 停止輪詢並reject該錯誤, 不得使計時器之async回呼reject(未處理之rejection且輪詢永不停止)
        try {
            r = await func()
        }
        catch (err) {
            clearInterval(t)
            if (trace) {
                trace('reject', { n, reason: 'error' })
            }
            pm.reject(err)
            return
        }
        finally {
            running = false
        }
        if (trace) {
            trace('result', { n, ok: r === true })
        }
        if (r === true) {
            //console.log('resolve', n)
            clearInterval(t)
            if (trace) {
                trace('resolve', { n })
            }
            pm.resolve()
            return
        }
        if (n > attemptNum) {
            //console.log('reject', n, attemptNum)
            clearInterval(t)
            if (trace) {
                trace('reject', { n, reason: 'exceeded' })
            }
            pm.reject(`exceeded attemptNum[${attemptNum}]`) //已超過最大次數
        }

    }, timeInterval)

    return pm
}


export default waitFun
