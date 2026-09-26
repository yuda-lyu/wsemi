import get from 'lodash-es/get.js'
import isnum from './isnum.mjs'
import cst from './_const.mjs'


//本檔為內部使用, 不由index匯出


/**
 * 取設定物件之數值選項, 無效時回傳預設值; 供各函數之數值選項共用同一套規則, 不各自手寫檢查
 *
 * 數字與數字字串皆可(isnum), 字串先轉為數字再判定, 例如'12.34'為12.34、'5'為5、' 7 '為7; 空字串、純空白字串、非數字字串、NaN、null、布林等皆非isnum, 一律用預設
 * 以Number轉換後判定, 不用cdbl: cdbl把Infinity轉為有限之Number.MAX_VALUE, 會使有限與否之判定失效
 * 低於下界(min, minOpen為true時須大於min)者用預設, below為'clamp'時改夾至下界
 * +Infinity依意圖處置: timer之計時器毫秒夾至計時器上限(同delay, 見_const.mjs), inf為'keep'者保留(例如容許誤差之無限大即任何變化皆容許), 其餘用預設; NaN用預設, -Infinity視為低於下界
 * int為true時須為整數(Infinity依上一條處置)
 * timer為true時有效值再以Math.min夾至計時器上限: 超大值之意圖為「很久」, 夾至上限最接近其意圖, 不視為無效
 *
 * @param {Object} opt 輸入設定物件
 * @param {String} key 輸入選項鍵名
 * @param {Number} def 輸入無效時之預設值
 * @param {Object} [rule={}] 輸入規則物件
 * @param {Number} [rule.min=-Infinity] 輸入下限
 * @param {Boolean} [rule.minOpen=false] 輸入是否不含下限(須大於min)
 * @param {String} [rule.below='def'] 輸入低於下限時之處置, 'def'為用預設, 'clamp'為夾至下限(minOpen為true時仍用預設)
 * @param {Boolean} [rule.int=false] 輸入是否須為整數
 * @param {Boolean} [rule.timer=false] 輸入是否為計時器毫秒(夾至上限)
 * @param {String} [rule.inf='def'] 輸入非計時器之+Infinity之處置, 'def'為用預設, 'keep'為保留
 * @returns {Number} 回傳數字
 */
function optNum(opt, key, def, rule = {}) {
    let min = get(rule, 'min', -Infinity)
    let minOpen = get(rule, 'minOpen', false) === true
    let clamp = get(rule, 'below', 'def') === 'clamp'
    let int = get(rule, 'int', false) === true
    let timer = get(rule, 'timer', false) === true
    let keepInf = get(rule, 'inf', 'def') === 'keep'

    //v, 數字或數字字串(isnum已排除NaN、空字串與純空白字串), 字串轉為數字
    let v = get(opt, key, null)
    if (!isnum(v)) {
        return def
    }
    v = Number(v)

    //check min
    if (minOpen ? !(v > min) : !(v >= min)) {
        return (clamp && !minOpen && Number.isFinite(min)) ? min : def
    }

    //check Infinity
    if (v === Infinity) {
        if (timer) {
            return cst.TIMER_TIME_MAX
        }
        return keepInf ? Infinity : def
    }
    if (!Number.isFinite(v)) {
        return def
    }

    //check int
    if (int && !Number.isInteger(v)) {
        return def
    }

    //timer
    if (timer) {
        v = Math.min(v, cst.TIMER_TIME_MAX)
    }

    return v
}


export default optNum
