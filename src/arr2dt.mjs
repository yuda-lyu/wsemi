import times from 'lodash/times'
import size from 'lodash/size'
import stubString from 'lodash/stubString'
import zipObject from 'lodash/zipObject'
import isarr from './isarr.mjs'
import iser from './iser.mjs'


/**
 * 結合keys與values成為物件
 *
 * @export
 * @param {Array} keys 輸入keys字串陣列
 * @param {Array} [values=undefined] 輸入values物件陣列，預設不使用
 * @returns {Object} 回傳組合後物件
 */
export default function arr2dt(keys, values = undefined) {

    //check
    if (!isarr(keys)) {
        return {}
    }

    //default values
    if (iser(values)) {
        values = times(size(keys), stubString)
    }
    
    //check values
    if(isarr(values)) {
        if(size(keys)!==size(values)){
            return {}
        }
    }

    return zipObject(keys, values)
}
