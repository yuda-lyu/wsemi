import genPm from './genPm.mjs'
import isnum from './isnum.mjs'


/**
 * Promise延遲毫秒
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/delay.test.mjs Github}
 * @memberOf wsemi
 * @param {Number} [ms=1] 輸入延遲毫秒整數，預設10ms
 * @returns {Promise}} 回傳Promise，resolve代表延遲完畢
 * @example
 * need test in browser
 *
 * delay(1000)
 * // => 延遲1s才執行
 *
 */
function delay(ms = 10) {

    //check
    if (!isnum(ms)) {
        ms = 10
    }

    let pm = genPm()
    setTimeout(function() {
        pm.resolve()
    }, ms)
    return pm
}


export default delay
