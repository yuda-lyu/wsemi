import get from 'lodash-es/get.js'
import each from 'lodash-es/each.js'
import cloneDeep from 'lodash-es/cloneDeep.js'
import isearr from './isearr.mjs'
import isestr from './isestr.mjs'
import isenum from './isenum.mjs'
import iseobj from './iseobj.mjs'
import isfun from './isfun.mjs'
import haskey from './haskey.mjs'
import maxminsLimits from './_maxminsLimits.mjs'


/**
 * 依照指定最大最小值物件陣列，查找陣列內各元素之所屬值
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/arrLookupByMaxmin.test.mjs Github}
 * @memberOf wsemi
 * @param {Array} arr 輸入要被切割的陣列，需為物件陣列，否則無法添加查找結果；各元素之keyValue欄位須為有效數字(有限數字或十進位數字字串，去頭尾空白後取值；Infinity、'Infinity'、'0x10'、包裝物件、null、非數字字串皆非有效數字)，非有效數字之元素略過不查找(不添加keyItems)
 * @param {Array} maxmins 輸入要切分的最大最小值物件陣列，每個元素需為物件，至少得要包含keyMax與keyMin欄位，其值須為有效數字(同上，數字字串亦可)；maxmins屬設定，上下限無效(未給、null、Infinity、'0x10'、包裝物件、非數字字串等)即throw Error(`invalid maxmins[索引].鍵: must be a valid number`，訊息不帶輸入值)，且不論arr內容；欲表示「無上限或無下限」請自行給適當之有限極值(如1e20、-1e20)
 * @param {Object} [opt={}] 輸入設定物件
 * @param {String} [opt.keyMax='max'] 輸入maxmins內各元素中，儲存最大值欄位字串，預設'max'
 * @param {String} [opt.keyMin='min'] 輸入maxmins內各元素中，儲存最小值欄位字串，預設'min'
 * @param {String} [opt.keyValue='value'] 輸入arr內各元素中，若為物件，則儲存欲判斷數值之欄位字串，預設'value'
 * @param {String} [opt.keyItems='items'] 輸入回傳arr物件陣列中，儲存所屬maxmins元素之欄位字串，預設'items'
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
 * console.log(JSON.stringify(arrLookupByMaxmin(arr1, mm1), null, 2))
 * // => [
 * //   {
 * //     "name": "a",
 * //     "value": 1.1,
 * //     "items": [
 * //       {
 * //         "min": 0,
 * //         "max": 2
 * //       }
 * //     ]
 * //   },
 * //   {
 * //     "name": "b",
 * //     "value": 2.2,
 * //     "items": [
 * //       {
 * //         "min": 2,
 * //         "max": 5
 * //       }
 * //     ]
 * //   },
 * //   {
 * //     "name": "c",
 * //     "value": 3.3,
 * //     "items": [
 * //       {
 * //         "min": 2,
 * //         "max": 5
 * //       }
 * //     ]
 * //   },
 * //   {
 * //     "name": "d",
 * //     "value": 4.4,
 * //     "items": [
 * //       {
 * //         "min": 2,
 * //         "max": 5
 * //       }
 * //     ]
 * //   },
 * //   {
 * //     "name": "e",
 * //     "value": 5.5
 * //   },
 * //   {
 * //     "name": "f",
 * //     "value": 6.6
 * //   }
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
 * console.log(JSON.stringify(arrLookupByMaxmin(arr2, mm2, { keyMin: 'rmin', keyMax: 'rmax' }), null, 2))
 * // => [
 * //   {
 * //     "name": "a",
 * //     "value": 1.1,
 * //     "items": [
 * //       {
 * //         "rmin": 0,
 * //         "rmax": 2
 * //       }
 * //     ]
 * //   },
 * //   {
 * //     "name": "b",
 * //     "value": 2.2,
 * //     "items": [
 * //       {
 * //         "rmin": 2,
 * //         "rmax": 5
 * //       }
 * //     ]
 * //   },
 * //   {
 * //     "name": "c",
 * //     "value": 3.3,
 * //     "items": [
 * //       {
 * //         "rmin": 2,
 * //         "rmax": 5
 * //       }
 * //     ]
 * //   },
 * //   {
 * //     "name": "d",
 * //     "value": 4.4,
 * //     "items": [
 * //       {
 * //         "rmin": 2,
 * //         "rmax": 5
 * //       }
 * //     ]
 * //   },
 * //   {
 * //     "name": "e",
 * //     "value": 5.5
 * //   },
 * //   {
 * //     "name": "f",
 * //     "value": 6.6
 * //   }
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
 * console.log(JSON.stringify(arrLookupByMaxmin(arr3, mm3, { keyValue: 'data' }), null, 2))
 * // => [
 * //   {
 * //     "name": "a",
 * //     "data": 1.1,
 * //     "items": [
 * //       {
 * //         "min": 0,
 * //         "max": 2
 * //       }
 * //     ]
 * //   },
 * //   {
 * //     "name": "b",
 * //     "data": 2.2,
 * //     "items": [
 * //       {
 * //         "min": 2,
 * //         "max": 5
 * //       }
 * //     ]
 * //   },
 * //   {
 * //     "name": "c",
 * //     "data": 3.3,
 * //     "items": [
 * //       {
 * //         "min": 2,
 * //         "max": 5
 * //       }
 * //     ]
 * //   },
 * //   {
 * //     "name": "d",
 * //     "data": 4.4,
 * //     "items": [
 * //       {
 * //         "min": 2,
 * //         "max": 5
 * //       }
 * //     ]
 * //   },
 * //   {
 * //     "name": "e",
 * //     "data": 5.5
 * //   },
 * //   {
 * //     "name": "f",
 * //     "data": 6.6
 * //   }
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
 * console.log(JSON.stringify(arrLookupByMaxmin(arr4, mm4, { keyItems: 'res' }), null, 2))
 * // => [
 * //   {
 * //     "name": "a",
 * //     "value": 1.1,
 * //     "res": [
 * //       {
 * //         "min": 0,
 * //         "max": 2
 * //       }
 * //     ]
 * //   },
 * //   {
 * //     "name": "b",
 * //     "value": 2.2,
 * //     "res": [
 * //       {
 * //         "min": 2,
 * //         "max": 5
 * //       }
 * //     ]
 * //   },
 * //   {
 * //     "name": "c",
 * //     "value": 3.3,
 * //     "res": [
 * //       {
 * //         "min": 2,
 * //         "max": 5
 * //       }
 * //     ]
 * //   },
 * //   {
 * //     "name": "d",
 * //     "value": 4.4,
 * //     "res": [
 * //       {
 * //         "min": 2,
 * //         "max": 5
 * //       }
 * //     ]
 * //   },
 * //   {
 * //     "name": "e",
 * //     "value": 5.5
 * //   },
 * //   {
 * //     "name": "f",
 * //     "value": 6.6
 * //   }
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
 * console.log(JSON.stringify(arrLookupByMaxmin(arr5, mm5, {
 *     keyItems: 'res',
 *     beforeAddResult: (m) => {
 *         return m.name
 *     }
 * }), null, 2))
 * // => [
 * //   {
 * //     "name": "a",
 * //     "value": 1.1,
 * //     "res": [
 * //       "x1"
 * //     ]
 * //   },
 * //   {
 * //     "name": "b",
 * //     "value": 2.2,
 * //     "res": [
 * //       "x2"
 * //     ]
 * //   },
 * //   {
 * //     "name": "c",
 * //     "value": 3.3,
 * //     "res": [
 * //       "x2"
 * //     ]
 * //   },
 * //   {
 * //     "name": "d",
 * //     "value": 4.4,
 * //     "res": [
 * //       "x2"
 * //     ]
 * //   },
 * //   {
 * //     "name": "e",
 * //     "value": 5.5
 * //   },
 * //   {
 * //     "name": "f",
 * //     "value": 6.6
 * //   }
 * // ]
 *
 * let arr6 = [
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
 * let mm6 = [
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
 * console.log(JSON.stringify(arrLookupByMaxmin(arr6, mm6), null, 2))
 * // => [
 * //   {
 * //     "name": "a",
 * //     "value": 1.1
 * //   },
 * //   {
 * //     "name": "b",
 * //     "value": 2.2,
 * //     "items": [
 * //       {
 * //         "min": 1.1,
 * //         "minType": ">",
 * //         "max": 2.2,
 * //         "maxType": "<="
 * //       },
 * //       {
 * //         "min": 2.2,
 * //         "minType": ">=",
 * //         "max": 5.5,
 * //         "maxType": "<"
 * //       }
 * //     ]
 * //   },
 * //   {
 * //     "name": "c",
 * //     "value": 3.3,
 * //     "items": [
 * //       {
 * //         "min": 2.2,
 * //         "minType": ">=",
 * //         "max": 5.5,
 * //         "maxType": "<"
 * //       }
 * //     ]
 * //   },
 * //   {
 * //     "name": "d",
 * //     "value": 4.4,
 * //     "items": [
 * //       {
 * //         "min": 2.2,
 * //         "minType": ">=",
 * //         "max": 5.5,
 * //         "maxType": "<"
 * //       }
 * //     ]
 * //   },
 * //   {
 * //     "name": "e",
 * //     "value": 5.5
 * //   },
 * //   {
 * //     "name": "f",
 * //     "value": 6.6
 * //   }
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

    //keyItems for items from arr
    let keyItems = get(opt, 'keyItems')
    if (!isestr(keyItems)) {
        keyItems = 'items'
    }

    //beforeAddResult for items from maxmins
    let beforeAddResult = get(opt, 'beforeAddResult', null)

    //check, maxmins不是有效陣列時維持回傳空陣列
    if (!isearr(maxmins)) {
        return []
    }

    //limits, maxmins為設定, 上下限無效即throw(不帶值), 先於arr檢查, 是否報錯與arr之內容無關
    let limits = maxminsLimits(maxmins, keyMax, keyMin)

    //check
    if (!isearr(arr)) {
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

        //value, 查找值為資料, 非有效數字(isenum判定)者略過該筆(不添加keyItems)
        let value = get(v, keyValue)
        if (isenum(value)) {
            value = Number(value)
        }
        else {
            value = null
            // console.log(`can not find keyValue[${keyValue}] in element of arr(object array)`)
        }
        if (value !== null) {
            each(maxmins, (mm, kmm) => {

                //rmax, rmin
                let { rmax, rmin } = limits[kmm]

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

                    //beforeAddResult
                    if (isfun(beforeAddResult)) {
                        mm = beforeAddResult(mm, rs[k], k)
                    }

                    //check
                    if (!haskey(rs[k], keyItems)) {
                        rs[k][keyItems] = []
                    }

                    //save
                    rs[k][keyItems].push(mm)

                }

            })
        }
    })

    return rs
}


export default arrLookupByMaxmin
