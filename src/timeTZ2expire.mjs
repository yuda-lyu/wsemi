import istimeTZ from './istimeTZ.mjs'
import timemsTZ2expire from './timemsTZ2expire.mjs'
import tz from './_tz.mjs'


function addms(t) {
    let st = tz.sepTZ(t)
    t = `${st.t}.000${st.tz}`
    return t
}


/**
 * 秒時間轉到期時間
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/timeTZ2expire.test.mjs Github}
 * @memberOf wsemi
 * @param {String} t 輸入秒時間字串
 * @param {String} [tNow=null] 輸入現在秒時間字串
 * @returns {String} 回傳到期時間字串
 * @example
 *
 * let t
 * let tNow = '2020-10-18T12:34:56+08:00'
 * let r
 *
 * t = '2020-10-18T12:34:58+08:00'
 * r = timeTZ2expire(t, tNow)
 * console.log(r)
 * // => { today: true, msg: '2秒後', err: '' }
 *
 * t = '2020-10-18T04:34:58+00:00'
 * r = timeTZ2expire(t, tNow)
 * console.log(r)
 * // => { today: true, msg: '2秒後', err: '' }
 *
 * t = '2020-10-18T04:34:58Z'
 * r = timeTZ2expire(t, tNow)
 * console.log(r)
 * // => { today: true, msg: '2秒後', err: '' }
 *
 * t = '2020-10-18T12:37:58+08:00'
 * r = timeTZ2expire(t, tNow)
 * console.log(r)
 * // => { today: true, msg: '3分鐘後', err: '' }
 *
 * t = '2020-10-18T16:37:58+08:00'
 * r = timeTZ2expire(t, tNow)
 * console.log(r)
 * // => { today: true, msg: '4小時後，今天16:37', err: '' }
 *
 * t = '2020-10-23T16:37:58+08:00'
 * r = timeTZ2expire(t, tNow)
 * console.log(r)
 * // => { today: false, msg: '5天後', err: '' }
 *
 * t = '2021-04-23T16:37:58+08:00'
 * r = timeTZ2expire(t, tNow)
 * console.log(r)
 * // => { today: false, msg: '6個月後', err: '' }
 *
 * t = '2028-04-23T16:37:58+08:00'
 * r = timeTZ2expire(t, tNow)
 * console.log(r)
 * // => { today: false, msg: '7年後', err: '' }
 *
 * t = '2018-04-23T16:37:58+08:00'
 * r = timeTZ2expire(t, tNow)
 * console.log(r)
 * // => { today: null, msg: '', err: '時間已過' }
 *
 */
function timeTZ2expire(t, tNow = null) {

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

    //timemsTZ2expire
    return timemsTZ2expire(t, tNow)
}


export default timeTZ2expire
