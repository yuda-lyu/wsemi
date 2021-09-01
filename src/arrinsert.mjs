import size from 'lodash/size'
import isarr from './isarr.mjs'
import isearr from './isearr.mjs'
import isp0int from './isp0int.mjs'
import cint from './cint.mjs'


/**
 * 判斷任一字串陣列vtar內元素，是否「等於」任一字串陣列vhas內元素
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/arrinsert.test.mjs Github}
 * @memberOf wsemi
 * @param {String|Number|Object|Boolean|Array} vtar 輸入被查找的字串陣列或字串
 * @param {String|Number|Object|Boolean|Array} vhas 輸入查找字串陣列或字串
 * @returns {Boolean} 回傳判斷布林值
 * @example
 *
 * let arr = [1, 2.5, '123']
 * let r
 *
 * r = arrinsert(arr, 0, 'abc')
 * console.log(r)
 * // => [ 'abc', 1, 2.5, '123' ]
 *
 * r = arrinsert(arr, 1, 'abc')
 * console.log(r)
 * // => [ 1, 'abc', 2.5, '123' ]
 *
 * r = arrinsert(arr, 3, 'abc')
 * console.log(r)
 * // => [ 1, 2.5, '123', 'abc' ]
 *
 * r = arrinsert(arr, 4, 'abc')
 * console.log(r)
 * // => [ 1, 2.5, '123' ]
 *
 * r = arrinsert(arr, 1, null)
 * console.log(r)
 * // => [ 1, null, 2.5, '123' ]
 *
 * r = arrinsert(arr, 1, ['abc', null, 'xyz'])
 * console.log(r)
 * // => [ 1, 'abc', null, 'xyz', 2.5, '123' ]
 *
 */
function arrinsert(arr, ind, items) {

    //check arr
    if (!isearr(arr)) {
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


export default arrinsert
