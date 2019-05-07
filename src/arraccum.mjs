import each from 'lodash/each'
import isarr from './isarr.mjs'
import isnum from './isnum.mjs'
import cdbl from './cdbl.mjs'


/**
 * 回傳累加後陣列
 * arraccum([1,2,3,null,4])=[1,3,6,'',10]
 * @export
 * @param {Array} vec 輸入要被累加計算的陣列
 * @returns {Array} 回傳各元素累加後之陣列
 */
export default function arraccum(vec) {

    //check
    if (!isarr(vec)) {
        return {}
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
