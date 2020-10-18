import ot from 'dayjs'
import istimeTZ from './istimeTZ.mjs'
import isestr from './isestr.mjs'


/**
 * 秒時間轉到期時間
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/timeTZ2expire.test.js Github}
 * @memberOf wsemi
 * @param {String} t 輸入秒時間字串
 * @param {String} [tNow=null] 輸入現在秒時間字串
 * @returns {String} 回傳到期時間字串
 * @example
 *
 * let t
 * let tNow = '2020-10-18T12:34:56+08:00'
 * let r
 *
 * t = '2020-10-18T12:34:58+08:00'
 * r = timeTZ2expire(t, tNow)
 * console.log(r)
 * // => { today: true, msg: '2秒後', err: '' }
 *
 * t = '2020-10-18T12:37:58+08:00'
 * r = timeTZ2expire(t, tNow)
 * console.log(r)
 * // => { today: true, msg: '3分鐘後', err: '' }
 *
 * t = '2020-10-18T16:37:58+08:00'
 * r = timeTZ2expire(t, tNow)
 * console.log(r)
 * // => { today: true, msg: '4小時後，今天16:37', err: '' }
 *
 * t = '2020-10-23T16:37:58+08:00'
 * r = timeTZ2expire(t, tNow)
 * console.log(r)
 * // => { today: false, msg: '5天後', err: '' }
 *
 * t = '2021-04-23T16:37:58+08:00'
 * r = timeTZ2expire(t, tNow)
 * console.log(r)
 * // => { today: false, msg: '6月後', err: '' }
 *
 * t = '2028-04-23T16:37:58+08:00'
 * r = timeTZ2expire(t, tNow)
 * console.log(r)
 * // => { today: false, msg: '7年後', err: '' }
 *
 * t = '2018-04-23T16:37:58+08:00'
 * r = timeTZ2expire(t, tNow)
 * console.log(r)
 * // => { today: null, msg: '', err: '時間已過' }
 *
 */
function timeTZ2expire(t, tNow = null) {

    //check
    if (!istimeTZ(t)) {
        return {
            today: null,
            msg: '',
            err: '時間格式錯誤',
        }
    }

    //mnow
    let mnow = ot()
    if (isestr(tNow)) {
        mnow = ot(tNow, 'YYYY-MM-DDTHH:mm:ssZ')
    }

    //mtime
    let mtime = ot(t, 'YYYY-MM-DDTHH:mm:ssZ')

    //check
    if (mnow > mtime) {
        return {
            today: null,
            msg: '',
            err: '時間已過',
        }
    }

    //day
    let nowday = mnow.format('YYYY-MM-DD')
    let timeday = mtime.format('YYYY-MM-DD')
    let mnowday = ot(nowday, 'YYYY-MM-DD')
    let mtimeday = ot(timeday, 'YYYY-MM-DD')

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
    if (iseconds >= 0) {
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

    return {
        today: today,
        msg: c,
        err: '',
    }
}


export default timeTZ2expire
