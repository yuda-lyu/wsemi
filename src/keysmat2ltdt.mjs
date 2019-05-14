import each from 'lodash/each'
import zipObject from 'lodash/zipObject'
import isearr from './isearr.mjs'


/**
 * 由keys與二維陣列mdata轉ltdt
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/keysmat2ltdt.test.js Github}
 *
 * @example
 *
 * @memberOf wsemi
 * @param {Array} keys 輸入字串陣列
 * @param {Array} mat 輸入資料陣列
 * @returns {Array} 回傳物件陣列
 */
function keysmat2ltdt(keys, mat) {

    //check
    if (!isearr(keys)) {
        return []
    }
    if (!isearr(mat)) {
        return []
    }
    if (!isearr(mat[0])) {
        return []
    }

    let ltdt = []
    each(mat, function(r) {
        let o = zipObject(keys, r)
        ltdt.push(o)
    })

    return ltdt
}


export default keysmat2ltdt
