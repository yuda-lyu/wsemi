import isenum from './isenum.mjs'
import iseint from './iseint.mjs'
import parseNumOpt from './_numOpt.mjs'


//本檔為內部使用, 不由index匯出


/**
 * opt類數值參數之檢測與預設(單一擁有者), 供第221項第二批各函數共用, 不各自手寫
 *
 * 規格: 主控dspec〈輸入參數之檢測機制〉K3(opt類參數遇非預期之輸入視為未給、改用預設, 含超出範圍; opt.debug警告)、V5、§7.1
 *
 * 使用者2026-10-31: opt類參數(opt之鍵, 以及JSDoc標[參數=預設]或程式碼有回退之位置參數)給了非預期之輸入(含超出範圍)時, 視為未給、改用預設, 不報錯;
 * 必須參數遇非預期之輸入才報錯(不使用本函數, 各函數自行判定)
 *
 * 規則:
 *   v為undefined或null視為未給, 回傳預設
 *   有效(rule.kind為'enum'以isenum判定, 為'eint'以iseint判定, rule.chk為其opt, 如{ use: 'timer', gt: 0 })則回傳Number(v), 即去頭尾空白後Number(…)取值(K4), 其後只用轉換值
 *   非預期(含超出範圍、Infinity、包裝物件、'0x10'等isenum/iseint拒收者)回傳預設, 不拋錯
 *   debug: 呼叫端傳入其opt(opt.debug === true, 非布林視為false)時, 非預期另輸出警告, 警告出口為opt.funLog(函數)或console.warn; 警告為固定詞彙,
 *     只含函數名、參數名、種類描述與所採之預設(程式常數), 不含傳入之值(K9、V20); 同一函數、同一參數每個行程只警告一次(與_numOpt.mjs共用去重表, parseNumOpt.resetWarned()可重設)
 *   位置參數無法帶debug者(呼叫端無opt)不傳opt, 即不警告
 *
 * @param {*} v 輸入原值(呼叫端已自opt讀出, 每個鍵只讀一次)
 * @param {*} def 輸入預設值(未給或非預期時回傳)
 * @param {Object} rule 輸入規則物件(建議於模組層建立一次, 不在熱路徑配置): { fn: 函數名, name: 參數名(如'opt.timeInterval'或'interval'), kind: 'enum'或'eint', chk: isenum/iseint之opt, defDesc: 預設值之警告描述(選用, 預設依def型別) }
 * @param {*} [opt] 輸入呼叫端之opt(供讀取debug與funLog), 未給則不警告
 * @returns {*} 回傳有效數字(Number)或預設值
 */
function optVal(v, def, rule, opt) {

    //未給
    if (v === undefined || v === null) {
        return def
    }

    //判定, 有效則取值
    let ok = rule.kind === 'eint' ? iseint(v, rule.chk) : isenum(v, rule.chk)
    if (ok) {
        return Number(v)
    }

    //非預期之輸入, 視為未給、改用預設; debug時警告
    if (opt !== undefined && opt !== null) {
        warnInvalid(rule, def, opt)
    }
    return def
}


//讀取opt.debug與opt.funLog(讀取拋錯一律視為未給), debug為true才警告
function warnInvalid(rule, def, opt) {
    let debug = false
    let funLog = null
    try {
        if (typeof opt === 'object' || typeof opt === 'function') {
            debug = opt.debug === true
            if (debug) {
                let f = opt.funLog
                funLog = typeof f === 'function' ? f : null
            }
        }
    }
    catch (err) {
        debug = false
    }
    if (!debug) {
        return
    }
    let msg = `[wsemi ${rule.fn}] invalid ${rule.name}: must be ${getDesc(rule)}, using default ${getDefDesc(rule, def)}`
    parseNumOpt.warnOnce(`${rule.fn}|invalid|${rule.name}`, msg, { fn: rule.fn, reason: 'invalid', key: rule.name }, funLog)
}


//規則之種類描述(固定詞彙, 取自程式常數): a valid number / a valid integer, 後接範圍
function getDesc(rule) {
    let s = rule.kind === 'eint' ? 'a valid integer' : 'a valid number'
    let c = rule.chk
    if (c === undefined || c === null) {
        return s
    }
    let ps = []
    if (c.use !== undefined) {
        ps.push(`use '${c.use}'`)
    }
    for (let k of ['min', 'max', 'gt', 'lt']) {
        if (c[k] !== undefined) {
            ps.push(`${k} ${c[k]}`)
        }
    }
    return ps.length > 0 ? `${s} (${ps.join(', ')})` : s
}


//預設值之描述(程式常數): 數字、null、字串或rule.defDesc
function getDefDesc(rule, def) {
    if (typeof rule.defDesc === 'string') {
        return rule.defDesc
    }
    if (def === null) {
        return 'null'
    }
    if (typeof def === 'number' || typeof def === 'boolean') {
        return String(def)
    }
    if (typeof def === 'string') {
        return `'${def}'`
    }
    return typeof def
}


optVal.getDesc = getDesc


export default optVal
