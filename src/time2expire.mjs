import ot from 'dayjs'
import istime from './istime.mjs'
import isbol from './isbol.mjs'


/**
 * 秒時間轉到期時間
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/time2expire.test.js Github}
 *
 * @example
 *
 * @memberOf wsemi
 * @param {String} t 輸入秒時間字串
 * @param {Boolean} [bReturnString=false] 輸入是否只回傳字串訊息，預設為false
 * @returns {String} 回傳到期時間字串
 */
function time2expire(t, bReturnString = false) {

    //check
    if (!istime(t)) {
        return ''
    }
    if (!isbol(bReturnString)) {
        return ''
    }

    //ot
    let mnow = ot()
    let mtime = ot(t, 'YYYY/MM/DD HH:mm:ss')

    //check
    if (mnow > mtime) {
        return ''
    }

    //day
    let nowday = mnow.format('YYYY/MM/DD')
    let timeday = mtime.format('YYYY/MM/DD')
    let mnowday = ot(nowday, 'YYYY/MM/DD')
    let mtimeday = ot(timeday, 'YYYY/MM/DD')

    //diff
    let iseconds = mtime.diff(mnow, 'seconds')
    let iminutes = mtime.diff(mnow, 'minutes')
    let ihours = mtime.diff(mnow, 'hours')
    let idays = mtimeday.diff(mnowday, 'days')
    let iweeks = mtimeday.diff(mnowday, 'weeks')
    let imonths = mtimeday.diff(mnowday, 'months')
    let iyears = mtimeday.diff(mnowday, 'years')

    //c
    let today
    let c = '即將到來'
    if (iseconds > 0) {
        today = true
        c = iseconds + '秒後'
    }
    if (iminutes > 0) {
        today = true
        c = iminutes + '分鐘後'
    }
    if (ihours > 0) {
        let mm = mtime.format('HH:mm')
        if (nowday === timeday) {
            today = true
            c = ihours + '小時後' + '，今天' + mm
        }
        else {
            today = false
            c = ihours + '小時後' + '，明天' + mm
        }
    }
    if (idays > 1) { //明天交由小時部份處理
        today = false
        if (idays === 2) {
            c = '後天'
        }
        else {
            c = idays + '天後'
        }
    }
    if (iweeks > 0) {
        today = false
        c = iweeks + '周後'
    }
    if (imonths > 0) {
        today = false
        c = imonths + '月後'
    }
    if (iyears > 0) {
        today = false
        c = iyears + '年後'
    }

    if (bReturnString) {
        return c
    }
    return {
        today: today,
        msg: c,
    }
}


export default time2expire
