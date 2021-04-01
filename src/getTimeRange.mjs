import ot from 'dayjs'
import istime from './istime.mjs'
import time2min from './time2min.mjs'


/**
 * 起訖時間合併顯示，時間單位皆為秒
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/getTimeRange.test.js Github}
 * @memberOf wsemi
 * @param {String} tstart 輸入開始秒時間字串，不含時區
 * @param {String} tend 輸入結束秒時間字串，不含時區，若不輸入則等同於開始時間字串
 * @returns {String} 回傳合併顯示時間字串
 * @example
 *
 * console.log(getTimeRange('2019-01-01T09:00:00'))
 * // => '2019-01-01T09:00 至 無'
 *
 * console.log(getTimeRange('2019-01-01T09:00:00', '2019-01-01T12:34:56'))
 * // => '2019-01-01T09:00 至 12:34'
 *
 * console.log(getTimeRange('2019-01-01T09:00:00', '2019-01-03T12:00:00'))
 * // => '2019-01-01T09:00 至 2019-01-03T12:00'
 *
 * console.log(getTimeRange('2019-01-01T19:00:00', '2019-01-01T12:00:00'))
 * // => '2019-01-01T19:00 至 12:00 (起始時間大於結束時間)'
 *
 * console.log(getTimeRange('2019-01-03T09:00:00', '2019-01-01T12:00:00'))
 * // => '2019-01-03T09:00 至 2019-01-01T12:00 (起始時間大於結束時間)'
 *
 */
function getTimeRange(tstart, tend) {
    //可再支援輸入TZ時間

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
    let m1 = ot(tstart, 'YYYY-MM-DDTHH:mm:ss')
    let m2 = ot(tend, 'YYYY-MM-DDTHH:mm:ss')

    //day
    let ctstart = m1.format('YYYY-MM-DD')
    let ctend = m2.format('YYYY-MM-DD')

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


export default getTimeRange
