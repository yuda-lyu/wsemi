import get from 'lodash-es/get.js'
import each from 'lodash-es/each.js'
import map from 'lodash-es/map.js'
import sortBy from 'lodash-es/sortBy.js'
import size from 'lodash-es/size.js'
import cloneDeep from 'lodash-es/cloneDeep.js'
import isearr from './isearr.mjs'
import isestr from './isestr.mjs'
import isbol from './isbol.mjs'
import isnum from './isnum.mjs'
import isobj from './isobj.mjs'
import cdbl from './cdbl.mjs'
import cstr from './cstr.mjs'
import trim from './trim.mjs'


//classify, 依可否排序分組(回傳指標): nums為數字與數字字串(可轉數字), strs為非空白之其他字串(可依字串或其內之數字排序),
//  others為無法轉數字或無法解析者(空字串、純空白字串、null、undefined、NaN、布林、物件、陣列等), 無法排序故一律放最末且維持原順序
function classify(vs) {
    let nums = []
    let strs = []
    let others = []
    each(vs, (v, k) => {
        if (isnum(v)) {
            nums.push(k)
        }
        else if (isestr(v) && v.trim() !== '') {
            strs.push(k)
        }
        else {
            others.push(k)
        }
    })
    return { nums, strs, others }
}


//sortNums, 數字依數值排序, 回傳指標
function sortNums(vs, inds) {
    let ts = map(inds, (k) => {
        return {
            key: k,
            value: cdbl(vs[k]),
        }
    })
    return map(sortBy(ts, 'value'), 'key')
}


//sortStrs, 字串排序, 回傳指標: 若皆可剔除開頭結尾非數字字元而得數字(例如'abc1'、'  4 abc ')則依其數值排序, 否則依字串排序
function sortStrs(vs, inds) {
    let vst = map(inds, (k) => {
        return trim(vs[k], { excludeString: true })
    })
    let bAllNum = size(vst) > 0 && vst.every((t) => isnum(t))
    let ts = map(inds, (k, i) => {
        return {
            key: k,
            value: bAllNum ? cdbl(vst[i]) : cstr(vs[k]),
        }
    })
    return map(sortBy(ts, 'value'), 'key')
}


// function lcSort(vs) {
//     return vs.slice().sort((a, b) => a.localeCompare(b))
// }


function lcSortByKey(vs, key) {

    //slice
    let vst = cloneDeep(vs)

    //sort
    vst.sort((a, b) => {

        //localeCompare: https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String/localeCompare
        let r = a[key].localeCompare(b[key], 'standard', { numeric: true })
        // console.log('a[key]', a[key], 'b[key]', b[key], 'r', r)

        return r
    })

    return vst
}


//sortLocale, localeCompare(檔名排序), 回傳指標: 數字與字串皆轉字串以localeCompare(numeric)排序
function sortLocale(vs, inds) {
    let ts = map(inds, (k) => {
        return {
            key: k,
            value: cstr(vs[k]),
        }
    })
    return map(lcSortByKey(ts, 'value'), 'key')
}


//orderInds, 排序後之指標: 數字與數字字串在前, 其他字串其次, 無法轉數字或無法解析者放最末(維持原順序); localeCompare時數字與字串一併以localeCompare排序
function orderInds(vs, localeCompare) {
    let { nums, strs, others } = classify(vs)
    if (localeCompare) {
        let inds = [...nums, ...strs].sort((a, b) => a - b) //依原順序, localeCompare排序為穩定排序
        return [...sortLocale(vs, inds), ...others]
    }
    return [...sortNums(vs, nums), ...sortStrs(vs, strs), ...others]
}


