import ot from 'dayjs'
import ismonth from './ismonth.mjs'
import iseint from './iseint.mjs'


/**
 * 輸入年月並增加/減少月份數量
 *
 * g與n為必須參數，n須為有效整數(iseint，數字字串亦可，去頭尾空白後取值，可為正負值)，無效(含Infinity、小數、'0x10'、包裝物件)回傳''；計算後日期無效(月份數量過大而超出dayjs可表示範圍)亦回傳''
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/addMonth.test.mjs Github}
 * @memberOf wsemi
 * @param {String} g 輸入月時間字串
 * @param {Integer|String} n 輸入要增加的月份數量整數，可為正負值，須為有效整數(安全整數，數字字串亦可)，無效回傳''
 * @returns {String} 回傳新的月時間字串
 * @example
 *
 * console.log(addMonth('2019-01', 2))
 * // => '2019-03'
 *
 * console.log(addMonth('2018-12', -1))
 * // => '2018-11'
 *
 * console.log(addMonth('2019-01', '3'))
 * // => '2019-04'
 *
 * console.log(addMonth('2019-01', Infinity))
 * // => ''
 *
 */
function addMonth(g, n) {

    //check
    if (!ismonth(g)) {
        return ''
    }
    if (!iseint(n, { use: 'safe' })) {
        return ''
    }
    n = Number(n)

    let m = ot(g, 'YYYY-MM')
    let a = m.add(n, 'months')

    //計算後日期無效(超出dayjs可表示範圍時format得字串'Invalid Date')回傳''
    if (!a.isValid()) {
        return ''
    }
    let r = a.format('YYYY-MM')

    return r
}


export default addMonth
