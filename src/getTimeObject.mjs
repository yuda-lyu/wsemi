import ot from './_dayjs.mjs'
import isestr from './isestr.mjs'
import getTimeFromUnit from './getTimeFromUnit.mjs'


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

    //o
    let o = parseTime(t, unit)

    //fmt
    let fmt = getTimeFromUnit(unit)

    //check unit
    let m = o.format(fmt)
    let b = (t === m)
    if (b) {
        return o
    }

    return null
}


export default getTimeObject
