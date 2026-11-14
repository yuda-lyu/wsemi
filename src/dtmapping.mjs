import cloneDeep from 'lodash-es/cloneDeep.js'
import isobj from './isobj.mjs'
import isarr from './isarr.mjs'
import _normKey from './_normKey.mjs'
import _setOwnKey from './_setOwnKey.mjs'


/**
 * 由dt物件提取指定keys欄位出來成為新物件，若物件不存在keys的欄位時，則會自動填入指定數據def
 *
 * 取值只取dt之自有可列舉同名欄位：欄位名不經路徑解析('d.e'、'd[0]'皆為欄位名)，繼承而來之欄位(如toString、constructor)視為不存在而填入def；欄位值為undefined視同無此欄位而填入def；
 * 鍵'__proto__'以一般欄位寫入結果(值取dt自有之同名欄位，無則def)，不改結果之原型；欄位值不複製，與輸入共用；不支援Map(Map之內容不是欄位)
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/dtmapping.test.mjs Github}
 * @memberOf wsemi
 * @param {Object} dt 輸入資料物件，必須參數，須為物件(含空物件{}，空物件則各欄位皆填入def)，非物件(undefined、null、字串、數字、陣列等)回傳空物件{}(使用者2026-11-12，dspec〈輸入參數之檢測機制〉§11 Q1-c：非數值之結構運算之主參數無效回輸出型別之空值)
 * @param {Array} keys 輸入要提取欄位集合的陣列，元素須為非空字串，有限數字視同字串，空字串''、null、undefined、空洞、物件、陣列、函數、Symbol等元素略過，重複者只算一次；非陣列、空陣列或元素全被略過時回傳空物件{}
 * @param {*} [def=''] 輸入若無提取欄位時所給予的預設值，預設為''；def為物件(含陣列、Date、Map等，typeof為object且非null)時每個欄位各填入一份以lodash cloneDeep產生之複本(無原型物件Object.create(null)之複本為一般物件)；def為函數時視為null(不執行、不複製)
 * @returns {Object} 回傳處理後物件
 * @example
 *
 * console.log(dtmapping({ a: 'a123', b: 234, c: '345' }, ['a', 'b']))
 * // => { a: 'a123', b: 234 }
 *
 * console.log(dtmapping({ a: 'a123', b: 234, c: '345' }, ['a', 'b', 'x']))
 * // => { a: 'a123', b: 234, x: '' }
 *
 * console.log(dtmapping({}, ['a', 'b']))
 * // => { a: '', b: '' }
 *
 * console.log(dtmapping(null, ['a', 'b']))
 * // => {} (dt非物件, 回傳空物件)
 *
 * console.log(dtmapping({ d: { e: 1 }, 'd.e': 2 }, ['d.e', 'toString']))
 * // => { 'd.e': 2, toString: '' } (欄位名不解析路徑, 繼承之toString不取)
 *
 * console.log(dtmapping({ a: 1 }, ['a', '', null, 'a', 2]))
 * // => { '2': '', a: 1 } (略過''與null, 重複只算一次, 數字視同字串)
 *
 */
function dtmapping(dt, keys, def = '') {

    //check dt, 須為物件(空物件合法, 要支援對空物件與keys直接產生新物件, 故用isobj而非iseobj); 非物件回傳空物件(dspec §11 Q1-c, 使用者2026-11-12)
    if (!isobj(dt)) {
        return {}
    }

    //check keys, 參數層: 非陣列回傳空物件; 元素全被略過者自然得空物件
    if (!isarr(keys)) {
        return {}
    }

    //def, 函數視為null(使用者2026-11-14, 第430項第二批); 物件(含陣列)每個欄位各一份複本
    if (typeof def === 'function') {
        def = null
    }
    let defIsObj = typeof def === 'object' && def !== null

    let r = {}
    let used = new Set()
    for (let i = 0; i < keys.length; i++) {

        //key, 略過無效之欄位名, 重複只算一次
        let key = _normKey(keys[i])
        if (key === null || used.has(key)) {
            continue
        }
        used.add(key)

        //v, 只取dt自有可列舉之同名欄位, 不經lodash get解析路徑, 不取繼承之欄位; undefined視同無此欄位
        let v = Object.prototype.propertyIsEnumerable.call(dt, key) ? dt[key] : undefined
        if (v === undefined) {
            v = defIsObj ? cloneDeep(def) : def
        }

        //寫入, 鍵__proto__以一般欄位寫入
        _setOwnKey(r, key, v)
    }

    return r
}


export default dtmapping
