import map from 'lodash/map'
import times from 'lodash/times'
import ot from 'dayjs'
import istime from './istime.mjs'


/**
 * 由兩日期之前回傳以unit分切的時間點
 *
 * @memberOf wsemi
 * @param {String} t1 輸入開始秒時間字串
 * @param {String} t2 輸入結束秒時間字串
 * @param {String} unit 輸入切分單位字串
 * @returns {Array} 回傳切分後各時間陣列
 */
function timebetween(t1, t2, unit) {

    //check
    if (!istime(t1) || !istime(t2)) {
        return []
    }
    if (t1 >= t2) {
        return []
    }

    //fm
    let fm
    if (unit === 'years') {
        fm = 'YYYY'
    }
    else if (unit === 'months') {
        fm = 'YYYY/MM'
    }
    else if (unit === 'days') {
        fm = 'YYYY/MM/DD'
    }
    else if (unit === 'hours') {
        fm = 'YYYY/MM/DD HH'
    }
    else if (unit === 'minutes') {
        fm = 'YYYY/MM/DD HH:mm'
    }
    else if (unit === 'seconds') {
        fm = 'YYYY/MM/DD HH:mm:ss'
    }

    function cvunit(t) {
        let v = ot(t, 'YYYY/MM/DD HH:mm:ss')
        let c = v.format(fm)
        let m = ot(c, fm)
        return m
    }

    //m1, m2
    let m1 = cvunit(t1)
    let m2 = cvunit(t2)

    //diff
    let n = m2.diff(m1, unit) + 1

    //r
    let r = map(times(n), function(i) {
        let m = m1.clone() //clone
        m.add(i, unit) //add
        return m.format(fm)
    })

    return r
}


export default timebetween
