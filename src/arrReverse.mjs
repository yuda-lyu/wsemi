import reverse from 'lodash-es/reverse.js'
import cloneDeep from 'lodash-es/cloneDeep.js'
import isarr from './isarr.mjs'


/**
 * 反序排列陣列
 *
 * vall須為陣列，非陣列(含未給、null、字串、物件等)回傳空陣列[]，不拋錯(輸入參數檢測機制C7，第1參數型別不對回輸出型別之空結果)；空陣列為合法資料，回傳空陣列[]；單一空元素之陣列([null]、['']、[{}]、[[]]、[undefined])視為一個元素，照常反序而保留(回傳深拷貝後之同內容新陣列)。回傳深拷貝後反序之新陣列，不改動輸入陣列。
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/arrReverse.test.mjs Github}
 * @memberOf wsemi
 * @param {Array} vall 輸入原始陣列，須為陣列(空陣列合法，回傳[])，非陣列回傳[]；[null]、['']、[{}]視為一個元素而保留
 * @returns {Array} 回傳反序後之新陣列；vall非陣列或為空陣列時回傳[]
 * @example
 *
 * console.log(arrReverse([1, 2, 3, 4, 5, 'abc']))
 * // => [ 'abc', 5, 4, 3, 2, 1 ]
 *
 * console.log(arrReverse([1, 2, 3, '4', 5, 'abc']))
 * // => [ 'abc', 5, '4', 3, 2, 1 ]
 *
 * console.log(arrReverse([]))
 * // => []
 *
 * console.log(arrReverse([null]))
 * // => [ null ] (單一空元素視為一個元素, 不被當成空陣列)
 *
 * console.log(arrReverse('abc'))
 * // => [] (非陣列回傳空結果, 不拋錯)
 *
 */
function arrReverse(vall) {

    //check, vall為第1參數, 非陣列回傳空結果[](不拋錯; dspec〈輸入參數之檢測機制〉§11 W-16乙, 使用者2026-11-16); 空陣列為合法資料照常回傳[]
    //單一空元素之陣列([null]、['']、[{}]、[[]])視為一個元素, 不得被當成空陣列而丟棄(W-19, 比照第三批)
    if (!isarr(vall)) {
        return []
    }

    //cloneDeep
    let rs = cloneDeep(vall)

    //reverse
    reverse(rs)

    return rs
}


export default arrReverse
