import istime from './istime.mjs'
import time2min from './time2min.mjs'


/**
 * 起訖時間合併顯示，時間單位皆為秒
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/getTimeRange.test.mjs Github}
 * @memberOf wsemi
 * @param {String} tstart 輸入開始秒時間字串，不含時區，須為有效秒時間字串(格式YYYY-MM-DDTHH:mm:ss)，無效則回傳空字串
 * @param {String} [tend] 輸入結束秒時間字串，不含時區，若不輸入(未給或undefined)則等同於開始時間字串；有給但無效(含null、空字串)則回傳空字串
 * @returns {String} 回傳合併顯示時間字串，tstart無效或tend有給但無效時回傳空字串(不再回傳中文訊息)
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
 * console.log(getTimeRange('', '2019-01-01T12:00:00'))
 * // => ''
 *
 * console.log(getTimeRange('2019-01-01T09:00:00', null))
 * // => ''
 *
 */
function getTimeRange(tstart, tend) {
    //可再支援輸入TZ時間

    //check
    if (!istime(tstart)) {
        return ''
    }

    //set tend
    if (tend === undefined) {
        tend = tstart //若無tend則設定為起始時間
    }

    //check
    if (!istime(tend)) {
        return ''
    }

    //day, 直接取字串中之時刻欄位(所給之牆鐘時刻), 不經本機時間解析(原以本機時間解析再format, 於本機時區之夏令空窗內差1小時; 排程第428項); tstart、tend已經istime驗證為標準寫法
    let ctstart = tstart.slice(0, 10) //'YYYY-MM-DD'
    let ctend = tend.slice(0, 10)

    if (ctstart === ctend) { //同天
        let h = tend.slice(11, 16) //'HH:mm'

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
