import strdelright from './strdelright.mjs'
import strright from './strright.mjs'


function checkTZ(t) {
    let tz

    //Z
    tz = strright(t, 1)
    if (tz === 'Z') {
        return true
    }

    //general
    tz = strright(t, 6)
    if (!/[+|-]\d\d:\d\d/.test(tz)) {
        return false
    }

    return true
}


function delTZ(t) {
    let tz

    //Z
    tz = strright(t, 1)
    if (tz === 'Z') {
        return strdelright(t, 1)
    }

    return strdelright(t, 6)
}


function normTZ(t) {
    let tz

    //Z
    tz = strright(t, 1)
    if (tz === 'Z') {
        t = strdelright(t, 1)
        return `${t}+00:00`
    }

    return t
}


function sepTZ(t) {
    let nt = normTZ(t)
    let tn = strdelright(nt, 6)
    let tz = strright(nt, 6)
    return {
        t: tn,
        tz,
    }
}


let RE_WALL = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})$/
let RE_WALL_MS = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})\.(\d{3})$/


/**
 * 判斷已去除時區之時刻字串是否為有效之日曆時刻(供istimeTZ、istimemsTZ; 排程第428項起亦供不帶時區之istime、istimems): 須為標準寫法'YYYY-MM-DDTHH:mm:ss'(withMs為true時'YYYY-MM-DDTHH:mm:ss.SSS'),
 * 年0000~9999、月、日(依格里曆之閏年)、時、分、秒、毫秒皆在範圍內; 以其時區之固定偏移解析(以UTC建立並逐欄比對, 固定偏移無夏令時間), 不經本機時間往返比對,
 * 故不受執行環境之時區(含夏令空窗)影響(使用者2026-11-15, 排程第430項第三批裁定表〈十四〉)
 *
 * @param {String} t 輸入已去除時區之時刻字串
 * @param {Boolean} withMs 輸入是否含毫秒
 * @returns {Boolean} 回傳是否有效
 */
function isWallTime(t, withMs) {
    let m = (withMs ? RE_WALL_MS : RE_WALL).exec(t)
    if (m === null) {
        return false
    }
    let y = Number(m[1])
    let mo = Number(m[2])
    let d = Number(m[3])
    let h = Number(m[4])
    let mi = Number(m[5])
    let s = Number(m[6])
    let ms = withMs ? Number(m[7]) : 0
    let dt = new Date(0)
    dt.setUTCFullYear(y, mo - 1, d) //setUTCFullYear不將0~99對映為1900~1999
    dt.setUTCHours(h, mi, s, ms)
    return dt.getUTCFullYear() === y &&
        dt.getUTCMonth() === mo - 1 &&
        dt.getUTCDate() === d &&
        dt.getUTCHours() === h &&
        dt.getUTCMinutes() === mi &&
        dt.getUTCSeconds() === s &&
        dt.getUTCMilliseconds() === ms
}


/**
 * 判斷日字串是否為有效之日曆日(供isday): 須為標準寫法'YYYY-MM-DD', 年0000~9999、月、日(依格里曆之閏年)皆在範圍內;
 * 同isWallTime逐欄比對, 不經本機時間往返比對, 故不受執行環境之時區影響(原以本機時間往返比對, 於整日被跳過之時區如Pacific/Apia之2011-12-30誤判無效; 排程第428項)
 *
 * @param {String} t 輸入日字串
 * @returns {Boolean} 回傳是否有效
 */
function isWallDay(t) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(t)) {
        return false
    }
    return isWallTime(`${t}T00:00:00`, false)
}


/**
 * 判斷月字串是否為有效之日曆月(供ismonth): 須為標準寫法'YYYY-MM', 年0000~9999、月01~12;
 * 同isWallTime逐欄比對, 不經本機時間往返比對, 故不受執行環境之時區影響(排程第428項)
 *
 * @param {String} t 輸入月字串
 * @returns {Boolean} 回傳是否有效
 */
function isWallMonth(t) {
    if (!/^\d{4}-\d{2}$/.test(t)) {
        return false
    }
    return isWallTime(`${t}-01T00:00:00`, false)
}


//isValidOffset(判斷時區是否為有效偏移)已移除: 排程第428項起istimeTZ、istimemsTZ對checkTZ所收之全部時區(有效偏移與'|08:00'、'+99:99'等)皆以isWallTime逐欄驗證, 不再分流


let tz = {
    checkTZ,
    delTZ,
    normTZ,
    sepTZ,
    isWallTime,
    isWallDay,
    isWallMonth,
}


export default tz
