import range from 'lodash/range'
import at from 'lodash/at'
import isarr from './isarr.mjs'
import isp0int from './isp0int.mjs'
import iser from './iser.mjs'


/**
 * 由vall陣列提取指定欄位(或欄位範圍)之資料
 * 若istart與iend有效, 提取istart~iend欄位
 * 若僅istart有效, 提取istart欄位
 * @export
 * @param {Array} vall 輸入要被提取的任意資料陣列
 * @param {Integer} istart 輸入起始的欄位指標整數
 * @param {Integer} [iend=undefined|] 輸入結束的欄位指標整數，若不使用則等同於istart
 * @returns {Array} 回傳提取的任意資料陣列
 */
export default function arrat(vall, istart, iend = undefined) {

    //check
    if (!isarr(vall)) {
        return []
    }
    if (!isp0int(istart)) {
        return []
    }

    let t
    if (!iser(iend)) {

        //check
        if (!isp0int(iend)) {
            return []
        }
        if (istart >= vall.length || iend >= vall.length) {
            return []
        }

        let inds = range(istart, iend)
        t = at(vall, inds)

    }
    else {

        //check
        if (istart >= vall.length) {
            return []
        }

        t = at(vall, istart)

    }

    return t
}
