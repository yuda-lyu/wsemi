import ot from 'dayjs'
import istimems from './istimems.mjs'


/**
 * 毫秒時間取至秒時間
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/timems2time.test.mjs Github}
 * @memberOf wsemi
 * @param {String} t 輸入毫秒時間字串，不含時區
 * @returns {String} 回傳秒時間字串
 * @example
 *
 * console.log(timems2time('2019-01-01T12:34:56.987'))
 * // => '2019-01-01T12:34:56'
 *
 */
function timems2time(t) {

    //check
    if (!istimems(t)) {
        return ''
    }

    let d = ot(t, 'YYYY-MM-DDTHH:mm:ss.SSS')
    let r = d.format('YYYY-MM-DDTHH:mm:ss')

    return r
}


export default timems2time
