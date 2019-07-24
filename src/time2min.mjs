import ot from 'dayjs'
import istime from './istime.mjs'


/**
 * 秒時間取至分時間
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/time2min.test.js Github}
 * @memberOf wsemi
 * @param {String} t 輸入秒時間字串
 * @returns {String} 回傳分時間字串
 * @example
 * time2min('2019-01-01T12:34:56+08:00')
 * // => '2019-01-01T12:34'
 */
function time2min(t) {

    //check
    if (!istime(t)) {
        return ''
    }

    let d = ot(t, 'YYYY-MM-DDTHH:mm:ssZ')
    let r = d.format('YYYY-MM-DDTHH:mm')

    return r
}


export default time2min
