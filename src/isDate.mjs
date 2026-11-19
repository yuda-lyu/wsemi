import get from 'lodash-es/get.js'
import isbol from './isbol.mjs'
import isday from './isday.mjs'
import istime from './istime.mjs'
import istimems from './istimems.mjs'
import istimeTZ from './istimeTZ.mjs'
import istimemsTZ from './istimemsTZ.mjs'


//dateTime, Date物件(含跨realm之Date, 如iframe、vm)之時間值, 以內部槽判定(Date.prototype.getTime對非Date物件拋TypeError, 偽造Symbol.toStringTag為'Date'之一般物件與Proxy不算); 無效日期(Invalid Date)為NaN, 非Date物件回傳null
function dateTime(v) {
    try {
        return Date.prototype.getTime.call(v)
    }
    catch (err) {
        return null
    }
}


/**
 * 判斷是否為時間(Date)
 *
 * 只收下列兩類，其餘一律false(使用者2026-11-16定，dspec〈輸入參數之檢測機制〉§11 W-21，收嚴：判斷函數不再以new Date()寬鬆解析)：
 * 1. 有效之Date物件(含跨realm之Date)，無效之Date(new Date('x')，即Invalid Date)為false
 * 2. 符合下列任一標準格式之字串，且該日期、時間確實存在：isday('YYYY-MM-DD')、istime('YYYY-MM-DDTHH:mm:ss')、istimems('YYYY-MM-DDTHH:mm:ss.SSS')、istimeTZ('YYYY-MM-DDTHH:mm:ss'加時區'Z'或'±HH:mm')、istimemsTZ('YYYY-MM-DDTHH:mm:ss.SSS'加時區'Z'或'±HH:mm')
 *
 * 數字一律為false(isDate(0)、isDate(1546300800000)改為false，毫秒時間戳請先以iseint判斷再自行轉Date)；數字字串('0'、'125'、'2019')、不存在之日期('2026-02-30')、非標準格式('2026/11/16'、'2019-01'、'2019'、'Nov 16 2026')皆為false；包裝物件(new String('2019-01-01'))為false(判斷函數只收原始值)
 * 字串之判定依isday、istime、istimems、istimeTZ、istimemsTZ，故與之相同依賴dayjs(UMD須先載入dayjs全域，未載入時與isday相同拋出invalid dayjs)；其餘輸入對任何值皆不拋錯(含已撤銷之Proxy，opt亦同，讀取即拋錯之opt視為未給)
 *
 * 若opt.onlyCheckDateObject為true，則僅判斷是否為Date物件(以內部槽判定，不解析字串與數值)：無效日期(Invalid Date)與跨realm(例如iframe、vm)之Date亦回傳true，字串與數字一律false；偽造Symbol.toStringTag為'Date'之一般物件與Proxy為false(修前以Object.prototype.toString判定而為true，修後以內部槽判定)
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/isDate.test.mjs Github}
 * @memberOf wsemi
 * @param {*} v 輸入任意資料
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Boolean} [opt.onlyCheckDateObject=false] 輸入是否僅判斷是否為Date物件布林值，若為true則只判斷是否為Date物件(含無效日期與跨realm之Date)，不解析字串與數值，非布林視為false，預設false
 * @returns {Boolean} 回傳判斷布林值
 * @example
 *
 * console.log(isDate(new Date('2019-01-01T12:34:56Z')))
 * // => true
 *
 * console.log(isDate(new Date('x')))
 * // => false (無效日期)
 *
 * console.log(isDate('2019-01-01'))
 * // => true
 *
 * console.log(isDate('2019-01-01T12:34:56'))
 * // => true
 *
 * console.log(isDate('2019-01-01T12:34:56.789'))
 * // => true
 *
 * console.log(isDate('2019-01-01T12:34:56+08:00'))
 * // => true
 *
 * console.log(isDate('2019-01-01T12:34:56.789Z'))
 * // => true
 *
 * console.log(isDate('2026-02-30'))
 * // => false (不存在之日期)
 *
 * console.log(isDate('2026/11/16'))
 * // => false (非標準格式)
 *
 * console.log(isDate('2019-01'))
 * // => false (非標準格式, 年月請用ismonth判斷)
 *
 * console.log(isDate('2019'))
 * // => false (非標準格式)
 *
 * console.log(isDate(1546300800000))
 * // => false (數字不收)
 *
 * console.log(isDate(new String('2019-01-01')))
 * // => false (包裝物件, 判斷函數只收原始值)
 *
 * console.log(isDate('2019-01-01', { onlyCheckDateObject: true }))
 * // => false
 *
 * console.log(isDate(new Date('2019-01-01'), { onlyCheckDateObject: true }))
 * // => true
 *
 * console.log(isDate(new Date('x'), { onlyCheckDateObject: true }))
 * // => true (無效日期亦為Date物件)
 *
 */
function isDate(v, opt = {}) {

    //onlyCheckDateObject, opt為已撤銷之Proxy等讀取即拋錯者視為未給(判斷函數不拋錯)
    let onlyCheckDateObject = null
    try {
        onlyCheckDateObject = get(opt, 'onlyCheckDateObject', null)
    }
    catch (err) {
        onlyCheckDateObject = null
    }
    if (!isbol(onlyCheckDateObject)) {
        onlyCheckDateObject = false
    }

    //Date物件, 以內部槽判定
    let t = dateTime(v)

    //onlyCheckDateObject, 僅判斷是否為Date物件(含無效日期), 不解析字串與數值
    if (onlyCheckDateObject) {
        return t !== null
    }

    //有效之Date物件; 無效日期(NaN)為false
    if (t !== null) {
        return !Number.isNaN(t)
    }

    //標準格式之字串(各函數內已判斷為原始字串), 其餘輸入(數字、包裝物件、物件等)一律false
    if (typeof v === 'string') {
        return isday(v) || istime(v) || istimems(v) || istimeTZ(v) || istimemsTZ(v)
    }

    return false
}


export default isDate
