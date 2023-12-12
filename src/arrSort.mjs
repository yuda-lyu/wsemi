import get from 'lodash-es/get'
import each from 'lodash-es/each'
import map from 'lodash-es/map'
import sortBy from 'lodash-es/sortBy'
import size from 'lodash-es/size'
import cloneDeep from 'lodash-es/cloneDeep'
import isearr from './isearr.mjs'
import isestr from './isestr.mjs'
import isstr from './isstr.mjs'
import isbol from './isbol.mjs'
import isnum from './isnum.mjs'
import isobj from './isobj.mjs'
import cdbl from './cdbl.mjs'
import cstr from './cstr.mjs'
import trim from './trim.mjs'


function getInputType(vs) {
    let inum = 0
    let istr = 0
    let iobj = 0
    let n = size(vs)
    each(vs, (v) => {
        if (isnum(v)) {
            inum += 1
        }
        else if (isstr(v)) {
            istr += 1
        }
        else if (isobj(v)) {
            iobj += 1
        }
    })
    let type = ''
    if (inum === n) {
        type = 'num'
    }
    else if (istr === n) {
        type = 'str'
    }
    else if (iobj === n) {
        type = 'obj'
    }
    else if (inum + istr === n) {
        //全元素皆為數字與字串混合, 則視為字串處理
        type = 'str'
    }
    else {
        //無法識別
        console.log('eles in array are non-homogeneous', vs)
    }
    return type
}


function getVirArr(vs, type, opt = {}) {
    let ts = []

    //check
    if (type !== 'num' && type !== 'str' && type !== 'files') {
        throw new Error(`invalid type[${type}]`)
    }

    // console.log('getVirArr type', type)
    if (type === 'num') {

        //產生待排序物件陣列
        ts = map(vs, (v, k) => {
            return {
                key: k,
                payload: v,
                value: cdbl(v),
            }
        })

    }
    else if (type === 'files') {

        //產生待排序物件陣列
        ts = map(vs, (v, k) => {
            return {
                key: k,
                payload: v,
                value: cstr(v),
            }
        })

    }
    else if (type === 'str') {

        //vst
        let vst = map(vs, (v) => {
            return trim(v, { excludeString: true })
        })

        //n
        let n = 0
        each(vst, (v) => {
            if (isnum(v)) {
                n++
            }
        })

        //bAllNum, 判識是否全陣列皆為數字
        let bAllNum = n === size(vst)

        //trim(剔除開頭結尾非數字之字串)後, 產生待排序物件陣列
        ts = map(vs, (v, k) => {
            let t = v

            //若為數字則給予過濾後純數字字串
            if (bAllNum) {
                // t = trim(t, { excludeString: true })
                t = vst[k]
                t = cdbl(t)
            }
            else {
                t = cstr(t)
            }

            return {
                key: k,
                payload: v,
                value: t,
            }
        })

    }

    return ts
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


function sortObjArr(vs, returnIndex) {
    let rs = sortBy(vs, 'value')
    if (returnIndex) {
        return map(rs, 'key')
    }
    else {
        return map(rs, 'payload')
    }
}


function sortObjArrWithLocaleCompare(vs, returnIndex) {
    let rs = lcSortByKey(vs, 'value')
    if (returnIndex) {
        return map(rs, 'key')
    }
    else {
        return map(rs, 'payload')
    }
}


/**
 * 排序vall陣列，可針對純數字、純字串、含固定開頭字元的數字字串、物件陣列進行排列
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

    //check
    if (size(vall) === 1) {
        return vall
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

    //compareKey
    let compareKey = get(opt, 'compareKey', null)
    //檢查放後面執行階段

    //sortArr localeCompare
    let sortArr = null
    if (localeCompare) {
        sortArr = sortObjArrWithLocaleCompare
    }
    else {
        sortArr = sortObjArr
    }

    //type
    let type = getInputType(vall)
    // console.log('type', type)

    //check
    if (type === '') {
        return []
    }

    //obj to str
    let rs
    if (type === 'obj') {

        //check
        if (!isestr(compareKey)) {
            return []
        }

        //物件取compareKey後, 產生待排序物件陣列
        let vallTrans = map(vall, (v, k) => {
            return get(v, compareKey, '')
        })

        //typeTrans
        let typeTrans = getInputType(vallTrans)
        // console.log('typeTrans', typeTrans)

        if (typeTrans === 'num' || typeTrans === 'str') {

            //localeCompare
            if (localeCompare) {
                //若使用localeCompare則視為檔案名稱排序
                typeTrans = 'files'
            }
            // console.log('typeTrans', typeTrans)

            //getVirArr
            let vs = getVirArr(vallTrans, typeTrans, opt)
            // console.log('obj: getVirArr vs', vs)

            //sortArr
            let inds = sortArr(vs, true)

            //returnIndex
            if (returnIndex) {
                rs = inds
            }
            else {
                rs = map(inds, (ind) => {
                    return vall[ind]
                })
            }

        }
        else {
            //若取完compareKey後不是num或str, 則自動回傳空陣列
            return []
        }

    }
    else if (type === 'num' || type === 'str') {

        //localeCompare
        if (localeCompare) {
            type = 'files'
        }
        // console.log('typeTrans', typeTrans)

        //getVirArr
        let vs = getVirArr(vall, type, opt)
        // console.log('num|str: getVirArr vs', vs)

        //sortArr
        rs = sortArr(vs, returnIndex)

    }

    return rs
}


export default arrSort
