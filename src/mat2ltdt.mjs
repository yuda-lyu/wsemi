import get from 'lodash-es/get.js'
import isbol from './isbol.mjs'
import isarr from './isarr.mjs'
import _keysmat2ltdtCore from './_keysmat2ltdtCore.mjs'


/**
 * 由mat第1行當head，其餘當data，轉ltdt
 * 表頭(mat第1列)之元素為字串或有限數字(視同字串)，其餘(''、null、undefined、空位、物件、陣列、布林、Symbol、非有限數字)連同該欄之值略過；表頭重複時後者覆蓋前者；表頭元素全被略過時回傳錯誤(keysmat2ltdt: invalid keys)
 * mat之每一列(含表頭)須為非空陣列，任一列無效時訊息指出mat之列號(invalid mat, row[i] is not an effective array，只含索引不含值)；列只有一個空元素(['']、[null])為有效列；只有表頭、無資料列為合法之空結果[]
 * 資料列之轉換同keysmat2ltdt：短於表頭補''、長於表頭丟棄多出之值、undefined與空位補''、函數視為null
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/mat2ltdt.test.mjs Github}
 * @memberOf wsemi
 * @param {Array} mat 輸入資料陣列，第1列為表頭
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Boolean} [opt.returnWithStateAndMsg=false] 輸入是否回傳含狀態與訊息物件布林值，若為true則回傳{ state, msg }物件，state為'success'或'error'，msg於success時為回傳結果、於error時為錯誤訊息字串，預設false
 * @param {Boolean} [opt.debug=false] 輸入是否輸出除錯警告布林值，非布林視為false；為true且有資料列之長度與表頭不同時，經opt.funLog(函數)或console.warn提示其於mat之列號與兩者之長度(不含值；同原因每個行程只提示一次)，預設false
 * @param {Function} [opt.funLog=null] 輸入警告之出口函數，以(msg, info)呼叫，未給則用console.warn，預設null
 * @returns {Array|Object} 回傳物件陣列，mat為空陣列(合法資料)、只有表頭、mat無效或任一列非有效陣列時回傳空陣列；若opt.returnWithStateAndMsg為true則回傳{ state, msg }物件，mat為空陣列或只有表頭時為{ state: 'success', msg: [] }，mat無效、任一列非有效陣列或表頭無效時為{ state: 'error', msg }
 * 失敗之辨識：預設模式於本函數所偵測之失敗(輸入無效或轉換失敗)時不拋錯而回傳空陣列[]，而空陣列[]亦為合法輸入之結果(如mat2ltdt([]))，故不可由回傳值判斷成敗；須辨識失敗時請設opt.returnWithStateAndMsg為true，以回傳之state === 'error'判定(只涵蓋本函數所偵測之失敗，msg為錯誤訊息)
 * @example
 *
 * console.log(mat2ltdt([['a', 'b'], [12, 34.56], ['x', '12.34']]))
 * // => [{ a: 12, b: 34.56 }, { a: 'x', b: '12.34' }]
 *
 * console.log(mat2ltdt([], { returnWithStateAndMsg: true }))
 * // => { state: 'success', msg: [] } (空陣列為合法資料，不是失敗)
 *
 * console.log(mat2ltdt([['a', 'b']], { returnWithStateAndMsg: true }))
 * // => { state: 'success', msg: [] } (只有表頭為合法之空結果)
 *
 * console.log(mat2ltdt([['a', 'b'], [1, 2], null], { returnWithStateAndMsg: true }))
 * // => { state: 'error', msg: 'invalid mat, row[2] is not an effective array' }
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

    //check, mat非陣列
    if (!isarr(mat)) {
        return retError('invalid mat')
    }

    //check, 每列(含表頭)皆須為非空陣列, 訊息以mat計之列號(只含索引); rows為快照(每列只讀一次, 不呼叫mat之方法)
    let rows = []
    for (let i = 0; i < mat.length; i++) {
        let r = mat[i]
        if (!isarr(r) || r.length === 0) {
            return retError(`invalid mat, row[${i}] is not an effective array`)
        }
        rows.push(r)
    }

    let keys = rows[0]
    let data = rows.slice(1)

    //內部一律以狀態取結果, 判識後才把結果交給下一步, 錯誤訊息前置來源函數名以利分辨是哪一步出錯; 只有表頭時data為[]而為success []; opt轉交(debug), 列號以mat計
    let r = _keysmat2ltdtCore(keys, data, opt, { fn: 'mat2ltdt', rowOffset: 1, keysLabel: 'header' })
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
