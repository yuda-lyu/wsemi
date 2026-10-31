//本檔為內部使用, 不由index匯出


/**
 * isenum與iseint共用之opt解析(單一擁有者)
 *
 * 規格: 主控dspec〈輸入參數之檢測機制〉K3(非預期之輸入視為未給, 改用預設; opt.debug警告)、§4 V4~V7、V11、§6 V20、§7.1
 *
 * opt為選填之設定, 非預期之輸入一律視為未給、改用預設, 不拋錯(使用者 2026-10-31: 「isenum/iseint 自己的 opt 也是給預設」):
 *   opt為undefined或null視為未給(呼叫端不進入本函數)
 *   opt須為一般物件(原型為Object.prototype或null, 不含陣列、類別實例、包裝物件、Date等), 否則整份視為{}
 *   各鍵為undefined或null視為未給; 給了而不屬該鍵之種類者視為未給(use改用預設)
 *   未宣告之鍵忽略(本函數不轉傳opt, 故於debug時提示, 如誤拼之minExlusive)
 *   每個鍵只讀一次(快照), 讀取拋錯(存取器)視為該鍵無效
 *   範圍為空(含與use之交集為空)時, 明確給定之界值(min、max、gt、lt)皆視為未給, use保留
 *
 * opt.debug(布林, 預設false; 非布林視為false): 為true時, 非預期之輸入另輸出警告, 說明哪個鍵因非預期已改用預設:
 *   警告出口: opt.funLog為函數者交funLog(msg, info), 否則console.warn(msg); 出口拋錯一律忽略
 *   警告為固定詞彙, 只含函數名、鍵名(僅短識別字)、種類描述與所採之預設(程式常數), 不含傳入之值(K9、V20)
 *   同一函數、同一鍵、同一原因每個行程只警告一次(逐筆呼叫之判斷函數不洗版); 去重表有上限, 滿了即不再警告
 *   opt本身非一般物件時整份視為{}, 讀不到debug, 故不警告
 *
 * @param {*} opt 呼叫端傳入之opt, 已確認不為undefined與null
 * @param {Object} spec 宣告表: { fn: 函數名, keys: 已宣告之鍵(Set), table: use範圍表, names: use名稱清單, useDef: 預設use或null, check: 界值檢測函數(v)=>Boolean, desc: 界值種類描述, boundKeys: 界值鍵之字串(訊息用) }
 * @returns {Object} 回傳範圍物件 { min, max, gt, lt }, 未限制者為±Infinity; min、max為含端點, gt、lt為不含端點, 皆為number
 */
function parseNumOpt(opt, spec) {

    let min = -Infinity
    let max = Infinity
    let gt = -Infinity
    let lt = Infinity
    let use = spec.useDef
    let debug = false
    let funLog = null
    let probs = null //非預期之輸入, 僅debug時才輸出: [原因, 鍵名]

    //opt本身須為一般物件, 否則整份視為{}
    let keys = null
    if (isPlainObj(opt)) {
        try {
            keys = Object.keys(opt)
        }
        catch (err) {
            keys = null
        }
    }

    //逐鍵讀取(快照)
    if (keys !== null) {
        for (let k of keys) {

            //未宣告之鍵, 忽略; 鍵名僅在為短識別字時帶入警告(鍵名非值, 但避免回顯任意長字串)
            if (!spec.keys.has(k)) {
                probs = addProb(probs, 'unknown', IDENT.test(k) ? k : '')
                continue
            }

            //讀取一次
            let v
            try {
                v = opt[k]
            }
            catch (err) {
                probs = addProb(probs, 'read', k)
                continue
            }

            //undefined與null視為未給
            if (v === undefined || v === null) {
                continue
            }

            if (k === 'debug') {
                debug = v === true //非布林視為false
                continue
            }
            if (k === 'funLog') {
                funLog = typeof v === 'function' ? v : null
                continue
            }
            if (k === 'use') {
                if (typeof v === 'string' && spec.table[v] !== undefined) {
                    use = v
                }
                else {
                    probs = addProb(probs, 'use', 'use')
                }
                continue
            }

            //min、max、gt、lt, 須為有效界值, 轉換後只用轉換值
            if (!spec.check(v)) {
                probs = addProb(probs, 'bound', k)
                continue
            }
            let n = Number(v)
            if (k === 'min') {
                min = n
            }
            else if (k === 'max') {
                max = n
            }
            else if (k === 'gt') {
                gt = n
            }
            else {
                lt = n
            }

        }
    }

    //與use取交集, 取較嚴者
    let r = use !== null ? spec.table[use] : null
    let rmin = r !== null && r.min !== undefined ? r.min : -Infinity
    let rmax = r !== null && r.max !== undefined ? r.max : Infinity
    let rgt = r !== null && r.gt !== undefined ? r.gt : -Infinity
    let rlt = r !== null && r.lt !== undefined ? r.lt : Infinity
    let emin = Math.max(min, rmin)
    let emax = Math.min(max, rmax)
    let egt = Math.max(gt, rgt)
    let elt = Math.min(lt, rlt)

    //範圍為空(含與use之交集為空), 明確給定之界值皆視為未給, use保留; 下界取min與gt之較大者, 相等時以不含端點為準
    let lo = Math.max(emin, egt)
    let hi = Math.min(emax, elt)
    if (lo > hi || (lo === hi && (egt >= emin || elt <= emax))) {
        probs = addProb(probs, 'empty', '')
        emin = rmin
        emax = rmax
        egt = rgt
        elt = rlt
    }

    //debug時輸出警告
    if (debug && probs !== null) {
        emit(probs, spec, funLog)
    }

    return { min: emin, max: emax, gt: egt, lt: elt }
}


