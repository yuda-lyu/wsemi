import Decimal from 'decimal.js'
import get from 'lodash-es/get.js'
import isenum from './isenum.mjs'
import isbol from './isbol.mjs'


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
 * 1. 整數以原文(數字字串)或數值本身判定(decimal.js的isInteger，不經Number轉換)，保留全部位數並正規化後回傳，小數位數為0，不經12位有效數字處理；
 *    正規化指輸出不含指數記號、正號、前導零、小數點與尾零，且-0為'0'：'+5.'得'5'、'007'得'7'、'1e1'得'10'、'1.5e1'得'15'、'12.000'得'12'、'-0'得'0'、1e21得'1000000000000000000000'、
 *    '123456789012345'與'9007199254740993'原樣(全部位數，不捨入)、數值9007199254740993(字面值解析時已為9007199254740992)得'9007199254740992'。
 * 2. 非整數以decimal.js取12位有效數字(new Decimal(v).toSignificantDigits(12)，採ROUND_HALF_UP)，字串為toFixed()，小數位數為decimalPlaces()。
 *    例: 0.1 + 0.2得'0.3'、1e-11得'0.00000000001'(小數位數11)、3.2e-10得'0.00000000032'(小數位數11)、1.23456789012得'1.23456789012'(不補尾零)、
 *    12345678.123456789得'12345678.1235'(小數位數4)、123456789012345.6得'123456789012000'(大量級之非整數，整數位亦只留12位有效數字)；
 *    取12位後成為整數者以整數輸出：'0.99999999999999999999'、'1.0000000000000001'得'1'(小數位數0)，故judge('0.99999999999999999999', '===', 1)為true。
 * 3. 數字字串先去頭尾空白，以decimal.js直接解析(不經Number轉換，以免多餘位數先被捨入)；包裝物件(new Number(1.5)、new String('1.5'))不收，throw(isenum不解包)。
 * 4. 供judge使用：judge預設(withPreciseNum為true)以本函式取兩數之12位有效數字後精確比較，故兩數相差落在第12位有效數字之內者可區分(如1e-11與0、1 + 1e-10與1)，
 *    第13位起才不同者視為相等(如1 + 1e-12與1)；浮點誤差累積落在第13位起者(如0.1累加1000次得99.9999999999986)亦視為相等，與100相等。
 *
 * 【必然之限制】
 * 1. 非整數之有效數字超過12位者被捨入至12位，如0.1234567890123456789得'0.123456789012'; 第13位起才不同之兩值視為相等，不應也無法被辨識(試驗數據罕超過10位有效數字)；但為捨入後比較，相差極微而跨越第12位進位邊界者(如1.2345678901249與1.2345678901251)仍被區分。
 * 2. 浮點運算誤差若已落入第12位有效數字之內(如極大量級相減後、極大量累加後)，不會被消除；decimal.js本身不去除浮點雜訊，故有效位數由本函式決定。
 * 3. 整數路徑保留全部位數，不經12位有效數字處理，故超過12位之整數(如123456789012345680)位數不被捨入，過大之整數亦輸出完整十進位(1e21得'1000000000000000000000'，不含指數記號)；
 *    因此大量級之整數(1.23456789012345e20)與大量級之非整數(123456789012345.6)之處理不同，後者整數位亦被捨入。
 * 4. 小數值依有效數字保留，不歸零(舊版以固定eps=1e-9判位數，使小於1e-9之小數歸零為'0.0'，已修正；舊版近似與量級無關之絕對容差，本版12位為相對容差，絕對值約10至1000時與之同級)，但很小之數字串會很長(5e-324得324位小數)。
 * 5. 回傳為字串，不含指數記號(整數與非整數路徑皆然)。
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
 * console.log(`preciseNum('+5.')`, preciseNum('+5.'), preciseNum('007'), preciseNum('1e1'), preciseNum('12.000'), preciseNum('-0'), preciseNum(1e21))
 * // => preciseNum('+5.') 5 7 10 12 0 1000000000000000000000 (整數保留全部位數並正規化)
 *
 * console.log(`preciseNum('0.99999999999999999999')`, preciseNum('0.99999999999999999999'), preciseNum('1.0000000000000001'))
 * // => preciseNum('0.99999999999999999999') 1 1 (取12位有效數字後為整數)
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

    //由decimal.js直接解析原文(數字字串已去頭尾空白, Decimal不接受前後空白; 數值取其本身), 不經Number轉換以免多餘位數先被捨入
    let d = new Decimal(v)

    //整數(以原文或數值本身判定, decimal.js的isInteger)保留全部位數並正規化(不含指數記號、前導零、正號、小數點與尾零, decimal.js的toFixed對-0亦輸出'0'): '+5.'得'5'、'007'得'7'、'1e1'得'10'、'12.000'得'12'、'-0'得'0'、1e21得'1000000000000000000000'
    if (d.isInteger()) {
        if (returnDigit) {
            return 0
        }
        return d.toFixed() //不能用cint, 得要回傳數字字串
    }

    //非整數取12位有效數字; 取整後轉換值為整數者(如'0.99999999999999999999'、'1.0000000000000001')亦於此路徑得'1'
    d = d.toSignificantDigits(PRECISE_DIGITS)

    if (returnDigit) {
        return d.decimalPlaces()
    }
    return d.toFixed()
}


export default preciseNum
