import ot from './_dayjs.mjs'
import isestr from './isestr.mjs'


/**
 * 判斷是否為月時間
 *
 * 年份限0000~9999(含0000~0099，不依dayjs將兩位數年份對映為1900~1999，見_dayjs.mjs)，須為標準寫法'YYYY-MM'
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

    //無效日期(如'Invalid Date')dayjs之format亦回傳'Invalid Date', 與輸入字串相等而誤判為true, 故須先判斷isValid
    let ft = 'YYYY-MM'
    let d = ot(v, ft)
    if (!d.isValid()) {
        return false
    }
    return (v === d.format(ft))
}


export default ismonth
