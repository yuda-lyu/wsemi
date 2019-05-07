import ot from 'dayjs'
import istime from './istime.mjs'


/**
 * 秒時間取至時時間
 *
 * @export
 * @param {String} t 輸入秒時間字串
 * @returns {String} 回傳時時間字串
 */
export default function time2hour(t) {

    //check
    if (!istime(t)) {
        return ''
    }

    let d = ot(t, 'YYYY/MM/DD HH:mm:ss')
    let r = d.format('YYYY/MM/DD HH')

    return r
}
