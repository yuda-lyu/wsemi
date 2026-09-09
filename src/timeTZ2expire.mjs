import get from 'lodash-es/get.js'
import isbol from './isbol.mjs'
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
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Boolean} [opt.returnWithStateAndMsg=false] 輸入是否回傳含狀態與訊息物件布林值，若為true則回傳{ state, msg }物件，state為'success'或'error'，msg於success時為回傳結果、於error時為錯誤訊息字串，預設false
 * @returns {Object} 回傳物件，含today、msg、err三欄位；t非有效秒時間字串時回傳{ today: null, msg: '', err: '時間格式錯誤' }，時間已過時回傳{ today: null, msg: '', err: '時間已過' }；若opt.returnWithStateAndMsg為true則回傳{ state, msg }物件，其中時間已過屬算得之結果故state仍為'success'
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
function timeTZ2expire(t, tNow = null, opt = {}) {

    //returnWithStateAndMsg
    let returnWithStateAndMsg = get(opt, 'returnWithStateAndMsg', null)
    if (!isbol(returnWithStateAndMsg)) {
        returnWithStateAndMsg = false
    }

    //retError, 預設模式沿用既有之{ today, msg, err }失敗形狀與其中文說明, 不改變既有行為
    let retError = (msg, errText) => {
        if (returnWithStateAndMsg) {
            return {
                state: 'error',
                msg,
            }
        }
        else {
            return {
                today: null,
                msg: '',
                err: errText,
            }
        }
    }

    //check
    if (!istimeTZ(t)) {
        return retError('invalid t', '時間格式錯誤')
    }

    //addms, 須攔截非預期錯誤, 否則會外拋至呼叫端
    try {
        t = addms(t)
        tNow = addms(tNow)
    }
    catch (err) {
        return retError(err.toString(), '時間轉換失敗')
    }

    //timemsTZ2expire, opt原樣傳遞, 兩種模式之回傳形狀皆由其產生
    return timemsTZ2expire(t, tNow, opt)
}


export default timeTZ2expire
