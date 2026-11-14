import isobj from './isobj.mjs'
import isarr from './isarr.mjs'
import isestr from './isestr.mjs'
import isnum from './isnum.mjs'
import _setOwnKey from './_setOwnKey.mjs'


/**
 * 由dt物件提取指定keys欄位出來成為新物件，僅保留有keys的欄位，若不存在欄位就不提取
 *
 * 只取dt之自有可列舉欄位(繼承而來之欄位如toString、或原型上之資料皆不取)，欄位名不經路徑解析('a.b'為欄位名)；鍵'__proto__'為dt之自有欄位時以一般欄位寫入結果(不改結果之原型)；
 * 欄位存在而值為undefined者保留(結果含該欄位且值為undefined，與dtmapping對undefined補預設值不同)；欄位值不複製，與輸入共用
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/dtpick.test.mjs Github}
 * @memberOf wsemi
 * @param {Object} dt 輸入資料物件，非物件回傳空物件{}
 * @param {Array} keys 輸入要提取欄位集合的字串陣列，元素須為非空字串(含String包裝物件，以其字串為欄位名)或數字(含數字字串；數字以String()為欄位名，如Infinity為'Infinity')，其餘元素(''、null、布林、物件、Symbol等)略過；keys非陣列或空陣列回傳空物件{}(欄位名之判定同修前，與dtmapping之欄位名正規化不同)
 * @returns {Object} 回傳處理後物件
 * @example
 *
 * console.log(dtpick({ a: 'a123', b: 234, c: '345' }, ['a', 'b']))
 * // => { a: 'a123', b: 234 }
 *
 * console.log(dtpick({ a: 'a123', b: 234, c: '345' }, ['a', 'b', 'x']))
 * // => { a: 'a123', b: 234 }
 *
 * console.log(dtpick({ a: undefined, b: 1 }, ['a', 'toString']))
 * // => { a: undefined } (undefined之欄位保留, 繼承之toString不取)
 *
 */
function dtpick(dt, keys) {

    //check
    if (!isobj(dt)) { //若輸入空物件可直接回傳空物件
        return {}
    }
    if (!isarr(keys)) {
        return {}
    }

    let r = {}
    for (let i = 0; i < keys.length; i++) {
        let key = keys[i]

        //鍵須為非空字串或數字(同原haskey之判定), 其餘略過
        if (!isestr(key) && !isnum(key)) {
            continue
        }

        //只取自有可列舉欄位(使用者2026-11-14, 第430項第二批): 不取繼承之欄位, 不經lodash get解析路徑
        if (!Object.prototype.propertyIsEnumerable.call(dt, key)) {
            continue
        }

        //寫入, 鍵__proto__以一般欄位寫入
        _setOwnKey(r, key, dt[key])
    }

    return r
}


export default dtpick
