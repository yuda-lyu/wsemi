import get from 'lodash/get'
import each from 'lodash/each'
import isNumber from 'lodash/isNumber'
import cloneDeep from 'lodash/cloneDeep'
import isearr from './isearr.mjs'
import isestr from './isestr.mjs'
import isnum from './isnum.mjs'
import iseobj from './iseobj.mjs'
import isfun from './isfun.mjs'
import cdbl from './cdbl.mjs'


/**
 * 依照指定最大最小值物件陣列，查找陣列內各元素之所屬值
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/arrLookupByMaxmin.test.mjs Github}
 * @memberOf wsemi
 * @param {Array} arr 輸入要被切割的陣列，需為物件陣列，否則無法添加查找結果
 * @param {Array} maxmins 輸入要切分的最大最小值物件陣列，每個元素需為物件，至少得要包含keyMax與keyMin欄位
 * @param {Object} [opt={}] 輸入設定物件
 * @param {String} [opt.keyMax='max'] 輸入maxmins內各元素中，儲存最大值欄位字串，預設'max'
 * @param {String} [opt.keyMin='min'] 輸入maxmins內各元素中，儲存最小值欄位字串，預設'min'
 * @param {String} [opt.keyValue='value'] 輸入arr內各元素中，若為物件，則儲存欲判斷數值之欄位字串，預設'value'
 * @param {String} [opt.keyResult='result'] 輸入回傳arr物件陣列中，儲存所屬maxmins元素之欄位字串，預設'result'
 * @param {Function} [opt.beforeAddResult=null] 輸入儲存至arr物件陣列前的處理函數，預設null
 * @returns {Array} 回傳切割後的陣列
 * @example
 *
 * let arr1 = [
 *     {
 *         name: 'a',
 *         value: 1.1,
 *     },
 *     {
 *         name: 'b',
 *         value: 2.2,
 *     },
 *     {
 *         name: 'c',
 *         value: 3.3,
 *     },
 *     {
 *         name: 'd',
 *         value: 4.4,
 *     },
 *     {
 *         name: 'e',
 *         value: 5.5,
 *     },
 *     {
 *         name: 'f',
 *         value: 6.6,
 *     },
 * ]
 * let mm1 = [
 *     {
 *         min: 0,
 *         max: 2,
 *     },
 *     {
 *         min: 2,
 *         max: 5,
 *     },
 * ]
 * console.log(arrLookupByMaxmin(arr1, mm1))
 * // => [
 * //   { name: 'a', value: 1.1, result: { min: 0, max: 2 } },
 * //   { name: 'b', value: 2.2, result: { min: 2, max: 5 } },
 * //   { name: 'c', value: 3.3, result: { min: 2, max: 5 } },
 * //   { name: 'd', value: 4.4, result: { min: 2, max: 5 } },
 * //   { name: 'e', value: 5.5 },
 * //   { name: 'f', value: 6.6 }
 * // ]
 *
 * let arr2 = [
 *     {
 *         name: 'a',
 *         value: 1.1,
 *     },
 *     {
 *         name: 'b',
 *         value: 2.2,
 *     },
 *     {
 *         name: 'c',
 *         value: 3.3,
 *     },
 *     {
 *         name: 'd',
 *         value: 4.4,
 *     },
 *     {
 *         name: 'e',
 *         value: 5.5,
 *     },
 *     {
 *         name: 'f',
 *         value: 6.6,
 *     },
 * ]
 * let mm2 = [
 *     {
 *         rmin: 0,
 *         rmax: 2,
 *     },
 *     {
 *         rmin: 2,
 *         rmax: 5,
 *     },
 * ]
 * console.log(arrLookupByMaxmin(arr2, mm2, { keyMin: 'rmin', keyMax: 'rmax' }))
 * // => [
 * //   { name: 'a', value: 1.1, result: { rmin: 0, rmax: 2 } },
 * //   { name: 'b', value: 2.2, result: { rmin: 2, rmax: 5 } },
 * //   { name: 'c', value: 3.3, result: { rmin: 2, rmax: 5 } },
 * //   { name: 'd', value: 4.4, result: { rmin: 2, rmax: 5 } },
 * //   { name: 'e', value: 5.5 },
 * //   { name: 'f', value: 6.6 }
 * // ]
 *
 * let arr3 = [
 *     {
 *         name: 'a',
 *         data: 1.1,
 *     },
 *     {
 *         name: 'b',
 *         data: 2.2,
 *     },
 *     {
 *         name: 'c',
 *         data: 3.3,
 *     },
 *     {
 *         name: 'd',
 *         data: 4.4,
 *     },
 *     {
 *         name: 'e',
 *         data: 5.5,
 *     },
 *     {
 *         name: 'f',
 *         data: 6.6,
 *     },
 * ]
 * let mm3 = [
 *     {
 *         min: 0,
 *         max: 2,
 *     },
 *     {
 *         min: 2,
 *         max: 5,
 *     },
 * ]
 * console.log(arrLookupByMaxmin(arr3, mm3, { keyValue: 'data' }))
 * // => [
 * //   { name: 'a', data: 1.1, result: { min: 0, max: 2 } },
 * //   { name: 'b', data: 2.2, result: { min: 2, max: 5 } },
 * //   { name: 'c', data: 3.3, result: { min: 2, max: 5 } },
 * //   { name: 'd', data: 4.4, result: { min: 2, max: 5 } },
 * //   { name: 'e', data: 5.5 },
 * //   { name: 'f', data: 6.6 }
 * // ]
 *
 * let arr4 = [
 *     {
 *         name: 'a',
 *         value: 1.1,
 *     },
 *     {
 *         name: 'b',
 *         value: 2.2,
 *     },
 *     {
 *         name: 'c',
 *         value: 3.3,
 *     },
 *     {
 *         name: 'd',
 *         value: 4.4,
 *     },
 *     {
 *         name: 'e',
 *         value: 5.5,
 *     },
 *     {
 *         name: 'f',
 *         value: 6.6,
 *     },
 * ]
 * let mm4 = [
 *     {
 *         min: 0,
 *         max: 2,
 *     },
 *     {
 *         min: 2,
 *         max: 5,
 *     },
 * ]
 * console.log(arrLookupByMaxmin(arr4, mm4, { keyResult: 'res' }))
 * // => [
 * //   { name: 'a', value: 1.1, res: { min: 0, max: 2 } },
 * //   { name: 'b', value: 2.2, res: { min: 2, max: 5 } },
 * //   { name: 'c', value: 3.3, res: { min: 2, max: 5 } },
 * //   { name: 'd', value: 4.4, res: { min: 2, max: 5 } },
 * //   { name: 'e', value: 5.5 },
 * //   { name: 'f', value: 6.6 }
 * // ]
 *
 * let arr5 = [
 *     {
 *         name: 'a',
 *         value: 1.1,
 *     },
 *     {
 *         name: 'b',
 *         value: 2.2,
 *     },
 *     {
 *         name: 'c',
 *         value: 3.3,
 *     },
 *     {
 *         name: 'd',
 *         value: 4.4,
 *     },
 *     {
 *         name: 'e',
 *         value: 5.5,
 *     },
 *     {
 *         name: 'f',
 *         value: 6.6,
 *     },
 * ]
 * let mm5 = [
 *     {
 *         name: 'x1',
 *         min: 0,
 *         max: 2,
 *     },
 *     {
 *         name: 'x2',
 *         min: 2,
 *         max: 5,
 *     },
 * ]
 * console.log(arrLookupByMaxmin(arr5, mm5, {
 *     keyResult: 'res',
 *     beforeAddResult: (m) => {
 *         return m.name
 *     }
 * }))
 * // => [
 * //   { name: 'a', value: 1.1, res: 'x1' },
 * //   { name: 'b', value: 2.2, res: 'x2' },
 * //   { name: 'c', value: 3.3, res: 'x2' },
 * //   { name: 'd', value: 4.4, res: 'x2' },
 * //   { name: 'e', value: 5.5 },
 * //   { name: 'f', value: 6.6 }
 * // ]
 *
 */
