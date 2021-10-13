import cloneDeep from 'lodash/cloneDeep'
import size from 'lodash/size'
import zipObject from 'lodash/zipObject'
import isearr from './isearr.mjs'
import iser from './iser.mjs'


/**
 * 結合keys與values成為物件
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/arr2dt.test.mjs Github}
 * @memberOf wsemi
 * @param {Array} keys 輸入keys字串陣列
 * @param {Array|*} [values=''] 輸入values物件陣列或需自動展開values成為的陣列，預設''
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
 * // => {}
 *
 * console.log(arr2dt(['a', 'b'], {}))
 * // => { a: {}, b: {} }
 *
 */
function arr2dt(keys, values = '') {

    //check
    if (!isearr(keys)) {
        return {}
    }

    //values為有效且等長陣列
    if (isearr(values)) {
        if (size(keys) === size(values)) {
            return zipObject(keys, values)
        }
        else {
            return {} //雖然values為陣列但不同長度
        }
    }

    //否則將values視為需產生與keys同長之陣列, 再合併成為物件
    let vs = []
    for (let i = 0; i < size(keys); i++) {
        vs.push(cloneDeep(values))
    }

    let t = zipObject(keys, vs)

    return t
}


export default arr2dt
