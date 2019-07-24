import ot from 'dayjs'
import isestr from './isestr.mjs'
import getTimeFromUnit from './getTimeFromUnit.mjs'


function parseTime(t, unit) {
    let fm = ''
    if (unit === 'years') {
        fm = 'YYYY'
    }
    else if (unit === 'months') {
        t += '-01'
        fm = 'YYYY-MM-01'
    }
    else if (unit === 'days') {
        fm = 'YYYY-MM-DD'
    }
    else if (unit === 'hours') {
        t += ':00:00'
        fm = 'YYYY-MM-DDTHH:00:00'
    }
    else if (unit === 'minutes') {
        t += ':00'
        fm = 'YYYY-MM-DDTHH:mm:00'
    }
    else if (unit === 'seconds') {
        fm = 'YYYY-MM-DDTHH:mm:ssZ'
    }
    return ot(t, fm)
}


/**
 * 輸入時間字串，單位為unit，回傳解析後之時間物件
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/getTimeObject.test.js Github}
 * @memberOf wsemi
 * @param {String} t 輸入時間字串
 * @param {String} [unit='days'] 輸入時間單位字串，預設為'days'
 * @returns {Object} 回傳時間物件，若非法時間則回傳null
 * @example
 * getTimeObject('2019-01-01', 'days')
 * // => dayjs('2019-01-01', 'YYYY-MM-DD') //use dayjs or moment
 *
 * getTimeObject('2019-01-01T12:34:56+08:00', 'seconds')
 * // => dayjs('2019-01-01T12:34:56+08:00', 'YYYY-MM-DDTHH:mm:ssZ') //use dayjs or moment
 */
function getTimeObject(t, unit = 'days') {
    //依照unit取得時間物件

    //check
    if (!isestr(t)) {
        return null
    }
    if (!isestr(unit)) {
        return null
    }

    //fmt
    let fmt = getTimeFromUnit(unit)

    //o
    let o = parseTime(t, unit)

    //check unit
    let m = o.format(fmt)
    let b = (t === m)
    if (b) {
        return o
    }

    return null
}


export default getTimeObject