function arrLookupByMaxmin(arr, maxmins, opt = {}) {

    //keyMax in maxmins
    let keyMax = get(opt, 'keyMax')
    if (!isestr(keyMax)) {
        keyMax = 'max'
    }

    //keyMin in maxmins
    let keyMin = get(opt, 'keyMin')
    if (!isestr(keyMin)) {
        keyMin = 'min'
    }

    //keyValue in arr
    let keyValue = get(opt, 'keyValue')
    if (!isestr(keyValue)) {
        keyValue = 'value'
    }

    //keyResult for result from arr
    let keyResult = get(opt, 'keyResult')
    if (!isestr(keyResult)) {
        keyResult = 'result'
    }

    //beforeAddResult for result from maxmins
    let beforeAddResult = get(opt, 'beforeAddResult', null)

    //check
    if (!isearr(arr)) {
        return []
    }
    if (!isearr(maxmins)) {
        return []
    }

    //isObjArray
    let isObjArray = iseobj(get(arr, 0))
    if (!isObjArray) {
        return []
    }

    //rs
    let rs = cloneDeep(arr)
    each(rs, (v, k) => {
        let value = get(v, keyValue)
        if (isnum(value)) {
            value = cdbl(value)
        }
        else {
            // console.log(`can not find keyValue[${keyValue}] in element of arr(object array)`)
        }
        if (isNumber(value)) {
            each(maxmins, (mm, kmm) => {
                let rmax = get(mm, keyMax, null)
                let rmin = get(mm, keyMin, null)
                if (rmax !== null && rmin !== null) {
                    if (isnum(rmax) && isnum(rmin)) {
                        rmax = cdbl(rmax)
                        rmin = cdbl(rmin)
                        if (value >= rmin && value <= rmax) {

                            //beforeAddResult
                            if (isfun(beforeAddResult)) {
                                mm = beforeAddResult(mm, rs[k], k)
                            }

                            //save
                            rs[k][keyResult] = mm

                            return true //跳出換下1個
                        }
                    }
                    else {
                        // console.log(`maxmins['${kmm}'][${keyMax}] or maxmins['${kmm}'][${keyMin}] is not a number`)
                    }
                }
                else {
                    // console.log(`can not find keyMax[${keyMax}] or keyMin[${keyMin}] in element of maxmins`)
                }
            })
        }
    })

    return rs
}


export default arrLookupByMaxmin
