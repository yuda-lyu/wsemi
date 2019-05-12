import genPm from './genPm.mjs'
import isfun from './isfun.mjs'
import ispint from './ispint.mjs'


/**
 * 等待f函數回傳true
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/waitfunction.test.js Github}
 *
 * @example
 *
 * @memberOf wsemi
 * @param {Function} f 輸入判斷用函數
 * @param {PositiveInteger} [maxnum=180] 輸入最大嘗試次數，為正整數，預設180次
 * @returns {Promise} 回傳Promise，resolve為空代表f函數回傳true或超過最大嘗試次數，reject為錯誤訊息
 */
function waitfunction(f, maxnum = 180) {

    //df
    let df = genPm()

    //check
    if (!isfun(f)) {
        df.reject('waitfunction需輸入函數f')
        return df
    }

    //default
    if (!ispint(maxnum)) {
        maxnum = 60 * 3 //3min
    }

    //setInterval
    let n = 0
    let t = setInterval(function() {
        n += 1
        //console.log('waitfunction: ', n)

        if (f() === true) {
            //console.log('resolve', n)
            clearInterval(t)
            df.resolve()
        }
        if (n >= maxnum) {
            //console.log('reject', n, maxnum)
            clearInterval(t)
            df.resolve() //已超過最大次數
        }

    }, 1000) //每1秒偵測一次

    return df
}


export default waitfunction
