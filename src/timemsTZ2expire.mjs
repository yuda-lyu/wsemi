import ot from 'dayjs'
import get from 'lodash-es/get.js'
import isbol from './isbol.mjs'
import isfun from './isfun.mjs'
import istimemsTZ from './istimemsTZ.mjs'


//core, 實際計算; 抽為獨立函數以便由呼叫端統一以try catch攔截非預期錯誤, 而不必將整段運算內縮
function core(t, tNow) {

    //mnow
    let mnow = ot()
    if (istimemsTZ(tNow)) {
        mnow = ot(tNow, 'YYYY-MM-DDTHH:mm:ss.SSSZ') //統一轉+00:00時區再計算時間差
    }

    //mtime
    let mtime = ot(t, 'YYYY-MM-DDTHH:mm:ss.SSSZ') //統一轉+00:00時區再計算時間差

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
        let hm = mtime.format('HH:mm')
        if (nowday === timeday) {
            today = true
            c = ihours + '小時後' + '，今天' + hm
        }
        else {
            today = false
            c = ihours + '小時後' + '，明天' + hm
        }
    }
    if (idays > 1) {
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
        c = imonths + '個月後'
    }
    if (iyears > 0) {
        today = false
        c = iyears + '年後'
    }

    return {
        today,
        msg: c,
        err: '',
    }
}


/**
 * 毫秒時間轉到期時間
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/timemsTZ2expire.test.mjs Github}
 * @memberOf wsemi
 * @param {String} t 輸入毫秒時間字串
 * @param {String} [tNow=null] 輸入現在毫秒時間字串
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Boolean} [opt.returnWithStateAndMsg=false] 輸入是否回傳含狀態與訊息物件布林值，若為true則回傳{ state, msg }物件，state為'success'或'error'，msg於success時為回傳結果、於error時為錯誤訊息字串，預設false
 * @returns {Object} 回傳物件，含today、msg、err三欄位；t非有效毫秒時間字串時回傳{ today: null, msg: '', err: '時間格式錯誤' }，時間已過時回傳{ today: null, msg: '', err: '時間已過' }；若opt.returnWithStateAndMsg為true則回傳{ state, msg }物件，其中時間已過屬算得之結果故state仍為'success'
 * @example
 *
 * let t
 * let tNow = '2020-10-18T12:34:56.987+08:00'
 * let r
 *
 * t = '2020-10-18T12:34:58.987+08:00'
 * r = timemsTZ2expire(t, tNow)
 * console.log(r)
 * // => { today: true, msg: '2秒後', err: '' }
 *
 * t = '2020-10-18T04:34:58.987+00:00'
 * r = timemsTZ2expire(t, tNow)
 * console.log(r)
 * // => { today: true, msg: '2秒後', err: '' }
 *
 * t = '2020-10-18T04:34:58.987Z'
 * r = timemsTZ2expire(t, tNow)
 * console.log(r)
 * // => { today: true, msg: '2秒後', err: '' }
 *
 * t = '2020-10-18T12:34:58.123+08:00'
 * r = timemsTZ2expire(t, tNow)
 * console.log(r)
 * // => { today: true, msg: '1秒後', err: '' }
 *
 * t = '2020-10-18T12:37:58.987+08:00'
 * r = timemsTZ2expire(t, tNow)
 * console.log(r)
 * // => { today: true, msg: '3分鐘後', err: '' }
 *
 * t = '2020-10-18T16:37:58.987+08:00'
 * r = timemsTZ2expire(t, tNow)
 * console.log(r)
 * // => { today: true, msg: '4小時後，今天16:37', err: '' }
 *
 * t = '2020-10-23T16:37:58.987+08:00'
 * r = timemsTZ2expire(t, tNow)
 * console.log(r)
 * // => { today: false, msg: '5天後', err: '' }
 *
 * t = '2021-04-23T16:37:58.987+08:00'
 * r = timemsTZ2expire(t, tNow)
 * console.log(r)
 * // => { today: false, msg: '6個月後', err: '' }
 *
 * t = '2028-04-23T16:37:58.987+08:00'
 * r = timemsTZ2expire(t, tNow)
 * console.log(r)
 * // => { today: false, msg: '7年後', err: '' }
 *
 * t = '2018-04-23T16:37:58.987+08:00'
 * r = timemsTZ2expire(t, tNow)
 * console.log(r)
 * // => { today: null, msg: '', err: '時間已過' }
 *
 */
function timemsTZ2expire(t, tNow = null, opt = {}) {

    //returnWithStateAndMsg
    let returnWithStateAndMsg = get(opt, 'returnWithStateAndMsg', null)
    if (!isbol(returnWithStateAndMsg)) {
        returnWithStateAndMsg = false
    }

    //retSuccess, 算得之結果(含err為'時間已過'者)皆屬成功, 該err為業務結果而非轉換失敗
    let retSuccess = (v) => {
        if (returnWithStateAndMsg) {
            return {
                state: 'success',
                msg: v,
            }
        }
        else {
            return v
        }
    }

    //retError, 預設模式沿用既有之{ today, msg, err }失敗形狀與其中文說明, 不改變既有行為
    let retError = (msg, errText) => {
        if (returnWithStateAndMsg) {
            return {
                state: 'error',
                msg,
            }
        }
        else {
            return {
                today: null,
                msg: '',
                err: errText,
            }
        }
    }

    //check
    if (!isfun(ot)) {
        throw new Error(`invalid dayjs`)
    }

    //check
    if (!istimemsTZ(t)) {
        return retError('invalid t', '時間格式錯誤')
    }

    //r, 須攔截非預期錯誤(如dayjs解析或格式化異常), 否則會外拋至呼叫端
    let r = null
    try {
        r = core(t, tNow)
    }
    catch (err) {
        return retError(err.toString(), '時間轉換失敗')
    }

    return retSuccess(r)
}


export default timemsTZ2expire
