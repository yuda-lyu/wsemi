import each from 'lodash/each'
import find from 'lodash/find'
import isEqual from 'lodash/isEqual'
import isestr from './isestr.mjs'
import isarr from './isarr.mjs'
import iser from './iser.mjs'
import haskey from './haskey.mjs'


/**
 * 回傳陣列以key為主鍵，vnew對vold中有差異之項目
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/ltdtdiff.test.js Github}
 * @memberOf wsemi
 * @param {Array|Object} ltdtOld 輸入舊的物件陣列或物件
 * @param {Array|Object} ltdtNew 輸入新的物件陣列或物件
 * @param {String} key 輸入比對的主鍵key值字串
 * @returns {Object} 回傳比對結果物件
 * @example
 * console.log(ltdtdiff([{ x: 'xa', y: 'y1' }, { x: 'xb', y: 'y2' }], [{ x: 'xa', z: 'z3' }], 'x'))
 * // => { infor: { xa: 'diff', xb: 'del' }, del: [ { x: 'xb', y: 'y2' } ], same: [], diff: [ { x: 'xa', z: 'z3' } ], add: [] }
 *
 * console.log(ltdtdiff({ id: 'pk', a: 'abc', b: 123 }, { id: 'pk', a: 'abc', b: 456 }, 'id'))
 * // => { infor: { pk: 'diff' }, del: [], same: [], diff: [{ id: 'pk', a: 'abc', b: 456 }], add: [] }
 *
 * console.log(ltdtdiff({ id: 'pk', a: 'abc', b: 123 }, { id: 'pk1', a: 'abc', b: 456 }, 'id'))
 * // => { infor: { pk: 'del', pk1: 'add' }, del: [{ id: 'pk', a: 'abc', b: 123 }], same: [], diff: [], add: [{ id: 'pk1', a: 'abc', b: 456 }] }
 */
function ltdtdiff(ltdtOld, ltdtNew, key) {

    //def
    let def = {
        infor: {},
        del: [],
        same: [],
        diff: [],
        add: [],
    }

    //check
    if (!isestr(key)) {
        return def
    }

    //to array
    if (!isarr(ltdtOld)) { //有可能傳空陣列故使用isarr
        ltdtOld = [ltdtOld]
    }
    if (!isarr(ltdtNew)) { //有可能傳空陣列故使用isarr
        ltdtNew = [ltdtNew]
    }

    // //check obj and key, 可能有空陣列情形
    // let haveKey = 0
    // each(ltdtOld, function(v) {
    //     if (haskey(v, key)) {
    //         haveKey = 1
    //     }
    // })
    // if (haveKey === 0) {
    //     return def
    // }
    // each(ltdtNew, function(v) {
    //     if (haskey(v, key)) {
    //         haveKey = 2
    //     }
    // })
    // if (haveKey === 1) {
    //     return def
    // }

    //tInfor, tDel, tDiff, tSame
    let tInfor = {}
    let tDel = []
    let tDiff = []
    let tSame = []
    each(ltdtOld, function(v) {
        if (haskey(v, key)) { //v需存在key
            let q = {
                [key]: v[key]
            }
            let o = find(ltdtNew, q)
            if (iser(o)) {
                tDel.push(v) //vold需刪去之項目
                tInfor[v[key]] = 'del'
            }
            else {
                if (isEqual(v, o)) {
                    tSame.push(o) //vsame與vold有同樣之項目
                    tInfor[o[key]] = 'same'
                }
                else {
                    tDiff.push(o) //vsame對vold有變更之項目
                    tInfor[o[key]] = 'diff'
                }
            }
        }
    })

    //vadd
    let vadd = []
    each(ltdtNew, function(v) {
        if (haskey(v, key)) { //v需存在key
            let q = {
                [key]: v[key]
            }
            let o = find(ltdtOld, q)
            if (iser(o)) {
                vadd.push(v) //vsame對vold有新增之項目
                tInfor[v[key]] = 'add'
            }
        }
    })

    return {
        infor: tInfor,
        del: tDel,
        same: tSame,
        diff: tDiff,
        add: vadd,
    }
}


export default ltdtdiff
