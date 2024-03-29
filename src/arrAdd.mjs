import size from 'lodash-es/size.js'
import each from 'lodash-es/each.js'
import isarr from './isarr.mjs'
import isnum from './isnum.mjs'
import cdbl from './cdbl.mjs'


function core(v1, v2) {

    //check
    if (!isarr(v1)) {
        return []
    }
    if (!isarr(v2)) {
        return []
    }

    //check size
    if (size(v1) !== size(v2)) {
        return []
    }

    let r = []
    each(v1, function(v, k) {
        let t = null
        let b1 = isnum(v1[k])
        let b2 = isnum(v2[k])
        if (b1 || b2) {
            t = 0
        }
        if (b1) {
            t += cdbl(v1[k])
        }
        if (b2) {
            t += cdbl(v2[k])
        }
        r.push(t)
    })

    return r
}


/**
 * 各陣列內元素相加，可輸入n個同長度陣列，若需輸入之陣列長度不同則回傳空陣列
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/arrAdd.test.mjs Github}
 * @memberOf wsemi
 * @param {Array} arguments 輸入n個陣列，需同長度，其內元素皆會轉為浮點數，各陣列針對各元素進行相加總
 * @returns {Array} 回傳各元素相加後陣列
 * @example
 *
 * let v1 = [1, 2, 3, 4]
 * let v2 = [0.1, 0.1, 0.1, 0.1]
 * let v3 = [11, 22, 33, 44]
 *
 * console.log(arrAdd(v1, v2))
 * // => [ 1.1, 2.1, 3.1, 4.1 ]
 *
 * console.log(arrAdd(v1, v2, v3))
 * // => [ 12.1, 24.1, 36.1, 48.1 ]
 *
 */
function arrAdd() {

    //check
    if (size(arguments) < 2) {
        return []
    }

    let r = arguments[0]
    for (let i = 1; i < size(arguments); i++) {
        let v = arguments[i]
        r = core(r, v)
    }

    return r
}


export default arrAdd
