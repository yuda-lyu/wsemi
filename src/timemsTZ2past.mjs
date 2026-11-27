import ot from './_dayjs.mjs'
import get from 'lodash-es/get.js'
import isbol from './isbol.mjs'
import isfun from './isfun.mjs'
import istimemsTZ from './istimemsTZ.mjs'
import diagIfAsked from './_diagIfAsked.mjs'
import pickOpt from './_pickOpt.mjs'
import calDayDiff from './_calDayDiff.mjs'


/**
 * 毫秒時間轉過去時間
 *
 * err之值分兩類：'invalid t: must be a time string YYYY-MM-DDTHH:mm:ss.SSS with a time zone (Z, +HH:mm or -HH:mm)'(t無效)、'時間轉換失敗'為失敗(狀態模式下為state: 'error')；'時間未到'為算得之結果(狀態模式下為state: 'success')；正常算得時err為''
 * 轉換方式：時刻依其時區之固定偏移解析為絕對時刻(不經本機時間往返)後計算時間差；「今天、昨天、明天」之日界與顯示之時:分依本機時區；天、周、月、年數為兩日(本機時區之日期)之日曆差(以日期欄位運算，不受夏令影響，如夏令於00:00起跳之日亦不少算)
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/timemsTZ2past.test.mjs Github}
 * @memberOf wsemi
 * @param {String} t 輸入毫秒時間字串
 * @param {String} [tNow=null] 輸入現在毫秒時間字串
 * @param {Object} [opt={}] 輸入設定物件，讀取拋錯(已撤銷之Proxy、存取器拋錯)者視為未給，預設{}
 * @param {Boolean} [opt.returnWithStateAndMsg=false] 輸入是否回傳含狀態與訊息物件布林值，若為true則回傳{ state, msg }物件，state為'success'或'error'，msg於success時為回傳結果、於error時為錯誤訊息字串，預設false
 * @param {Boolean} [opt.logDetail=false] 輸入讀取呼叫端之值或轉換失敗時是否輸出遮罩後之細節布林值(經getDiag之出口)，須為true才生效，狀態模式之msg為固定詞彙(不含呼叫端所拋出之文字)，預設false(靜默)
 * @param {Function} [opt.funLog=null] 輸入讀取呼叫端之值或轉換失敗時之診斷輸出函數，格式為(label, safe, detail)=>{}，給予時診斷交給它(label為'[wsemi timemsTZ2past] can not convert time'，同getDiag)，預設null
 * @returns {Object} 回傳物件，含today、msg、err三欄位；t非有效毫秒時間字串時回傳{ today: null, msg: '', err: 'invalid t: must be a time string YYYY-MM-DDTHH:mm:ss.SSS with a time zone (Z, +HH:mm or -HH:mm)' }，時間未到時回傳{ today: null, msg: '', err: '時間未到' }；若opt.returnWithStateAndMsg為true則回傳{ state, msg }物件，其中時間未到屬算得之結果故state仍為'success'
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

    //diff, 秒、分、時為時刻(毫秒)差; 天、周、月、年為兩日之日曆差(日期欄位於UTC日曆運算, 不經本機時間: 原以本機時間之午夜物件diff, 於午夜不存在之日〔夏令於00:00起跳之時區〕少算1天; 排程第675項同機制盤點)
    let iseconds = mnow.diff(mtime, 'seconds')
    let iminutes = mnow.diff(mtime, 'minutes')
    let ihours = mnow.diff(mtime, 'hours')
    let dd = calDayDiff(nowday, timeday)
    let idays
    let iweeks
    let imonths
    let iyears
    if (dd !== null) {
        idays = dd.days
        iweeks = dd.weeks
        imonths = dd.months
        iyears = dd.years
    }
    else {
        //日期非標準寫法(如本機時區使年份超出0000~9999)時維持原算法
        let mnowday = ot(nowday, 'YYYY-MM-DD')
        let mtimeday = ot(timeday, 'YYYY-MM-DD')
        idays = mnowday.diff(mtimeday, 'days')
        iweeks = mnowday.diff(mtimeday, 'weeks')
        imonths = mnowday.diff(mtimeday, 'months')
        iyears = mnowday.diff(mtimeday, 'years')
    }

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


function timemsTZ2past(t, tNow = null, opt = {}) {

    //opt, 取快照: 讀取拋錯(已撤銷之Proxy、getter拋錯、陷阱拋錯)之opt或其鍵視為未給, 不拋錯(C1/K3: 無法轉型回預設值, 不拋錯)
    let optSnap = pickOpt(opt, ['returnWithStateAndMsg'], [])

    //returnWithStateAndMsg
    let returnWithStateAndMsg = get(optSnap, 'returnWithStateAndMsg', null)
    if (!isbol(returnWithStateAndMsg)) {
        returnWithStateAndMsg = false
    }

    //retSuccess, 算得之結果(含err為'時間未到'者)皆屬成功, 該err為業務結果而非轉換失敗
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

    //retError, 預設模式沿用既有之{ today, msg, err }失敗形狀(err為失敗說明, t無效時與狀態模式之msg同一則訊息), 不改變既有行為
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
        let msgT = 'invalid t: must be a time string YYYY-MM-DDTHH:mm:ss.SSS with a time zone (Z, +HH:mm or -HH:mm)'
        return retError(msgT, msgT) //狀態模式之msg與預設模式之err為同一則訊息
    }

    //r, 須攔截非預期錯誤(如dayjs解析或格式化異常), 否則會外拋至呼叫端
    let r = null
    try {
        r = core(t, tNow)
    }
    catch (err) {
        //狀態模式之訊息為固定詞彙(V19、V20, 不轉出錯誤之文字), 細節經opt之診斷出口(預設靜默); 預設模式之err維持既有之'時間轉換失敗'
        diagIfAsked(opt, '[wsemi timemsTZ2past] can not convert time', err)
        return retError('can not convert time', '時間轉換失敗')
    }

    return retSuccess(r)
}


export default timemsTZ2past
