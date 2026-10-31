import numRange from './_numRange.mjs'
import parseNumOpt from './_numOpt.mjs'


//dspec 3.1數字字串之格式: 去頭尾空白後須為十進位寫法(可帶正負號、小數點、科學記號)
//注意: 規格原式為^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$, 其\d+\.?\d*於長串數字後接非法字元時為O(n^2)回溯, 此處改為等價之無歧義寫法\d+(\.\d*)?, 為線性
let RE_NUM = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/


//尾數(指數之前)是否含非零數字, 供判定下溢(轉換後為0而尾數含非零數字)
function hasNonZeroMantissa(t) {
    for (let i = 0; i < t.length; i++) {
        let c = t.charCodeAt(i)
        if (c === 101 || c === 69) { //e, E
            return false
        }
        if (c >= 49 && c <= 57) { //1~9
            return true
        }
    }
    return false
}


//有效數字之取值: 有效則回轉換後之數字, 無效回NaN(有效數字不可能為NaN, 故可作無效標記)
function enumVal(v) {
    if (typeof v === 'number') {
        return Number.isFinite(v) ? v : NaN
    }
    if (typeof v === 'string') {
        let t = v.trim()
        if (!RE_NUM.test(t)) {
            return NaN
        }
        let n = Number(t)
        if (!Number.isFinite(n)) {
            return NaN //'1e400'轉換後為Infinity
        }
        if (n === 0 && hasNonZeroMantissa(t)) {
            return NaN //'1e-400'、'4.9e-325'下溢為0
        }
        return n
    }
    return NaN
}


//界值(opt.min、max、gt、lt)之檢測: 有效數字, 不限整數與安全整數範圍
function checkBound(v) {
    return !Number.isNaN(enumVal(v))
}


let SPEC = {
    fn: 'isenum',
    keys: new Set(['use', 'min', 'max', 'gt', 'lt', 'debug', 'funLog']),
    table: numRange.ENUM_USE,
    names: numRange.ENUM_USE_NAMES,
    useDef: null,
    check: checkBound,
    desc: 'a valid number',
    boundKeys: 'min/max/gt/lt',
}


