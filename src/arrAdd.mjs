import { splitArrs, reduceArrs } from './_arrNum.mjs'


/**
 * 各陣列內元素相加，可輸入n個同長度陣列，若需輸入之陣列長度不同則回傳空陣列
 *
 * 各元素以isenum判定是否為有效數字(有限數字，或去頭尾空白後為十進位寫法之數字字串)，有效者取其數值參與相加；
 * 凡非有效數字(含標記字串'-'、'NP'、''、null、undefined、布林、NaN、Infinity、'Infinity'、'0x10'、'1e400'、包裝物件等)，一律以基準值opt.base(預設0)代入計算，不報錯、不略過；
 * 同位置元素皆非有效數字者，該位置結果為2倍opt.base(預設即0)。
 * 每個輸入陣列各自至少要有1個有效數字(含空陣列，皆視為0個)，否則throw Error('invalid arrs[索引]: must contain a valid number')，訊息不帶輸入值。
 * 陣列容器之處置不變：陣列參數少於2個、非陣列、長度不同，回傳空陣列(先於有效數字之檢查)。
 * 本函數為不定參數，最後一個參數若為一般物件(非陣列)則視為opt；最後一個參數若為undefined或null則視為未給opt(不當成陣列參數)，如arrAdd(a, b, undefined)等同arrAdd(a, b)。
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/arrAdd.test.mjs Github}
 * @memberOf wsemi
 * @param {...Array} arguments 輸入n個陣列，需同長度，各陣列針對各位置元素進行相加總；元素為有效數字(數字或數字字串，定義見isenum)者取其數值，非有效數字者以opt.base代入；每個陣列各自至少1個有效數字，否則throw
 * @param {Object} [opt] 輸入最後一個參數為一般物件時視為設定物件，預設未給
 * @param {Number|String} [opt.base=0] 輸入非有效數字元素代入之基準值，需為有效數字(數字或數字字串，定義見isenum)，非預期之輸入(非有效數字、Infinity、'0x10'、包裝物件等)視為未給而改用預設，不報錯，預設0
 * @param {Boolean} [opt.debug=false] 輸入是否於opt.base為非預期之輸入而改用預設時輸出警告布林值，非布林視為false，警告為固定詞彙(不含傳入之值)，同一參數每個行程只警告一次，預設false
 * @param {Function} [opt.funLog=null] 輸入警告出口函數，以(msg, { fn, reason, key })呼叫，未給則用console.warn，預設null
 * @returns {Array} 回傳各元素相加後陣列
 * @example
 *
 * let v1 = [1, 2, 3, 4]
 * let v2 = [0.1, 0.1, 0.1, 0.1]
 * let v3 = [11, 22, 33, 44]
 *
 * console.log(arrAdd(v1, v2))
 * // => [ 1.1, 2.1, 3.1, 4.1 ]
 *
 * console.log(arrAdd(v1, v2, v3))
 * // => [ 12.1, 24.1, 36.1, 48.1 ]
 *
 * console.log(arrAdd([1, '2', ' 3 ', 4], [10, '-', null, Infinity]))
 * // => [ 11, 2, 3, 4 ] (非有效數字以基準值0代入)
 *
 * console.log(arrAdd([1, '-'], [10, 20], { base: 5 }))
 * // => [ 11, 25 ] (非有效數字以基準值5代入)
 *
 * console.log(arrAdd(['-', 'NP'], [1, 2]))
 * // => [ 1, 2 ]
 *
 * try {
 *     arrAdd(['-', 'NP'], [1, 2], [3, 4])
 * }
 * catch (err) {
 *     console.log(err.message)
 * }
 * // => invalid arrs[0]: must contain a valid number
 *
 */
function arrAdd() {

    //arrs與opt
    let { arrs, opt } = splitArrs(arguments)

    return reduceArrs(arrs, opt, 'arrAdd', 0, 0, (t, v) => t + v)
}


export default arrAdd
