import each from 'lodash/each'
import isearr from './isearr.mjs'
import dtmapping from './dtmapping.mjs'


/**
 * 針對物件陣列ltdt呼叫dtmapping處理
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/ltdtmapping.test.js Github}
 *
 * @example
 *
 * @memberOf wsemi
 * @param {Array} ltdt 輸入資料物件陣列
 * @param {Array} keys 輸入keys值字串陣列
 * @returns {Array} 回傳處理後物件陣列
 */
function ltdtmapping(ltdt, keys) {
    //針對物件陣列ltdt呼叫dtmapping處理

    //check
    if (!isearr(ltdt)) {
        return []
    }
    if (!isearr(keys)) {
        return []
    }

    let r = []
    each(ltdt, function(dt) {
        r.push(dtmapping(dt, keys))
    })

    return r
}


export default ltdtmapping
