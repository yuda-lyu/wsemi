import map from 'lodash/map'
import arrat from './arrat.mjs'


/**
 * 由二維陣列mall提取資料
 * 若istart與iend有效, 提取istart~iend欄位
 * 若僅istart有效, 提取istart欄位
 * @export
 * @param {Array} mall 輸入要被提取的資料陣列
 * @param {Integer} istart 輸入起始的欄位指標整數
 * @param {Integer} [iend=istart] 輸入結束的欄位指標整數，若不輸入則等同於istart
 * @returns {Array} 回傳提取的資料陣列
 */
export default function matat(mall, istart, iend) {

    let m = map(mall, function(v) {
        return arrat(v, istart, iend)
    })

    return m
}
