import ot from 'dayjs'
import istime from './istime.mjs'


/**
 * 秒時間取至分時間
 *
 * @export
 * @param {String} t 輸入秒時間字串
 * @returns {String} 回傳分時間字串
 */
export default function time2min(t) {

    //check
    if (!istime(t)) {
        return ''
    }

    let d = ot(t, 'YYYY/MM/DD HH:mm:ss')
    let r = d.format('YYYY/MM/DD HH:mm')

    return r
}
