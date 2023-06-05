import each from 'lodash/each'
import find from 'lodash/find'
import isEqual from 'lodash/isEqual'
import isestr from './isestr.mjs'
import isarr from './isarr.mjs'
import iser from './iser.mjs'
import haskey from './haskey.mjs'


/**
 * 比對新舊物件陣列，基於指定key為主鍵，比對vnew對vold中有差異之項目
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/ltdtDiffByKey.test.mjs Github}
 * @memberOf wsemi
 * @param {Array|Object} ltdtOld 輸入舊的物件陣列或物件
 * @param {Array|Object} ltdtNew 輸入新的物件陣列或物件
 * @param {String} key 輸入比對的主鍵key值字串
 * @returns {Object} 回傳比對結果物件
 * @example
 *
 * let vOld = [{ id: 'id-1', a: 'a1' }, { id: 'id-2', a: 'a2' }, { id: 'id-3', a: 'a3' }]
 * let vNew = [{ id: 'id-1', z: 'z3' }, { id: 'id-3', a: 'a3' }, { id: 'id-4', a: 'a4' }]
 * console.log(ltdtDiffByKey(vOld, vNew, 'id'))
 * // => {
 * //     infor: { 'id-1': 'diff', 'id-2': 'del', 'id-3': 'same', 'id-4': 'add' },
 * //     del: [ { id: 'id-2', a: 'a2' } ],
 * //     same: [ { id: 'id-3', a: 'a3' } ],
 * //     diff: [ { id: 'id-1', z: 'z3' } ],
 * //     add: [ { id: 'id-4', a: 'a4' } ]
 * // }
 *
 */
function ltdtDiffByKey(ltdtOld, ltdtNew, key) {

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
        console.log('invalid key')
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


export default ltdtDiffByKey
