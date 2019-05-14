import cloneDeep from 'lodash/cloneDeep'
import pullAll from 'lodash/pullAll'
import isearr from './isearr.mjs'


/**
 * 由vall陣列移除vdel陣列
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/arrpull.test.js Github}
 * @memberOf wsemi
 * @param {Array} vall 輸入要被刪除的任意資料陣列
 * @param {Array} vdel 輸入要刪除的任意資料陣列
 * @returns {Array} 回傳被刪除的任意資料陣列
 * @example
 *
 */
function arrpull(vall, vdel) {

    //check
    if (!isearr(vall)) {
        return []
    }
    if (!isearr(vdel)) {
        return []
    }

    let t = cloneDeep(vall)
    pullAll(t, vdel)

    return t
}


export default arrpull
