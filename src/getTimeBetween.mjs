import map from 'lodash-es/map.js'
import times from 'lodash-es/times.js'
import getTimeFromUnit from './getTimeFromUnit.mjs'
import getTimeObject from './getTimeObject.mjs'


/**
 * 輸入兩時間，單位皆為unit，由兩時間之間回傳以unit分切的時間點，回傳時間單位一樣為unit
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/getTimeBetween.test.mjs Github}
 * @memberOf wsemi
 * @param {String} tstart 輸入開始時間字串，不含時區
 * @param {String} tend 輸入結束時間字串，不含時區
 * @param {String} [unit='days'] 輸入切分單位字串，可選'years'、'months'、'days'、'hours'、'minutes'、'seconds'，其他值(含null、數字、布林、物件、陣列、包裝物件、不在可選集合之字串)視為未給而改用預設'days'，不報錯，預設為'days'
 * @returns {Array} 回傳切分後各時間陣列；回傳[]代表無可切分之時間點，包含tstart或tend無效(或其格式與unit不符)，以及起訖相同或起始時間大於結束時間(字串比較tstart >= tend)，故[]不單指輸入無效
 * @example
 *
 * console.log(getTimeBetween('2017', '2019', 'years'))
 * // => ['2017', '2018', '2019']
 *
 * console.log(getTimeBetween('2019-01-01', '2019-01-03', 'days'))
 * // => ['2019-01-01', '2019-01-02', '2019-01-03']
 *
 * console.log(getTimeBetween('2019-01-01', '2019-01-03'))
 * // => ['2019-01-01', '2019-01-02', '2019-01-03']
 *
 * console.log(getTimeBetween('2019-01-03', '2019-01-03'))
 * // => []
 *
 * console.log(getTimeBetween('2019-01-03', '2019-01-01'))
 * // => []
 *
 */
function getTimeBetween(tstart, tend, unit = 'days') {

    //unit, opt類位置參數(簽名預設'days'): 非預期(非字串, 或不在years、months、days、hours、minutes、seconds之字串, 含null、數字、布林、物件、陣列、包裝物件、空字串)視為未給, 改用預設'days'(K3, W-13/N-B, 使用者2026-11-16)
    if (getTimeFromUnit(unit) === '') {
        unit = 'days'
    }

    //fmt
    let fmt = getTimeFromUnit(unit)

    //m1, m2
    let m1 = getTimeObject(tstart, unit)
    let m2 = getTimeObject(tend, unit)

    //check
    if (m1 === null || m2 === null) {
        return []
    }
    if (tstart >= tend) {
        return []
    }

    //diff
    let n = m2.diff(m1, unit) + 1

    //r
    let r = map(times(n), function(i) {
        let m = m1.clone() //clone
        return m.add(i, unit).format(fmt) //add
    })

    return r
}


export default getTimeBetween
