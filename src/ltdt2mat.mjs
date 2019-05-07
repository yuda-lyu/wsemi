import each from 'lodash/each'
import map from 'lodash/map'
import join from 'lodash/join'
import isarr from './isarr.mjs'
import isobj from './isobj.mjs'
import o2j from './o2j.mjs'


/**
 * 由物件陣列ltdt並使用keys轉二維陣列mat
 *
 * @export
 * @param {Array} keys 輸入字串陣列
 * @param {Array} ltdt 輸入物件陣列
 * @returns {Array} 回傳資料陣列
 */
export default function ltdt2mat(keys, ltdt) {

    //check
    if (!isarr(keys)) {
        return []
    }
    if (!isarr(ltdt)) {
        return []
    }

    //mdata
    let mdata = []
    each(ltdt, function(v) {
        let r = map(keys, function(k) {
            if (isarr(v[k])) {
                if (v[k].length > 0) {
                    return join(v[k], ',')
                }
                else {
                    return ''
                }
            }
            else if (isobj(v[k])){
                return o2j(v[k])
            }
            return v[k]
        })
        mdata.push(r)
    })

    return mdata
}
