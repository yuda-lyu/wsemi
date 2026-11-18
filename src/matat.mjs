import isarr from './isarr.mjs'
import iseint from './iseint.mjs'
import arrAt from './arrAt.mjs'


/**
 * 由二維陣列mat提取資料。若istart與iend有效則提取istart~iend欄位，而若僅istart有效則提取istart欄位
 *
 * mat為第1參數：非陣列(含未給、null、字串、物件等)回傳空陣列[]，不拋錯(輸入參數檢測機制C7，第1參數型別不對回輸出型別之空結果)，此時不檢查istart；mat為陣列時各列須為陣列，有列非陣列throw Error('invalid mat: row[i] is not an array')(只含索引，外層空位視為非陣列)。istart為必須參數，型別檢測與mat有無資料無關，檢測順序為mat(陣列、各列為陣列)、istart：須為有效整數(iseint，數字字串亦可，去頭尾空白後取值)且為索引(0~4294967294)，無效(含未給、負數、小數、非數字字串等)throw Error('invalid istart: must be an integer index')；訊息皆不帶輸入值。iend為opt類參數，非預期之輸入或小於istart視為未給而只提取istart一筆，不報錯
 * 各列依arrAt提取：mat為空陣列(istart有效)時為合法資料，回傳[]；空列([[]])回傳[[]](列數不變)；列只有一個空元素(['']、[null]、[{}])時取得該元素；istart超出該列長度時該列回傳[]，iend超出該列長度時截至該列最後一欄；列內空位取得undefined
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/matat.test.mjs Github}
 * @memberOf wsemi
 * @param {Array} mat 輸入要被提取的資料陣列，須為二維陣列(空陣列合法，回傳[])，非陣列回傳[]，有列非陣列throw Error('invalid mat: row[i] is not an array')
 * @param {Integer|String} istart 輸入起始的欄位指標整數，必須參數(有效整數，0~4294967294，數字字串亦可)，無效throw Error('invalid istart: must be an integer index')；mat非陣列時不檢查
 * @param {Integer|String} [iend=istart] 輸入結束的欄位指標整數，opt類參數(有效整數，0~4294967294，數字字串亦可)，若不輸入、非預期之輸入或小於istart則視為未給，等同於istart
 * @returns {Array} 回傳提取的資料陣列(列數同mat)；mat非陣列時回傳[]
 * @throws {Error} mat為陣列而有列非陣列時throw Error('invalid mat: row[i] is not an array')；istart無效時throw Error('invalid istart: must be an integer index')；訊息皆不帶輸入值
 * @example
 *
 * console.log(matat([['a', 'b', '12.34'], [12, 34.56, 'abc']], 1))
 * // => [ [ 'b' ], [ 34.56 ] ]
 *
 * console.log(matat([['a', 'b', '12.34'], [12, 34.56, 'abc']], 1, 2))
 * // => [ [ 'b', '12.34' ], [ 34.56, 'abc' ] ]
 *
 * console.log(matat([['a', 'b', '12.34'], [12]], 1, 5))
 * // => [ [ 'b', '12.34' ], [] ]
 *
 * console.log(matat([[]], 0))
 * // => [ [] ]
 *
 * console.log(matat([], 0))
 * // => []
 *
 * console.log(matat('abc', 0))
 * // => [] (mat非陣列回傳空結果, 不拋錯)
 *
 * try {
 *     matat([['a', 'b']], 'x')
 * }
 * catch (err) {
 *     console.log(err.message)
 * }
 * // => invalid istart: must be an integer index
 *
 */
function matat(mat, istart, iend) {

    //check, mat為第1參數, 非陣列回傳空結果[](不拋錯; dspec〈輸入參數之檢測機制〉§11 W-16乙, 使用者2026-11-16), 不檢查istart; 各列須為陣列(元素層維持throw, 訊息只含索引, 不帶值)
    if (!isarr(mat)) {
        return []
    }
    let rows = [] //快照(每列只讀一次, 檢查之列即其後使用之列)
    for (let i = 0; i < mat.length; i++) { //依索引走訪, 空洞視為undefined而無效
        let r = mat[i]
        if (!isarr(r)) {
            throw new Error(`invalid mat: row[${i}] is not an array`)
        }
        rows.push(r)
    }

    //check, istart為必須參數(與mat有無資料無關), 與arrAt同判定(iseint, use: 'index'), 無效throw(訊息不帶值)
    if (!iseint(istart, { use: 'index' })) {
        throw new Error('invalid istart: must be an integer index')
    }

    //各列依arrAt提取(空陣列回傳[], 空列回傳[], 列數不變)
    let m = []
    for (let i = 0; i < rows.length; i++) {
        m.push(arrAt(rows[i], istart, iend))
    }

    return m
}


export default matat
