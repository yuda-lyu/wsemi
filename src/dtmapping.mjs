import each from 'lodash-es/each.js'
import get from 'lodash-es/get.js'
import isobj from './isobj.mjs'
import isearr from './isearr.mjs'


/**
 * 由dt物件提取指定keys欄位出來成為新物件，若物件不存在keys的欄位時，則會自動填入指定數據def
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/dtmapping.test.mjs Github}
 * @memberOf wsemi
 * @param {Object} dt 輸入資料物件，必須參數，須為物件(含空物件{}，空物件則各欄位皆填入def)，非物件(undefined、null、字串、數字、陣列等)回傳空物件{}(使用者2026-11-12，dspec〈輸入參數之檢測機制〉§11 Q1-c：非數值之結構運算之主參數無效回輸出型別之空值)
 * @param {Array} keys 輸入要提取欄位集合的字串陣列，非有效陣列回傳空物件{}
 * @param {*} [def=''] 輸入若無提取欄位時所給予的預設值，預設為''
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
 */
function dtmapping(dt, keys, def = '') {

    //check dt, 須為物件(空物件合法, 要支援對空物件與keys直接產生新物件, 故用isobj而非iseobj); 非物件回傳空物件(dspec §11 Q1-c, 使用者2026-11-12)
    if (!isobj(dt)) {
        return {}
    }

    //check keys
    if (!isearr(keys)) {
        return {}
    }

    let r = {}
    each(keys, function(key) {
        r[key] = get(dt, key, def)
    })

    return r
}


export default dtmapping
