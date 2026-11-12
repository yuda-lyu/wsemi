import pullAll from 'lodash-es/pullAll.js'
import cloneDeep from 'lodash-es/cloneDeep.js'
import isarr from './isarr.mjs'
import isearr from './isearr.mjs'
import isstr from './isstr.mjs'
import isbol from './isbol.mjs'
import isnum from './isnum.mjs'
import isobj from './isobj.mjs'


/**
 * 針對陣列移除元素或陣列內全部元素
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/arrPull.test.mjs Github}
 * @memberOf wsemi
 * @param {Array} vsrc 輸入原始陣列，非有效陣列回傳空陣列[]
 * @param {Array|Object|Number|String|Boolean} vpull 輸入要被移除的元素或陣列，必須參數，單值(物件、數字、字串、布林)自動轉陣列，其餘非陣列(undefined、null、NaN、函數等)為無效而回傳空陣列[]，不回傳原陣列；空陣列代表無可移除，回傳原陣列之複本；限制(既有行為)：以isearr判定待移除之陣列，故單一無效值(''、{}，或['']、[null]、[{}]等)視為無可移除而回傳原陣列之複本，不會移除陣列內之''或null
 * @returns {Array} 回傳移除後陣列(新陣列，不改動原陣列)
 * @example
 *
 * console.log(arrPull([1, 2, 3], null))
 * // => [] (vpull無效, 回傳空陣列)
 *
 * console.log(arrPull([1, 2, 3], []))
 * // => [ 1, 2, 3 ] (無可移除)
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

    //vpull, 單值(物件、數字、字串、布林)自動轉陣列; 其餘非陣列(undefined、null、NaN、函數等)為無效, 回傳空陣列, 不回原陣列(dspec〈輸入參數之檢測機制〉§11 Q1-c, 使用者2026-11-12)
    if (isobj(vpull) || isnum(vpull) || isstr(vpull) || isbol(vpull)) {
        vpull = [vpull]
    }
    if (!isarr(vpull)) {
        return []
    }

    //cloneDeep
    let rs = cloneDeep(vall)

    //vpull為陣列但無有效元素(空陣列, 或isearr視為空之['']、[null]、[{}]等單一無效元素): 無可移除, 回傳複本(內容同修前之原陣列)
    if (!isearr(vpull)) {
        return rs
    }

    //pullAll
    pullAll(rs, vpull)

    return rs
}


export default arrPull
