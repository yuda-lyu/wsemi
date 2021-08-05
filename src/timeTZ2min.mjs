import ot from 'dayjs'
import istimeTZ from './istimeTZ.mjs'
import sepTimeTZ from './sepTimeTZ.mjs'


/**
 * 秒時間取至分時間
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/timeTZ2min.test.mjs Github}
 * @memberOf wsemi
 * @param {String} t 輸入秒時間字串
 * @returns {String} 回傳分時間字串
 * @example
 *
 * console.log(timeTZ2min('2019-01-01T12:34:56+08:00'))
 * // => '2019-01-01T12:34'
 *
 */
function timeTZ2min(t) {

    //check
    if (!istimeTZ(t)) {
        return ''
    }

    //sepTimeTZ
    let o = sepTimeTZ(t)

    let d = ot(o.t, 'YYYY-MM-DDTHH:mm:ss')
    let r = d.format('YYYY-MM-DDTHH:mm')

    return r
}


export default timeTZ2min
