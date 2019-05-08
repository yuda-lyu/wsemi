import each from 'lodash/each'
import isobj from './isobj.mjs'
import isearr from './isearr.mjs'
import haskey from './haskey.mjs'
import getdtv from './getdtv.mjs'


/**
 * 由dt物件提取keys, 僅保留有keys的欄位, 不存在keys的欄位則刪除
 *
 * @export
 * @param {Object} dt 輸入資料物件
 * @param {Array} keys 輸入keys值字串陣列
 * @returns {Object} 回傳處理後物件
 */
export default function dtpick(dt, keys) {

    //check
    if (!isobj(dt)) {
        return {}
    }
    if (!isearr(keys)) {
        return {}
    }

    let r = {}
    each(keys, function(key) {
        if (haskey(dt, key)) {
            r[key] = getdtv(dt, key)
        }
    })

    return r
}
