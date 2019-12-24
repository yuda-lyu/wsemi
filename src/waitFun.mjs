import genPm from './genPm.mjs'
import isfun from './isfun.mjs'
import ispint from './ispint.mjs'


/**
 * 等待f函數回傳true
 * 原始名稱為waitFunction，但與nodejs或travis-ci有名稱衝突，故才改為waitFun
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/waitFun.test.js Github}
 * @memberOf wsemi
 * @param {Function} f 輸入判斷用函數
 * @param {Integer} [maxnum=180] 輸入最大嘗試次數，為正整數，預設180次
 * @returns {Promise} 回傳Promise，resolve為空代表f函數回傳true或超過最大嘗試次數，reject為錯誤訊息
 * @example
 * let i = 0
 * let fn = function() {
 *   i++
 *   return i >= 2
 * }
 * waitFun(fn)
 *     .then(function() {
 *         console.log('then')
 *         //code here
 *     })
 */
function waitFun(f, maxnum = 180) {

    //pm
    let pm = genPm()

    //check
    if (!isfun(f)) {
        pm.reject('waitfunction需輸入函數f')
        return pm
    }

    //immediate call
    if (f() === true) {
        pm.resolve()
        return pm
    }

    //default
    if (!ispint(maxnum)) {
        maxnum = 60 * 3 //3min
    }

    //setInterval
    let n = 0
    let t = setInterval(function() {
        n += 1
        //console.log('waitFun: ', n)

        if (f() === true) {
            //console.log('resolve', n)
            clearInterval(t)
            pm.resolve()
        }
        if (n >= maxnum) {
            //console.log('reject', n, maxnum)
            clearInterval(t)
            pm.resolve() //已超過最大次數
        }

    }, 1000) //每1秒偵測一次

    return pm
}


export default waitFun
