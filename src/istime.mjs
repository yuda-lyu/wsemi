import ot from 'dayjs'
import isestr from './isestr.mjs'


/**
 * 判斷是否為秒時間
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/istime.test.js Github}
 * @memberOf wsemi
 * @param {String} v 輸入秒時間字串，不含時區
 * @returns {Boolean} 回傳是否為秒時間布林值
 * @example
 * console.log(istime('2019-01-01T12:34:56:789'))
 * // => false
 *
 * console.log(istime('2019-01-01T12:34:56'))
 * // => true
 *
 * console.log(istime('2019-01-01'))
 * // => false
 */
function istime(v) {

    //check
    if (!isestr(v)) {
        return false
    }

    let ft = 'YYYY-MM-DDTHH:mm:ss'
    let m = ot(v, ft).format(ft)
    return (v === m)
}


export default istime
