import istimeTZ from './istimeTZ.mjs'
import timemsTZ2past from './timemsTZ2past.mjs'
import tz from './_tz.mjs'


function addms(t) {
    let st = tz.sepTZ(t)
    t = `${st.t}.000${st.tz}`
    return t
}


/**
 * 秒時間轉過去時間
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/timeTZ2past.test.mjs Github}
 * @memberOf wsemi
 * @param {String} t 輸入秒時間字串
 * @param {String} [tNow=null] 輸入現在秒時間字串
 * @returns {String} 回傳過去時間字串
 * @example
 *
 * let t
 * let tNow = '2020-10-18T12:34:56+08:00'
 * let r
 *
 * t = '2020-10-18T12:34:54+08:00'
 * r = timeTZ2past(t, tNow)
 * console.log(r)
 * // => { today: true, msg: '2秒前', err: '' }
 *
 * t = '2020-10-18T04:34:54+00:00'
 * r = timeTZ2past(t, tNow)
 * console.log(r)
 * // => { today: true, msg: '2秒前', err: '' }
 *
 * t = '2020-10-18T04:34:54Z'
 * r = timeTZ2past(t, tNow)
 * console.log(r)
 * // => { today: true, msg: '2秒前', err: '' }
 *
 * t = '2020-10-18T12:31:54+08:00'
 * r = timeTZ2past(t, tNow)
 * console.log(r)
 * // => { today: true, msg: '3分鐘前', err: '' }
 *
 * t = '2020-10-18T08:31:54+08:00'
 * r = timeTZ2past(t, tNow)
 * console.log(r)
 * // => { today: true, msg: '4小時前', err: '' }
 *
 * t = '2020-10-13T08:31:54+08:00'
 * r = timeTZ2past(t, tNow)
 * console.log(r)
 * // => { today: false, msg: '5天前', err: '' }
 *
 * t = '2020-04-13T08:31:54+08:00'
 * r = timeTZ2past(t, tNow)
 * console.log(r)
 * // => { today: false, msg: '6個月前', err: '' }
 *
 * t = '2013-04-13T08:31:54+08:00'
 * r = timeTZ2past(t, tNow)
 * console.log(r)
 * // => { today: false, msg: '7年前', err: '' }
 *
 * t = '2023-04-13T08:31:54+08:00'
 * r = timeTZ2past(t, tNow)
 * console.log(r)
 * // => { today: null, msg: '', err: '時間未到' }
 *
 */
function timeTZ2past(t, tNow = null) {

    //check
    if (!istimeTZ(t)) {
        return {
            today: null,
            msg: '',
            err: '時間格式錯誤',
        }
    }

    //addms
    t = addms(t)
    tNow = addms(tNow)

    //timemsTZ2past
    return timemsTZ2past(t, tNow)
}


export default timeTZ2past
