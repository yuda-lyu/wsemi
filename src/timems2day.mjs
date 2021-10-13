import ot from 'dayjs'
import istimems from './istimems.mjs'


/**
 * 毫秒時間取至日時間
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/timems2day.test.mjs Github}
 * @memberOf wsemi
 * @param {String} t 輸入毫秒時間字串，不含時區
 * @returns {String} 回傳日時間字串
 * @example
 *
 * console.log(timems2day('2019-01-01T12:34:56.987'))
 * // => '2019-01-01'
 *
 */
function timems2day(t) {

    //check
    if (!istimems(t)) {
        return ''
    }

    let d = ot(t, 'YYYY-MM-DDTHH:mm:ss.SSS')
    let r = d.format('YYYY-MM-DD')

    return r
}


export default timems2day
