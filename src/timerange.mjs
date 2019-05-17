import ot from 'dayjs'
import istime from './istime.mjs'
import time2min from './time2min.mjs'


/**
 * 起訖時間合併顯示，時間單位皆為秒
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/timerange.test.js Github}
 * @memberOf wsemi
 * @param {String} tstart 輸入開始秒時間字串
 * @param {String} tend 輸入結束秒時間字串，若不輸入則等同於開始時間字串
 * @returns {String} 回傳合併顯示時間字串
 * @example
 *
 */
function timerange(tstart, tend) {

    //check
    if (!istime(tstart)) {
        return '無起始時間'
    }

    //set tend
    if (tend === undefined) {
        tend = tstart //若無tend則設定為起始時間
    }

    //check
    if (!istime(tend)) {
        return '結束時間格式錯誤'
    }

    //m1, m2
    let m1 = ot(tstart, 'YYYY/MM/DD HH:mm:ss')
    let m2 = ot(tend, 'YYYY/MM/DD HH:mm:ss')

    //day
    let ctstart = m1.format('YYYY/MM/DD')
    let ctend = m2.format('YYYY/MM/DD')

    if (ctstart === ctend) { //同天
        let h = m2.format('HH:mm')

        if (tstart === tend) {
            return time2min(tstart) + ' 至 ' + '無'
        }
        else if (tstart < tend) {
            return time2min(tstart) + ' 至 ' + h
        }
        else if (tstart > tend) {
            return time2min(tstart) + ' 至 ' + h + ' (起始時間大於結束時間)'
        }

    }
    else if (ctstart < ctend) {

        return time2min(tstart) + ' 至 ' + time2min(tend)

    }
    else if (ctstart > ctend) {

        return time2min(tstart) + ' 至 ' + time2min(tend) + ' (起始時間大於結束時間)'

    }

    return ''
}


export default timerange
