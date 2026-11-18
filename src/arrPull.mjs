import pullAll from 'lodash-es/pullAll.js'
import cloneDeep from 'lodash-es/cloneDeep.js'
import isarr from './isarr.mjs'
import isstr from './isstr.mjs'
import isbol from './isbol.mjs'
import isnum from './isnum.mjs'
import isobj from './isobj.mjs'


/**
 * 針對陣列移除元素或陣列內全部元素
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/arrPull.test.mjs Github}
 * @memberOf wsemi
 * @param {Array} vall 輸入原始陣列，非陣列回傳空陣列[]；單一空元素之陣列([null]、['']、[{}])視為一個元素，照常處理而保留(不被當成空陣列)
 * @param {Array|Object|Number|String|Boolean} vpull 輸入要被移除的元素或陣列，必須參數，單值(物件、數字、字串、布林，含''與{})自動轉陣列，其餘非陣列(undefined、null、NaN、函數等)為無效而回傳空陣列[]，不回傳原陣列；空陣列代表無可移除，回傳原陣列之複本；單一空元素之陣列([null]、[''])視為一個待移除值，會移除vall內之null與''(以SameValueZero比對，{}為新物件故無法以值移除)；單值''亦同(移除vall內之'')
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
 * console.log(arrPull([1, null, 2, '', 3], [null, '']))
 * // => [ 1, 2, 3 ] (單一空元素視為一個待移除值)
 *
 * console.log(arrPull([null], [1]))
 * // => [ null ] (單一空元素視為一個元素, 不被當成空陣列)
 *
 */
function arrPull(vall, vpull) {

    //check, vall非陣列回傳空結果[]; 空陣列照常(下方回傳複本[]); 單一空元素([null]、['']、[{}])為一個元素, 不得被當成空陣列而丟棄(W-19, 比照第三批)
    if (!isarr(vall)) {
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

    //vpull為空陣列: 無可移除, 回傳複本; 單一空元素([null]、['']、[{}])為一個待移除值, 不得被當成空陣列而忽略(W-19, 比照第三批)
    if (vpull.length === 0) {
        return rs
    }

    //pullAll
    pullAll(rs, vpull)

    return rs
}


export default arrPull
