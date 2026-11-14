import cloneDeep from 'lodash-es/cloneDeep.js'
import isarr from './isarr.mjs'
import optVal from './_optVal.mjs'
import parseNumOpt from './_numOpt.mjs'
import _normKey from './_normKey.mjs'
import _setOwnKey from './_setOwnKey.mjs'


/**
 * 結合keys與values成為物件
 *
 * keys之元素為空字串''、null、undefined、空洞、物件、陣列(及函數、Symbol)時，該欄位名連同其對應之值略過，其餘配對位置不變；有限數字視同字串；keys重複時後者覆蓋前者
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/arr2dt.test.mjs Github}
 * @memberOf wsemi
 * @param {Array} keys 輸入keys字串陣列，非陣列或空陣列回傳空物件{}
 * @param {Array|*} [values=''] 輸入values陣列或需自動展開values成為的陣列，預設''；values為陣列(含['']、[null]、[{}]、[])時一律當作值陣列與keys逐一配對，長度不同時回傳空物件{}；values非陣列時各欄位皆填入values，values為物件(typeof為object且非null)時各欄位各一份以lodash cloneDeep產生之複本(無原型物件之複本為一般物件，同修前)，values為函數時視為null(不執行、不複製)
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Boolean} [opt.debug=false] 輸入是否輸出除錯警告布林值，非布林視為false；為true且values為陣列而長度與keys不同時，經opt.funLog(函數)或console.warn提示兩者之長度(不含值；同原因每個行程只提示一次)，預設false
 * @param {Function} [opt.funLog=null] 輸入警告之出口函數，以(msg, info)呼叫，未給則用console.warn，預設null
 * @returns {Object} 回傳組合後物件
 * @example
 *
 * console.log(arr2dt(['a', 'b']))
 * // => { 'a': '', 'b': '' }
 *
 * console.log(arr2dt(['a', 'b'], 'xyz'))
 * // => { a: 'xyz', b: 'xyz' }
 *
 * console.log(arr2dt(['a', 'b'], null))
 * // => { a: null, b: null }
 *
 * console.log(arr2dt(['a', 'b'], [12.3, '456a']))
 * // => { 'a': 12.3, 'b': '456a' }
 *
 * console.log(arr2dt(['a', 'b'], [null, '456a']))
 * // => { 'a': null, 'b': '456a' }
 *
 * console.log(arr2dt(['a', 'b'], [12.3]))
 * // => {} (長度不同)
 *
 * console.log(arr2dt(['a', 'b'], {}))
 * // => { a: {}, b: {} }
 *
 * console.log(arr2dt(['a'], ['']))
 * // => { a: '' } (陣列一律當作值陣列)
 *
 * console.log(arr2dt(['a', '', 'c'], [1, 2, 3]))
 * // => { a: 1, c: 3 } (略過空字串欄位名及其值)
 *
 * console.log(arr2dt(['a', 'a'], [1, 2]))
 * // => { a: 2 } (重複時後者覆蓋前者)
 *
 * console.log(arr2dt(['a'], function() {}))
 * // => { a: null } (函數視為null)
 *
 */
function arr2dt(keys, values = '', opt = {}) {

    //check, 參數層: 非陣列或空陣列回傳空物件
    if (!isarr(keys) || keys.length === 0) {
        return {}
    }

    let r = {}

    //values為陣列: 一律當作值陣列逐一配對(使用者2026-11-14, 第430項第二批; 原以isearr判定, ['']、[null]、[{}]、[]被當成單一填充值)
    if (isarr(values)) {

        //長度不同回傳空物件, opt.debug時提示兩者長度(只含長度, 不含值)
        if (keys.length !== values.length) {
            let { debug, funLog } = optVal.readDbg(opt)
            if (debug) {
                parseNumOpt.warnOnce('arr2dt|length|values', `[wsemi arr2dt] invalid values: must have the same length as keys (values ${values.length}, keys ${keys.length}), returning {}`, { fn: 'arr2dt', reason: 'length', key: 'values' }, funLog)
            }
            return {}
        }

        for (let i = 0; i < keys.length; i++) {
            let key = _normKey(keys[i])
            if (key === null) {
                continue //略過該欄位名連同其對應之值
            }
            _setOwnKey(r, key, values[i])
        }
        return r
    }

    //values非陣列: 各欄位皆填入values, 函數視為null, 物件各欄位各一份複本
    if (typeof values === 'function') {
        values = null
    }
    let vIsObj = typeof values === 'object' && values !== null
    for (let i = 0; i < keys.length; i++) {
        let key = _normKey(keys[i])
        if (key === null) {
            continue
        }
        _setOwnKey(r, key, vIsObj ? cloneDeep(values) : values)
    }

    return r
}


export default arr2dt
