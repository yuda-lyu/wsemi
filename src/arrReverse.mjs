import reverse from 'lodash-es/reverse.js'
import cloneDeep from 'lodash-es/cloneDeep.js'
import isearr from './isearr.mjs'
import isstr from './isstr.mjs'
import isbol from './isbol.mjs'
import isnum from './isnum.mjs'
import isobj from './isobj.mjs'


/**
 * 反序排列陣列
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/arrReverse.test.mjs Github}
 * @memberOf wsemi
 * @param {Array} vsrc 輸入原始陣列
 * @returns {Array} 回傳移除後陣列
 * @example
 *
 * console.log(arrReverse([1, 2, 3, 4, 5, 'abc']))
 * // => [ 'abc', 5, 4, 3, 2, 1 ]
 *
 * console.log(arrReverse([1, 2, 3, '4', 5, 'abc']))
 * // => [ 'abc', 5, '4', 3, 2, 1 ]
 *
 */
function arrReverse(vall) {

    //check
    if (!isearr(vall)) {
        return []
    }

    //cloneDeep
    let rs = cloneDeep(vall)

    //reverse
    reverse(rs)

    return rs
}


export default arrReverse
