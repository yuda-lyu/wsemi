import map from 'lodash/map'
import isearr from './isearr.mjs'
import arrat from './arrat.mjs'


/**
 * 由二維陣列mat提取資料
 * 若istart與iend有效, 提取istart~iend欄位
 * 若僅istart有效, 提取istart欄位
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/matat.test.js Github}
 * @memberOf wsemi
 * @param {Array} mat 輸入要被提取的資料陣列
 * @param {Integer} istart 輸入起始的欄位指標整數
 * @param {Integer} [iend=istart] 輸入結束的欄位指標整數，若不輸入則等同於istart
 * @returns {Array} 回傳提取的資料陣列
 * @example
 *
 */
function matat(mat, istart, iend) {

    //check
    if (!isearr(mat)) {
        return []
    }

    let m = map(mat, function(v) {
        return arrat(v, istart, iend)
    })

    return m
}


export default matat
