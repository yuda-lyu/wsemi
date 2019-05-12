import each from 'lodash/each'
import concat from 'lodash/concat'
import isearr from './isearr.mjs'
import isobj from './isobj.mjs'
import ltdt2mat from './ltdt2mat.mjs'


/**
 * keys轉heads後，由物件陣列ltdt轉二維陣列mat
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/ltdth2mat.test.js Github}
 *
 * @example
 *
 * @memberOf wsemi
 * @param {Array} keys 輸入字串陣列
 * @param {Object} kphead 輸入字典物件，內含keys對應values之物件，供keys查詢得values
 * @param {Array} ltdt 輸入物件陣列
 * @returns {Array} 回傳資料陣列
 */
function ltdth2mat(keys, kphead, ltdt) {

    //check
    if (!isearr(keys)) {
        return []
    }
    if (!isobj(kphead)) {
        return []
    }
    if (!isearr(ltdt)) {
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


export default ltdth2mat
