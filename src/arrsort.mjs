import get from 'lodash/get'
import each from 'lodash/each'
import map from 'lodash/map'
import split from 'lodash/split'
import sortBy from 'lodash/sortBy'
import size from 'lodash/size'
import isearr from './isearr.mjs'
import isestr from './isestr.mjs'
import isstr from './isstr.mjs'
import isbol from './isbol.mjs'
import isnum from './isnum.mjs'
import isobj from './isobj.mjs'
import isStrHasNumber from './isStrHasNumber.mjs'
import cdbl from './cdbl.mjs'
import strmid from './strmid.mjs'
import strdelleft from './strdelleft.mjs'


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
    return type
}


function getVirArr(vs, type) {
    let ts = []

    //check
    if (type !== 'num' && type !== 'str') {
        throw new Error(`invalid type`)
    }

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
    else if (type === 'str') {

        //偵測是否字首有共通字串
        let s0 = get(vs, 0, '')
        let bHasPre = false
        let iHasPre = -1
        if (isStrHasNumber(s0)) {
            let ss = split(s0, '')
            each(ss, (sv, ksv) => {
                let b = true
                each(vs, (ov, kov) => {
                    if (strmid(ov, ksv) !== sv) {
                        b = false
                        return false
                    }
                })
                if (b) {
                    bHasPre = true
                    iHasPre = ksv + 1 //ksv是位置, +1為待刪除的長度
                }
                else {
                    return false
                }
            })
        }

        if (bHasPre) {

            //剔除字首後, 產生待排序物件陣列
            ts = map(vs, (v, k) => {
                let t = strdelleft(v, iHasPre)
                if (isnum(t)) {
                    t = cdbl(t)
                }
                return {
                    key: k,
                    payload: v,
                    value: t,
                }
            })

        }
        else {

            //產生待排序物件陣列
            ts = map(vs, (v, k) => {
                return {
                    key: k,
                    payload: v,
                    value: v,
                }
            })

        }

    }

    return ts
}


function sortArr(vs, returnIndex) {
    let rs = sortBy(vs, 'value')
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
 * @param {Boolean} [returnIndex=false] 輸入是否回傳排序指標陣列，預設false
 * @param {String} [compareKey=null] 輸入當vall為物件陣列時，指定取compareKey欄位出來排序，compareKey需為有效字串，預設null
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
 * r = arrSort(['abc1', 'abc30', 'abc4', 'abc21', 'abc100000'])
 * console.log(r)
 * // => [ 'abc1', 'abc4', 'abc21', 'abc30', 'abc100000' ]
 *
 * r = arrSort(['1a', '30c', '  4 abc ', '21d', '100000xy'])
 * console.log(r)
 * // => [ '  4 abc ', '100000xy', '1a', '21d', '30c' ]
 *
 * r = arrSort([{ s: 'March', i: 1, }, { s: 'Jan', i: 4, }, { s: 'Feb', i: 100000, }, { s: 'Dec', i: 30, }], { compareKey: 's' })
 * console.log(r)
 * // => [
 * //   { s: 'Dec', i: 30 },
 * //   { s: 'Feb', i: 100000 },
 * //   { s: 'Jan', i: 4 },
 * //   { s: 'March', i: 1 }
 * // ]
 *
 * r = arrSort([{ s: 'abc1', i: 1, }, { s: 'abc30', i: 4, }, { s: 'abc4', i: 100000, }, { s: 'abc100000', i: 30, }], { compareKey: 's' })
 * console.log(r)
 * // => [
 * //   { s: 'abc1', i: 1 },
 * //   { s: 'abc4', i: 100000 },
 * //   { s: 'abc30', i: 4 },
 * //   { s: 'abc100000', i: 30 }
 * // ]
 *
 * r = arrSort([{ s: 'March', i: 1, }, { s: 'Jan', i: 4, }, { s: 'Feb', i: 100000, }, { s: 'Dec', i: 30, }], { compareKey: 'i' })
 * console.log(r)
 * // => [
 * //   { s: 'March', i: 1 },
 * //   { s: 'Jan', i: 4 },
 * //   { s: 'Dec', i: 30 },
 * //   { s: 'Feb', i: 100000 }
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

    //returnIndex
    let returnIndex = get(opt, 'returnIndex')
    if (!isbol(returnIndex)) {
        returnIndex = false
    }

    //compareKey
    let compareKey = get(opt, 'compareKey', null)
    //檢查放後面執行階段

    //type
    let type = getInputType(vall)

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

        if (typeTrans === 'num' || typeTrans === 'str') {

            //getVirArr
            let vs = getVirArr(vallTrans, typeTrans)

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

        //getVirArr
        let vs = getVirArr(vall, type)

        //sortArr
        rs = sortArr(vs, returnIndex)

    }

    return rs
}


export default arrSort
