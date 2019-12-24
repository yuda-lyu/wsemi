import map from 'lodash/map'
import each from 'lodash/each'
import zipObject from 'lodash/zipObject'
import isearr from './isearr.mjs'


/**
 * 由keys與二維陣列mdata轉ltdt
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/keysmat2ltdt.test.js Github}
 * @memberOf wsemi
 * @param {Array} keys 輸入字串陣列
 * @param {Array} mat 輸入資料陣列
 * @returns {Array} 回傳物件陣列
 * @example
 * console.log(keysmat2ltdt(['a', 'b'], [[12, 34.56], ['123', 'xyz']]))
 * // => [{ a: 12, b: 34.56 }, { a: '123', b: 'xyz' }]
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

    let ltdt = map(mat, function(r) {

        //o
        let o = zipObject(keys, r)

        //clear undefined
        each(o, function(v, k) {
            if (v === undefined) {
                o[k] = ''
            }
        })

        return o
    })

    return ltdt
}


export default keysmat2ltdt
