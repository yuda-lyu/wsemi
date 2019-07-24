/**
 * 輸入時間單位，回傳時間套件所需之解析字串
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/getTimeFromUnit.test.js Github}
 * @memberOf wsemi
 * @param {String} unit 輸入時間單位字串
 * @returns {String} 回傳時間套件所需之解析字串
 * @example
 * getTimeFromUnit('years')
 * // => 'YYYY'
 *
 * getTimeFromUnit('seconds')
 * // => 'YYYY-MM-DDTHH:mm:ssZ'
 */
function getTimeFromUnit(unit) {
    let fm = ''
    if (unit === 'years') {
        fm = 'YYYY'
    }
    else if (unit === 'months') {
        fm = 'YYYY-MM'
    }
    else if (unit === 'days') {
        fm = 'YYYY-MM-DD'
    }
    else if (unit === 'hours') {
        fm = 'YYYY-MM-DDTHH'
    }
    else if (unit === 'minutes') {
        fm = 'YYYY-MM-DDTHH:mm'
    }
    else if (unit === 'seconds') {
        fm = 'YYYY-MM-DDTHH:mm:ssZ'
    }
    return fm
}


export default getTimeFromUnit
