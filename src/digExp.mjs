import isenum from './isenum.mjs'
import dig from './dig.mjs'
import optVal from './_optVal.mjs'


//idig: opt類參數(JSDoc [idig=0]), 有效整數且為小數位數(iseint, use: 'digits', 0~100, toFixed與toExponential之範圍), 非預期改用預設0; 本函數無opt物件可帶debug, 故不警告
let RULE_IDIG = { fn: 'digExp', name: 'idig', kind: 'eint', chk: { use: 'digits' } }


/**
 * 數字取指定小數位，小於1e-6改指數顯示
 * v須為有效數字(isenum: 有限數字，或去頭尾空白後為十進位寫法之數字字串)，其餘(Infinity、'Infinity'、'0x10'、'1e400'、'-'、''、null、包裝物件等)回傳空字串
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/digExp.test.mjs Github}
 * @memberOf wsemi
 * @param {Number|String} v 輸入數值，需為有效數字(數字或數字字串，定義見isenum，不收Infinity與'0x10'等)，非有效數字時回傳空字串
 * @param {Integer|String} [idig=0] 輸入指定小數位，opt類參數(有效整數，小數位數0~100，數字字串亦可，去頭尾空白後取值)，非預期之輸入(非有效整數、小數、負數、超過100、Infinity、'0x10'、包裝物件等)視為未給而改用預設，不報錯，預設為0
 * @returns {String} 回傳取指定小數位的字串，v非有效數字時回傳空字串
 * @example
 *
 * console.log(digExp(0.000000123456789, 2))
 * // => '1.23e-7'
 *
 * console.log(digExp(Infinity, 2))
 * // => '' (舊版為'NaN')
 *
 */
function digExp(v, idig = 0) {

    //check
    if (!isenum(v)) {
        return ''
    }

    //idig, opt類參數(預設0), 須為有效整數且為小數位數(0~100), 非預期(含Infinity、負數、小數、超過100)視為未給、改用預設; 傳給dig者為解析後之值
    idig = optVal(idig, 0, RULE_IDIG)

    v = Number(v) //檢測之值即為使用之值(去頭尾空白後Number)

    let r = ''
    if (v === 0) {
        r = '0'
    }
    else if (Math.abs(v) <= 1e-6) {
        r = v.toExponential(idig)
    }
    else {
        r = dig(v, idig)
    }

    return r
}


export default digExp
