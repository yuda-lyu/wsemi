import each from 'lodash/each'
import concat from 'lodash/concat'
import isarr from './isarr.mjs'
import isobj from './isobj.mjs'
import ltdt2mat from './ltdt2mat.mjs'


/**
 * keys轉heads後，由物件陣列ltdt轉二維陣列mat
 *
 * @export
 * @param {Array} keys 輸入字串陣列
 * @param {Object} kphead 輸入字典物件，內含keys對應values之物件，供keys查詢得values
 * @param {Array} ltdt 輸入物件陣列
 * @returns {Array} 回傳資料陣列
 */
export default function ltdth2mat(keys, kphead, ltdt) {

    //check
    if (!isarr(keys)) {
        return []
    }
    if (!isobj(kphead)) {
        return []
    }
    if (!isarr(ltdt)) {
        return []
    }

    //h
    let h = []
    each(keys, function(key) {
        h.push(kphead[key])
    })

    //m
    let m = ltdt2mat(keys, ltdt)

    //mdata
    let mdata = concat([h], m)

    return mdata
}
