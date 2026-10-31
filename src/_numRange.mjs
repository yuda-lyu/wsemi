//本檔為內部使用之數值範圍表, 不由index匯出
import cst from './_const.mjs'


/**
 * isenum(有效數字)與iseint(有效整數)之opt.use範圍表(單一來源)
 *
 * 規格: 主控dspec〈輸入參數之檢測機制〉§7.1。兩函數之use範圍集中於此, 計時上限取自_const.mjs之TIMER_TIME_MAX, 不另寫數字;
 * 日後單值檢測產生訊息(如 must be an integer between 1 and 65535)亦應讀本檔。
 *
 * 每項之鍵意義:
 *   min: 下界(含); max: 上界(含); gt: 下界(不含); lt: 上界(不含)
 *   未列之鍵視為無該限制。表為凍結之無原型物件, 故use為'constructor'、'__proto__'、'toString'等不會誤中
 *
 * 表內各use之範圍依據(見各項註解), 以測試(test/_numRange.test.mjs)鎖定各use之上下界
 */


//安全整數界線, 超出者相鄰整數無法區分
let MAX_SAFE = Number.MAX_SAFE_INTEGER //9007199254740991


//建立凍結之無原型表, 並凍結各項
function mk(o) {
    let t = Object.create(null)
    for (let k of Object.keys(o)) {
        t[k] = Object.freeze({ ...o[k] })
    }
    return Object.freeze(t)
}


/**
 * isenum之use範圍表
 *
 * 可帶小數, 故為連續區間, 無整數限制
 */
let ENUM_USE = mk({
    positive: { gt: 0 }, //>0, 時間間隔dt、容差、標準差
    nonnegative: { min: 0 }, //>=0, 距離、深度
    timer: { min: 0, max: cst.TIMER_TIME_MAX }, //0~2147483647, 計時毫秒, 可帶小數(執行環境本會截斷, 危害在過大, 見_const.mjs)
    ratio: { min: 0, max: 1 }, //0~1, 機率、分位數、比例
    percent: { min: 0, max: 100 }, //0~100, 百分比
})


/**
 * iseint之use範圍表
 *
 * 另須為安全整數(Number.isSafeInteger), 見iseint
 */
let EINT_USE = mk({
    safe: { min: -MAX_SAFE, max: MAX_SAFE }, //預設, 一般整數, Number.isSafeInteger
    count: { min: 0, max: 4294967295 }, //個數、數量、長度, 陣列長度上限2^32-1
    index: { min: 0, max: 4294967294 }, //陣列索引、位置, 陣列索引上限2^32-2
    timer: { min: 0, max: cst.TIMER_TIME_MAX }, //計時毫秒, 超過時Node改以1毫秒觸發(過大反而立即觸發)
    port: { min: 1, max: 65535 }, //網路埠號, TCP/UDP, 0為系統配發須收0者改用use='safe'搭min:0,max:65535
    byte: { min: 0, max: 255 }, //位元組值, Uint8Array元素超出即被取模
    int32: { min: -2147483648, max: 2147483647 }, //位元運算(| & ^ << >>)運算元被截為32位元有號整數
    uint32: { min: 0, max: 4294967295 }, //無號位元運算(>>>)、雜湊種子
    digits: { min: 0, max: 100 }, //小數位數, toFixed之範圍, 超出即RangeError
    radix: { min: 2, max: 36 }, //進位基數, toString、parseInt之範圍
    year: { min: 0, max: 9999 }, //西元年
    timestamp: { min: -62167219200000, max: 253402300799999 }, //毫秒時間戳, 0000-01-01T00:00:00.000Z~9999-12-31T23:59:59.999Z
})


//合法use之名稱清單(訊息用, 不含值)
let ENUM_USE_NAMES = Object.freeze(Object.keys(ENUM_USE))
let EINT_USE_NAMES = Object.freeze(Object.keys(EINT_USE))


let numRange = {
    MAX_SAFE,
    ENUM_USE,
    EINT_USE,
    ENUM_USE_NAMES,
    EINT_USE_NAMES,
}


export default numRange
