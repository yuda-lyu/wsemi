import ot from './_dayjs.mjs'
import tz from './_tz.mjs'
import isestr from './isestr.mjs'


/**
 * 判斷是否為秒時間，含時區
 *
 * 年份限0000~9999(含0000~0099，不依dayjs將兩位數年份對映為1900~1999，見_dayjs.mjs)，須為標準寫法'YYYY-MM-DDTHH:mm:ss'加時區
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/istimeTZ.test.mjs Github}
 * @memberOf wsemi
 * @param {String} v 輸入秒時間字串，含時區
 * @returns {Boolean} 回傳是否為秒時間布林值
 * @example
 *
 * console.log(istimeTZ('2019-01-01T12:34:56:789+08:00'))
 * // => false
 *
 * console.log(istimeTZ('2019-01-01T12:34:56+08:00'))
 * // => true
 *
 * console.log(istimeTZ('2019-01-01T12:34:56Z'))
 * // => true
 *
 * console.log(istimeTZ('2019-01-01T12:34:56A'))
 * // => false
 *
 * console.log(istimeTZ('2019-01-01'))
 * // => false
 *
 */
function istimeTZ(v) {

    //check
    if (!isestr(v)) {
        return false
    }

    //check tz
    if (!tz.checkTZ(v)) {
        return false
    }

    //t
    let t = tz.delTZ(v)

    //無效日期(如'Invalid DateZ'去除時區後為'Invalid Date')dayjs之format亦回傳'Invalid Date', 與輸入字串相等而誤判為true, 故須先判斷isValid
    let ft = 'YYYY-MM-DDTHH:mm:ss'
    let d = ot(t, ft)
    if (!d.isValid()) {
        return false
    }
    return (t === d.format(ft))
}


export default istimeTZ
