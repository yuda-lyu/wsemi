import map from 'lodash-es/map.js'
import each from 'lodash-es/each.js'
import sortBy from 'lodash-es/sortBy.js'
import iseobj from './iseobj.mjs'
import isfun from './isfun.mjs'


/**
 * 對物件內各鍵進行排序，通過傳入排序函數取得各物件值或鍵，回傳可排序的數字或字串，則可進行對物件的鍵排序
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/objSortBy.test.mjs Github}
 * @memberOf wsemi
 * @param {Object} obj 輸入物件資料
 * @param {Function} fun 輸入回調的排序函數，將傳入(v,k)代表各物件的值與鍵，回傳排序用的值，可為數字或字串
 * @returns {Object} 回傳排序後物件
 * @example
 *
 * let obj1 = {
 *     'a': 3,
 *     'b': 2,
 *     'c': 1,
 * }
 * let robj1 = objSortBy(obj1, (v, k) => {
 *     return v
 * })
 * console.log(robj1)
 * // => { c: 1, b: 2, a: 3 }
 *
 * let obj2 = {
 *     'x2': 2,
 *     'x1': 1,
 *     'x3': 3,
 * }
 * let robj2 = objSortBy(obj2, (v, k) => {
 *     return k
 * })
 * console.log(robj2)
 * // => { x1: 1, x2: 2, x3: 3 }
 *
 */
function objSortBy(obj, fun) {

    //check
    if (!iseobj(obj)) {
        return {}
    }
    if (!isfun(fun)) {
        throw new Error('fun is not a function')
    }

    //rs
    let rs = map(obj, (v, k) => {
        let t = fun(v, k)
        return { k, v, t }
    })

    //sortBy
    rs = sortBy(rs, 't')

    //objTemp
    let objTemp = {}
    each(rs, (r) => {
        objTemp[r.k] = r.v
    })

    return objTemp
}


export default objSortBy
