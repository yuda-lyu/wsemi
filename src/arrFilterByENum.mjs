import map from 'lodash-es/map.js'
import filter from 'lodash-es/filter.js'
import isarr from './isarr.mjs'
import isenum from './isenum.mjs'


/**
 * 過濾陣列內元素僅保留有效數字，並且自動轉數值
 *
 * 判定用isenum(有效數字: 有限數字，或去頭尾空白後為十進位寫法之數字字串，可帶科學記號)，取值為去頭尾空白後Number(…)，其後只用轉換值。
 * 與arrFilterByNum(基於isnum)之差異: Infinity、-Infinity、'Infinity'、'0x10'、'0b11'、'1e400'、'1e-400'(下溢)、包裝物件(new Number(1))、
 * 空字串與純空白字串、'-'、'NP'等標記字串、null、undefined、NaN、布林、BigInt、物件、陣列等皆不保留。
 * 與arrFilterByPnum(基於ispnum，僅保留正數)之差異: 不限正數，負數與0亦保留。
 * arr須為陣列，非陣列(含未給、null、字串、物件等)回傳空陣列[]，不拋錯(輸入參數檢測機制C7，第1參數型別不對回輸出型別之空結果)；空陣列為合法資料，回傳空陣列[]，亦不因無有效數字而報錯；元素順序與重複皆保留；不改動輸入陣列。
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/arrFilterByENum.test.mjs Github}
 * @memberOf wsemi
 * @param {Array} arr 輸入原始陣列，須為陣列(空陣列合法，回傳[])，非陣列回傳[]
 * @returns {Array} 回傳新陣列，元素皆為Number；無有效數字(含空陣列)或arr非陣列時為空陣列[]
 * @example
 *
 * let arr
 *
 * arr = ['abc', '-2.2', '-1.1', -1.1, -1, -0.5, 0, '0', 0.5, 1, 1.1, '1.1', '2.2', 'xyz']
 * console.log(arrFilterByENum(arr))
 * // => [ -2.2, -1.1, -1.1, -1, -0.5, 0, 0, 0.5, 1, 1.1, 1.1, 2.2 ]
 *
 * arr = [' 12 ', '1.2e-5', '-', 'NP', '', Infinity, '0x10', null, true, new Number(3), 5]
 * console.log(arrFilterByENum(arr))
 * // => [ 12, 0.000012, 5 ]
 *
 * console.log(arrFilterByENum([]))
 * // => []
 *
 * console.log(arrFilterByENum('abc'))
 * // => [] (非陣列回傳空結果, 不拋錯)
 *
 */
function arrFilterByENum(arr) {

    //check, arr為第1參數, 非陣列回傳空結果[](不拋錯; dspec〈輸入參數之檢測機制〉§11 W-16乙, 使用者2026-11-16); 空陣列為合法資料, 照常回傳[]
    if (!isarr(arr)) {
        return []
    }

    //filter, 以包裝函數呼叫isenum, 不讓lodash傳入之索引與陣列落入isenum之opt位置
    arr = filter(arr, (v) => isenum(v))

    //map, 判定通過後取值為去頭尾空白後Number
    arr = map(arr, (v) => Number(v))

    return arr
}


export default arrFilterByENum
