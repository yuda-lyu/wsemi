import get from 'lodash-es/get.js'
import isestr from './isestr.mjs'
import isarr from './isarr.mjs'
import isobj from './isobj.mjs'
import isbol from './isbol.mjs'
import _setOwnKey from './_setOwnKey.mjs'


//canon, 對JSON.parse所得之值(只含null、布林、數字、字串、陣列、物件)輸出鍵排序後之JSON字串, 陣列依原順序
function canon(x) {
    if (Array.isArray(x)) {
        return '[' + x.map(canon).join(',') + ']'
    }
    if (x !== null && typeof x === 'object') {
        return '{' + Object.keys(x).sort().map((k) => JSON.stringify(k) + ':' + canon(x[k])).join(',') + '}'
    }
    return JSON.stringify(x)
}


//stableStringify, 鍵排序後之JSON(遞迴排序巢狀物件之鍵, 陣列依原順序): 欄位順序不同視為相同; 先以JSON.stringify取得JSON語意(undefined欄位省略、NaN與Infinity為null、Date經toJSON為ISO字串、Map與Set為{}、包裝物件為其值), 再JSON.parse後排序鍵輸出(JSON.parse之__proto__鍵為自有欄位)
function stableStringify(v) {
    let s = JSON.stringify(v)
    if (s === undefined) {
        return s
    }
    return canon(JSON.parse(s))
}


//isKeyVal, 主鍵值須為非空字串或有限數字
function isKeyVal(v) {
    if (typeof v === 'string') {
        return v !== ''
    }
    if (typeof v === 'number') {
        return Number.isFinite(v)
    }
    return false
}


/**
 * 比對新舊物件陣列，基於指定key為主鍵，比對vnew對vold中有差異之項目
 *
 * 資料列之檢測(使用者2026-11-14裁定，任一不符即同步拋出Error，訊息指出第幾列，不含輸入值)：各列須為物件(非陣列)，且須有自有可列舉之主鍵欄位；主鍵值須為非空字串或有限數字(undefined、null、''、NaN、物件等皆無效)；同一側之主鍵值不得重複；主鍵值轉字串相同而型別不同(如1與'1')者不得並存(同側或跨側皆然)
 * 內容比對：以鍵排序後之JSON比對(遞迴排序巢狀物件之鍵，陣列依原順序)，欄位順序不同視為相同；JSON語意維持：值為undefined之欄位視同不存在，NaN與Infinity視同null，Date視同其ISO字串(toJSON)，Map與Set視同{}
 * infor以主鍵值為欄位名，主鍵值'__proto__'以一般欄位寫入
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/ltdtDiffByKey.test.mjs Github}
 * @memberOf wsemi
 * @param {Array|Object} ltdtOld 輸入舊的物件陣列或物件(物件視為單筆，空陣列合法)，非陣列亦非物件(undefined、null、字串、數字等)回傳空結果
 * @param {Array|Object} ltdtNew 輸入新的物件陣列或物件，規則同ltdtOld
 * @param {String} key 輸入比對的主鍵key值字串，非有效字串回傳空結果
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Boolean} [opt.withInfor=true] 輸入是否提供infor資訊布林值，不提供可再加速，預設true
 * @returns {Object} 回傳比對結果物件；ltdtOld、ltdtNew、key任一無效時回傳空結果{ del: [], add: [], same: [], diff: [], infor: {} }(opt.withInfor為false時無infor)；資料列不符上述檢測時拋出Error
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
 * console.log(ltdtDiffByKey([{ id: 1, a: 1, b: 2 }], [{ b: 2, a: 1, id: 1 }], 'id').same)
 * // => [ { b: 2, a: 1, id: 1 } ] (欄位順序不同視為相同)
 *
 * try {
 *     ltdtDiffByKey([{ id: 1 }, { id: 1 }], [], 'id')
 * }
 * catch (err) {
 *     console.log(err.message)
 * }
 * // => invalid ltdtOld[1]: primary key must be unique, duplicated with ltdtOld[0]
 *
 */
