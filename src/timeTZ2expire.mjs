import get from 'lodash-es/get.js'
import isbol from './isbol.mjs'
import istimeTZ from './istimeTZ.mjs'
import timemsTZ2expire from './timemsTZ2expire.mjs'
import tz from './_tz.mjs'
import diagIfAsked from './_diagIfAsked.mjs'
import pickOpt from './_pickOpt.mjs'


function addms(t) {
    let st = tz.sepTZ(t)
    t = `${st.t}.000${st.tz}`
    return t
}


/**
 * 秒時間轉到期時間
 *
 * err之值分兩類：'invalid t: must be a time string YYYY-MM-DDTHH:mm:ss with a time zone (Z, +HH:mm or -HH:mm)'(t無效)、'時間轉換失敗'為失敗(狀態模式下為state: 'error')；'時間已過'為算得之結果(狀態模式下為state: 'success')；正常算得時err為''
 * 轉換方式：時刻依其時區之固定偏移解析為絕對時刻(不經本機時間往返)後計算時間差；「今天、昨天、明天」之日界與顯示之時:分依本機時區
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/timeTZ2expire.test.mjs Github}
 * @memberOf wsemi
 * @param {String} t 輸入秒時間字串
 * @param {String} [tNow=null] 輸入現在秒時間字串
 * @param {Object} [opt={}] 輸入設定物件，讀取拋錯(已撤銷之Proxy、存取器拋錯)者視為未給，預設{}
 * @param {Boolean} [opt.returnWithStateAndMsg=false] 輸入是否回傳含狀態與訊息物件布林值，若為true則回傳{ state, msg }物件，state為'success'或'error'，msg於success時為回傳結果、於error時為錯誤訊息字串，預設false
 * @param {Boolean} [opt.logDetail=false] 輸入讀取呼叫端之值或轉換失敗時是否輸出遮罩後之細節布林值(經getDiag之出口)，須為true才生效，狀態模式之msg為固定詞彙(不含呼叫端所拋出之文字)，預設false(靜默)
 * @param {Function} [opt.funLog=null] 輸入讀取呼叫端之值或轉換失敗時之診斷輸出函數，格式為(label, safe, detail)=>{}，給予時診斷交給它(label為'[wsemi timemsTZ2expire] can not convert time'(轉換於其內進行)，同getDiag)，預設null
 * @returns {Object} 回傳物件，含today、msg、err三欄位；t非有效秒時間字串時回傳{ today: null, msg: '', err: 'invalid t: must be a time string YYYY-MM-DDTHH:mm:ss with a time zone (Z, +HH:mm or -HH:mm)' }，時間已過時回傳{ today: null, msg: '', err: '時間已過' }；若opt.returnWithStateAndMsg為true則回傳{ state, msg }物件，其中時間已過屬算得之結果故state仍為'success'
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

    //opt, 取快照: 讀取拋錯(已撤銷之Proxy、getter拋錯、陷阱拋錯)之opt或其鍵視為未給, 不拋錯(C1/K3: 無法轉型回預設值, 不拋錯)
    let optSnap = pickOpt(opt, ['returnWithStateAndMsg'], [])

    //returnWithStateAndMsg
    let returnWithStateAndMsg = get(optSnap, 'returnWithStateAndMsg', null)
    if (!isbol(returnWithStateAndMsg)) {
        returnWithStateAndMsg = false
    }

    //retError, 預設模式沿用既有之{ today, msg, err }失敗形狀(err為失敗說明, t無效時與狀態模式之msg同一則訊息), 不改變既有行為
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
        let msgT = 'invalid t: must be a time string YYYY-MM-DDTHH:mm:ss with a time zone (Z, +HH:mm or -HH:mm)'
        return retError(msgT, msgT) //狀態模式之msg與預設模式之err為同一則訊息
    }

    //addms, 須攔截非預期錯誤, 否則會外拋至呼叫端
    try {
        t = addms(t)
        tNow = addms(tNow)
    }
    catch (err) {
        //狀態模式之訊息為固定詞彙(V19、V20, 不轉出錯誤之文字), 細節經opt之診斷出口(預設靜默); 預設模式之err維持既有之'時間轉換失敗'
        diagIfAsked(opt, '[wsemi timeTZ2expire] can not convert time', err)
        return retError('can not convert time', '時間轉換失敗')
    }

    //timemsTZ2expire, opt原樣傳遞, 兩種模式之回傳形狀皆由其產生
    return timemsTZ2expire(t, tNow, opt)
}


export default timeTZ2expire
