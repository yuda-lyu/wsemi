import getDiagSecrets from './getDiagSecrets.mjs'
import maskDiagText from './maskDiagText.mjs'
import maskDiagCopy from './maskDiagCopy.mjs'
import maskDiagErr from './maskDiagErr.mjs'
import getDiagBriefErr from './getDiagBriefErr.mjs'
import getDiagShape from './getDiagShape.mjs'
import pmMarkHandled from './_pmMarkHandled.mjs'
import { MASK, NONE, isObjLike, isProxy, gd, hasOwn, declOf, normLabel, normSafe, MODE_KEY, markHandled, markDropped, arrVals, pickList } from './_diagKit.mjs'


//readOpt, 讀設定之一個鍵(各自try; 讀取拋錯或不存在為undefined)
let readOpt = (o, k) => {
    try {
        if (!isObjLike(o)) {
            return undefined
        }
        return o[k]
    }
    catch (err) {
        return undefined
    }
}


//readCfg, 讀套件宣告之一個鍵(自有資料屬性)
let readCfg = (cfg, k) => {
    try {
        if (!isObjLike(cfg) || isProxy(cfg)) {
            return undefined
        }
        let d = gd(cfg, k)
        return d !== undefined && hasOwn(d, 'value') ? d.value : undefined
    }
    catch (err) {
        return undefined
    }
}


//arrItems, 宣告類陣列之項(自有資料屬性, 不執行getter, 存取器之項略過; 非陣列、可偵測之Proxy或讀取拋錯〔已撤銷之Proxy〕為null: 宣告類無法讀取者略過, 不影響秘密清單)
let arrItems = (v) => {
    try {
        if (isProxy(v) || !Array.isArray(v)) {
            return null
        }
        return arrVals(v, false)
    }
    catch (err) {
        return null
    }
}


//UNREADABLE, 套件宣告之secrets無法讀取(cfg或其原型為可偵測之Proxy、secrets為存取器〔含類別原型上之getter〕、讀取拋錯)
const UNREADABLE = Symbol('unreadable')


//readSecrets, 讀套件宣告之secrets(自有或繼承之資料屬性): 未宣告(cfg非物件、原型鏈至Object.prototype皆無此鍵)為undefined; 無法讀取為UNREADABLE(秘密取不到, 呼叫端fail-closed; 不執行getter、不觸發可偵測之Proxy之陷阱)
let readSecrets = (cfg) => {
    try {
        if (!isObjLike(cfg)) {
            return undefined
        }
        let v = declOf(cfg, 'secrets')
        return v === NONE ? undefined : v
    }
    catch (err) {
        return UNREADABLE
    }
}


//strArr, 字串陣列之複本(非陣列為[])
let strArr = (v) => {
    let a = arrItems(v)
    return a === null ? [] : a.filter((x) => typeof x === 'string')
}


//toLists, 秘密參數轉兩份清單(同pickList之規則: getDiagSecrets之結果、陣列(兩清單同)、undefined與null(空); 其餘拋出, 由getLists轉為fail-closed)
//清單原樣沿用(getDiagSecrets之凍結清單可沿用比對器快取)
let toLists = (s) => {
    return { detail: pickList(s, 'detail'), reject: pickList(s, 'reject') }
}


//mergeLists, 合併兩組清單(以自有資料屬性讀取, 存取器之項拋出; 凍結, 使比對器可快取)
let mergeLists = (a, b) => {
    return { detail: Object.freeze([...arrVals(a.detail, true), ...arrVals(b.detail, true)]), reject: Object.freeze([...arrVals(a.reject, true), ...arrVals(b.reject, true)]) }
}


//isFrozenList, 凍結之清單(內容不再改變, 合併結果可依身分沿用)
let isFrozenList = (v) => {
    try {
        return Object.isFrozen(v)
    }
    catch (err) {
        return false
    }
}


