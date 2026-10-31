import isenum from './isenum.mjs'
import dig from './dig.mjs'
import optVal from './_optVal.mjs'


//idig: opt類參數(JSDoc [idig=0]), 有效整數且為小數位數(iseint, use: 'digits', 0~100), 非預期改用預設0; 本函數無opt物件可帶debug, 故不警告
let RULE_IDIG = { fn: 'cfinancial', name: 'idig', kind: 'eint', chk: { use: 'digits' } }


/**
 * 數字或字串轉金融格式(百分位添加逗號)表示
 * v須為有效數字(isenum: 有限數字，或去頭尾空白後為十進位寫法之數字字串)，其餘(Infinity、'Infinity'、'0x10'、'1e400'、'-'、''、null、包裝物件等)回傳空字串
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/cfinancial.test.mjs Github}
 * @memberOf wsemi
 * @param {Number|String} v 輸入數值，需為有效數字(數字或數字字串，定義見isenum，不收Infinity與'0x10'等)，非有效數字時回傳空字串
 * @param {Integer|String} [idig=0] 輸入指定小數位，opt類參數(有效整數，小數位數0~100，數字字串亦可，去頭尾空白後取值)，非預期之輸入(非有效整數、小數、負數、超過100、Infinity、'0x10'、包裝物件等)視為未給而改用預設，不報錯，預設為0
 * @returns {String} 回傳金融格式的字串，v非有效數字時回傳空字串
 * @example
 *
 * console.log(cfinancial(0.123456789, 3))
 * // => '0.123'
 *
 * console.log(cfinancial(1234567.89))
 * // => '1,234,568'
 *
 * console.log(cfinancial(1234567.89, 1))
 * // => '1,234,567.9'
 *
 */
function cfinancial(v, idig = 0) {

    //check
    if (!isenum(v)) {
        return ''
    }

    //idig, opt類參數(預設0), 須為有效整數且為小數位數(0~100), 非預期(含Infinity、負數、小數、超過100)視為未給、改用預設; 傳給dig者為解析後之值
    idig = optVal(idig, 0, RULE_IDIG)

    v = dig(v, idig) //dig內同樣以isenum檢測並以去頭尾空白後Number取值

    //轉成金融數字格式
    let x = v.split('.')
    let x1 = x[0]
    let x2 = x.length > 1 ? '.' + x[1] : ''
    let rgx = /(\d+)(\d{3})/
    while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + ',' + '$2')
    }
    let r = x1 + x2

    return r
}


export default cfinancial
