import each from 'lodash/each'
import isearr from './isearr.mjs'
import iseobj from './iseobj.mjs'
import dtmapping from './dtmapping.mjs'


/**
 * 針對物件陣列ltdt呼叫dtmapping處理，由keys提取dt對應值，若無key則給空字串
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/ltdtmapping.test.js Github}
 * @memberOf wsemi
 * @param {Array} ltdt 輸入資料物件陣列
 * @param {Array} keys 輸入keys值字串陣列
 * @returns {Array} 回傳處理後物件陣列
 * @example
 * ltdtmapping([{ a: 12, b: 34.56 }, { a: '123', b: 'xyz', c: 'mn' }], ['a', 'b', 'c'])
 * // => [{ a: 12, b: 34.56, c: '' }, { a: '123', b: 'xyz', c: 'mn' }]
 */
function ltdtmapping(ltdt, keys) {

    //check
    if (!isearr(ltdt)) {
        return []
    }
    if (!isearr(keys)) {
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

    let r = []
    each(ltdt, function(dt) {
        r.push(dtmapping(dt, keys))
    })

    return r
}


export default ltdtmapping
