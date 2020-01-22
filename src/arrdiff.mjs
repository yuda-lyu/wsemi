import each from 'lodash/each'
import find from 'lodash/find'
import isEqual from 'lodash/isEqual'
import isestr from './isestr.mjs'
import isearr from './isearr.mjs'
import iser from './iser.mjs'
import haskey from './haskey.mjs'


/**
 * 回傳陣列以key為主鍵，vnew對vold中有差異之項目
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/arrdiff.test.js Github}
 * @memberOf wsemi
 * @param {Array|Object} vold 輸入舊的物件陣列或物件
 * @param {Array|Object} vnew 輸入新的物件陣列或物件
 * @param {String} key 輸入比對的主鍵key值字串
 * @returns {Object} 回傳比對結果物件
 * @example
 * console.log(arrdiff([{ x: 'xa', y: 'y1' }, { x: 'xb', y: 'y2' }], [{ x: 'xa', z: 'z3' }], 'x'))
 * // => { infor: { xa: 'diff', xb: 'del' }, del: [ { x: 'xb', y: 'y2' } ], same: [], diff: [ { x: 'xa', z: 'z3' } ], add: [] }
 *
 * console.log(arrdiff({ id: 'pk', a: 'abc', b: 123 }, { id: 'pk', a: 'abc', b: 456 }, 'id'))
 * // => { infor: { pk: 'diff' }, del: [], same: [], diff: [{ id: 'pk', a: 'abc', b: 456 }], add: [] }
 *
 * console.log(arrdiff({ id: 'pk', a: 'abc', b: 123 }, { id: 'pk1', a: 'abc', b: 456 }, 'id'))
 * // => { infor: { pk: 'del', pk1: 'add' }, del: [{ id: 'pk', a: 'abc', b: 123 }], same: [], diff: [], add: [{ id: 'pk1', a: 'abc', b: 456 }] }
 */
function arrdiff(vold, vnew, key) {

    //check
    if (!isestr(key)) {
        return {}
    }

    //to array
    if (!isearr(vold)) {
        vold = [vold]
    }
    if (!isearr(vnew)) {
        vnew = [vnew]
    }

    //check obj and key
    let haveKey = 0
    each(vold, function(v) {
        if (iser(v)) {
            return {}
        }
        if (haskey(v, key)) {
            haveKey = 1
        }
    })
    if (haveKey === 0) {
        return {}
    }
    each(vnew, function(v) {
        if (iser(v)) {
            return {}
        }
        if (haskey(v, key)) {
            haveKey = 2
        }
    })
    if (haveKey === 1) {
        return {}
    }

    //vinfor,vdel, vdiff, vsame
    let vinfor = {}
    let vdel = []
    let vdiff = []
    let vsame = []
    each(vold, function(v) {
        let q = {}
        q[key] = v[key]
        let o = find(vnew, q)
        if (iser(o)) {
            vdel.push(v) //vold需刪去之項目
            vinfor[v[key]] = 'del'
        }
        else {
            if (isEqual(v, o)) {
                vsame.push(o) //vsame與vold有同樣之項目
                vinfor[o[key]] = 'same'
            }
            else {
                vdiff.push(o) //vsame對vold有變更之項目
                vinfor[o[key]] = 'diff'
            }
        }
    })

    //vadd
    let vadd = []
    each(vnew, function(v) {
        let q = {}
        q[key] = v[key]
        let o = find(vold, q)
        if (iser(o)) {
            vadd.push(v) //vsame對vold有新增之項目
            vinfor[v[key]] = 'add'
        }
    })

    return {
        infor: vinfor,
        del: vdel,
        same: vsame,
        diff: vdiff,
        add: vadd,
    }
}


export default arrdiff
