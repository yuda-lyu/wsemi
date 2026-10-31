import numRange from './_numRange.mjs'
import parseNumOpt from './_numOpt.mjs'
import isenum from './isenum.mjs'


//15位以內之純數字字串(可帶正負號)必然為精確之安全整數, 直接判定(快路徑)
let RE_INT15 = /^[+-]?\d{1,15}$/


//去除前導零與尾零後之有效數字序列, ds為純數字字串(不含正負號與小數點)
function sigDigits(ds) {
    let i = 0
    let j = ds.length
    while (i < j && ds.charCodeAt(i) === 48) { //前導零
        i++
    }
    while (j > i && ds.charCodeAt(j - 1) === 48) { //尾零
        j--
    }
    return ds.substring(i, j)
}


//字串轉換為數字後是否遺失精度: 比照Joi lib/types/number.js之extractSignificantDigits, 去指數、去小數點、去尾零、去正負號與前導零後, 輸入字串與String(轉換值)須相同
//t為已通過isenum且去頭尾空白之字串, n為Number(t)且為安全整數
function isLossless(t, n) {

    //去正負號
    let s = (t.charCodeAt(0) === 43 || t.charCodeAt(0) === 45) ? t.substring(1) : t

    //去指數
    let ei = s.search(/[eE]/)
    if (ei >= 0) {
        s = s.substring(0, ei)
    }

    //去小數點(至多一個)
    let di = s.indexOf('.')
    if (di >= 0) {
        s = s.substring(0, di) + s.substring(di + 1)
    }

    //n為安全整數, String(Math.abs(n))必為不帶指數之十進位整數字串
    let sn = n === 0 ? '' : sigDigits(String(Math.abs(n)))

    return sigDigits(s) === sn
}


//有效整數之取值: 有效則回轉換後之安全整數, 無效回NaN
function eintVal(v) {

    if (typeof v === 'number') {
        return Number.isSafeInteger(v) ? v : NaN
    }

    if (typeof v === 'string') {
        let t = v.trim()

        //快路徑
        if (t.length <= 16 && RE_INT15.test(t)) {
            return Number(t)
        }

        //以isenum為底(格式、有限、下溢), 再判整數與精度
        if (!isenum(t)) {
            return NaN
        }
        let n = Number(t)
        if (!Number.isSafeInteger(n)) {
            return NaN
        }
        return isLossless(t, n) ? n : NaN
    }

    return NaN
}


//界值(opt.min、max)之檢測: 有效整數(安全整數)
function checkBound(v) {
    return !Number.isNaN(eintVal(v))
}


let SPEC = {
    fn: 'iseint',
    keys: new Set(['use', 'min', 'max', 'debug', 'funLog']),
    table: numRange.EINT_USE,
    names: numRange.EINT_USE_NAMES,
    useDef: 'safe',
    check: checkBound,
    desc: 'a safe integer',
    boundKeys: 'min/max',
}


