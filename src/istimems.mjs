import ot from 'dayjs'
import isestr from './isestr.mjs'


/**
 * 判斷是否為秒時間，不含時區
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/istimems.test.mjs Github}
 * @memberOf wsemi
 * @param {String} v 輸入毫秒時間字串，不含時區
 * @returns {Boolean} 回傳是否為毫秒時間布林值
 * @example
 *
 * console.log(istimems('2019-01-01T12:34:56:789.321'))
 * // => false
 *
 * console.log(istimems('2019-01-01T12:34:56.321'))
 * // => true
 *
 * console.log(istimems('2019-01-01T12:34:56'))
 * // => false
 *
 * console.log(istimems('2019-01-01'))
 * // => false
 *
 */
function istimems(v) {

    //check
    if (!isestr(v)) {
        return false
    }

    let ft = 'YYYY-MM-DDTHH:mm:ss.SSS'
    let m = ot(v, ft).format(ft)
    return (v === m)
}


export default istimems
