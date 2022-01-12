import get from 'lodash/get'
import each from 'lodash/each'
import iseobj from './iseobj.mjs'
import isearr from './isearr.mjs'
import objSortBy from './objSortBy.mjs'


/**
 * 對物件內各鍵進行排序，通過傳入指定鍵值陣列，可基於物件各鍵位於指定鍵值陣列之位置進行排序
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/objSortByKeys.test.mjs Github}
 * @memberOf wsemi
 * @param {Object} obj 輸入物件資料
 * @param {Function} fun 輸入回調的排序函數，將傳入(v,k)代表各物件的值與鍵，回傳排序用的值，可為數字或字串
 * @returns {Object} 回傳排序後物件
 * @example
 *
 * let obj1 = {
 *     'x2': 2,
 *     'x1': 1,
 *     'x3': 3,
 * }
 * let arr1 = ['x1', 'x2', 'x3']
 * let robj1 = objSortByKeys(obj1, arr1)
 * console.log(robj1)
 * // => { x1: 1, x2: 2, x3: 3 }
 *
 * let obj2 = {
 *     'x2': 2,
 *     'x111': 1,
 *     'x33': 3,
 * }
 * let arr2 = ['x111', 'x2', 'x33']
 * let robj2 = objSortByKeys(obj2, arr2)
 * console.log(robj2)
 * // => { x111: 1, x2: 2, x33: 3 }
 *
 */
function objSortByKeys(obj, arr) {

    //check
    if (!iseobj(obj)) {
        return {}
    }
    if (!isearr(arr)) {
        return {}
    }

    //kp
    let kp = {}
    each(arr, (v, k) => {
        kp[v] = k
    })
    // console.log('kp', kp)

    //objSortBy
    let objTemp = objSortBy(obj, (v, k) => {
        return get(kp, k, 0)
    })

    return objTemp
}


export default objSortByKeys
