import ot from './_dayjs.mjs'
import isestr from './isestr.mjs'
import getTimeFromUnit from './getTimeFromUnit.mjs'
import tz from './_tz.mjs'


function parseTime(t, unit) {
    let e = ''
    if (unit === 'years') {
        e = '-01-01T00:00:00'
    }
    else if (unit === 'months') {
        e = '-01T00:00:00'
    }
    else if (unit === 'days') {
        e = 'T00:00:00'
    }
    else if (unit === 'hours') {
        e = ':00:00'
    }
    else if (unit === 'minutes') {
        e = ':00'
    }
    // else if (unit === 'seconds') {
    // }
    let fm = 'YYYY-MM-DDTHH:mm:ss'
    return ot(t + e, fm)
}


/**
 * 輸入時間字串，單位為unit，回傳解析後之時間物件
 *
 * 有效性之判定：逐欄驗證(標準寫法，年0000～9999、月、日依格里曆之閏年、時、分、秒皆在範圍內)，不經本機時間往返比對，故不受執行環境之時區(含夏令空窗與整日被跳過之日)影響；本機時區之夏令空窗內之時刻(如America/New_York之'2026-03-08T02:30:00')為有效，不回傳null
 * 回傳之時間物件為dayjs物件(依本機時區之本機時間，對外語意不變)：本機時區之夏令空窗內之時刻，物件依JS規則推移為空窗後之本機時刻(如上例之物件為03:30)；須依牆鐘欄位做日曆運算(如列舉區間)時請用getTimeBetween，不要對本物件做本機時間加減
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/getTimeObject.test.mjs Github}
 * @memberOf wsemi
 * @param {String} t 輸入時間字串，不含時區
 * @param {String} [unit='days'] 輸入時間單位字串，可選'years'、'months'、'days'、'hours'、'minutes'、'seconds'，其他值(含null、數字、布林、物件、陣列、包裝物件、不在可選集合之字串)視為未給而改用預設'days'，不報錯，預設為'days'
 * @returns {Object} 回傳時間物件，若非法時間(t非非空字串，或t之格式與unit不符)則回傳null
 * @example
 *
 * console.log(getTimeObject('2019-01-01', 'days'))
 * // => dayjs('2019-01-01', 'YYYY-MM-DD') //use dayjs or moment
 *
 * console.log(getTimeObject('2019-01-01T12:34:56', 'seconds'))
 * // => dayjs('2019-01-01T12:34:56', 'YYYY-MM-DDTHH:mm:ss') //use dayjs or moment
 *
 */
function getTimeObject(t, unit = 'days') {

    //check
    if (!isestr(t)) {
        return null
    }

    //unit, opt類位置參數(簽名預設'days'): 非預期(非字串, 或不在years、months、days、hours、minutes、seconds之字串, 含null、數字、布林、物件、陣列、包裝物件、空字串)視為未給, 改用預設'days'(K3, W-13/N-B, 使用者2026-11-16)
    if (getTimeFromUnit(unit) === '') {
        unit = 'days'
    }

    //dayjs不可用(UMD未載入dayjs全域)時維持修前之拋錯(原經dayjs解析而拋'invalid dayjs'), 使呼叫端之失敗形式不變
    ot.assertDayjs()

    //check, 逐欄驗證(標準寫法、年月日時分秒皆在日曆範圍內), 不經本機時間往返比對(原以本機時區解析再format比對, 於本機時區夏令空窗內之時刻或整日被跳過之日誤判無效回傳null; 排程第675項, 同第428項)
    if (tz.parseWallUnit(t, unit) === null) {
        return null
    }

    //o, 本機時間之dayjs物件(對外語意不變); 本機時區夏令空窗內之時刻依JS規則推移為空窗後之本機時刻
    let o = parseTime(t, unit)

    return o
}


export default getTimeObject
