import get from 'lodash-es/get.js'
import size from 'lodash-es/size.js'
import isEqual from 'lodash-es/isEqual.js'
import isarr from './isarr.mjs'
import isfun from './isfun.mjs'
import isbol from './isbol.mjs'


/**
 * 找尋陣列內元素指定值
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/arrReduce.test.mjs Github}
 * @memberOf wsemi
 * @param {Array} vall 輸入原始陣列，須為陣列，非陣列回傳null；空陣列回傳null(無元素可彙總)；單一空元素之陣列([null]、['']、[{}])視為一個元素，會對該元素呼叫fun(不被當成空陣列)
 * @param {Function} fun 輸入處理與比對函數，輸入參數為全域暫存值與現在提取值，函數比對完須回傳新的全域暫存值；非函數回傳null
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Boolean} [opt.returnIndex=false] 輸入是否回傳排序指標陣列布林值，預設false
 * @returns {Number|Object} 回傳指定值數字或判斷具有指定值之物件
 * @example
 *
 * let r
 *
 * r = arrReduce([100000, 1, 30, 4, 21], (vTemp, vNow) => {
 *     if (vTemp === null) {
 *         return vNow
 *     }
 *     return Math.min(vTemp, vNow)
 * })
 * console.log(r)
 * // => 1
 *
 * r = arrReduce([1, 30, 4, 21, 100000], (vTemp, vNow) => {
 *     if (vTemp === null) {
 *         return vNow
 *     }
 *     return Math.max(vTemp, vNow)
 * })
 * console.log(r)
 * // => 100000
 *
 * r = arrReduce([1, 30, 4, 100000, 21], (vTemp, vNow) => {
 *     if (vTemp === null) {
 *         return vNow
 *     }
 *     return Math.max(vTemp, vNow)
 * }, { returnIndex: true })
 * console.log(r)
 * // => 3
 *
 * r = arrReduce(
 *     [{ s: 'March', i: 1 }, { s: 'Jan', i: 4 }, { s: 'Feb', i: 100000 }, { s: 'Dec', i: 30 }, { s: 'Nov', i: 25, }],
 *     (vTemp, vNow) => {
 *         if (vTemp === null) {
 *             return vNow.i
 *         }
 *         return Math.min(vTemp, vNow.i)
 *     },
 * )
 * console.log(r)
 * // => 1
 *
 * r = arrReduce(
 *     [{ s: 'March', i: 1 }, { s: 'Jan', i: 4 }, { s: 'Feb', i: 100000 }, { s: 'Dec', i: 30 }, { s: 'Nov', i: 25, }],
 *     (vTemp, vNow) => {
 *         if (vTemp === null) {
 *             return vNow
 *         }
 *         return vTemp.i < vNow.i ? vNow : vTemp //max
 *     },
 * )
 * console.log(r)
 * // => { s: 'Feb', i: 100000 }
 *
 * r = arrReduce(
 *     [{ s: 'March', i: 1 }, { s: 'Jan', i: 4 }, { s: 'Feb', i: 100000 }, { s: 'Dec', i: 30 }, { s: 'Nov', i: 25, }],
 *     (vTemp, vNow) => {
 *         if (vTemp === null) {
 *             return vNow
 *         }
 *         return vTemp.i < vNow.i ? vNow : vTemp //max
 *     },
 *     { returnIndex: true }
 * )
 * console.log(r)
 * // => 2
 *
 */
function arrReduce(vall, fun, opt = {}) {

    //check, vall非陣列或空陣列(無元素可彙總)回傳null(彙總類之空結果); 單一空元素([null]、['']、[{}])為一個元素, 會呼叫fun, 不得被當成空陣列而丟棄(W-19, 比照第三批)
    if (!isarr(vall) || vall.length === 0) {
        return null
    }
    if (!isfun(fun)) {
        return null
    }

    //returnIndex
    let returnIndex = get(opt, 'returnIndex')
    if (!isbol(returnIndex)) {
        returnIndex = false
    }

    //find
    let ind = -1
    let vv = null
    for (let k = 0; k < size(vall); k++) {

        //v
        let v = vall[k]

        //fun
        let r = fun(vv, v)

        //update
        if (!isEqual(vv, r)) {
            vv = r
            ind = k
        }

    }

    //returnIndex
    let r = null
    if (returnIndex) {
        r = ind
    }
    else {
        r = vv
    }

    return r
}


export default arrReduce
