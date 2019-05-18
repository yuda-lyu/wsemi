import ot from 'dayjs'
import isestr from './isestr.mjs'


/**
 * 判斷是否為秒時間
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/istime.test.js Github}
 * @memberOf wsemi
 * @param {String} v 輸入秒時間字串
 * @returns {Boolean} 回傳是否為秒時間布林值
 * @example
 * istime('2019/01/01 12:34:56:789')
 * // => false
 * istime('2019/01/01 12:34:56')
 * // => true
 * istime('2019/01/01')
 * // => false
 */
function istime(v) {

    //check
    if (!isestr(v)) {
        return false
    }

    let df = 'YYYY/MM/DD HH:mm:ss'
    let m = ot(v, df).format(df)
    return (v === m)
}


export default istime
