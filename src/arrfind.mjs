import map from 'lodash/map'
import indexOf from 'lodash/indexOf'
import isarr from './isarr.mjs'


/**
 * 由vall陣列找尋vfind內各元素之第1位置
 *
 * @export
 * @param {Array} vall 輸入要被尋找的任意資料陣列
 * @param {Array} vfind 輸入要尋找的任意資料陣列
 * @returns {Array} 回傳所找到各元素第1位置之陣列
 */
export default function arrfind(vall, vfind) {

    //check
    if (!isarr(vall)) {
        return []
    }
    if (!isarr(vfind)) {
        return []
    }

    let inds = map(vfind, function(v) {
        return indexOf(vall, v)
    })

    return inds
}
