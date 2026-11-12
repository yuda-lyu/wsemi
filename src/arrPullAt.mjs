import each from 'lodash-es/each.js'
import pullAt from 'lodash-es/pullAt.js'
import cloneDeep from 'lodash-es/cloneDeep.js'
import isarr from './isarr.mjs'
import isearr from './isearr.mjs'
import iseint from './iseint.mjs'


/**
 * 針對陣列移除指定位置或陣列的指定位置
 *
 * vpull為必須參數：單值時須為有效整數(iseint，數字字串亦可，去頭尾空白後取值)且為索引(0~4294967294)，無效(含負數、小數、Infinity、'0x1'、包裝物件、null、undefined等)回傳空陣列[]，不回傳原陣列(使用者2026-11-12，dspec〈輸入參數之檢測機制〉§11 Q1-c：非數值之結構運算之次參數無效回輸出型別之空值)；
 * 為陣列時，其中有效索引者照常移除，無效索引(非數字、負數、小數、Infinity、'0x1'等)者略過，不會被當成索引0而誤刪；空陣列代表無可移除，回傳原陣列之複本
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/arrPullAt.test.mjs Github}
 * @memberOf wsemi
 * @param {Array} vsrc 輸入原始陣列，非有效陣列回傳空陣列[]
 * @param {Array|Integer|String} vpull 輸入要被移除的指定位置或陣列的指定位置，必須參數(有效整數，0~4294967294，數字字串亦可)，單值無效回傳空陣列[]，陣列中之無效索引略過
 * @returns {Array} 回傳移除後陣列(新陣列，不改動原陣列)
 * @example
 *
 * console.log(arrPullAt([1, 2, 3, 4, 5, 'abc'], [0, 2]))
 * // => [ 2, 4, 5, 'abc' ]
 *
 * console.log(arrPullAt([1, 2, 3, '4', 5, 'abc'], [1, 3]))
 * // => [ 1, 3, 5, 'abc' ]
 *
 * console.log(arrPullAt([1, 2, 3, '4', 5, 'abc'], [4, 7]))
 * // => [ 1, 2, 3, '4', 'abc' ]
 *
 * console.log(arrPullAt([1, 2, 3], ['x', 1]))
 * // => [ 1, 3 ] (無效索引'x'略過，不會被當成索引0而誤刪)
 *
 * console.log(arrPullAt([1, 2, 3], 'x'))
 * // => [] (單值vpull無效, 回傳空陣列)
 *
 */
function arrPullAt(vall, vpull) {

    //check
    if (!isearr(vall)) {
        return []
    }

    //vpull, 單值須為有效索引而轉陣列; 無效單值(非陣列)回傳空陣列, 不回原陣列(dspec §11 Q1-c, 使用者2026-11-12); 陣列(含空陣列)照常處理, 其中無效索引於下方略過
    if (iseint(vpull, { use: 'index' })) {
        vpull = [vpull]
    }
    if (!isarr(vpull)) {
        return []
    }

    //inds, 僅取有效索引之轉換值, 無效索引略過(不可經cint變成0而誤刪第0項)
    let inds = []
    each(vpull, (v) => {
        if (iseint(v, { use: 'index' })) {
            inds.push(Number(v))
        }
    })

    //cloneDeep
    let rs = cloneDeep(vall)

    //pullAt
    pullAt(rs, inds)

    return rs
}


export default arrPullAt
