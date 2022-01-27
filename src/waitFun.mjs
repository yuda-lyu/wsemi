import get from 'lodash/get'
import genPm from './genPm.mjs'
import isfun from './isfun.mjs'
import ispint from './ispint.mjs'
import ispm from './ispm.mjs'


/**
 * 等待f函數回傳true
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/waitFun.test.mjs Github}
 * @memberOf wsemi
 * @param {Function} fun 輸入判斷用函數
 * @param {Object} opt 輸入設定物件，預設{}
 * @param {Integer} [opt.attemptNum=200] 輸入最大嘗試次數，為正整數，預設200
 * @param {Integer} [opt.timeInterval=1000] 輸入嘗試時間週期，為正整數，單位為ms，預設1000
 * @returns {Promise} 回傳Promise，resolve為空代表f函數回傳true或超過最大嘗試次數，reject為錯誤訊息
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
 *     // waiting: 3
 *
 * }
 * topAsync().catch(() => {})
 *
 */
async function waitFun(fun, opt = {}) {
    let r = null

    //pm
    let pm = genPm()

    //check
    if (!isfun(fun)) {
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
    r = await func()
    if (r === true) {
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

    //setInterval
    let n = 0
    let t = setInterval(async() => {
        n += 1
        //console.log('waitFun: ', n)

        r = await func()
        if (r === true) {
            //console.log('resolve', n)
            clearInterval(t)
            pm.resolve()
        }
        if (n > attemptNum) {
            //console.log('reject', n, attemptNum)
            clearInterval(t)
            pm.resolve() //已超過最大次數
        }

    }, timeInterval)

    return pm
}


export default waitFun
