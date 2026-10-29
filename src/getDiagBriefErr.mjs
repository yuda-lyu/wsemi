import { ERR_TYPES, CODES } from './_diagCodes.mjs'
import { isObjLike, isProxy, isErr, className, ownData, gd, hasOwn, arrVals } from './_diagKit.mjs'


//readArr, 讀設定之陣列(鍵與陣列項皆只讀自有資料屬性, 不執行getter; 可偵測之Proxy不讀)
let readArr = (opt, k) => {
    try {
        if (!isObjLike(opt) || isProxy(opt)) {
            return []
        }
        let d = gd(opt, k)
        return d !== undefined && hasOwn(d, 'value') && Array.isArray(d.value) && !isProxy(d.value) ? arrVals(d.value, false).filter((v) => typeof v === 'string') : []
    }
    catch (err) {
        return []
    }
}


//isCode, 代碼是否在允許之集合內(SYS、NODE恆含, 其餘依宣告之集合名稱); 字串與整數皆只收明列者
let isCode = (c, names) => {
    if (typeof c !== 'string' && !(typeof c === 'number' && Number.isInteger(c))) {
        return false
    }
    for (let n of ['SYS', 'NODE', ...names]) {
        if (Object.prototype.hasOwnProperty.call(CODES, n) && CODES[n].indexOf(c) >= 0) {
            return true
        }
    }
    return false
}


/**
 * 錯誤之安全摘要：只列錯誤類別與白名單內之錯誤代碼，不含訊息文字與資料值，供診斷輸出之預設摘要(safe)使用
 *
 * 規則見sgud/rule/rulebook_diag.md之R-DIAG-01。errType: 非物件為typeof名稱('string'、'number'、'boolean'、'undefined'、'bigint'、'symbol')、null為'null'、函數為'function'；
 * 可偵測之Proxy為'Proxy'(不觸發陷阱)；原生錯誤(util.types.isNativeError，含跨realm；無util時以有界原型鏈可達Error.prototype判定)取類別名
 * (原型鏈首個name若為字串資料屬性且非Error即取之，否則首個自有資料constructor之自有資料name)，僅在內建錯誤類別名或opt.types所列者照列，其餘一律'Error'；其他物件為'object'
 *
 * errCode: 取自有資料屬性code(不執行getter)，不在允許集合者依序取opt.nested各鍵所指物件之自有資料code(深度1)；允許集合為系統錯誤名(SYS)、Node內部與TLS代碼(NODE)與opt.codes所宣告之集合
 * (sqlstate、sqlite、mysql、mssql、mongo、mongoServer、lmdb、level)，不用任何樣式，整數只收集合明列者(mongoServer、mssql)
 *
 * 回傳以物件字面值一次建成{ errType }或{ errType, errCode }；內部任何失敗回{ errType: 'unknown' }；不執行使用端程式、永不拋錯
 *
 * 已知限制: 無util.types時Proxy不可偵測(判定原型鏈時其陷阱可能被執行)；跨realm錯誤於無util時以有界原型鏈判定
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/getDiagBriefErr.test.mjs Github}
 * @memberOf wsemi
 * @param {*} e 輸入錯誤或任意值
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Array} [opt.codes=[]] 輸入另允許之代碼集合名稱陣列，預設[]
 * @param {Array} [opt.types=[]] 輸入另允許之錯誤類別名陣列，預設[]
 * @param {Array} [opt.nested=[]] 輸入另讀其code之巢狀錯誤鍵陣列，如['original','parent']，預設[]
 * @returns {Object} 回傳摘要物件{ errType, errCode? }
 * @example
 *
 * let e = new Error('connect failed')
 * e.code = 'ECONNREFUSED'
 * console.log(getDiagBriefErr(e))
 * // => { errType: 'Error', errCode: 'ECONNREFUSED' }
 *
 * let e2 = new Error('dup')
 * e2.code = '23505'
 * console.log(getDiagBriefErr(e2), getDiagBriefErr(e2, { codes: ['sqlstate'] }))
 * // => { errType: 'Error' } { errType: 'Error', errCode: '23505' }
 *
 */
function getDiagBriefErr(e, opt) {
    try {
        let codes = readArr(opt, 'codes')
        let types = readArr(opt, 'types')
        let nested = readArr(opt, 'nested')
        let errType
        if (e === null) {
            errType = 'null'
        }
        else if (typeof e === 'function') {
            errType = 'function'
        }
        else if (typeof e !== 'object') {
            errType = typeof e
        }
        else if (isProxy(e)) {
            return { errType: 'Proxy' }
        }
        else if (isErr(e)) {
            let cn = className(e)
            errType = ERR_TYPES.indexOf(cn) >= 0 || types.indexOf(cn) >= 0 ? cn : 'Error'
        }
        else {
            errType = 'object'
        }
        let c = ownData(e, 'code')
        if (!isCode(c, codes)) {
            c = undefined
            for (let k of nested) {
                let x = ownData(ownData(e, k), 'code')
                if (isCode(x, codes)) {
                    c = x
                    break
                }
            }
        }
        return c === undefined ? { errType } : { errType, errCode: c }
    }
    catch (err) {
        return { errType: 'unknown' }
    }
}


export default getDiagBriefErr
