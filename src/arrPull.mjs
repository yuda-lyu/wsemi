import pullAll from 'lodash-es/pullAll.js'
import cloneDeep from 'lodash-es/cloneDeep.js'
import isearr from './isearr.mjs'
import isstr from './isstr.mjs'
import isbol from './isbol.mjs'
import isnum from './isnum.mjs'
import isobj from './isobj.mjs'


/**
 * 針對陣列移除元素或陣列
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/arrPull.test.mjs Github}
 * @memberOf wsemi
 * @param {Array} vsrc 輸入原始陣列
 * @param {Array|Object|Number|String|Boolean} vpull 輸入要被移除的元素或陣列
 * @returns {Array} 回傳移除後陣列
 * @example
 *
 * console.log(arrPull([1, 2, 3, 4, 5, 'abc'], [1, 4]))
 * // => [ 2, 3, 5, 'abc' ]
 *
 * console.log(arrPull([1, 2, 3, '4', 5, 'abc'], [1, 4]))
 * // => [ 2, 3, '4', 5, 'abc' ]
 *
 * console.log(arrPull([1, 2, 3, '4', 5, 'abc'], [6, 7]))
 * // => [ 1, 2, 3, '4', 5, 'abc' ]
 *
 */
function arrPull(vall, vpull) {

    //check
    if (!isearr(vall)) {
        return []
    }

    //vall
    if (isobj(vpull) || isnum(vpull) || isstr(vpull) || isbol(vpull)) {
        vpull = [vpull]
    }
    if (!isearr(vpull)) {
        return vall
    }

    //cloneDeep
    let rs = cloneDeep(vall)

    //pullAll
    pullAll(rs, vpull)

    return rs
}


export default arrPull
