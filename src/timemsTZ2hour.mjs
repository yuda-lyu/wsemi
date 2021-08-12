import ot from 'dayjs'
import istimemsTZ from './istimemsTZ.mjs'
import tz from './_tz.mjs'


/**
 * 毫秒時間(含時區)取至時時間
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/timemsTZ2hour.test.mjs Github}
 * @memberOf wsemi
 * @param {String} t 輸入毫秒時間字串，含時區
 * @returns {String} 回傳時時間字串
 * @example
 *
 * console.log(timemsTZ2hour('2019-01-01T12:34:56.987+08:00'))
 * // => '2019-01-01T12'
 *
 * console.log(timemsTZ2hour('2019-01-01T12:34:56.987Z'))
 * // => '2019-01-02T12'
 *
 */
function timemsTZ2hour(t) {

    //check
    if (!istimemsTZ(t)) {
        return ''
    }

    //delTZ
    t = tz.delTZ(t)

    let d = ot(t)
    let r = d.format('YYYY-MM-DDTHH')

    return r
}


export default timemsTZ2hour
