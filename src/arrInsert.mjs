import size from 'lodash-es/size.js'
import isarr from './isarr.mjs'
import iseint from './iseint.mjs'


/**
 * 於陣列arr內指定位置ind插入新陣列items
 *
 * ind為必須參數，須為有效整數(iseint，數字字串亦可，去頭尾空白後取值)且為索引(0~4294967294)，並須不大於arr長度，無效(含負數、小數、Infinity、'0x1'、包裝物件、超過長度)回傳原陣列arr，不報錯
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/arrInsert.test.mjs Github}
 * @memberOf wsemi
 * @param {Array} arr 輸入原始陣列
 * @param {Integer|String} ind 輸入插入指標，必須參數(有效整數，0~4294967294，數字字串亦可)，無效回傳原陣列arr
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

    //check ind, 必須參數, 需為有效整數且為索引, 有效則取轉換值(字串型數字不可原樣交給slice)
    if (!iseint(ind, { use: 'index' })) {
        return arr
    }
    ind = Number(ind)

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
