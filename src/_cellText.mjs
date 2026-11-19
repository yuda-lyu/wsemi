import o2j from './o2j.mjs'


//本檔為內部使用, 不由index匯出


/**
 * 儲存格之文字表示法(單一擁有者, 供ltdtkeys2mat(及經其之ltdtkeysheads2mat)、arrDiff(及經其之matDiff、ltdtDiff)共用, 不各寫一份)
 *
 * 規格: 使用者2026-11-15(排程第430項第三批, 裁定表〈四、ltdtkeys2mat〉〈七、arrDiff〉; dspec〈輸入參數之檢測機制〉§11〈第三批〉之「儲存格文字表示法一致」):
 *   字串與有限數字原值(ltdtkeys2mat回原值, arrDiff取其文字)、布林'true'/'false'、null為'null'、NaN與±Infinity為字串'NaN'/'Infinity'/'-Infinity'、
 *   物件與陣列為JSON(arrDiff為鍵排序後之JSON)、Date為ISO字串(不帶引號)、函數視為null即'null'、BigInt為String(v);
 *   undefined(與陣列空位)為缺值, 本函數回傳undefined, 由呼叫端決定(ltdtkeys2mat給opt.empty, arrDiff為'')
 *
 * 裁定表未列而沿用修前或同類者(ws430c, 列入報告待主控確認): Symbol比照函數視為null即'null'; 無效之Date(getTime為NaN)為'null'(同JSON); 包裝物件(以內部槽判定)String/Number依修前之原值(arrDiff取String(v)), Boolean包裝以其原始布林值, 偽造型別標籤之一般物件照物件為JSON;
 *   物件序列化失敗(含BigInt、循環參照)為''(同o2j失敗)
 *
 * @param {*} v 輸入儲存格之值
 * @param {Boolean} [sortKeys=false] 輸入物件與陣列是否以鍵排序後之JSON表示(arrDiff為true)
 * @returns {String|Number|*} 回傳表示值(字串、有限數字, 或包裝物件原值), v為undefined時回傳undefined
 */
function cellRep(v, sortKeys = false) {
    if (v === undefined) {
        return undefined
    }
    let t = typeof v
    if (t === 'string') {
        return v
    }
    if (t === 'number') {
        return Number.isFinite(v) ? v : String(v)
    }
    if (t === 'boolean') {
        return v ? 'true' : 'false'
    }
    if (t === 'function' || t === 'symbol') {
        return 'null' //函數視為null(不執行、不序列化); Symbol比照
    }
    if (t === 'bigint') {
        return String(v)
    }
    if (v === null) {
        return 'null'
    }

    //Date, 以內部槽判定(Date.prototype.getTime對非Date拋錯), 不依instanceof或toStringTag
    let tm = dateTime(v)
    if (tm !== undefined) {
        return Number.isNaN(tm) ? 'null' : new Date(tm).toISOString()
    }

    //包裝物件(R-WRAPPER-01規則5, 顯式拆包處; 判斷函數不拆包): 以內部槽判定(偽造Symbol.toStringTag之一般物件不算, 照物件為JSON; ws430c2外審T9), Boolean包裝以其原始布林值, String/Number包裝依修前之原值
    let b = boolOf(v)
    if (b !== undefined) {
        return b ? 'true' : 'false'
    }
    if (strOf(v) !== undefined || numOf(v) !== undefined) {
        return v
    }

    //物件與陣列
    if (sortKeys) {
        let s
        try {
            s = stableStringify(v)
        }
        catch (err) {
            s = undefined
        }
        return s === undefined ? '' : s
    }
    return o2j(v)
}


/**
 * 儲存格之比對文字(arrDiff用): 依cellRep(鍵排序後之JSON)取表示後轉字串, 缺值(undefined、空位)為''
 *
 * @param {*} v 輸入儲存格之值
 * @returns {String} 回傳文字
 */
function cellText(v) {
    let r = cellRep(v, true)
    if (r === undefined) {
        return ''
    }
    if (typeof r === 'string') {
        return r
    }
    try {
        return String(r)
    }
    catch (err) {
        return ''
    }
}


