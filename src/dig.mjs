import round from 'lodash-es/round.js'
import isenum from './isenum.mjs'
import optVal from './_optVal.mjs'


//idig: opt類參數(JSDoc [idig=0]), 有效整數且為小數位數(iseint, use: 'digits', 0~100), 非預期改用預設0
let RULE_IDIG = { fn: 'dig', name: 'idig', kind: 'eint', chk: { use: 'digits' } }


/**
 * 數字取指定小數位的字串
 * 為字串故可自動補0
 * console.log(1.005.toFixed(2)) //1.00
 * console.log(dig(1.005, 2)) //1.01
 * v須為有效數字(isenum: 有限數字，或去頭尾空白後為十進位寫法之數字字串)，其餘(Infinity、'Infinity'、'0x10'、'1e400'、'-'、''、null、包裝物件等)回傳空字串
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/dig.test.mjs Github}
 * @memberOf wsemi
 * @param {Number|String} v 輸入數值，需為有效數字(數字或數字字串，定義見isenum，不收Infinity與'0x10'等)，非有效數字時回傳空字串
 * @param {Integer} [idig=0] 輸入指定小數位整數，須為有效整數且介於0至100(iseint之use:'digits'，toFixed之範圍，可為字串型數字)，非預期之輸入(含Infinity、負數、小數、超過100、'0x10'、包裝物件)視為未給而改用預設0(舊版回傳空字串或拋RangeError)，預設為0
 * @returns {String} 回傳取指定小數位的字串，v非有效數字時回傳空字串
 * @example
 *
 * console.log(dig(0.123456789, 3))
 * // => '0.123'
 *
 * console.log(dig(0.123456789, 4))
 * // => '0.1235'
 *
 * console.log(dig(' 1.005 ', 2))
 * // => '1.01'
 *
 * console.log(dig(Infinity, 2))
 * // => '' (舊版為'NaN')
 *
 * console.log(dig('0x10', 2))
 * // => '' (舊版為'16.00')
 *
 * console.log(dig(1.25, Infinity))
 * // => '1' (idig非預期改用預設0; 舊版拋RangeError)
 *
 */
function dig(v, idig = 0) {

    //check
    if (!isenum(v)) {
        return ''
    }

    //idig, opt類參數(JSDoc [idig=0])以iseint判定(帳本G17、R-OPT-VAL-01, 同digExp): 須為有效整數且為小數位數(0~100, toFixed之範圍), 非預期(含Infinity、負數、小數、超過100、'0x10'、包裝物件)視為未給、改用預設0(原回空字串或toFixed拋RangeError); 無opt物件可帶debug, 故不警告
    idig = optVal(idig, 0, RULE_IDIG)

    v = Number(v) //檢測之值即為使用之值(去頭尾空白後Number)
    let r = round(v, idig).toFixed(idig) //IEEE754, toFixed回傳為string

    return r
}


export default dig
