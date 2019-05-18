import times from 'lodash/times'
import size from 'lodash/size'
import stubString from 'lodash/stubString'
import zipObject from 'lodash/zipObject'
import isearr from './isearr.mjs'
import iser from './iser.mjs'


/**
 * 結合keys與values成為物件
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/arr2dt.test.js Github}
 * @memberOf wsemi
 * @param {Array} keys 輸入keys字串陣列
 * @param {Array} [values=undefined] 輸入values物件陣列，預設不使用
 * @returns {Object} 回傳組合後物件
 * @example
 * arr2dt(['a', 'b'])
 * // => { 'a': '', 'b': '' }
 * arr2dt(['a', 'b'], [12.3, '456a'])
 * // => { 'a': 12.3, 'b': '456a' }
 */
function arr2dt(keys, values = undefined) {

    //check
    if (!isearr(keys)) {
        return {}
    }

    //default values
    if (iser(values)) {
        values = times(size(keys), stubString)
    }

    //check values
    if (isearr(values)) {
        if (size(keys) !== size(values)) {
            return {}
        }
    }

    return zipObject(keys, values)
}


export default arr2dt