//build, 建diag函數(snap為讀opt所得之快照, base為套件宣告, extra為with併入之來源清單)
let build = (snap, base, extra) => {
    let { logDetail, funLog, noDetail } = snap
    let { secrets, codes, types, nested, patterns, safeKeys } = base
    let pat = { patterns }
    let patRej = { patterns, [MODE_KEY]: 'reject' }

    //getLists, 取當下之秘密清單(函數形式者每次呼叫); 取不到(宣告無法讀取、函數拋錯、函數回傳undefined/null或不合、已撤銷之Proxy)為null, 呼叫端fail-closed
    //with併入之清單: 來源兩清單皆凍結時依其身分快取合併結果(沿用同一份凍結清單); 未凍結者(可被原地修改, 如權杖簿)每次重新合併
    let last = null
    let getLists = () => {
        try {
            if (secrets === UNREADABLE || extra === UNREADABLE) {
                return null
            }
            let s = secrets
            if (typeof secrets === 'function') {
                s = secrets()
                markHandled(s, pmMarkHandled) //回傳之原生Promise(含rejected)標記已處理(其為不合之回傳, fail-closed)
                if (s === undefined || s === null) {
                    return null //函數形式之秘密回傳空值視為取不到(不當作未宣告)
                }
            }
            let r = toLists(s)
            if (extra === null) {
                return r
            }
            if (last !== null && last.d === r.detail && last.j === r.reject) {
                return last.m
            }
            let m = mergeLists(r, extra)
            last = isFrozenList(r.detail) && isFrozenList(r.reject) ? { d: r.detail, j: r.reject, m } : null
            return m
        }
        catch (err) {
            return null
        }
    }

    let diag = (label, safe, getDetail, level) => {
        try {
            let lb = normLabel(label)
            let sf = normSafe(safe, safeKeys)
            let hasDetail = typeof getDetail === 'function'

            //getD, 完整細節(遮罩後); 只在需要時取得
            let getD = () => {
                let d
                try {
                    d = getDetail()
                    markHandled(d, pmMarkHandled) //回傳之原生Promise(含rejected)標記已處理(細節為[Promise])
                }
                catch (err) {
                    return '(unprintable)'
                }
                let ls = getLists()
                return ls === null ? '(unprintable)' : maskDiagCopy(d, ls.detail, pat)
            }

            //funLog, 取代console輸出
            if (funLog !== null) {
                try {
                    let r = hasDetail && !noDetail ? funLog(lb, sf, getD()) : funLog(lb, sf)
                    markHandled(r, pmMarkHandled)
                }
                catch (err) {
                    //放棄輸出
                }
                return
            }

            //console, 預設為安全摘要; logDetail為true且有細節時改為細節
            let m = level === 'error' ? 'error' : 'log'
            let fn = null
            try {
                fn = console[m]
            }
            catch (err) {
                fn = null
            }
            if (typeof fn !== 'function') {
                return
            }
            try {
                if (logDetail && hasDetail) {
                    fn.call(console, lb, getD())
                }
                else if (sf === undefined) {
                    fn.call(console, lb)
                }
                else {
                    fn.call(console, lb, sf)
                }
            }
            catch (err) {
                try {
                    fn.call(console, lb, '(unprintable)')
                }
                catch (err2) {
                    //放棄輸出
                }
            }
        }
        catch (err) {
            //全程不使呼叫端流程拋錯
        }
    }

    //秘密清單取不到時fail-closed: 文字為***、拷貝為[Uncopyable]、對外錯誤值為new Error('***')
    diag.brief = (err) => getDiagBriefErr(err, { codes, types, nested })
    //形狀摘要(只輸出型別、長度與鍵名, 永不輸出值; 與秘密清單無關, 取不到清單時亦照常)
    diag.shape = (v, o) => getDiagShape(v, o)
    //(取不到時輸入不交出: 原生Promise以markDropped標記已處理)
    diag.mask = (text) => {
        let ls = getLists()
        if (ls === null) {
            markDropped(text)
            return typeof text === 'string' ? MASK : new Error(MASK)
        }
        //字串以文字遮罩; 非字串(如回給遠端之msg為Error)以對外錯誤值之規則
        return typeof text === 'string' ? maskDiagText(text, ls.reject, patRej) : maskDiagErr(text, ls.reject, pat)
    }
    diag.copy = (v) => {
        let ls = getLists()
        if (ls === null) {
            markDropped(v)
            return '[Uncopyable]'
        }
        return maskDiagCopy(v, ls.detail, pat)
    }
    diag.err = (v) => {
        let ls = getLists()
        if (ls === null) {
            markDropped(v)
            return typeof v === 'string' ? MASK : new Error(MASK)
        }
        return maskDiagErr(v, ls.reject, pat)
    }
    diag.with = (src) => {
        //併入之來源無法讀取(getDiagSecrets之結果帶失敗標記)時, 新diag之清單恆為取不到(fail-closed); 永不拋錯
        let ex = UNREADABLE
        try {
            if (extra !== UNREADABLE) {
                let add = toLists(getDiagSecrets(src))
                ex = extra === null ? add : mergeLists(extra, add)
            }
        }
        catch (err) {
            ex = UNREADABLE
        }
        return build(snap, base, ex)
    }
    return diag
}


