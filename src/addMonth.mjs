import ot from './_dayjs.mjs'
import ismonth from './ismonth.mjs'
import iseint from './iseint.mjs'


/**
 * 輸入年月並增加/減少月份數量
 *
 * g與n為必須參數，n須為有效整數(iseint，數字字串亦可，去頭尾空白後取值，可為正負值)，無效(含Infinity、小數、'0x10'、包裝物件)回傳''；計算後日期無效(月份數量過大而超出dayjs可表示範圍)或計算後年份超出0~9999(如加上100000個月得10353年)亦回傳''
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/addMonth.test.mjs Github}
 * @memberOf wsemi
 * @param {String} g 輸入月時間字串
 * @param {Integer|String} n 輸入要增加的月份數量整數，可為正負值，須為有效整數(安全整數，數字字串亦可)，無效回傳''
 * @returns {String} 回傳新的月時間字串，輸入無效或計算後日期無效、年份超出0~9999時回傳''
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
 * console.log(addMonth('9999-12', 1))
 * // => '' (計算後年份10000超出0~9999)
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

    //計算後年份須在0~9999(dspec §3.5 年份限0000~9999, 使輸出為四位數年份之'YYYY-MM'): 超出時format得'10353-05'、'-6314-09'(負年為'00-1-12'一類)等不符月時間格式之字串, 回傳''
    //年份0~99之結果(如'0000-01')經_dayjs.mjs修正兩位數年份對映後, 可回送ismonth與本函數
    let y = a.year()
    if (y < 0 || y > 9999) {
        return ''
    }
    let r = a.format('YYYY-MM')

    return r
}


export default addMonth
