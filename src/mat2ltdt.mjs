import each from 'lodash-es/each.js'
import take from 'lodash-es/take.js'
import tail from 'lodash-es/tail.js'
import get from 'lodash-es/get.js'
import isbol from './isbol.mjs'
import isarr from './isarr.mjs'
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
 * @returns {Array|Object} 回傳物件陣列，mat為空陣列(合法資料)、mat無效、列數少於2或任一列非有效陣列時回傳空陣列；若opt.returnWithStateAndMsg為true則回傳{ state, msg }物件，mat為空陣列時為{ state: 'success', msg: [] }，mat無效、列數少於2或任一列非有效陣列時為{ state: 'error', msg }
 * 失敗之辨識：預設模式於本函數所偵測之失敗(輸入無效或轉換失敗)時不拋錯而回傳空陣列[]，而空陣列[]亦為合法輸入之結果(如mat2ltdt([]))，故不可由回傳值判斷成敗；須辨識失敗時請設opt.returnWithStateAndMsg為true，以回傳之state === 'error'判定(只涵蓋本函數所偵測之失敗，msg為錯誤訊息)
 * @example
 *
 * console.log(mat2ltdt([['a', 'b'], [12, 34.56], ['x', '12.34']]))
 * // => [{ a: 12, b: 34.56 }, { a: 'x', b: '12.34' }]
 *
 * console.log(mat2ltdt([], { returnWithStateAndMsg: true }))
 * // => { state: 'success', msg: [] } (空陣列為合法資料，不是失敗)
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

    //空陣列為合法資料, 不是失敗, 轉出空陣列(每次新陣列)
    if (isarr(mat) && mat.length === 0) {
        if (returnWithStateAndMsg) {
            return {
                state: 'success',
                msg: [],
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
