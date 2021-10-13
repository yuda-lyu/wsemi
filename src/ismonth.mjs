import ot from 'dayjs'
import isestr from './isestr.mjs'


/**
 * 判斷是否為月時間
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/ismonth.test.mjs Github}
 * @memberOf wsemi
 * @param {String} v 輸入月時間字串
 * @returns {Boolean} 回傳是否為月時間布林值
 * @example
 *
 * console.log(ismonth('2019-01-01'))
 * // => false
 *
 * console.log(ismonth('2019-01'))
 * // => true
 *
 */
function ismonth(v) {

    //check
    if (!isestr(v)) {
        return false
    }

    let ft = 'YYYY-MM'
    let m = ot(v, ft).format(ft)
    return (v === m)
}


export default ismonth