/**
 * 排序vall陣列，可針對純數字、純字串、含固定開頭字元的數字字串、物件陣列進行排列
 *
 * 排序規則(同Excel之升冪)：數字與數字字串依數值排序排在最前；其他字串其次，若皆可剔除開頭結尾非數字字元而得數字(例如'abc1')則依其數值排序，否則依字串排序；無法轉數字或無法解析者(空字串、純空白字串、null、undefined、NaN、布林、物件、陣列等)無法排序，一律放最末並維持原順序
 *
 * localeCompare為true時數字與字串一併以localeCompare(numeric)排序，無法解析者仍放最末；vall全為物件時取compareKey欄位之值套用相同規則，無此欄位者放最末
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/arrSort.test.mjs Github}
 * @memberOf wsemi
 * @param {Array} vall 輸入要被提取的任意資料陣列
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Boolean} [opt.localeCompare=false] 輸入是否使用localeCompare排序布林值，預設false
 * @param {Boolean} [opt.returnIndex=false] 輸入是否回傳排序指標陣列布林值，預設false
 * @param {String} [opt.compareKey=null] 輸入當vall為物件陣列時，指定取compareKey欄位出來排序，compareKey需為有效字串，預設null
 * @returns {Array} 回傳排序後陣列或指標陣列
 * @example
 *
 * let r
 *
 * r = arrSort([1, 30, 4, 21, 100000])
 * console.log(r)
 * // => [ 1, 4, 21, 30, 100000 ]
 *
 * r = arrSort([1, 30, 4, 21, 100000], { returnIndex: true })
 * console.log(r)
 * // => [ 0, 2, 3, 1, 4 ]
 *
 * r = arrSort(['March', 'Jan', 'Feb', 'Dec'])
 * console.log(r)
 * // => [ 'Dec', 'Feb', 'Jan', 'March' ]
 *
 * r = arrSort(['1', '30', '  4  ', '21', '100000'])
 * console.log(r)
 * // => [ '1', '  4  ', '21', '30', '100000' ]
 *
 * r = arrSort(['1', '30', '  4  ', 21, '100000'])
 * console.log(r)
 * // => [ '1', '  4  ', 21, '30', '100000' ]
 *
 * r = arrSort([1, 2, 'abc', 5, 3, '4'])
 * console.log(r)
 * // => [ 1, 2, 3, '4', 5, 'abc' ]
 *
 * r = arrSort([10, '', 9, 'N/A', ' ', null, 100])
 * console.log(r)
 * // => [ 9, 10, 100, 'N/A', '', ' ', null ]
 *
 * r = arrSort(['abc1', 'abc30', 'abc4', 'abc21', 'abc100000'])
 * console.log(r)
 * // => [ 'abc1', 'abc4', 'abc21', 'abc30', 'abc100000' ]
 *
 * r = arrSort(['1a', '30c', '  4 abc ', 'xyz', '21d', '100000xy'])
 * console.log(r)
 * // => [ '  4 abc ', '100000xy', '1a', '21d', '30c', 'xyz' ]
 *
 * r = arrSort(
 *     [{ s: 'March', i: 1 }, { s: 'Jan', i: 4 }, { s: 'Feb', i: 100000 }, { s: 'Dec', i: 30 }],
 *     { compareKey: 'i' }
 * )
 * console.log(r)
 * // => [
 * //   { s: 'March', i: 1 },
 * //   { s: 'Jan', i: 4 },
 * //   { s: 'Dec', i: 30 },
 * //   { s: 'Feb', i: 100000 }
 * // ]
 *
 * r = arrSort(
 *     [{ s: 'March', i: 1 }, { s: 'Jan', i: 4 }, { s: 'Feb', i: 100000 }, { s: 'Dec', i: 30 }],
 *     { compareKey: 's' }
 * )
 * console.log(r)
 * // => [
 * //   { s: 'Dec', i: 30 },
 * //   { s: 'Feb', i: 100000 },
 * //   { s: 'Jan', i: 4 },
 * //   { s: 'March', i: 1 }
 * // ]
 *
 * r = arrSort(
 *     [{ s: 'abc1', i: 1, }, { s: 'abc', i: -1, }, { s: 'abc30', i: 4, }, { s: 'abc4', i: 100000, }, { s: 'abc100000', i: 30, }],
 *     { compareKey: 's' }
 * )
 * console.log(r)
 * // => [
 * //   { s: 'abc', i: -1 },
 * //   { s: 'abc1', i: 1 },
 * //   { s: 'abc100000', i: 30 },
 * //   { s: 'abc30', i: 4 },
 * //   { s: 'abc4', i: 100000 }
 * // ]
 *
 * r = arrSort(
 *     [{ s: 'abc1', i: 1, }, { s: 'abc', i: -1, }, { s: 'abc30', i: 4, }, { s: 'abc4', i: 100000, }, { s: 'abc100000', i: 30, }],
 *     { compareKey: 's', localeCompare: true }
 * )
 * console.log(r)
 * // => [
 * //   { s: 'abc', i: -1 },
 * //   { s: 'abc1', i: 1 },
 * //   { s: 'abc4', i: 100000 },
 * //   { s: 'abc30', i: 4 },
 * //   { s: 'abc100000', i: 30 }
 * // ]
 *
 * r = arrSort(
 *     [{ s: '中文1', i: 1, }, { s: '中文', i: -1, }, { s: '中文30', i: 4, }, { s: '中文4', i: 100000, }, { s: '中文100000', i: 30, }],
 *     { compareKey: 's', localeCompare: true }
 * )
 * console.log(r)
 * // => [
 * //   { s: '中文', i: -1 },
 * //   { s: '中文1', i: 1 },
 * //   { s: '中文4', i: 100000 },
 * //   { s: '中文30', i: 4 },
 * //   { s: '中文100000', i: 30 }
 * // ]
 *
 * r = arrSort(
 *     [{ s: 'xyz.txt', i: 100, }, { s: 'abc1.txt', i: 1, }, { s: 'abc.txt', i: -1, }, { s: 'abc', i: -2, }, { s: 'abc30.txt', i: 4, }, { s: 'abc4.txt', i: 100000, }, { s: 'abc100000.txt', i: 30, }],
 *     { compareKey: 's', localeCompare: true }
 * )
 * console.log(r)
 * // => [
 * //   { s: 'abc', i: -2 },
 * //   { s: 'abc.txt', i: -1 },
 * //   { s: 'abc1.txt', i: 1 },
 * //   { s: 'abc4.txt', i: 100000 },
 * //   { s: 'abc30.txt', i: 4 },
 * //   { s: 'abc100000.txt', i: 30 },
 * //   { s: 'xyz.txt', i: 100 }
 * // ]
 *
 */
function arrSort(vall, opt = {}) {

    //check
    if (!isearr(vall)) {
        return []
    }

    //localeCompare
    let localeCompare = get(opt, 'localeCompare')
    if (!isbol(localeCompare)) {
        localeCompare = false
    }

    //returnIndex
    let returnIndex = get(opt, 'returnIndex')
    if (!isbol(returnIndex)) {
        returnIndex = false
    }

    //check
    if (size(vall) === 1) {
        return returnIndex ? [0] : vall
    }

    //compareKey
    let compareKey = get(opt, 'compareKey', null)

    //vs, 排序用之值: 全為物件時取compareKey欄位之值(無此欄位者為'', 放最末), 否則為元素本身
    let vs = vall
    if (vall.every((v) => isobj(v))) {

        //check
        if (!isestr(compareKey)) {
            return []
        }

        vs = map(vall, (v) => {
            return get(v, compareKey, '')
        })

    }

    //inds
    let inds = orderInds(vs, localeCompare)

    //returnIndex
    if (returnIndex) {
        return inds
    }
    return map(inds, (ind) => {
        return vall[ind]
    })
}


export default arrSort
