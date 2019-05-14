import each from 'lodash/each'
import isearr from './isearr.mjs'
import isnum from './isnum.mjs'
import cdbl from './cdbl.mjs'


/**
 * 回傳累加後陣列
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/arraccum.test.js Github}
 * @memberOf wsemi
 * @param {Array} vec 輸入要被累加計算的陣列
 * @returns {Array} 回傳各元素累加後之陣列
 * @example
 *
 */
function arraccum(vec) {

    //check
    if (!isearr(vec)) {
        return []
    }

    let r = []
    let vv = 0
    each(vec, function(v) {
        vv += cdbl(v)
        if (isnum(v)) {
            r.push(vv)
        }
        else {
            r.push('')
        }
    })
    return r
}


export default arraccum
