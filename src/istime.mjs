import ot from 'dayjs'
import isestr from './isestr.mjs'


/**
 * 判斷是否為秒時間
 *
 * @export
 * @param {String} v 輸入秒時間字串
 * @returns {Boolean} 回傳是否為秒時間布林值
 */
export default function istime(v) {

    //check
    if (!isestr(v)) {
        return false
    }

    let df = 'YYYY/MM/DD HH:mm:ss'
    let m = ot(v, df).format(df)
    return (v === m)
}
