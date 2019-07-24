import ot from 'dayjs'
import istime from './istime.mjs'


/**
 * 秒時間取至時時間
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/time2hour.test.js Github}
 * @memberOf wsemi
 * @param {String} t 輸入秒時間字串
 * @returns {String} 回傳時時間字串
 * @example
 * time2hour('2019-01-01T12:34:56+08:00')
 * // => '2019-01-01T12'
 */
function time2hour(t) {

    //check
    if (!istime(t)) {
        return ''
    }

    let d = ot(t, 'YYYY-MM-DDTHH:mm:ssZ')
    let r = d.format('YYYY-MM-DDTHH')

    return r
}


export default time2hour
