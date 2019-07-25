import ot from 'dayjs'
import istimeTZ from './istimeTZ.mjs'
import sepTimeTZ from './sepTimeTZ.mjs'


/**
 * 秒時間取至日時間
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/timeTZ2day.test.js Github}
 * @memberOf wsemi
 * @param {String} t 輸入秒時間字串
 * @returns {String} 回傳日時間字串
 * @example
 * timeTZ2day('2019-01-01T12:34:56+08:00')
 * // => '2019-01-01'
 */
function timeTZ2day(t) {

    //check
    if (!istimeTZ(t)) {
        return ''
    }

    //sepTimeTZ
    let o = sepTimeTZ(t)

    let d = ot(o.t, 'YYYY-MM-DDTHH:mm:ss')
    let r = d.format('YYYY-MM-DD')

    return r
}


export default timeTZ2day
