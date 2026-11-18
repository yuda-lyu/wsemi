import isobj from './isobj.mjs'
import _setOwnKey from './_setOwnKey.mjs'


/**
 * 對物件內各鍵進行排序，通過傳入指定鍵值陣列，將指定鍵依其於指定鍵值陣列之順序放前，未列於指定鍵值陣列之鍵維持原順序放後
 *
 * 指定鍵值陣列為[]或內含物件不存在之鍵皆為合法，不存在之鍵略過；元素為字串或數字(視為其字串)時才可能對應鍵，其他型別之元素略過；指定鍵重複時依第一次出現之位置，各鍵只出現一次；只對應物件自有可列舉之字串鍵，不含繼承、不可列舉者與Symbol鍵(Symbol鍵不會出現於回傳物件，同修前)；回傳新物件，值原樣放入(不複製)，不修改輸入。注意：JS規定陣列索引樣之整數字串鍵(0至4294967294，如'1'、'2')於物件內恆依數值遞增排在其他鍵之前，不受本函數之排序影響
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/objSortByKeys.test.mjs Github}
 * @memberOf wsemi
 * @param {Object} obj 輸入物件資料，須為物件(Object.prototype.toString為[object Object]且非真陣列)，陣列、函數、字串、null、undefined等非物件回傳{}，不拋錯(輸入參數檢測機制C7，第1參數型別不對回輸出型別之空結果)，此時不檢查keys；空物件{}為合法，回傳{}
 * @param {Array} keys 輸入指定鍵值陣列，必須參數(obj為物件時才檢查)，須為真陣列(Array.isArray)，非陣列(含以Symbol.toStringTag偽稱Array之物件)throw Error('invalid keys: must be an array')，訊息不帶輸入值；空陣列[]為合法；[null]、['']、[{}]視為一個元素(非字串非數字之元素略過，不影響其餘鍵之順序)
 * @param {Object} [opt={}] 輸入設定物件，預設{}；非一般物件(含函數、陣列)視為未給
 * @param {Boolean} [opt.onlyKeys=false] 輸入是否只保留列於keys且存在於obj之鍵(依keys之順序)，預設false；只有布林true生效，其他值(含非布林、包裝物件)視為未給(false)，不報錯
 * @returns {Object} 回傳排序後物件(新物件)；onlyKeys為false時含obj全部之自有可列舉字串鍵，指定鍵依序放前、其餘維持原順序放後；onlyKeys為true時只含指定鍵
 * @throws {Error} obj為物件而keys非陣列throw Error('invalid keys: must be an array')
 * @example
 *
 * let obj1 = {
 *     'x2': 2,
 *     'x1': 1,
 *     'x3': 3,
 * }
 * let arr1 = ['x1', 'x2', 'x3']
 * let robj1 = objSortByKeys(obj1, arr1)
 * console.log(robj1)
 * // => { x1: 1, x2: 2, x3: 3 }
 *
 * let obj2 = {
 *     'x2': 2,
 *     'x111': 1,
 *     'x33': 3,
 * }
 * let arr2 = ['x111', 'x2', 'x33']
 * let robj2 = objSortByKeys(obj2, arr2)
 * console.log(robj2)
 * // => { x111: 1, x2: 2, x33: 3 }
 *
 * let obj3 = { b: 1, a: 2, c: 3 }
 * console.log(objSortByKeys(obj3, ['a']))
 * // => { a: 2, b: 1, c: 3 } (指定鍵放前, 其餘維持原順序放後)
 *
 * console.log(objSortByKeys(obj3, ['c', 'a'], { onlyKeys: true }))
 * // => { c: 3, a: 2 } (只保留指定鍵)
 *
 * console.log(objSortByKeys(obj3, []))
 * // => { b: 1, a: 2, c: 3 } (空陣列合法, 維持原順序)
 *
 * console.log(objSortByKeys(obj3, ['x', 'a']))
 * // => { a: 2, b: 1, c: 3 } (不存在之鍵略過)
 *
 * console.log(objSortByKeys('abc', ['a']))
 * // => {} (obj非物件回傳空結果, 不拋錯)
 *
 * try {
 *     objSortByKeys(obj3, 'a')
 * }
 * catch (err) {
 *     console.log(err.message)
 * }
 * // => invalid keys: must be an array
 *
 */
function objSortByKeys(obj, keys, opt = {}) {

    //check, obj為第1參數, 非物件回傳空結果{}(不拋錯; dspec〈輸入參數之檢測機制〉§11 W-16乙, 使用者2026-11-16), 不檢查keys; obj為物件時keys為必須參數, 非預期throw(訊息不帶值; 使用者2026-11-03), 空物件與空陣列為合法資料
    //  真陣列以Array.isArray判定(R-OBJ-ITER-01規則2: 依Object.prototype.toString為真而非真陣列者, 如以Symbol.toStringTag偽稱Array之物件, 不得依其length迭代)
    if (!isobj(obj) || Array.isArray(obj)) {
        return {}
    }
    if (!Array.isArray(keys)) {
        throw new Error('invalid keys: must be an array')
    }

    //onlyKeys, opt可省略, 非一般物件視為未給, 只有布林true生效, 其餘(含false、非布林、包裝物件)為false(K3)
    let onlyKeys = isobj(opt) && !Array.isArray(opt) && opt.onlyKeys === true

    //oks, 物件自有可列舉之字串鍵(依物件原順序); length與其他鍵同為一般鍵, 不以lodash迭代(R-OBJ-ITER-01)
    let oks = Object.keys(obj)
    let has = new Set(oks)

    //rks, 指定鍵依其於keys之順序(第一次出現者), 只取物件內存在者
    let used = new Set()
    let rks = []
    for (let i = 0; i < keys.length; i++) {
        let v = keys[i]
        if (typeof v !== 'string' && typeof v !== 'number') {
            continue
        }
        let k = String(v)
        if (has.has(k) && !used.has(k)) {
            used.add(k)
            rks.push(k)
        }
    }

    //其餘鍵維持原順序放後
    if (!onlyKeys) {
        for (let k of oks) {
            if (!used.has(k)) {
                rks.push(k)
            }
        }
    }

    //r, 以自有資料屬性寫入(鍵'__proto__'不改原型)
    let r = {}
    for (let k of rks) {
        _setOwnKey(r, k, obj[k])
    }

    return r
}


export default objSortByKeys