//是否為短識別字(警告可帶入之鍵名)
let IDENT = /^[A-Za-z_$][\w$]{0,31}$/


//累積非預期之輸入
function addProb(probs, reason, key) {
    if (probs === null) {
        probs = []
    }
    probs.push([reason, key])
    return probs
}


//是否為一般物件: 原型為null, 或原型之原型為null且原型自有isPrototypeOf(即任一領域之Object.prototype)
function isPlainObj(o) {
    if (typeof o !== 'object' || o === null) {
        return false
    }
    try {
        if (Object.prototype.toString.call(o) !== '[object Object]') {
            return false
        }
        let p = Object.getPrototypeOf(o)
        if (p === null) {
            return true
        }
        return Object.getPrototypeOf(p) === null && Object.prototype.hasOwnProperty.call(p, 'isPrototypeOf')
    }
    catch (err) {
        return false
    }
}


//已警告之表(每個行程), 有上限避免呼叫端以大量不同鍵名撐大
let WARNED_MAX = 256
let warned = new Set()


//重設已警告之表(供測試)
function resetWarned() {
    warned.clear()
}


//警告訊息(固定詞彙, 不含傳入之值)
function getMsg(reason, key, spec) {
    let s = `[wsemi ${spec.fn}] `
    if (reason === 'unknown') {
        return key !== '' ? `${s}invalid opt.${key}: unknown option, ignored` : `${s}invalid opt: unknown option, ignored`
    }
    if (reason === 'read') {
        return `${s}invalid opt.${key}: cannot be read, ignored`
    }
    if (reason === 'use') {
        let ns = spec.names.map((n) => `'${n}'`).join(', ')
        return `${s}invalid opt.use: must be one of ${ns}, ${spec.useDef !== null ? `using default '${spec.useDef}'` : 'ignored'}`
    }
    if (reason === 'bound') {
        return `${s}invalid opt.${key}: must be ${spec.desc}, ignored`
    }
    return `${s}invalid opt: range is empty, ${spec.boundKeys} ignored` //empty
}


//輸出一則警告(單一出口, 供本檔與_optVal.mjs共用): 同一id每個行程只輸出一次, 去重表滿了即不再輸出; 有funLog者交funLog(msg, info), 否則console.warn(msg); 出口拋錯一律忽略
function warnOnce(id, msg, info, funLog) {
    if (warned.has(id)) {
        return
    }
    if (warned.size >= WARNED_MAX) {
        return
    }
    warned.add(id)
    try {
        if (typeof funLog === 'function') {
            let r = funLog(msg, info)

            //出口回傳thenable(如async函數)時, 其rejection一律忽略, 否則成為unhandledRejection而使行程崩潰
            if (r !== null && r !== undefined && typeof r.then === 'function') {
                r.then(undefined, () => {})
            }
        }
        else {
            console.warn(msg)
        }
    }
    catch (err) {
        //忽略
    }
}


//輸出警告: 有funLog者交funLog(msg, info), 否則console.warn(msg); 出口拋錯一律忽略
function emit(probs, spec, funLog) {
    for (let [reason, key] of probs) {
        warnOnce(`${spec.fn}|${reason}|${key}`, getMsg(reason, key, spec), { fn: spec.fn, reason, key }, funLog)
    }
}


parseNumOpt.resetWarned = resetWarned
parseNumOpt.warnOnce = warnOnce


export default parseNumOpt
