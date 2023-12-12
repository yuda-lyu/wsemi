import get from 'lodash-es/get'
import each from 'lodash-es/each'
import isNumber from 'lodash-es/isNumber'
import cloneDeep from 'lodash-es/cloneDeep'
import isearr from './isearr.mjs'
import isestr from './isestr.mjs'
import isnum from './isnum.mjs'
import cdbl from './cdbl.mjs'
import haskey from './haskey.mjs'


/**
 * 依照指定最大最小值物件陣列切分陣列
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/arrGroupByMaxmin.test.mjs Github}
 * @memberOf wsemi
 * @param {Array} arr 輸入要被切割的陣列
 * @param {Array} maxmins 輸入要切分的最大最小值物件陣列，每個元素需為物件，至少得要包含keyMax與keyMin欄位
 * @param {Object} [opt={}] 輸入設定物件
 * @param {String} [opt.keyMax='max'] 輸入maxmins內各元素中，儲存最大值欄位字串，預設'max'
 * @param {String} [opt.keyMin='min'] 輸入maxmins內各元素中，儲存最小值欄位字串，預設'min'
 * @param {String} [opt.keyValue='value'] 輸入arr內各元素中，若為物件，則儲存欲判斷數值之欄位字串，預設'value'
 * @param {String} [opt.keyItems='items'] 輸入回傳maxmins物件陣列中，儲存所屬arr元素之欄位字串，預設'items'
 * @returns {Array} 回傳切割後的陣列
 * @example
 *
 * let arr1 = [1.1, 2.2, 3.3, 4.4, 5.5, 6.6]
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
 * console.log(arrGroupByMaxmin(arr1, mm1))
 * // => [
 * //   { min: 0, max: 2, items: [ 1.1 ] },
 * //   { min: 2, max: 5, items: [ 2.2, 3.3, 4.4 ] }
 * // ]
 *
 * let arr2 = [1.1, 2.2, 3.3, 4.4, 5.5, 6.6]
 * let mm2 = [
 *     {
 *         min: 0,
 *         max: 2,
 *     },
 *     {
 *         min: 2.5,
 *         max: 5,
 *     },
 * ]
 * console.log(arrGroupByMaxmin(arr2, mm2))
 * // => [
 * //   { min: 0, max: 2, items: [ 1.1 ] },
 * //   { min: 2.5, max: 5, items: [ 3.3, 4.4 ] }
 * // ]
 *
 * let arr3 = [1.1, 2.2, 3.3, 4.4, 5.5, 6.6]
 * let mm3 = [
 *     {
 *         min: -1e20,
 *         max: 2,
 *     },
 *     {
 *         min: 2.5,
 *         max: 5,
 *     },
 *     {
 *         min: 6,
 *         max: 1e20,
 *     },
 * ]
 * console.log(arrGroupByMaxmin(arr3, mm3))
 * // => [
 * //   { min: -100000000000000000000, max: 2, items: [ 1.1 ] },
 * //   { min: 2.5, max: 5, items: [ 3.3, 4.4 ] },
 * //   { min: 6, max: 100000000000000000000, items: [ 6.6 ] }
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
 * console.log(JSON.stringify(arrGroupByMaxmin(arr4, mm4), null, 2))
 * // => [
 * //   {
 * //     "min": 0,
 * //     "max": 2,
 * //     "items": [
 * //       {
 * //         "name": "a",
 * //         "value": 1.1
 * //       }
 * //     ]
 * //   },
 * //   {
 * //     "min": 2,
 * //     "max": 5,
 * //     "items": [
 * //       {
 * //         "name": "b",
 * //         "value": 2.2
 * //       },
 * //       {
 * //         "name": "c",
 * //         "value": 3.3
 * //       },
 * //       {
 * //         "name": "d",
 * //         "value": 4.4
 * //       }
 * //     ]
 * //   }
 * // ]
 *
 * let arr5 = [1.1, 2.2, 3.3, 4.4, 5.5, 6.6]
 * let mm5 = [
 *     {
 *         rmin: 0,
 *         rmax: 2,
 *     },
 *     {
 *         rmin: 2,
 *         rmax: 5,
 *     },
 * ]
 * console.log(arrGroupByMaxmin(arr5, mm5, { keyMin: 'rmin', keyMax: 'rmax' }))
 * // => [
 * //   { rmin: 0, rmax: 2, items: [ 1.1 ] },
 * //   { rmin: 2, rmax: 5, items: [ 2.2, 3.3, 4.4 ] }
 * // ]
 *
 * let arr6 = [
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
 * let mm6 = [
 *     {
 *         min: 0,
 *         max: 2,
 *     },
 *     {
 *         min: 2,
 *         max: 5,
 *     },
 * ]
 * console.log(JSON.stringify(arrGroupByMaxmin(arr6, mm6, { keyValue: 'data' }), null, 2))
 * // => [
 * //   {
 * //     "min": 0,
 * //     "max": 2,
 * //     "items": [
 * //       {
 * //         "name": "a",
 * //         "data": 1.1
 * //       }
 * //     ]
 * //   },
 * //   {
 * //     "min": 2,
 * //     "max": 5,
 * //     "items": [
 * //       {
 * //         "name": "b",
 * //         "data": 2.2
 * //       },
 * //       {
 * //         "name": "c",
 * //         "data": 3.3
 * //       },
 * //       {
 * //         "name": "d",
 * //         "data": 4.4
 * //       }
 * //     ]
 * //   }
 * // ]
 *
 * let arr7 = [1.1, 2.2, 3.3, 4.4, 5.5, 6.6]
 * let mm7 = [
 *     {
 *         min: 0,
 *         max: 2,
 *     },
 *     {
 *         min: 2,
 *         max: 5,
 *     },
 * ]
 * console.log(arrGroupByMaxmin(arr7, mm7, { keyItems: 'result' }))
 * // => [
 * //   { min: 0, max: 2, result: [ 1.1 ] },
 * //   { min: 2, max: 5, result: [ 2.2, 3.3, 4.4 ] }
 * // ]
 *
 * let arr8 = [1.1, 2.2, 3.3, 4.4, 5.5, 6.6]
 * let mm8 = [
 *     {
 *         min: 1.1,
 *         minType: '>',
 *         max: 2.2,
 *         maxType: '<=',
 *     },
 *     {
 *         min: 2.2,
 *         minType: '>=',
 *         max: 5.5,
 *         maxType: '<',
 *     },
 * ]
 * console.log(arrGroupByMaxmin(arr8, mm8))
 * // => [
 * //   {
 * //     min: 1.1,
 * //     minType: '>',
 * //     max: 2.2,
 * //     maxType: '<=',
 * //     items: [ 2.2 ]
 * //   },
 * //   {
 * //     min: 2.2,
 * //     minType: '>=',
 * //     max: 5.5,
 * //     maxType: '<',
 * //     items: [ 2.2, 3.3, 4.4 ]
 * //   }
 * // ]
 *
 *
 * let arr9 = [
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
 * let mm9 = [
 *     {
 *         min: 0,
 *         minType: '>=',
 *         max: 5,
 *         maxType: '<',
 *     },
 *     {
 *         min: 5,
 *         minType: '>=',
 *         max: 10,
 *         maxType: '<',
 *     },
 * ]
 * console.log(JSON.stringify(arrGroupByMaxmin(arr9, mm9), null, 2))
 * // => [
 * //   {
 * //     "min": 0,
 * //     "minType": ">=",
 * //     "max": 5,
 * //     "maxType": "<",
 * //     "items": [
 * //       {
 * //         "name": "a",
 * //         "value": 1.1
 * //       },
 * //       {
 * //         "name": "b",
 * //         "value": 2.2
 * //       },
 * //       {
 * //         "name": "c",
 * //         "value": 3.3
 * //       },
 * //       {
 * //         "name": "d",
 * //         "value": 4.4
 * //       }
 * //     ]
 * //   },
 * //   {
 * //     "min": 5,
 * //     "minType": ">=",
 * //     "max": 10,
 * //     "maxType": "<",
 * //     "items": [
 * //       {
 * //         "name": "e",
 * //         "value": 5.5
 * //       },
 * //       {
 * //         "name": "f",
 * //         "value": 6.6
 * //       }
 * //     ]
 * //   }
 * // ]
 *
 *
 * let arr10 = [
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
 * let mm10 = [
 *     {
 *         min: 0,
 *         minType: '>=',
 *         max: 5,
 *         maxType: '<',
 *     },
 *     {
 *         min: 5,
 *         minType: '>=',
 *         max: 10,
 *         maxType: '<',
 *     },
 * ]
 * console.log(JSON.stringify(arrGroupByMaxmin(arr10, mm10, { keyValue: 'data' }), null, 2))
 * // => [
 * //   {
 * //     "min": 0,
 * //     "minType": ">=",
 * //     "max": 5,
 * //     "maxType": "<",
 * //     "items": [
 * //       {
 * //         "name": "a",
 * //         "data": 1.1
 * //       },
 * //       {
 * //         "name": "b",
 * //         "data": 2.2
 * //       },
 * //       {
 * //         "name": "c",
 * //         "data": 3.3
 * //       },
 * //       {
 * //         "name": "d",
 * //         "data": 4.4
 * //       }
 * //     ]
 * //   },
 * //   {
 * //     "min": 5,
 * //     "minType": ">=",
 * //     "max": 10,
 * //     "maxType": "<",
 * //     "items": [
 * //       {
 * //         "name": "e",
 * //         "data": 5.5
 * //       },
 * //       {
 * //         "name": "f",
 * //         "data": 6.6
 * //       }
 * //     ]
 * //   }
 * // ]
 *
 */
