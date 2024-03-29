import each from 'lodash-es/each.js'
import isearr from './isearr.mjs'
import isnum from './isnum.mjs'
import cdbl from './cdbl.mjs'


/**
 * 回傳累加後陣列
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/arrAccum.test.mjs Github}
 * @memberOf wsemi
 * @param {Array} vec 輸入要被累加計算的陣列
 * @returns {Array} 回傳各元素累加後之陣列
 * @example
 *
 * console.log(arrAccum([1, 2, 3, 4]))
 * // => [1, 3, 6, 10]
 *
 */
function arrAccum(vec) {

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


export default arrAccum
