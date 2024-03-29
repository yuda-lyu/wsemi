import ot from 'dayjs'
import isfun from './isfun.mjs'
import istimemsTZ from './istimemsTZ.mjs'


/**
 * 毫秒時間轉過去時間
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/timemsTZ2past.test.mjs Github}
 * @memberOf wsemi
 * @param {String} t 輸入毫秒時間字串
 * @param {String} [tNow=null] 輸入現在毫秒時間字串
 * @returns {String} 回傳過去時間字串
 * @example
 *
 * let t
 * let tNow = '2020-10-18T12:34:56.987+08:00'
 * let r
 *
 * t = '2020-10-18T12:34:54.987+08:00'
 * r = timemsTZ2past(t, tNow)
 * console.log(r)
 * // => { today: true, msg: '2秒前', err: '' }
 *
 * t = '2020-10-18T04:34:54.987+00:00'
 * r = timemsTZ2past(t, tNow)
 * console.log(r)
 * // => { today: true, msg: '2秒前', err: '' }
 *
 * t = '2020-10-18T04:34:54.987Z'
 * r = timemsTZ2past(t, tNow)
 * console.log(r)
 * // => { today: true, msg: '2秒前', err: '' }
 *
 * t = '2020-10-18T12:34:55.500+08:00'
 * r = timemsTZ2past(t, tNow)
 * console.log(r)
 * // => { today: true, msg: '1秒前', err: '' }
 *
 * t = '2020-10-18T12:31:54.987+08:00'
 * r = timemsTZ2past(t, tNow)
 * console.log(r)
 * // => { today: true, msg: '3分鐘前', err: '' }
 *
 * t = '2020-10-18T08:31:54.987+08:00'
 * r = timemsTZ2past(t, tNow)
 * console.log(r)
 * // => { today: true, msg: '4小時前', err: '' }
 *
 * t = '2020-10-13T08:31:54.987+08:00'
 * r = timemsTZ2past(t, tNow)
 * console.log(r)
 * // => { today: false, msg: '5天前', err: '' }
 *
 * t = '2020-04-13T08:31:54.987+08:00'
 * r = timemsTZ2past(t, tNow)
 * console.log(r)
 * // => { today: false, msg: '6個月前', err: '' }
 *
 * t = '2013-04-13T08:31:54.987+08:00'
 * r = timemsTZ2past(t, tNow)
 * console.log(r)
 * // => { today: false, msg: '7年前', err: '' }
 *
 * t = '2023-04-13T08:31:54.987+08:00'
 * r = timemsTZ2past(t, tNow)
 * console.log(r)
 * // => { today: null, msg: '', err: '時間未到' }
 *
 */
function timemsTZ2past(t, tNow = null) {

    //check
    if (!isfun(ot)) {
        throw new Error(`invalid dayjs`)
    }

    //check
    if (!istimemsTZ(t)) {
        return {
            today: null,
            msg: '',
            err: '時間格式錯誤',
        }
    }

    //mnow
    let mnow = ot()
    if (istimemsTZ(tNow)) {
        mnow = ot(tNow, 'YYYY-MM-DDTHH:mm:ss.SSSZ') //統一轉+00:00時區再計算時間差
    }

    //mtime
    let mtime = ot(t, 'YYYY-MM-DDTHH:mm:ss.SSSZ') //統一轉+00:00時區再計算時間差

    //check
    if (mnow < mtime) {
        return {
            today: null,
            msg: '',
            err: '時間未到',
        }
    }

    //day
    let nowday = mnow.format('YYYY-MM-DD')
    let timeday = mtime.format('YYYY-MM-DD')
    let mnowday = ot(nowday, 'YYYY-MM-DD')
    let mtimeday = ot(timeday, 'YYYY-MM-DD')

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
        let hm = mtime.format('HH:mm')
        if (nowday === timeday) {
            today = true
            c = ihours + '小時前'
        }
        else {
            today = false
            c = '昨天' + hm
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
        c = imonths + '個月前'
    }
    if (iyears > 0) {
        today = false
        c = iyears + '年前'
    }

    return {
        today,
        msg: c,
        err: '',
    }
}


export default timemsTZ2past