function arrGroupByMaxmin(arr, maxmins, opt = {}) {

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

    //keyItems for result from maxmins
    let keyItems = get(opt, 'keyItems')
    if (!isestr(keyItems)) {
        keyItems = 'items'
    }

    //check
    if (!isearr(arr)) {
        return []
    }
    if (!isearr(maxmins)) {
        return []
    }

    //rs
    let rs = cloneDeep(maxmins)
    each(arr, (v, k) => {
        let value = get(v, keyValue)
        if (isnum(value)) {
            value = cdbl(value)
        }
        else {
            if (isnum(v)) {
                value = cdbl(v)
            }
            else {
                // console.log(`can not find keyValue[${keyValue}] in element of arr(object array)`)
            }
        }
        if (isNumber(value)) {
            each(maxmins, (mm, kmm) => {

                //rmax, rmin
                let rmax = get(mm, keyMax, null)
                let rmin = get(mm, keyMin, null)

                //check
                if (rmax !== null && rmin !== null) {

                    //check
                    if (isnum(rmax) && isnum(rmin)) {

                        //maxType in mm
                        let maxType = get(mm, 'maxType')
                        if (maxType !== '<=' && maxType !== '<') {
                            maxType = '<='
                        }

                        //minType in mm
                        let minType = get(mm, 'minType')
                        if (minType !== '>=' && minType !== '>') {
                            minType = '>='
                        }

                        //cdbl
                        rmax = cdbl(rmax)
                        rmin = cdbl(rmin)

                        //bmin
                        let bmin
                        if (minType === '>=') {
                            bmin = value >= rmin
                        }
                        else {
                            bmin = value > rmin
                        }

                        //bmax
                        let bmax
                        if (maxType === '<=') {
                            bmax = value <= rmax
                        }
                        else {
                            bmax = value < rmax
                        }

                        //check
                        if (bmin && bmax) {

                            //check
                            if (!haskey(rs[kmm], keyItems)) {
                                rs[kmm][keyItems] = []
                            }

                            //push
                            rs[kmm][keyItems].push(v)

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


export default arrGroupByMaxmin
