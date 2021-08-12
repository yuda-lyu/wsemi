import ot from 'dayjs'
import istimemsTZ from './istimemsTZ.mjs'
import tz from './_tz.mjs'


/**
 * 毫秒時間(含時區)取至分時間
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/timemsTZ2min.test.mjs Github}
 * @memberOf wsemi
 * @param {String} t 輸入毫秒時間字串，含時區
 * @returns {String} 回傳分時間字串
 * @example
 *
 * console.log(timemsTZ2min('2019-01-01T12:34:56.987+08:00'))
 * // => '2019-01-01T12:34'
 *
 * console.log(timemsTZ2min('2019-01-01T12:34:56.987Z'))
 * // => '2019-01-01T12:34'
 *
 */
function timemsTZ2min(t) {

    //check
    if (!istimemsTZ(t)) {
        return ''
    }

    //delTZ
    t = tz.delTZ(t)

    let d = ot(t)
    let r = d.format('YYYY-MM-DDTHH:mm')

    return r
}


export default timemsTZ2min
