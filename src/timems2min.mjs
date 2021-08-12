import ot from 'dayjs'
import istimems from './istimems.mjs'


/**
 * 毫秒時間取至分時間
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/timems2min.test.mjs Github}
 * @memberOf wsemi
 * @param {String} t 輸入毫秒時間字串，不含時區
 * @returns {String} 回傳分時間字串
 * @example
 *
 * console.log(timems2min('2019-01-01T12:34:56.987'))
 * // => '2019-01-01T12:34'
 *
 */
function timems2min(t) {

    //check
    if (!istimems(t)) {
        return ''
    }

    let d = ot(t, 'YYYY-MM-DDTHH:mm:ss.SSS')
    let r = d.format('YYYY-MM-DDTHH:mm')

    return r
}


export default timems2min