function ltdtDiffByKey(ltdtOld, ltdtNew, key, opt = {}) {

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

    //check, 參數層: 主參數(ltdtOld、ltdtNew須為陣列或物件)與次參數(key須為有效字串)無效皆回傳同形之空結果, 不拋錯、不輸出至console(dspec〈輸入參數之檢測機制〉§11 Q1-c, 使用者2026-11-12: 非數值之結構運算之主參數與次參數無效皆回輸出型別之空值)
    if (!isestr(key) || !(isarr(ltdtOld) || isobj(ltdtOld)) || !(isarr(ltdtNew) || isobj(ltdtNew))) {
        if (withInfor) {
            r.infor = {}
        }
        return r
    }

    //元素層: 檢測各列並取主鍵值(使用者2026-11-14, 第430項第二批: 原壞列與無主鍵者靜默濾除、重複者後者覆蓋, 現一律拋錯)
    let kpType = new Map() //主鍵值字串 -> { type, name }, 跨兩側檢查型別混用
    let chkSide = (ltdt, nameSide) => {
        let single = !isarr(ltdt) //物件視為單筆
        let rows = single ? [ltdt] : ltdt
        let kpInd = new Map() //主鍵值 -> 列名, 同側重複檢查
        let vs = []
        for (let i = 0; i < rows.length; i++) {
            let v = rows[i]
            let name = single ? nameSide : `${nameSide}[${i}]`

            //列須為物件(非陣列)
            if (!isobj(v)) {
                throw new Error(`invalid ${name}: must be an object`)
            }

            //須有自有可列舉之主鍵欄位
            if (!Object.prototype.propertyIsEnumerable.call(v, key)) {
                throw new Error(`invalid ${name}: must have the primary key as an own field`)
            }

            //主鍵值須為非空字串或有限數字
            let kv = v[key]
            if (!isKeyVal(kv)) {
                throw new Error(`invalid ${name}: primary key must be a non-empty string or a finite number`)
            }

            //轉字串相同而型別不同者不得並存
            let ks = String(kv)
            let tp = typeof kv
            let t = kpType.get(ks)
            if (t === undefined) {
                kpType.set(ks, { type: tp, name })
            }
            else if (t.type !== tp) {
                throw new Error(`invalid ${name}: primary key must not mix a number and a string of the same text, conflicts with ${t.name}`)
            }

            //同側不得重複
            if (kpInd.has(kv)) {
                throw new Error(`invalid ${name}: primary key must be unique, duplicated with ${kpInd.get(kv)}`)
            }
            kpInd.set(kv, name)

            vs.push([kv, v]) //檢測之主鍵值即其後使用之值(K4), 不再重讀
        }
        return vs
    }
    let psOld = chkSide(ltdtOld, 'ltdtOld')
    let psNew = chkSide(ltdtNew, 'ltdtNew')

    //mapNew
    let mapNew = new Map(psNew)

    //處理存在於ltdtOld中的項目
    let ksDel = []
    let ksDiff = []
    let ksSame = []
    for (let [kv, dtOld] of psOld) {
        if (!mapNew.has(kv)) {
            r.del.push(dtOld)
            ksDel.push(kv)
        }
        else {
            let dtNew = mapNew.get(kv)
            let isEqual = stableStringify(dtOld) === stableStringify(dtNew) //鍵排序後比對, 欄位順序不同視為相同
            if (isEqual) {
                r.same.push(dtNew)
                ksSame.push(kv)
            }
            else {
                r.diff.push(dtNew)
                ksDiff.push(kv)
            }
            // 處理過的從 mapNew 移除，剩下的才是新增
            mapNew.delete(kv)
        }
    }

    //剩下的就是add
    r.add = Array.from(mapNew.values())
    let ksAdd = Array.from(mapNew.keys())

    //withInfor
    if (withInfor) {
        let infor = {}
        for (let kv of ksDel) {
            _setOwnKey(infor, kv, 'del') //主鍵值__proto__以一般欄位寫入
        }
        for (let kv of ksAdd) {
            _setOwnKey(infor, kv, 'add')
        }
        for (let kv of ksDiff) {
            _setOwnKey(infor, kv, 'diff')
        }
        for (let kv of ksSame) {
            _setOwnKey(infor, kv, 'same')
        }
        r.infor = infor
    }

    return r
}


export default ltdtDiffByKey