/**
 * 診斷輸出之出口：套件之一切診斷輸出(console與使用端funLog)皆經回傳之diag，預設只輸出安全摘要，細節必經遮罩，永不使呼叫端流程拋錯
 *
 * 規則見sgud/rule/rulebook_diag.md之R-DIAG-01。opt為使用端設定(任何值皆可，各鍵各自try讀取，建構時取快照其後不再讀)：opt.logDetail須===true才生效；opt.funLog須為函數才生效，給予時診斷輸出只交給它(不寫console，logDetail不作用)；
 * funLog帶noDetail===true屬性者(genDiagFunLog所產生者即是)不呼叫getDetail、不做拷貝
 *
 * cfg為套件宣告：secrets(getDiagSecrets之結果、字串陣列，或回傳其一之函數——每次輸出時呼叫，如權杖簿)、codes、types、nested(同getDiagBriefErr)、patterns(同maskDiagText)、
 * safeKeys(safe會用到之鍵名陣列，恆含errType、errCode；白名單外之鍵丟棄，未宣告時只留errType、errCode)；套件宣告只讀自有資料屬性，無法讀取者不拋錯(秘密視為取不到)
 *
 * diag(label, safe, getDetail, level): label為固定詞彙(非字串為'(label)'，控制字元換?，至多200字元，不做文字遮罩)；safe為摘要純物件(只取自有可列舉資料屬性，值限字串至多200字元、有限數字、布林、null、陣列至多20項與至多2層之純物件，不做文字遮罩、不執行使用端程式)；
 * getDetail為回傳細節之函數(惰性，只在funLog或logDetail需要時呼叫一次，拋錯為'(unprintable)'，取得後必經maskDiagCopy以detail清單遮罩)；level為'error'時寫console.error，其餘任何值寫console.log
 *
 * 出口：funLog→funLog(label, safe, detail)(無getDetail或noDetail時為2引數)，其回傳之原生Promise經_pmMarkHandled標記已處理(不呼叫一般thenable之then)、同步拋錯吞下；
 * 否則logDetail且有getDetail→console[level](label, detail)；否則console[level](label)或console[level](label, safe)；console拋錯時以(label, '(unprintable)')退一次，再失敗放棄
 *
 * 回傳之diag另帶: diag.brief(err)(getDiagBriefErr)、diag.shape(v, opt)(getDiagShape：資料值之形狀摘要，只輸出型別、長度與鍵名，永不輸出值，與秘密清單無關)、diag.mask(text)(對外文字之遮罩，用reject清單，不用路徑類樣式；非字串如Error依maskDiagErr之規則)、diag.copy(v)(maskDiagCopy，用detail清單)、diag.err(v)(maskDiagErr，用reject清單；對外reject、throw、'error'事件前必經)、
 * diag.with(src)(回傳併入額外秘密來源之新diag)
 *
 * cfg之secrets讀自有或繼承(至Object.prototype止)之資料屬性；宣告類參數(codes、types、nested、patterns、safeKeys)無法讀取(已撤銷之Proxy等)者略過，不影響秘密清單
 *
 * fail-closed：秘密清單取不到(cfg或其原型為可偵測之Proxy、secrets為存取器〔含類別原型上之getter〕、secrets函數拋錯或回傳undefined/null/不合之值、清單為可偵測之Proxy或含存取器或可偵測之Proxy之項、來源無法讀取之getDiagSecrets結果、已撤銷之Proxy、with併入之來源無法讀取)時，
 * 細節為'(unprintable)'、diag.mask為***、diag.copy為[Uncopyable]、diag.err為new Error('***')(字串為***)；secrets函數、getDetail回傳之原生Promise標記已處理
 *
 * 已知限制: funLog回傳之原生Promise其constructor或species為拋錯之getter時無法標記，跨realm之Promise不標記；無util.types時Proxy不可偵測
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/getDiag.test.mjs Github}
 * @memberOf wsemi
 * @param {Object} [opt={}] 輸入使用端設定物件，讀其logDetail與funLog，預設{}
 * @param {Boolean} [opt.logDetail=false] 輸入是否於console輸出遮罩後之細節，預設false
 * @param {Function} [opt.funLog=null] 輸入診斷輸出函數，格式為(label, safe, detail)=>{}，預設null
 * @param {Object} [cfg={}] 輸入套件宣告物件，預設{}
 * @param {Object|Array|Function} [cfg.secrets=[]] 輸入秘密清單，預設[]
 * @param {Array} [cfg.codes=[]] 輸入另允許之代碼集合名稱陣列，預設[]
 * @param {Array} [cfg.types=[]] 輸入另允許之錯誤類別名陣列，預設[]
 * @param {Array} [cfg.nested=[]] 輸入另讀其code之巢狀錯誤鍵陣列，預設[]
 * @param {Array} [cfg.patterns=[]] 輸入套件樣式陣列，預設[]
 * @param {Array} [cfg.safeKeys=[]] 輸入safe之鍵名白名單陣列(恆含errType、errCode)，預設[]
 * @returns {Function} 回傳診斷輸出函數diag(label, safe, getDetail, level)，並帶brief、shape、mask、copy、err、with方法
 * @example
 *
 * let ss = getDiagSecrets({ urls: ['postgres://u1:pw1234@db:5432/app'] })
 * let diag = getDiag({ logDetail: true }, { secrets: ss, safeKeys: ['mode'] })
 * let err = new Error('auth failed for postgres://u1:pw1234@db:5432/app')
 * diag('select failed', { mode: 'select', ...diag.brief(err) }, () => err)
 * // console.log('select failed', [Error: auth failed for ***] ...)
 *
 * console.log(diag.err(err).message)
 * // => 'auth failed for ***'
 *
 */
function getDiag(opt, cfg) {
    let logDetail = readOpt(opt, 'logDetail') === true
    let funLog = readOpt(opt, 'funLog')
    funLog = typeof funLog === 'function' ? funLog : null
    let noDetail = funLog !== null && readOpt(funLog, 'noDetail') === true
    let base = null
    try {
        let pats = arrItems(readCfg(cfg, 'patterns'))
        base = {
            secrets: readSecrets(cfg), //無法讀取者為UNREADABLE(fail-closed), 未宣告者為undefined(空清單)
            codes: strArr(readCfg(cfg, 'codes')),
            types: strArr(readCfg(cfg, 'types')),
            nested: strArr(readCfg(cfg, 'nested')),
            patterns: pats === null ? [] : pats,
            safeKeys: strArr(readCfg(cfg, 'safeKeys')), //未宣告為[](只留errType、errCode)
        }
    }
    catch (err) {
        //套件宣告無法讀取: 秘密取不到(fail-closed), 其餘為預設
        base = {
            secrets: () => {
                throw err
            },
            codes: [],
            types: [],
            nested: [],
            patterns: [],
            safeKeys: []
        }
    }
    return build({ logDetail, funLog, noDetail }, base, null)
}


export default getDiag
