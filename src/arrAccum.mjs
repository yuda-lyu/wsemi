import isarr from './isarr.mjs'
import isenum from './isenum.mjs'
import { getBase, chkValid } from './_arrNum.mjs'


/**
 * 回傳累加後陣列
 *
 * 各元素以isenum判定是否為有效數字(有限數字，或去頭尾空白後為十進位寫法之數字字串)，有效者取其數值參與累加；
 * 凡非有效數字(含標記字串'-'、'NP'、''、null、undefined、布林、NaN、Infinity、'Infinity'、'0x10'、'1e400'、包裝物件等)，一律以基準值opt.base(預設0)代入累加，輸出與輸入逐筆對應，不報錯、不略過、不改成空字串。
 * 輸入陣列至少要有1個有效數字(含空陣列，視為0個)，否則throw Error('invalid vec: must contain a valid number')，訊息不帶輸入值。
 * 輸入不是陣列時回傳空陣列(容器之處置不變，先於有效數字之檢查)。
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/arrAccum.test.mjs Github}
 * @memberOf wsemi
 * @param {Array} vec 輸入要被累加計算的陣列，元素為有效數字(數字或數字字串，定義見isenum)者取其數值，非有效數字者以opt.base代入；至少1個有效數字，否則throw
 * @param {Object} [opt] 輸入設定物件，預設未給
 * @param {Number|String} [opt.base=0] 輸入非有效數字元素代入之基準值，需為有效數字(數字或數字字串，定義見isenum)，非預期之輸入(非有效數字、Infinity、'0x10'、包裝物件等)視為未給而改用預設，不報錯，預設0
 * @param {Boolean} [opt.debug=false] 輸入是否於opt.base為非預期之輸入而改用預設時輸出警告布林值，非布林視為false，警告為固定詞彙(不含傳入之值)，同一參數每個行程只警告一次，預設false
 * @param {Function} [opt.funLog=null] 輸入警告出口函數，以(msg, { fn, reason, key })呼叫，未給則用console.warn，預設null
 * @returns {Array} 回傳各元素累加後之陣列
 * @example
 *
 * console.log(arrAccum([1, 2, 3, 4]))
 * // => [1, 3, 6, 10]
 *
 * console.log(arrAccum([1, '2', '-', 3]))
 * // => [1, 3, 3, 6] (非有效數字以基準值0代入)
 *
 * console.log(arrAccum([1, '2', '-', 3], { base: 10 }))
 * // => [1, 3, 13, 16] (非有效數字以基準值10代入)
 *
 */
function arrAccum(vec, opt) {

    //check
    if (!isarr(vec)) {
        return []
    }

    //至少1個有效數字
    chkValid([vec], 'vec', false)

    //base
    let base = getBase(opt, 0, 'arrAccum')

    let r = []
    let vv = 0
    for (let i = 0; i < vec.length; i++) {
        let v = vec[i]
        vv += isenum(v) ? Number(v) : base
        r.push(vv)
    }
    return r
}


export default arrAccum
