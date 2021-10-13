import map from 'lodash/map'
import isearr from './isearr.mjs'
import arrAt from './arrAt.mjs'


/**
 * 由二維陣列mat提取資料
 * 若istart與iend有效, 提取istart~iend欄位
 * 若僅istart有效, 提取istart欄位
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/matat.test.mjs Github}
 * @memberOf wsemi
 * @param {Array} mat 輸入要被提取的資料陣列
 * @param {Integer} istart 輸入起始的欄位指標整數
 * @param {Integer} [iend=istart] 輸入結束的欄位指標整數，若不輸入則等同於istart
 * @returns {Array} 回傳提取的資料陣列
 * @example
 *
 * console.log(matat([['a', 'b', '12.34'], [12, 34.56, 'abc']], 1))
 * // => [['b'], [34.56]]
 *
 * console.log(matat([['a', 'b', '12.34'], [12, 34.56, 'abc']], 1, 2))
 * // => [['b', '12.34'], [34.56, 'abc']]
 *
 */
function matat(mat, istart, iend) {

    //check
    if (!isearr(mat)) {
        return []
    }

    let m = map(mat, function(v) {
        return arrAt(v, istart, iend)
    })

    return m
}


export default matat
