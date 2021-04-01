import ot from 'dayjs'
import ismonth from './ismonth.mjs'
import isint from './isint.mjs'


/**
 * 輸入年月並增加/減少月份數量
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/addMonth.test.js Github}
 * @memberOf wsemi
 * @param {String} g 輸入月時間字串
 * @param {Integer} n 輸入要增加的月份數量整數，可為正負值
 * @returns {String} 回傳新的月時間字串
 * @example
 *
 * console.log(addMonth('2019-01', 2))
 * // => '2019-03'
 *
 * console.log(addMonth('2018-12', -1))
 * // => '2018-11'
 *
 */
function addMonth(g, n) {

    //check
    if (!ismonth(g)) {
        return ''
    }
    if (!isint(n)) {
        return ''
    }

    let m = ot(g, 'YYYY-MM')
    let r = m.add(n, 'months').format('YYYY-MM')

    return r
}


export default addMonth
