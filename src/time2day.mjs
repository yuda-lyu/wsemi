import ot from 'dayjs'
import istime from './istime.mjs'


/**
 * 秒時間取至日時間
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/time2day.test.js Github}
 * @memberOf wsemi
 * @param {String} t 輸入秒時間字串
 * @returns {String} 回傳日時間字串
 * @example
 * time2day('2019-01-01T12:34:56+08:00')
 * // => '2019-01-01'
 */
function time2day(t) {

    //check
    if (!istime(t)) {
        return ''
    }

    let d = ot(t, 'YYYY-MM-DDTHH:mm:ssZ')
    let r = d.format('YYYY-MM-DD')

    return r
}


export default time2day
