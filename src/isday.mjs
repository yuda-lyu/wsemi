import ot from 'dayjs'
import isestr from './isestr.mjs'


/**
 * 判斷是否為日時間
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/isday.test.js Github}
 * @memberOf wsemi
 * @param {String} v 輸入日時間字串
 * @returns {Boolean} 回傳是否為日時間布林值
 * @example
 *
 * console.log(isday('2019-01-01'))
 * // => true
 *
 */
function isday(v) {

    //check
    if (!isestr(v)) {
        return false
    }

    let ft = 'YYYY-MM-DD'
    let m = ot(v, ft).format(ft)
    return (v === m)
}


export default isday
