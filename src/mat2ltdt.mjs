import each from 'lodash-es/each.js'
import take from 'lodash-es/take.js'
import tail from 'lodash-es/tail.js'
import isearr from './isearr.mjs'
import keysmat2ltdt from './keysmat2ltdt.mjs'


/**
 * 由mat第1行當head，其餘當data，轉ltdt
 * mat第1行需為字串陣列，才能當head
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/mat2ltdt.test.mjs Github}
 * @memberOf wsemi
 * @param {Array} mat 輸入資料陣列
 * @returns {Array} 回傳物件陣列
 * @example
 *
 * console.log(mat2ltdt([['a', 'b'], [12, 34.56], ['x', '12.34']]))
 * // => [{ a: 12, b: 34.56 }, { a: 'x', b: '12.34' }]
 *
 */
function mat2ltdt(mat) {

    //check
    if (!isearr(mat)) {
        return []
    }

    //check length, 至少需2列數據
    if (mat.length <= 1) {
        return []
    }

    //check mat
    let b = false
    each(mat, function(v) {
        if (!isearr(v)) {
            b = true
        }
    })
    if (b) {
        return []
    }

    let keys = take(mat)[0]
    let data = tail(mat)

    return keysmat2ltdt(keys, data)
}


export default mat2ltdt
