import ot from 'dayjs'
import isestr from './isestr.mjs'


/**
 * 判斷是否為月時間
 *
 * @export
 * @param {String} v 輸入月時間字串
 * @returns {Boolean} 回傳是否為月時間布林值
 */
export default function ismonth(v) {

    //check
    if (!isestr(v)) {
        return false
    }

    let df = 'YYYY/MM'
    let m = ot(v, df).format(df)
    return (v === m)
}
