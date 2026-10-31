import { splitArrs, reduceArrs } from './_arrNum.mjs'


/**
 * 各陣列同位置元素相乘
 *
 * 各元素以isenum判定是否為有效數字(有限數字，或去頭尾空白後為十進位寫法之數字字串)，有效者取其數值參與相乘；
 * 凡非有效數字(含標記字串'-'、'NP'、''、null、undefined、布林、NaN、Infinity、'Infinity'、'0x10'、'1e400'、包裝物件等)，一律以基準值opt.base(預設1)代入計算，不報錯、不略過；
 * 同位置元素皆非有效數字者，該位置結果為opt.base的平方(預設即1)。
 * 每個輸入陣列各自至少要有1個有效數字(含空陣列，皆視為0個)，否則throw Error('invalid arrs[索引]: must contain a valid number')，訊息不帶輸入值。
 * 陣列容器之處置不變：陣列參數少於2個、非陣列、長度不同，回傳空陣列(先於有效數字之檢查)。
 * 本函數為不定參數，最後一個參數若為一般物件(非陣列)則視為opt；最後一個參數若為undefined或null則視為未給opt(不當成陣列參數)，如arrMulti(a, b, undefined)等同arrMulti(a, b)。
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/arrMulti.test.mjs Github}
 * @memberOf wsemi
 * @param {...Array} arguments 輸入n個陣列，需同長度，各陣列針對各位置元素進行相乘；元素為有效數字(數字或數字字串，定義見isenum)者取其數值，非有效數字者以opt.base代入；每個陣列各自至少1個有效數字，否則throw
 * @param {Object} [opt] 輸入最後一個參數為一般物件時視為設定物件，預設未給
 * @param {Number|String} [opt.base=1] 輸入非有效數字元素代入之基準值，需為有效數字(數字或數字字串，定義見isenum)，非預期之輸入(非有效數字、Infinity、'0x10'、包裝物件等)視為未給而改用預設，不報錯，預設1
 * @param {Boolean} [opt.debug=false] 輸入是否於opt.base為非預期之輸入而改用預設時輸出警告布林值，非布林視為false，警告為固定詞彙(不含傳入之值)，同一參數每個行程只警告一次，預設false
 * @param {Function} [opt.funLog=null] 輸入警告出口函數，以(msg, { fn, reason, key })呼叫，未給則用console.warn，預設null
 * @returns {Array} 回傳各元素相乘後陣列
 * @example
 *
 * let v1 = [1, 2, 3, 4]
 * let v2 = [0.1, 0.1, 0.1, 0.1]
 * let v3 = [11, 22, 33, 44]
 *
 * console.log(arrMulti(v1, v2))
 * // => [ 0.1, 0.2, 0.30000000000000004, 0.4 ]
 *
 * console.log(arrMulti(v1, v2, v3))
 * // => [ 1.1, 4.4, 9.900000000000002, 17.6 ]
 *
 * console.log(arrMulti([2, '3', ' 4 ', 5], [10, '-', null, Infinity]))
 * // => [ 20, 3, 4, 5 ] (非有效數字以基準值1代入)
 *
 * console.log(arrMulti([2, '-'], [10, 20], { base: 0 }))
 * // => [ 20, 0 ] (非有效數字以基準值0代入)
 *
 */
function arrMulti() {

    //arrs與opt
    let { arrs, opt } = splitArrs(arguments)

    return reduceArrs(arrs, opt, 'arrMulti', 1, 1, (t, v) => t * v)
}


export default arrMulti
