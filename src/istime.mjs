import ot from './_dayjs.mjs'
import isestr from './isestr.mjs'


/**
 * 判斷是否為秒時間
 *
 * 年份限0000~9999(含0000~0099，不依dayjs將兩位數年份對映為1900~1999，見_dayjs.mjs)，須為標準寫法'YYYY-MM-DDTHH:mm:ss'
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/istime.test.mjs Github}
 * @memberOf wsemi
 * @param {String} v 輸入秒時間字串，不含時區
 * @returns {Boolean} 回傳是否為秒時間布林值
 * @example
 *
 * console.log(istime('2019-01-01T12:34:56:789'))
 * // => false
 *
 * console.log(istime('2019-01-01T12:34:56'))
 * // => true
 *
 * console.log(istime('2019-01-01'))
 * // => false
 *
 */
function istime(v) {

    //check
    if (!isestr(v)) {
        return false
    }

    //無效日期(如'Invalid Date')dayjs之format亦回傳'Invalid Date', 與輸入字串相等而誤判為true, 故須先判斷isValid
    let ft = 'YYYY-MM-DDTHH:mm:ss'
    let d = ot(v, ft)
    if (!d.isValid()) {
        return false
    }
    return (v === d.format(ft))
}


export default istime
