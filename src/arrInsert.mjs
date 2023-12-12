import size from 'lodash-es/size'
import isarr from './isarr.mjs'
import isp0int from './isp0int.mjs'
import cint from './cint.mjs'


/**
 * 於陣列arr內指定位置ind插入新陣列items
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/arrInsert.test.mjs Github}
 * @memberOf wsemi
 * @param {Array} arr 輸入原始陣列
 * @param {Integer} ind 輸入插入指標
 * @param {String|Number|Object|Boolean|Array} items 輸入欲插入的資料或陣列，非陣列資料都會自動轉陣列再插入
 * @returns {Array} 回傳新陣列
 * @example
 *
 * let arr = [1, 2.5, '123']
 * let r
 *
 * r = arrInsert([], 0, 'abc')
 * console.log(r)
 * // => [ 'abc' ]
 *
 * r = arrInsert(arr, 0, 'abc')
 * console.log(r)
 * // => [ 'abc', 1, 2.5, '123' ]
 *
 * r = arrInsert(arr, 1, 'abc')
 * console.log(r)
 * // => [ 1, 'abc', 2.5, '123' ]
 *
 * r = arrInsert(arr, 3, 'abc')
 * console.log(r)
 * // => [ 1, 2.5, '123', 'abc' ]
 *
 * r = arrInsert(arr, 4, 'abc')
 * console.log(r)
 * // => [ 1, 2.5, '123' ]
 *
 * r = arrInsert(arr, 1, null)
 * console.log(r)
 * // => [ 1, null, 2.5, '123' ]
 *
 * r = arrInsert(arr, 1, ['abc', null, 'xyz'])
 * console.log(r)
 * // => [ 1, 'abc', null, 'xyz', 2.5, '123' ]
 *
 */
function arrInsert(arr, ind, items) {

    //check arr
    if (!isarr(arr)) {
        return []
    }

    //check items, 自動轉陣列
    if (!isarr(items)) {
        items = [items]
    }

    //check ind, 需為正整數
    if (!isp0int(ind)) {
        return arr
    }
    ind = cint(ind)

    //check ind, 指標需位於陣列0~size(arr), 也就是能插入陣列最前與最末
    if (ind > size(arr)) {
        return arr
    }

    let r = arr
    try {
        r = [
            ...arr.slice(0, ind),
            ...items,
            ...arr.slice(ind)
        ]
    }
    catch (err) {}

    return r
}


export default arrInsert
