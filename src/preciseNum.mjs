import Decimal from 'decimal.js'
import get from 'lodash-es/get.js'
import isenum from './isenum.mjs'
import isint from './isint.mjs'
import isbol from './isbol.mjs'
import cstr from './cstr.mjs'


//有效位數(使用者2026-10-31由15位改定12位): 相對精度(小數值不歸零, 可吸收多次運算之累積誤差); 舊版eps = 1e-9近似絕對容差, 兩者只在|x|約10~1000同級, |x|>=1000較舊版寬、|x|<1較舊版嚴(見JSDoc必然之限制)
const PRECISE_DIGITS = 12


/**
 * 轉數字成為原始精度之數字字串
 *
 * 【範疇】
 * 計算類函數(judge、estimateTicks使用)。將數字(或數字字串)取12位有效數字後，以不含指數記號之十進位字串回傳，
 * 用以消除浮點運算誤差(如0.1 + 0.2為0.30000000000000004，得'0.3'；0.1累加1000次得99.9999999999986，得'100')，並可取得其小數位數。
 * 判定輸入用isenum(有效數字: 有限數字，或去頭尾空白後為十進位寫法之數字字串，可帶科學記號)，不收Infinity、'Infinity'、'0x10'、'1e400'、'-'、''、null、包裝物件等，非有效數字throw Error('v is not a number')。
 *
 * 【用法】
 * 1. 整數(isint為true)直接轉字串回傳，小數位數為0，不經12位有效數字處理。
 * 2. 非整數以decimal.js取12位有效數字(new Decimal(v).toSignificantDigits(12)，採ROUND_HALF_UP)，字串為toFixed()，小數位數為decimalPlaces()。
 *    例: 0.1 + 0.2得'0.3'、1e-11得'0.00000000001'(小數位數11)、3.2e-10得'0.00000000032'(小數位數11)、1.23456789012得'1.23456789012'(不補尾零)、
 *    12345678.123456789得'12345678.1235'(小數位數4)、123456789012345.6得'123456789012000'(大量級之非整數，整數位亦只留12位有效數字)。
 * 3. 數字字串先去頭尾空白(整數路徑亦回傳去空白後之字串)，以decimal.js直接解析(不經Number轉換，以免多餘位數先被捨入)；包裝物件(new Number(1.5)、new String('1.5'))不收，throw(isenum不解包)。
 * 4. 供judge使用：judge預設(withPreciseNum為true)以本函式取兩數之12位有效數字後精確比較，故兩數相差落在第12位有效數字之內者可區分(如1e-11與0、1 + 1e-10與1)，
 *    第13位起才不同者視為相等(如1 + 1e-12與1)；浮點誤差累積落在第13位起者(如0.1累加1000次得99.9999999999986)亦視為相等，與100相等。
 *
 * 【必然之限制】
 * 1. 非整數之有效數字超過12位者被捨入至12位，如0.1234567890123456789得'0.123456789012'; 第13位起才不同之兩值視為相等，不應也無法被辨識(試驗數據罕超過10位有效數字)；但為捨入後比較，相差極微而跨越第12位進位邊界者(如1.2345678901249與1.2345678901251)仍被區分。
 * 2. 浮點運算誤差若已落入第12位有效數字之內(如極大量級相減後、極大量累加後)，不會被消除；decimal.js本身不去除浮點雜訊，故有效位數由本函式決定。
 * 3. 整數路徑原樣轉字串(cstr)，不經12位有效數字處理，故超過12位之整數(如123456789012345680)位數不被捨入，過大之數維持指數記號(1e21得'1e+21')；
 *    因此大量級之整數(1.23456789012345e20)與大量級之非整數(123456789012345.6)之處理不同，後者整數位亦被捨入。
 * 4. 小數值依有效數字保留，不歸零(舊版以固定eps=1e-9判位數，使小於1e-9之小數歸零為'0.0'，已修正；舊版近似與量級無關之絕對容差，本版12位為相對容差，絕對值約10至1000時與之同級)，但很小之數字串會很長(5e-324得324位小數)。
 * 5. 回傳為字串，不含指數記號(非整數路徑)。
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/preciseNum.test.mjs Github}
 * @memberOf wsemi
 * @param {String|Number} v 輸入數字字串或數字，需為有效數字(定義見isenum，不收Infinity與'0x10'等)，否則throw
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Boolean} [opt.returnDigit=false] 輸入是否回傳小數位數布林值，預設false
 * @returns {String} 回傳數字字串，若returnDigit=true則回傳小數位數整數
 * @example
 *
 * console.log(`preciseNum(0)`, preciseNum(0))
 * // => preciseNum(0) 0
 *
 * console.log(`preciseNum(1)`, preciseNum(1))
 * // => preciseNum(1) 1
 *
 * console.log(`preciseNum(0.3)`, preciseNum(0.3))
 * // => preciseNum(0.3) 0.3
 *
 * console.log(`preciseNum(0.1 + 0.2)`, preciseNum(0.1 + 0.2))
 * // => preciseNum(0.1 + 0.2) 0.3
 *
 * console.log(`preciseNum(4.67 + 7.12 + 94.4)`, preciseNum(4.67 + 7.12 + 94.4))
 * // => preciseNum(4.67 + 7.12 + 94.4) 106.19
 *
 * console.log(`preciseNum(94.4 + 7.12 + 4.67)`, preciseNum(94.4 + 7.12 + 4.67))
 * // => preciseNum(94.4 + 7.12 + 4.67) 106.19
 *
 * console.log(`preciseNum(0, { returnDigit: true })`, preciseNum(0, { returnDigit: true }))
 * // => preciseNum(0, { returnDigit: true })) 0
 *
 * console.log(`preciseNum(1, { returnDigit: true })`, preciseNum(1, { returnDigit: true }))
 * // => preciseNum(1, { returnDigit: true })) 0
 *
 * console.log(`preciseNum(0.3, { returnDigit: true })`, preciseNum(0.3, { returnDigit: true }))
 * // => preciseNum(0.3, { returnDigit: true })) 1
 *
 * console.log(`preciseNum(0.1 + 0.2, { returnDigit: true })`, preciseNum(0.1 + 0.2, { returnDigit: true }))
 * // => preciseNum(0.1 + 0.2, { returnDigit: true })) 1
 *
 * console.log(`preciseNum(4.67 + 7.12 + 94.4, { returnDigit: true })`, preciseNum(4.67 + 7.12 + 94.4, { returnDigit: true }))
 * // => preciseNum(4.67 + 7.12 + 94.4, { returnDigit: true })) 2
 *
 * console.log(`preciseNum(94.4 + 7.12 + 4.67, { returnDigit: true })`, preciseNum(94.4 + 7.12 + 4.67, { returnDigit: true }))
 * // => preciseNum(94.4 + 7.12 + 4.67, { returnDigit: true })) 2
 *
 */
function preciseNum(v, opt = {}) {

    //check
    if (!isenum(v)) {
        throw new Error(`v is not a number`)
    }

    //數字字串去頭尾空白, 其後一律使用去空白後之值(檢測之值即為使用之值)
    if (typeof v === 'string') {
        v = v.trim()
    }

    //returnDigit
    let returnDigit = get(opt, 'returnDigit')
    if (!isbol(returnDigit)) {
        returnDigit = false
    }

    //check
    if (isint(v)) {
        if (returnDigit) {
            return 0
        }
        return cstr(v) //不能用cint, 得要回傳數字字串
    }

    //取12位有效數字, 數字字串已去頭尾空白(Decimal不接受前後空白)由decimal.js直接解析
    let d = new Decimal(v).toSignificantDigits(PRECISE_DIGITS)

    if (returnDigit) {
        return d.decimalPlaces()
    }
    return d.toFixed()
}


export default preciseNum
