import ot from 'dayjs'
import tz from './_tz.mjs'
import isestr from './isestr.mjs'


/**
 * 判斷是否為毫秒時間，含時區
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/istimemsTZ.test.mjs Github}
 * @memberOf wsemi
 * @param {String} v 輸入毫秒時間字串，含時區
 * @returns {Boolean} 回傳是否為毫秒時間布林值
 * @example
 *
 * console.log(istimemsTZ('2019-01-01T12:34:56.789+08:00'))
 * // => true
 *
 * console.log(istimemsTZ('2019-01-01T12:34:56:789+08:00'))
 * // => false
 *
 * console.log(istimemsTZ('2019-01-01T12:34:56+08:00'))
 * // => false
 *
 * console.log(istimemsTZ('2019-01-01'))
 * // => false
 *
 */
function istimemsTZ(v) {

    //check
    if (!isestr(v)) {
        return false
    }

    //check tz
    if (!tz.checkTZ(v)) {
        return false
    }

    //t
    let t = tz.delTZ(v)

    let ft = 'YYYY-MM-DDTHH:mm:ss.SSS'
    let m = ot(t, ft).format(ft)
    return (t === m)
}


export default istimemsTZ
