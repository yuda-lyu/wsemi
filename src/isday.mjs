import ot from 'dayjs'
import isestr from './isestr.mjs'


/**
 * 判斷是否為日時間
 *
 * @memberOf wsemi
 * @param {String} v 輸入日時間字串
 * @returns {Boolean} 回傳是否為日時間布林值
 */
function isday(v) {

    //check
    if (!isestr(v)) {
        return false
    }

    let df = 'YYYY/MM/DD'
    let m = ot(v, df).format(df)
    return (v === m)
}


export default isday
