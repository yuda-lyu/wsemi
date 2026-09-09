import each from 'lodash-es/each.js'
import take from 'lodash-es/take.js'
import tail from 'lodash-es/tail.js'
import get from 'lodash-es/get.js'
import isbol from './isbol.mjs'
import isearr from './isearr.mjs'
import keysmat2ltdt from './keysmat2ltdt.mjs'


/**
 * 由mat第1行當head，其餘當data，轉ltdt
 * mat第1行需為字串陣列，才能當head
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/mat2ltdt.test.mjs Github}
 * @memberOf wsemi
 * @param {Array} mat 輸入資料陣列
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Boolean} [opt.returnWithStateAndMsg=false] 輸入是否回傳含狀態與訊息物件布林值，若為true則回傳{ state, msg }物件，state為'success'或'error'，msg於success時為回傳結果、於error時為錯誤訊息字串，預設false
 * @returns {Array|Object} 回傳物件陣列，mat無效、列數少於2或任一列非有效陣列時回傳空陣列；若opt.returnWithStateAndMsg為true則回傳{ state, msg }物件
 * @example
 *
 * console.log(mat2ltdt([['a', 'b'], [12, 34.56], ['x', '12.34']]))
 * // => [{ a: 12, b: 34.56 }, { a: 'x', b: '12.34' }]
 *
 */
function mat2ltdt(mat, opt = {}) {

    //returnWithStateAndMsg
    let returnWithStateAndMsg = get(opt, 'returnWithStateAndMsg', null)
    if (!isbol(returnWithStateAndMsg)) {
        returnWithStateAndMsg = false
    }

    //retError
    let retError = (msg) => {
        if (returnWithStateAndMsg) {
            return {
                state: 'error',
                msg,
            }
        }
        else {
            return []
        }
    }

    //check, 原碼三種失敗皆回[], 與「本就轉出空陣列」無從分辨
    if (!isearr(mat)) {
        return retError('invalid mat')
    }

    //check length, 至少需2列數據
    if (mat.length <= 1) {
        return retError('invalid mat, at least 2 rows are required')
    }

    //check mat
    let b = false
    each(mat, function(v) {
        if (!isearr(v)) {
            b = true
        }
    })
    if (b) {
        return retError('invalid mat, every row must be an effective array')
    }

    let keys = take(mat)[0]
    let data = tail(mat)

    //內部一律以returnWithStateAndMsg取狀態, 判識後才把結果交給下一步, 錯誤訊息前置來源函數名以利分辨是哪一步出錯
    let r = keysmat2ltdt(keys, data, { returnWithStateAndMsg: true })
    if (r.state === 'error') {
        return retError(`keysmat2ltdt: ${r.msg}`)
    }

    if (returnWithStateAndMsg) {
        return r
    }
    else {
        return r.msg
    }
}


export default mat2ltdt
