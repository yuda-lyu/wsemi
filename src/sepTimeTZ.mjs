import istimeTZ from './istimeTZ.mjs'
import strdelright from './strdelright.mjs'
import strright from './strright.mjs'


/**
 * 切分秒時間
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/sepTimeTZ.test.mjs Github}
 * @memberOf wsemi
 * @param {String} t 輸入秒時間字串
 * @returns {Object} 回傳切分後時間物件，t為無時區秒時間，tz為時區
 * @example
 *
 * console.log(sepTimeTZ('2019-01-01T12:34:56+08:00'))
 * // => { t: '2019-01-01T12:34:56', tz: '+08:00' }
 *
 */
function sepTimeTZ(v) {

    //check
    if (!istimeTZ(v)) {
        return {
            t: '',
            tz: ''
        }
    }

    //t
    let t = strdelright(v, 6)

    //tz
    let tz = strright(v, 6)

    return {
        t: t,
        tz: tz
    }
}


export default sepTimeTZ
