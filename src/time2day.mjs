import ot from 'dayjs'
import istime from './istime.mjs'


/**
 * 秒時間取至日時間
 *
 * @export
 * @param {String} t 輸入秒時間字串
 * @returns {String} 回傳日時間字串
 */
export default function time2day(t) {

    //check
    if (!istime(t)) {
        return ''
    }

    let d = ot(t, 'YYYY/MM/DD HH:mm:ss')
    let r = d.format('YYYY/MM/DD')

    return r
}
