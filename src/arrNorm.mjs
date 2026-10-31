import isarr from './isarr.mjs'
import isnum from './isnum.mjs'
import arrProduct from './arrProduct.mjs'
import { getBase, chkValid } from './_arrNum.mjs'


/**
 * 陣列Norm值，代表由各元素平方值相加開根號
 *
 * 內部以arrProduct(vec, vec)計算(傳入基準值base為opt.base，預設0)：
 * 元素以isenum判定是否為有效數字(有限數字，或去頭尾空白後為十進位寫法之數字字串)，有效者取其數值；
 * 凡非有效數字(含標記字串'-'、'NP'、''、null、undefined、布林、NaN、Infinity、'Infinity'、'0x10'、'1e400'、包裝物件等)，一律以基準值opt.base(預設0)代入，故預設下不影響結果，不報錯。
 * 輸入陣列至少要有1個有效數字(含空陣列，視為0個)，否則throw Error('invalid vec: must contain a valid number')，訊息不帶輸入值。
 * 輸入不是陣列時回傳null(容器之處置不變，先於有效數字之檢查)；各元素平方和為0時亦回傳null(舊有行為不變)。
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/arrNorm.test.mjs Github}
 * @memberOf wsemi
 * @param {Array} vec 輸入要被計算的陣列，元素為有效數字(數字或數字字串，定義見isenum)者取其數值，非有效數字者以opt.base代入；至少1個有效數字，否則throw
 * @param {Object} [opt] 輸入設定物件，預設未給
 * @param {Number|String} [opt.base=0] 輸入非有效數字元素代入之基準值，需為有效數字(數字或數字字串，定義見isenum)，非預期之輸入(非有效數字、Infinity、'0x10'、包裝物件等)視為未給而改用預設，不報錯，預設0
 * @param {Boolean} [opt.debug=false] 輸入是否於opt.base為非預期之輸入而改用預設時輸出警告布林值，非布林視為false，警告為固定詞彙(不含傳入之值)，同一參數每個行程只警告一次，預設false
 * @param {Function} [opt.funLog=null] 輸入警告出口函數，以(msg, { fn, reason, key })呼叫，未給則用console.warn，預設null
 * @returns {Number} 回傳Norm值，輸入非陣列或平方和為0時回傳null
 * @example
 *
 * console.log(arrNorm([1, 2, 3, 4]))
 * // => 5.477225575051661
 *
 * console.log(arrNorm([0.1, 0.1, 0.1, 0.1]))
 * // => 0.2
 *
 * console.log(arrNorm([11, 22, 33, 44]))
 * // => 60.249481325568276
 *
 * console.log(arrNorm([3, '-', 4]))
 * // => 5 (非有效數字以基準值0代入)
 *
 */
function arrNorm(vec, opt) {

    //check
    if (!isarr(vec)) {
        return null
    }

    //至少1個有效數字
    chkValid([vec], 'vec', false)

    //base, 非預期之輸入改用預設0
    let base = getBase(opt, 0, 'arrNorm')

    //arrProduct
    let r = arrProduct(vec, vec, { base })

    //check
    if (!isnum(r)) {
        return null
    }

    if (r <= 0) {
        return null
    }

    return Math.sqrt(r)
}


export default arrNorm