/**
 * 判斷是否為有效整數(可用於計算之整數), 並可依用途限定範圍
 *
 * 【範疇】
 * 判斷類函數(dspec〈輸入參數之檢測機制〉§5.3 C2、§7.1): 只回傳布林、不轉換、對被檢測值v永不拋錯、不呼叫被檢測值之任何方法、包裝物件不解包。
 * 專供計算類函數於入口判定整數參數(個數、索引、埠號、計時毫秒、位元運算元等)。
 *
 * 何謂有效整數: 「是整數」不代表「對該函數是有效的整數」。例如個數須在陣列長度上限內、計時毫秒過大反而立即觸發、埠號須在1~65535。故有效整數為:
 * 1. isenum(v)為true(有限數字, 或去頭尾空白後符合十進位寫法且未下溢之字串);
 * 2. 轉換後為整數, 且落在opt.use之範圍內(未給use時為'safe', 即安全整數);
 * 3. 有給opt.min、opt.max者另須落在其內(與用途範圍取交集);
 * 4. 數字以Number.isSafeInteger判定; 字串轉換後須無精度遺失(見下列〈用法〉第3點);
 * 5. BigInt一律false(JS中BigInt與Number為互不相容之算術域)。
 *
 * 與isint之差異: isint屬定義上之「是否為整數」, 先經cdbl、lodash isInteger, 故isint(Infinity)為true、isint('0x10')為true、isint(2 ** 60)為true、isint(new Number(5))為true;
 * iseint一律不收這些(Infinity、'0x10'、非安全整數、包裝物件皆false)。計算類函數判定整數參數請用iseint, 不要用isint、ispint、isp0int、cint、parseInt。
 * 不要求整數者請用isenum。
 *
 * 【用法】
 * 1. 計算類函數之入口判定: 先判定、再取值, 其後一律使用轉換值。取值方式為去頭尾空白後Number(…), 即 `Number(v)`; 判定為false者視為無效輸入, 計算類函數依規格throw Error, 不得視為0。
 * 2. opt.use依用途限定範圍(未給為'safe'), 與opt.min、opt.max(須為有效整數, 含端點)取交集:
 *    - 'safe'(預設): -9007199254740991 ~ 9007199254740991, 一般整數;
 *    - 'count': 0 ~ 4294967295, 個數、數量、長度(陣列長度上限2^32-1);
 *    - 'index': 0 ~ 4294967294, 陣列索引、位置(陣列索引上限2^32-2);
 *    - 'timer': 0 ~ 2147483647, 計時毫秒(setTimeout、setInterval、逾時、間隔、防抖), 上限取自內部常數TIMER_TIME_MAX, 超過時Node改以1毫秒觸發即過大反而立即觸發;
 *    - 'port': 1 ~ 65535, 網路埠號; 0為系統配發, 須收0者改用 `{ use: 'safe', min: 0, max: 65535 }`('port'與min取交集, 故不能以min:0放寬);
 *    - 'byte': 0 ~ 255, 位元組值(Uint8Array元素超出即被取模);
 *    - 'int32': -2147483648 ~ 2147483647, 位元運算(| & ^ << >>)之運算元(被截為32位元有號整數);
 *    - 'uint32': 0 ~ 4294967295, 無號位元運算(>>>)、雜湊種子;
 *    - 'digits': 0 ~ 100, 小數位數(toFixed之範圍, 超出即RangeError);
 *    - 'radix': 2 ~ 36, 進位基數(toString、parseInt之範圍);
 *    - 'year': 0 ~ 9999, 西元年;
 *    - 'timestamp': -62167219200000 ~ 253402300799999, 毫秒時間戳(0000-01-01T00:00:00.000Z ~ 9999-12-31T23:59:59.999Z)。
 * 3. 字串之精度: 字串轉換為數字時可能遺失資訊, 如'1.0000000000000001'轉為1、'4503599627370496.5'轉為4503599627370496、'9007199254740993'轉為9007199254740992。
 *    故字串須通過有效數字比對(比照Joi之extractSignificantDigits: 去指數、去小數點、去尾零、去正負號與前導零後, 輸入字串與String(轉換值)須相同)才為true:
 *    '1.0'、'12.000'、'1.5e1'、'00012'為true; '1.0000000000000001'、'4503599627370496.5'、'9007199254740993'為false。15位以內之純數字字串必然精確, 走快路徑直接判定。
 * 4. 計時毫秒不要求整數者(計算得之時長常帶小數)用isenum(v, { use: 'timer' }); 必須為整數者才用iseint(v, { use: 'timer' })。正數之計時: iseint(v, { use: 'timer', min: 1 })。
 * 5. 未給opt(或opt為undefined、null)時不配置物件, 為最快路徑。
 * 6. opt之非預期輸入視為未給、改用預設, 一律不拋錯(對v與對opt皆然; 使用者2026-10-31: opt給了而不屬該鍵之種類者, 大部分是給回預設值, 直接報錯應只用於必須參數):
 *    - opt不是一般物件(陣列、類別實例、包裝物件、Date、數字、字串等)時, 整份視為{}。因此 `['1', '2'].every(iseint)` 可用(第二引數為索引, 被視為未給)。
 *    - use不是上列之值, 改用預設'safe'; min、max不是有效整數(安全整數), 該鍵視為未給; 範圍為空(min > max, 或與use之交集為空, 如use為'byte'而min為300), 則min、max皆視為未給(use保留)。
 *    - 含未宣告之鍵(如誤拼之mim; 本函式無gt、lt)忽略; 本函式不轉傳opt, 故於debug時提示。
 *    - opt.debug為true時(非布林視為false), 另輸出警告說明哪個鍵因非預期而改用預設; 警告出口為opt.funLog(函數, 以(msg, { fn, reason, key })呼叫), 未給則為console.warn;
 *      警告為固定詞彙, 只含函數名、鍵名、種類描述與所採之預設, 不含傳入之值; 同一函數、同一鍵、同一原因每個行程只警告一次(逐筆呼叫不洗版); 出口拋錯一律忽略。
 *      例: `[wsemi iseint] invalid opt.use: must be one of 'safe', 'count', …, using default 'safe'`(實際列出全部用途名稱)。
 *
 * 【必然之限制】
 * 1. 數字字面值於解析時已捨去之精度無從得知: 如程式中寫4503599627370496.5, JS解析後即為4503599627370496(整數), 本函式只能依現值判定為true; 只有字串才能偵測精度遺失。
 * 2. 字串超過約17位有效數字者, 依IEEE 754捨入至最近之雙精度值; 本函式對整數字串以有效數字比對偵測遺失, 非安全整數(如'9007199254740992'、'1e21')一律false。
 * 3. 浮點運算誤差(如0.1 * 3為0.30000000000000004)依實際值判定, 不加容差; 須容差之比較請用judge。
 * 4. 前導零('007')依值判定為整數(7); 以前導零為意義之編號(如郵遞區號、'007')應以字串類判定。
 * 5. 不收千分位('1,234')、底線('1_000')、全形數字、Unicode減號、十六進位('0x10')、二進位、八進位、'Infinity'、'NaN'、包裝物件(new Number(1))、BigInt。
 * 6. 空字串、純空白字串、'-'、'NP'、'N/A'等標記字串皆回false; 要「標記字串保留、不算錯」之廣義數字(規格 N1)不是本函式的範疇(後續另設)。
 * 7. -0視為0(數字-0與字串'-0'皆為有效整數), 本函式不轉換故不區分; 要區分者自行以Object.is。
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/iseint.test.mjs Github}
 * @memberOf wsemi
 * @param {*} v 輸入任意資料
 * @param {Object} [opt] 輸入設定物件，預設未給(等同use為'safe')
 * @param {String} [opt.use='safe'] 輸入用途字串，可用'safe'、'count'、'index'、'timer'、'port'、'byte'、'int32'、'uint32'、'digits'、'radix'、'year'、'timestamp'，預設'safe'
 * @param {Number|String} [opt.min] 輸入下界(含)，需為有效整數(安全整數)，與用途範圍取交集，預設未給
 * @param {Number|String} [opt.max] 輸入上界(含)，需為有效整數(安全整數)，與用途範圍取交集，預設未給
 * @param {Boolean} [opt.debug=false] 輸入是否於opt出現非預期輸入時輸出警告布林值，非布林視為false，預設false
 * @param {Function} [opt.funLog] 輸入警告出口函數，以(msg, { fn, reason, key })呼叫，未給則用console.warn，預設未給
 * @returns {Boolean} 回傳判斷布林值
 * @example
 *
 * console.log(iseint(125))
 * // => true
 *
 * console.log(iseint('125'))
 * // => true
 *
 * console.log(iseint(' 12 '))
 * // => true
 *
 * console.log(iseint('1.0'))
 * // => true
 *
 * console.log(iseint('1.5e1'))
 * // => true
 *
 * console.log(iseint(1.25))
 * // => false
 *
 * console.log(iseint(Infinity))
 * // => false (isint(Infinity)為true)
 *
 * console.log(iseint(10n))
 * // => false (BigInt)
 *
 * console.log(iseint('9007199254740993'))
 * // => false (精度遺失)
 *
 * console.log(iseint('1.0000000000000001'))
 * // => false (精度遺失)
 *
 * console.log(iseint('8080', { use: 'port' }))
 * // => true
 *
 * console.log(iseint(0, { use: 'port' }))
 * // => false
 *
 * console.log(iseint(2147483648, { use: 'timer' }))
 * // => false (過大, Node會改以1毫秒觸發)
 *
 * console.log(iseint(1, { use: 'timer', min: 1 }))
 * // => true (正數之計時)
 *
 * console.log(iseint(4294967294, { use: 'index' }))
 * // => true
 *
 * console.log(iseint(4294967295, { use: 'index' }))
 * // => false
 *
 * console.log(iseint(5, { use: 'abc' }))
 * // => true (use非表內之值，改用預設'safe')
 *
 * console.log(iseint(5, { use: 'byte', min: 300 }))
 * // => true (與use之交集為空，min視為未給，範圍回到0~255)
 *
 * console.log(['1', '2.5', 'a', '3'].filter((v) => iseint(v)))
 * // => ['1', '3']
 *
 */
function iseint(v, opt) {

    //未給opt, 即use為'safe', 數字與字串之安全整數判定已含其範圍, 最快路徑, 不配置物件
    if (opt === undefined || opt === null) {
        return !Number.isNaN(eintVal(v)) //NaN為無效標記
    }

    //opt非預期之輸入視為未給、改用預設, 不拋錯; opt.debug為true時警告
    let r = parseNumOpt(opt, SPEC)

    let n = eintVal(v)
    if (Number.isNaN(n)) {
        return false
    }
    return n >= r.min && n <= r.max
}


export default iseint
