import map from 'lodash/map'
import times from 'lodash/times'
import getTimeFromUnit from './getTimeFromUnit.mjs'
import getTimeObject from './getTimeObject.mjs'


/**
 * 輸入兩時間，單位皆為unit，由兩時間之間回傳以unit分切的時間點，回傳時間單位一樣為unit
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/timebetween.test.js Github}
 * @memberOf wsemi
 * @param {String} tstart 輸入開始時間字串
 * @param {String} tend 輸入結束時間字串
 * @param {String} [unit='days'] 輸入切分單位字串，預設為'days'
 * @returns {Array} 回傳切分後各時間陣列
 * @example
 *
 */
function timebetween(tstart, tend, unit = 'days') {

    //fmt
    let fmt = getTimeFromUnit(unit)

    //check
    if (fmt === '') {
        return []
    }

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


export default timebetween
