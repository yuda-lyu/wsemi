import reverse from 'lodash-es/reverse.js'
import cloneDeep from 'lodash-es/cloneDeep.js'
import isarr from './isarr.mjs'
import isearr from './isearr.mjs'
import isstr from './isstr.mjs'
import isbol from './isbol.mjs'
import isnum from './isnum.mjs'
import isobj from './isobj.mjs'


/**
 * 反序排列陣列
 *
 * vall為必須參數，須為陣列，非陣列(含未給、null、字串、物件等)throw Error('invalid vall: must be an array')，訊息不帶輸入值；空陣列為合法資料，回傳空陣列[]。回傳深拷貝後反序之新陣列，不改動輸入陣列。
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/arrReverse.test.mjs Github}
 * @memberOf wsemi
 * @param {Array} vall 輸入原始陣列，必須參數，須為陣列(空陣列合法，回傳[])，非陣列throw Error('invalid vall: must be an array')
 * @returns {Array} 回傳反序後之新陣列
 * @throws {Error} vall非陣列時throw Error('invalid vall: must be an array')，訊息不帶輸入值
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
 * try {
 *     arrReverse('abc')
 * }
 * catch (err) {
 *     console.log(err.message)
 * }
 * // => invalid vall: must be an array
 *
 */
function arrReverse(vall) {

    //check, vall為必須參數, 非陣列throw(訊息不帶值)
    if (!isarr(vall)) {
        throw new Error('invalid vall: must be an array')
    }

    //check, 空陣列為合法資料回傳[]; 僅含單一廣義無效元素(null、''、{}、[]等)之陣列維持原行為回傳[](本次不動)
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
