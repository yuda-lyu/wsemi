import ot from 'dayjs'
import istime from './istime.mjs'
import time2min from './time2min.mjs'


/**
 * 起訖時間合併顯示
 *
 * @export
 * @param {String} t1 輸入開始秒時間字串
 * @param {String} t2 輸入結束秒時間字串，若不輸入則等同於開始時間字串
 * @returns {String} 回傳合併顯示時間字串
 */
export default function timerange(t1, t2) {

    //check
    if (!istime(t1)) {
        return '無起始時間'
    }
    if (!istime(t2)) {
        t2 = t1 //設定為起始時間
    }

    //m1, m2
    let m1 = ot(t1, 'YYYY/MM/DD HH:mm:ss')
    let m2 = ot(t2, 'YYYY/MM/DD HH:mm:ss')

    //day
    let ct1 = m1.format('YYYY/MM/DD')
    let ct2 = m2.format('YYYY/MM/DD')

    if (ct1 === ct2) { //同天
        let h = m2.format('HH:mm')

        if (t1 === t2) {
            return time2min(t1) + ' 至 ' + '無'
        }
        else if (t1 < t2) {
            return time2min(t1) + ' 至 ' + h
        }
        else if (t1 > t2) {
            return time2min(t1) + ' 至 ' + h + ' (起始時間大於結束時間)'
        }

    }
    else if (ct1 < ct2) {

        return time2min(t1) + ' 至 ' + time2min(t2)

    }
    else if (ct1 > ct2) {

        return time2min(t1) + ' 至 ' + time2min(t2) + ' (起始時間大於結束時間)'

    }

    return ''
}
