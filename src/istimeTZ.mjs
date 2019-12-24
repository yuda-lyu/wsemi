import ot from 'dayjs'
import isestr from './isestr.mjs'
import strdelright from './strdelright.mjs'
import strright from './strright.mjs'


/**
 * 判斷是否為秒時間
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/istimeTZ.test.js Github}
 * @memberOf wsemi
 * @param {String} v 輸入秒時間字串
 * @returns {Boolean} 回傳是否為秒時間布林值
 * @example
 * console.log(istimeTZ('2019-01-01T12:34:56:789+08:00'))
 * // => false
 *
 * console.log(istimeTZ('2019-01-01T12:34:56+08:00'))
 * // => true
 *
 * console.log(istimeTZ('2019-01-01'))
 * // => false
 */
function istimeTZ(v) {

    //check
    if (!isestr(v)) {
        return false
    }

    //tz
    let tz = strright(v, 6)

    //check
    if (!/[+|-]\d\d:\d\d/.test(tz)) {
        return false
    }

    //t
    let t = strdelright(v, 6)

    let ft = 'YYYY-MM-DDTHH:mm:ss'
    let m = ot(t, ft).format(ft)
    return (t === m)
}


export default istimeTZ
