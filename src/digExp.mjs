import isenum from './isenum.mjs'
import isp0int from './isp0int.mjs'
import dig from './dig.mjs'


/**
 * 數字取指定小數位，小於1e-6改指數顯示
 * v須為有效數字(isenum: 有限數字，或去頭尾空白後為十進位寫法之數字字串)，其餘(Infinity、'Infinity'、'0x10'、'1e400'、'-'、''、null、包裝物件等)回傳空字串
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/digExp.test.mjs Github}
 * @memberOf wsemi
 * @param {Number|String} v 輸入數值，需為有效數字(數字或數字字串，定義見isenum，不收Infinity與'0x10'等)，非有效數字時回傳空字串
 * @param {Integer} [idig=0] 輸入指定小數位整數，預設為0
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
    if (!isp0int(idig)) {
        return ''
    }

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
