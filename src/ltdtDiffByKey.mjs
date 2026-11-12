import get from 'lodash-es/get.js'
import filter from 'lodash-es/filter.js'
import isestr from './isestr.mjs'
import isarr from './isarr.mjs'
import isobj from './isobj.mjs'
import isbol from './isbol.mjs'
import haskey from './haskey.mjs'


/**
 * 比對新舊物件陣列，基於指定key為主鍵，比對vnew對vold中有差異之項目
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/ltdtDiffByKey.test.mjs Github}
 * @memberOf wsemi
 * @param {Array|Object} ltdtOld 輸入舊的物件陣列或物件(物件視為單筆，空陣列合法)，非陣列亦非物件(undefined、null、字串、數字等)回傳空結果
 * @param {Array|Object} ltdtNew 輸入新的物件陣列或物件，規則同ltdtOld
 * @param {String} key 輸入比對的主鍵key值字串，非有效字串回傳空結果
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Boolean} [opt.withInfor=true] 輸入是否提供infor資訊布林值，不提供可再加速，預設true
 * @returns {Object} 回傳比對結果物件；ltdtOld、ltdtNew、key任一無效時回傳空結果{ del: [], add: [], same: [], diff: [], infor: {} }(opt.withInfor為false時無infor)，不拋錯
 * @example
 *
 * let ltdtOld = [{ id: 'id-1', a: 'a1' }, { id: 'id-2', a: 'a2' }, { id: 'id-3', a: 'a3' }]
 * let ltdtNew = [{ id: 'id-1', z: 'z3' }, { id: 'id-3', a: 'a3' }, { id: 'id-4', a: 'a4' }]
 * console.log(ltdtDiffByKey(ltdtOld, ltdtNew, 'id'))
 * // => {
 * //   del: [ { id: 'id-2', a: 'a2' } ],
 * //   add: [ { id: 'id-4', a: 'a4' } ],
 * //   same: [ { id: 'id-3', a: 'a3' } ],
 * //   diff: [ { id: 'id-1', z: 'z3' } ],
 * //   infor: { 'id-2': 'del', 'id-4': 'add', 'id-1': 'diff', 'id-3': 'same' }
 * // }
 *
 */
function ltdtDiffByKey(ltdtOld, ltdtNew, key, opt = {}) {

    // //def
    // let def = {
    //     infor: {},
    //     del: [],
    //     same: [],
    //     diff: [],
    //     add: [],
    // }

    //withInfor
    let withInfor = get(opt, 'withInfor')
    if (!isbol(withInfor)) {
        withInfor = true
    }

    //defult
    let r = {
        del: [],
        add: [],
        same: [],
        diff: [],
    }

    //check, 主參數(ltdtOld、ltdtNew須為陣列或物件)與次參數(key須為有效字串)無效皆回傳同形之空結果, 不拋錯、不輸出至console(dspec〈輸入參數之檢測機制〉§11 Q1-c, 使用者2026-11-12: 非數值之結構運算之主參數與次參數無效皆回輸出型別之空值)
    //  原ltdtOld、ltdtNew無效(null、字串、數字等)時被包成單元素陣列再濾除, 等同空陣列而照常比對(如新者全列為add), 現改回空結果; key無效原另以console.log輸出'invalid key', 現移除
    if (!isestr(key) || !(isarr(ltdtOld) || isobj(ltdtOld)) || !(isarr(ltdtNew) || isobj(ltdtNew))) {
        if (withInfor) {
            r.infor = {}
        }
        return r
    }

    //to array, 物件視為單筆
    if (!isarr(ltdtOld)) { //有可能傳空陣列故使用isarr
        ltdtOld = [ltdtOld]
    }
    if (!isarr(ltdtNew)) { //有可能傳空陣列故使用isarr
        ltdtNew = [ltdtNew]
    }

    //filter
    ltdtOld = filter(ltdtOld, (v) => {
        return haskey(v, key)
    })
    ltdtNew = filter(ltdtNew, (v) => {
        return haskey(v, key)
    })

    //mapNew
    let mapNew = new Map(ltdtNew.map(item => [item[key], item]))

    //處理存在於ltdtOld中的項目
    for (let dtOld of ltdtOld) {
        let dtNew = mapNew.get(dtOld[key])
        if (!dtNew) {
            r.del.push(dtOld)
        }
        else {
            let isEqual = JSON.stringify(dtOld) === JSON.stringify(dtNew)
            if (isEqual) {
                r.same.push(dtNew)
            }
            else {
                r.diff.push(dtNew)
            }
            // 處理過的從 mapNew 移除，剩下的才是新增
            mapNew.delete(dtOld[key])
        }
    }

    //剩下的就是add
    r.add = Array.from(mapNew.values())

    //withInfor
    if (withInfor) {
        let infor = {}
        for (let v of r.del) {
            infor[v[key]] = 'del'
        }
        for (let v of r.add) {
            infor[v[key]] = 'add'
        }
        for (let v of r.diff) {
            infor[v[key]] = 'diff'
        }
        for (let v of r.same) {
            infor[v[key]] = 'same'
        }
        r.infor = infor
    }

    return r
}


export default ltdtDiffByKey
