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
 * 判斷已去除時區之時刻字串是否為有效之日曆時刻(供istimeTZ、istimemsTZ): 須為標準寫法'YYYY-MM-DDTHH:mm:ss'(withMs為true時'YYYY-MM-DDTHH:mm:ss.SSS'),
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
 * 判斷時刻字串之時區是否為有效之偏移(供istimeTZ、istimemsTZ): 'Z', 或'+HH:mm'/'-HH:mm'且HH為00~23、mm為00~59(同Date可解析之範圍);
 * checkTZ另收'|'符號與超出範圍之偏移(如'+99:99'、'|08:00'), 該類輸入不屬「有效之帶時區時刻」, 由呼叫端維持修前之判定(ws430c2外審T6)
 *
 * @param {String} v 輸入時刻字串(已通過checkTZ)
 * @returns {Boolean} 回傳是否為有效之偏移
 */
function isValidOffset(v) {
    if (strright(v, 1) === 'Z') {
        return true
    }
    let m = /^[+-](\d\d):(\d\d)$/.exec(strright(v, 6))
    if (m === null) {
        return false
    }
    return Number(m[1]) <= 23 && Number(m[2]) <= 59
}


let tz = {
    checkTZ,
    delTZ,
    normTZ,
    sepTZ,
    isWallTime,
    isValidOffset,
}


export default tz
