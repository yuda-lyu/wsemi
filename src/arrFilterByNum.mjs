import map from 'lodash/map'
import filter from 'lodash/filter'
import cloneDeep from 'lodash/cloneDeep'
import isearr from './isearr.mjs'
import isnum from './isnum.mjs'
import cdbl from './cdbl.mjs'


/**
 * 過濾陣列內元素僅保留數字，並且自動轉數值
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/arrFilterByNum.test.mjs Github}
 * @memberOf wsemi
 * @param {Array} arr 輸入原始陣列
 * @returns {Array} 回傳新陣列
 * @example
 *
 * let arr
 *
 * arr = ['abc', '-2.2', '-1.1', -1.1, -1, -0.5, 0, '0', 0.5, 1, 1.1, '1.1', '2.2', 'xyz']
 * console.log(arrFilterByNum(arr))
 * // => [ -2.2, -1.1, -1.1, -1, -0.5, 0, 0, 0.5, 1, 1.1, 1.1, 2.2 ]
 *
 * arr = ['-2.2', '-1.1', -1.1, -1, -0.5, 0, '0']
 * console.log(arrFilterByNum(arr))
 * // => [ -2.2, -1.1, -1.1, -1, -0.5, 0, 0 ]
 *
 */
function arrFilterByNum(arr) {

    //check
    if (!isearr(arr)) {
        return []
    }

    //cloneDeep
    arr = cloneDeep(arr)

    //filter
    arr = filter(arr, isnum)

    //map
    arr = map(arr, cdbl)

    return arr
}


export default arrFilterByNum
