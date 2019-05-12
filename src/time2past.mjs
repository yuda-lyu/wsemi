import ot from 'dayjs'
import istime from './istime.mjs'
import isbol from './isbol.mjs'


/**
 * 秒時間轉過去時間
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/time2past.test.js Github}
 *
 * @example
 *
 * @memberOf wsemi
 * @param {String} t 輸入秒時間字串
 * @param {Boolean} [bReturnString=false] 輸入是否只回傳字串訊息，預設為false
 * @returns {String} 回傳過去時間字串
 */
function time2past(t, bReturnString = false) {

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
    if (mnow < mtime) {
        return ''
    }

    //day
    let nowday = mnow.format('YYYY/MM/DD')
    let timeday = mtime.format('YYYY/MM/DD')
    let mnowday = ot(nowday, 'YYYY/MM/DD')
    let mtimeday = ot(timeday, 'YYYY/MM/DD')

    //diff
    let iseconds = mnow.diff(mtime, 'seconds')
    let iminutes = mnow.diff(mtime, 'minutes')
    let ihours = mnow.diff(mtime, 'hours')
    let idays = mnowday.diff(mtimeday, 'days')
    let iweeks = mnowday.diff(mtimeday, 'weeks')
    let imonths = mnowday.diff(mtimeday, 'months')
    let iyears = mnowday.diff(mtimeday, 'years')

    //c
    let today = false
    let c = '剛剛'
    if (iseconds > 0) {
        today = true
        c = iseconds + '秒前'
    }
    if (iminutes > 0) {
        today = true
        c = iminutes + '分鐘前'
    }
    if (ihours > 0) {
        let mm = mtime.format('HH:mm')
        if (nowday === timeday) {
            today = true
            c = ihours + '小時前'
        }
        else {
            today = false
            c = '昨天' + mm
        }
    }
    if (idays > 1) { //昨天交由小時部份處理
        today = false
        c = idays + '天前'
    }
    if (iweeks > 0) {
        today = false
        c = iweeks + '周前'
    }
    if (imonths > 0) {
        today = false
        c = imonths + '月前'
    }
    if (iyears > 0) {
        today = false
        c = iyears + '年前'
    }

    if (bReturnString) {
        return c
    }
    return {
        today: today,
        msg: c,
    }
}


export default time2past
