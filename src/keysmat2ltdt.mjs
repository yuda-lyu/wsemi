import each from 'lodash/each'
import zipObject from 'lodash/zipObject'
import isearr from './isearr.mjs'


/**
 * 由keys與二維陣列mdata轉ltdt
 *
 * @memberOf wsemi
 * @param {Array} keys 輸入字串陣列
 * @param {Array} mdata 輸入資料陣列
 * @returns {Array} 回傳物件陣列
 */
function keysmat2ltdt(keys, mdata) {

    //check
    if (!isearr(keys)) {
        return []
    }
    if (!isearr(mdata)) {
        return []
    }

    let ltdt = []
    each(mdata, function(r) {
        let o = zipObject(keys, r)
        ltdt.push(o)
    })

    return ltdt
}


export default keysmat2ltdt
