import each from 'lodash/each'
import map from 'lodash/map'
import concat from 'lodash/concat'
import isearr from './isearr.mjs'
import iseobj from './iseobj.mjs'
import getdtv from './getdtv.mjs'
import ltdtkeys2mat from './ltdtkeys2mat.mjs'


/**
 * keys轉heads，物件陣列ltdt使用keys取值，兩者合併轉出二維陣列mat
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/ltdtkeysheads2mat.test.js Github}
 *
 * @example
 *
 * @memberOf wsemi
 * @param {Array} ltdt 輸入物件陣列
 * @param {Array} keys 輸入字串陣列
 * @param {Object} kphead 輸入字典物件，內含keys對應values之物件，供keys查詢得values
 * @returns {Array} 回傳資料陣列
 */
function ltdtkeysheads2mat(ltdt, keys, kphead) {

    //check
    if (!isearr(ltdt)) {
        return []
    }
    if (!isearr(keys)) {
        return []
    }
    if (!iseobj(kphead)) {
        return []
    }

    //check ltdt
    let b = false
    each(ltdt, function(v) {
        if (!iseobj(v)) {
            b = true
        }
    })
    if (b) {
        return []
    }

    //h
    let h = map(keys, function(key) {
        return getdtv(kphead, key)
    })

    //m
    let m = ltdtkeys2mat(ltdt, keys)

    //mat
    let mat = concat([h], m)

    return mat
}


export default ltdtkeysheads2mat