/**
 * 判斷是否為有效數字(可用於計算之數字), 並可限定範圍
 *
 * 【範疇】
 * 判斷類函數(dspec〈輸入參數之檢測機制〉§5.3 C2、§7.1): 只回傳布林、不轉換、對被檢測值v永不拋錯、不呼叫被檢測值之任何方法、包裝物件不解包。
 * 專供計算類函數於入口判定參數(有效數字, 規格 N2): 判定為true者, 取值後可直接進行數值運算。
 *
 * 何謂有效數字:
 * 1. 原始型別number, 且為有限數(排除NaN、Infinity、-Infinity)。
 * 2. 原始型別字串, 去頭尾空白後符合十進位寫法(可帶正負號、小數點、科學記號, 即/^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/), 轉換後為有限數, 且未下溢(轉換後為0而尾數含非零數字者, 如'1e-400'、'4.9e-325')。
 *
 * 與isnum之差異: isnum屬定義上之「是否為數字」, 收Infinity(經isnbr)、'Infinity'、'0x10'、'0b11'、包裝物件new Number(1), 且上述寫法經Number()轉換後即可用於計算時會出錯或失真;
 * isenum屬「對計算是否有效」, 一律不收上述各項。計算類函數判定參數請用isenum, 不要用isnum、cdbl、cint、parseFloat、Number(v)直接轉。
 * 要求整數者另見iseint。
 *
 * 【用法】
 * 1. 計算類函數之入口判定: 先判定、再取值, 其後一律使用轉換值(不得再用原字串)。取值方式為去頭尾空白後Number(…), 即 `Number(v)`(Number()本身即會去頭尾空白, 與isenum之去空白相同);
 *    判定為false者視為無效輸入, 計算類函數依規格throw Error, 不得視為0。
 * 2. 限定範圍, 以opt.min、opt.max(含端點)、opt.gt、opt.lt(不含端點)與opt.use取交集:
 *    - opt.min、opt.max、opt.gt、opt.lt: 須為有效數字(以isenum判定, 數字或數字字串皆可, 不限整數與安全整數範圍, 如1e300、0.001)。
 *    - opt.use: 依常見用途之範圍,
 *      'positive'為大於0(時間間隔、容差、標準差),
 *      'nonnegative'為大於等於0(距離、深度),
 *      'timer'為0~2147483647(計時毫秒, 可帶小數; 上限取自內部常數TIMER_TIME_MAX, 超過時Node改以1毫秒觸發), 必須為整數者改用iseint(v, { use: 'timer' }),
 *      'ratio'為0~1(機率、分位數、比例),
 *      'percent'為0~100(百分比)。
 *      未列經緯度, 多數座標為投影座標, 視需要再加。
 *    - 未給opt(或opt為undefined、null)時不配置物件, 為最快路徑。
 * 3. opt之非預期輸入視為未給、改用預設, 一律不拋錯(對v與對opt皆然; 使用者2026-10-31: opt給了而不屬該鍵之種類者, 大部分是給回預設值, 直接報錯應只用於必須參數):
 *    - opt不是一般物件(陣列、類別實例、包裝物件、Date、數字、字串等)時, 整份視為{}。因此 `['1', '2'].filter(isenum)` 可用(第二引數為索引, 被視為未給)。
 *    - use不是上列之值, 視為未給(不限定範圍); min、max、gt、lt不是有效數字, 該鍵視為未給; 範圍為空(min > max、gt >= lt、min >= lt、gt >= max等, 或與use之交集為空, 如use為'ratio'而min為2), 則min、max、gt、lt皆視為未給(use保留)。
 *    - 含未宣告之鍵(如誤拼之minExlusive)忽略; 本函式不轉傳opt, 故於debug時提示。
 *    - opt.debug為true時(非布林視為false), 另輸出警告說明哪個鍵因非預期而改用預設; 警告出口為opt.funLog(函數, 以(msg, { fn, reason, key })呼叫), 未給則為console.warn;
 *      警告為固定詞彙, 只含函數名、鍵名、種類描述與所採之預設, 不含傳入之值; 同一函數、同一鍵、同一原因每個行程只警告一次(逐筆呼叫不洗版); 出口拋錯一律忽略。
 *      例: `[wsemi isenum] invalid opt.use: must be one of 'positive', 'nonnegative', 'timer', 'ratio', 'percent', ignored`。
 *
 * 【必然之限制】
 * 1. 數字字面值於解析時已捨去之精度無從得知: 如程式中寫4503599627370496.5, JS解析後即為4503599627370496, 本函式只能依現值判定。
 * 2. 字串超過約17位有效數字者, 依IEEE 754捨入至最近之雙精度值, 不視為無效(本函式只擋下溢, 不擋精度損失); 要求精度無損者請用iseint(只限整數)。
 * 3. 浮點運算誤差(如0.1 + 0.2為0.30000000000000004)依實際值判定, 範圍比較不加容差(如isenum(0.1 + 0.2, { max: 0.3 })為false); 須容差之比較請用judge。
 * 4. 前導零('007')依值判定為數字(7); 以前導零為意義之編號(如'007')應以字串類判定, 不應交給本函式。
 * 5. 不收千分位('1,234')、底線('1_000')、全形數字、Unicode減號、十六進位('0x10')、二進位、八進位、'Infinity'、'NaN'、包裝物件(new Number(1))、BigInt。
 * 6. 空字串、純空白字串、'-'、'NP'、'N/A'等標記字串皆回false; 要「標記字串保留、不算錯」之廣義數字(規格 N1)不是本函式的範疇(後續另設)。
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/isenum.test.mjs Github}
 * @memberOf wsemi
 * @param {*} v 輸入任意資料
 * @param {Object} [opt] 輸入設定物件，預設未給(不限制範圍)
 * @param {Number|String} [opt.min] 輸入下界(含)，需為有效數字，預設未給
 * @param {Number|String} [opt.max] 輸入上界(含)，需為有效數字，預設未給
 * @param {Number|String} [opt.gt] 輸入下界(不含，即須大於)，需為有效數字，預設未給
 * @param {Number|String} [opt.lt] 輸入上界(不含，即須小於)，需為有效數字，預設未給
 * @param {String} [opt.use] 輸入用途字串，可用'positive'、'nonnegative'、'timer'、'ratio'、'percent'，預設未給
 * @param {Boolean} [opt.debug=false] 輸入是否於opt出現非預期輸入時輸出警告布林值，非布林視為false，預設false
 * @param {Function} [opt.funLog] 輸入警告出口函數，以(msg, { fn, reason, key })呼叫，未給則用console.warn，預設未給
 * @returns {Boolean} 回傳判斷布林值
 * @example
 *
 * console.log(isenum(0))
 * // => true
 *
 * console.log(isenum(' 12 '))
 * // => true
 *
 * console.log(isenum('1.2e-5'))
 * // => true
 *
 * console.log(isenum(Infinity))
 * // => false (非有效數字, isnum(Infinity)為true)
 *
 * console.log(isenum('0x10'))
 * // => false (isnum('0x10')為true)
 *
 * console.log(isenum('1e-400'))
 * // => false (下溢)
 *
 * console.log(isenum(new Number(1)))
 * // => false (包裝物件不解包)
 *
 * console.log(isenum('-'))
 * // => false (標記字串)
 *
 * console.log(isenum('0.5', { use: 'ratio' }))
 * // => true
 *
 * console.log(isenum(0, { gt: 0 }))
 * // => false
 *
 * console.log(isenum(1e300, { max: 1e301 }))
 * // => true
 *
 * console.log(isenum(2147483648, { use: 'timer' }))
 * // => false
 *
 * console.log(isenum(2.5, { use: 'positive', max: 10 }))
 * // => true
 *
 * console.log(isenum(5, { min: 'abc' }))
 * // => true (min非有效數字，視為未給)
 *
 * console.log(isenum(5, { use: 'ratio', min: 2 }))
 * // => false (與use之交集為空，min視為未給，範圍回到0~1)
 *
 * console.log(['1', 'a', '2.5'].filter(isenum))
 * // => ['1', '2.5']
 *
 */
function isenum(v, opt) {

    //未給opt, 最快路徑, 不配置物件
    if (opt === undefined || opt === null) {
        return !Number.isNaN(enumVal(v)) //NaN為無效標記
    }

    //opt非預期之輸入視為未給、改用預設, 不拋錯; opt.debug為true時警告
    let r = parseNumOpt(opt, SPEC)

    let n = enumVal(v)
    if (Number.isNaN(n)) {
        return false
    }
    return n >= r.min && n <= r.max && n > r.gt && n < r.lt
}


export default isenum
