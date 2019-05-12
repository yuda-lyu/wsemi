import map from 'lodash/map'
import indexOf from 'lodash/indexOf'
import isearr from './isearr.mjs'


/**
 * 由vall陣列找尋vfind內各元素之第1位置
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/arrfind.test.js Github}
 *
 * @example
 *
 * @memberOf wsemi
 * @param {Array} vall 輸入要被尋找的任意資料陣列
 * @param {Array} vfind 輸入要尋找的任意資料陣列
 * @returns {Array} 回傳所找到各元素第1位置之陣列
 */
function arrfind(vall, vfind) {

    //check
    if (!isearr(vall)) {
        return []
    }
    if (!isearr(vfind)) {
        return []
    }

    let inds = map(vfind, function(v) {
        return indexOf(vall, v)
    })

    return inds
}


export default arrfind
