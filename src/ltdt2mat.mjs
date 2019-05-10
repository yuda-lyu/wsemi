import each from 'lodash/each'
import map from 'lodash/map'
import isearr from './isearr.mjs'
import isstr from './isstr.mjs'
import isnum from './isnum.mjs'
import o2j from './o2j.mjs'


/**
 * 由物件陣列ltdt並使用keys轉二維陣列mat
 *
 * @memberOf wsemi
 * @param {Array} keys 輸入字串陣列
 * @param {Array} ltdt 輸入物件陣列
 * @returns {Array} 回傳資料陣列
 */
function ltdt2mat(keys, ltdt) {

    //check
    if (!isearr(keys)) {
        return []
    }
    if (!isearr(ltdt)) {
        return []
    }

    //mdata
    let mdata = []
    each(ltdt, function(v) {
        let r = map(keys, function(k) {
            if (!isstr(v[k]) && !isnum(v[k])) {
                return o2j(v[k])
            }
            return v[k]
        })
        mdata.push(r)
    })

    return mdata
}


export default ltdt2mat