//dateTime, Date物件回傳其時間值(可為NaN), 非Date回傳undefined
function dateTime(v) {
    try {
        return Date.prototype.getTime.call(v)
    }
    catch (err) {
        return undefined
    }
}


//boolOf, Boolean包裝物件回傳其原始布林值, 非Boolean物件回傳undefined(以內部槽判定, valueOf對非Boolean拋錯)
function boolOf(v) {
    try {
        return Boolean.prototype.valueOf.call(v)
    }
    catch (err) {
        return undefined
    }
}


//strOf, String包裝物件回傳其原始字串, 否則undefined(以內部槽判定)
function strOf(v) {
    try {
        return String.prototype.valueOf.call(v)
    }
    catch (err) {
        return undefined
    }
}


//numOf, Number包裝物件回傳其原始數字, 否則undefined(以內部槽判定)
function numOf(v) {
    try {
        return Number.prototype.valueOf.call(v)
    }
    catch (err) {
        return undefined
    }
}


//isPlainObj, 一般物件(原型為null, 或原型之原型為null且原型自有isPrototypeOf), 同_numOpt.mjs之判定; dspec §4 V4: opt非一般物件視為未給
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


//canon, 對JSON.parse所得之值(只含null、布林、數字、字串、陣列、物件)輸出鍵排序後之JSON字串, 陣列依原順序
function canon(x) {
    if (Array.isArray(x)) {
        return '[' + x.map(canon).join(',') + ']'
    }
    if (x !== null && typeof x === 'object') {
        return '{' + Object.keys(x).sort().map((k) => JSON.stringify(k) + ':' + canon(x[k])).join(',') + '}'
    }
    return JSON.stringify(x)
}


/**
 * 鍵排序後之JSON(遞迴排序巢狀物件之鍵, 陣列依原順序; 單一擁有者, 供ltdtDiffByKey之內容比對與arrDiff之儲存格文字共用):
 * 先以JSON.stringify取得JSON語意(undefined欄位省略、NaN與Infinity為null、Date經toJSON為ISO字串、Map與Set為{}、包裝物件為其值), 再JSON.parse後排序鍵輸出(JSON.parse之__proto__鍵為自有欄位);
 * 序列化失敗(BigInt、循環參照等)照JSON.stringify拋錯, JSON.stringify回傳undefined(函數等)時回傳undefined
 *
 * @param {*} v 輸入值
 * @returns {String|undefined} 回傳鍵排序後之JSON字串
 */
function stableStringify(v) {
    let s = JSON.stringify(v)
    if (s === undefined) {
        return s
    }
    return canon(JSON.parse(s))
}


/**
 * 取物件之自有可列舉同名欄位之值(不解析路徑、不取繼承鍵), 無此欄位回傳undefined
 *
 * @param {Object} o 輸入物件
 * @param {String} k 輸入欄位名
 * @returns {*} 回傳欄位值或undefined
 */
function getOwn(o, k) {
    if (o === null || o === undefined) {
        return undefined
    }
    if (!Object.prototype.propertyIsEnumerable.call(o, k)) {
        return undefined
    }
    return o[k]
}


/**
 * 讀取opt之填充值類鍵(如opt.empty、opt.emptyHead; dspec〈輸入參數之檢測機制〉§4): opt非一般物件(含陣列、Date、類別實例)視為未給(V4); 鍵只讀一次, 讀取拋錯或undefined取預設; 函數值視為null(不執行、不複製); null與其他值原樣(中性、可設定之預設值)
 *
 * @param {Object} opt 輸入設定物件
 * @param {String} key 輸入鍵名
 * @param {*} def 輸入預設值
 * @returns {*} 回傳填充值
 */
function readFill(opt, key, def) {
    let v
    try {
        if (isPlainObj(opt)) {
            v = opt[key]
        }
    }
    catch (err) {
        v = undefined
    }
    if (v === undefined) {
        return def
    }
    if (typeof v === 'function') {
        return null
    }
    return v
}


let _cellText = {
    cellRep,
    cellText,
    stableStringify,
    getOwn,
    readFill,
}


export default _cellText
