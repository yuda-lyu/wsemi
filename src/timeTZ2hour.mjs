import ot from 'dayjs'
import istimeTZ from './istimeTZ.mjs'
import sepTimeTZ from './sepTimeTZ.mjs'


/**
 * 秒時間取至時時間
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/timeTZ2hour.test.mjs Github}
 * @memberOf wsemi
 * @param {String} t 輸入秒時間字串
 * @returns {String} 回傳時時間字串
 * @example
 *
 * console.log(timeTZ2hour('2019-01-01T12:34:56+08:00'))
 * // => '2019-01-01T12'
 *
 */
function timeTZ2hour(t) {

    //check
    if (!istimeTZ(t)) {
        return ''
    }

    //sepTimeTZ
    let o = sepTimeTZ(t)

    let d = ot(o.t, 'YYYY-MM-DDTHH:mm:ss')
    let r = d.format('YYYY-MM-DDTHH')

    return r
}


export default timeTZ2hour
