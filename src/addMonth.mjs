import ot from 'dayjs'
import ismonth from './ismonth.mjs'
import isint from './isint.mjs'


/**
 * 月份增加
 *
 * @export
 * @param {String} g 輸入月時間字串
 * @param {Integer} n 輸入要增加的月份數量整數，可為正負值
 * @returns {String} 回傳新的月時間字串
 */
export default function addMonth(g, n) {

    //check
    if (!ismonth(g)) {
        return ''
    }
    if (!isint(n)) {
        return ''
    }

    let m = ot(g, 'YYYY/MM')
    let r = m.add(n, 'months').format('YYYY/MM')

    return r
}
