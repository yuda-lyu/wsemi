import ot from 'dayjs'
import istime from './istime.mjs'


/**
 * 秒時間轉過去時間
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/time2past.test.js Github}
 * @memberOf wsemi
 * @param {String} t 輸入秒時間字串
 * @returns {String} 回傳過去時間字串
 * @example
 * need test in browser
 */
function time2past(t) {

    //check
    if (!istime(t)) {
        return {
            today: null,
            msg: '',
            err: '時間格式錯誤',
        }
    }

    //ot
    let mnow = ot()
    let mtime = ot(t, 'YYYY/MM/DD HH:mm:ss')

    //check
    if (mnow < mtime) {
        return {
            today: null,
            msg: '',
            err: '時間未到',
        }
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
    if (iseconds >= 0) {
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

    return {
        today: today,
        msg: c,
        err: '',
    }
}


export default time2past
