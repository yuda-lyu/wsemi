import get from 'lodash-es/get.js'
import isbol from './isbol.mjs'
import _keysmat2ltdtCore from './_keysmat2ltdtCore.mjs'


/**
 * 由keys與二維陣列mdata轉ltdt
 *
 * keys之元素為空字串''、null、undefined、空位、物件、陣列、布林、Symbol、非有限數字(NaN、±Infinity)時，該欄連同其值略過，其餘位置不變；有限數字視同字串；keys重複時後者覆蓋前者；keys非陣列、為空陣列或元素全被略過時視為keys無效
 * mat之每一列(不限第一列)須為非空陣列，任一列非陣列(null、字串、物件、數字、空位)或為[]時視為mat無效，訊息指出第幾列(invalid mat[i]: must be a non-empty array，只含索引不含值)；列只有一個空元素(['']、[null]、[{}])為有效列
 * 列短於keys時缺少之欄補''，列長於keys時多出之值丟棄；值為undefined或列內空位補''；值為函數時視為null(不執行、不複製)；其餘之值原樣放入(不複製)
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/keysmat2ltdt.test.mjs Github}
 * @memberOf wsemi
 * @param {Array} keys 輸入欄位名陣列，元素為字串或有限數字，其餘略過
 * @param {Array} mat 輸入資料陣列，每一列須為非空陣列
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Boolean} [opt.returnWithStateAndMsg=false] 輸入是否回傳含狀態與訊息物件布林值，若為true則回傳{ state, msg }物件，state為'success'或'error'，msg於success時為回傳結果、於error時為錯誤訊息字串，預設false
 * @param {Boolean} [opt.debug=false] 輸入是否輸出除錯警告布林值，非布林視為false；為true且有列之長度與keys不同時，經opt.funLog(函數)或console.warn提示列號與兩者之長度(不含值；同原因每個行程只提示一次)，預設false
 * @param {Function} [opt.funLog=null] 輸入警告之出口函數，以(msg, info)呼叫，未給則用console.warn，預設null
 * @returns {Array|Object} 回傳物件陣列，mat為空陣列(合法資料)、keys或mat無效時回傳空陣列；若opt.returnWithStateAndMsg為true則回傳{ state, msg }物件，keys有效且mat為空陣列時為{ state: 'success', msg: [] }，keys或mat無效時為{ state: 'error', msg }
 * 失敗之辨識：預設模式於本函數所偵測之失敗(輸入無效或轉換失敗)時不拋錯而回傳空陣列[]，而空陣列[]亦為合法輸入之結果(如keysmat2ltdt(['a'], []))，故不可由回傳值判斷成敗；須辨識失敗時請設opt.returnWithStateAndMsg為true，以回傳之state === 'error'判定(只涵蓋本函數所偵測之失敗，msg為錯誤訊息)
 * @example
 *
 * console.log(keysmat2ltdt(['a', 'b'], [[12, 34.56], ['123', 'xyz']]))
 * // => [{ a: 12, b: 34.56 }, { a: '123', b: 'xyz' }]
 *
 * console.log(keysmat2ltdt(['a', 'b'], [], { returnWithStateAndMsg: true }))
 * // => { state: 'success', msg: [] } (空陣列為合法資料，不是失敗)
 *
 * console.log(keysmat2ltdt(['a', 'b'], [[1], [2, 3, 4]]))
 * // => [{ a: 1, b: '' }, { a: 2, b: 3 }] (短者補''，長者丟棄多出之值)
 *
 * console.log(keysmat2ltdt(['a', null, 'c', 1], [[1, 2, 3, 4]]))
 * // => [{ '1': 4, a: 1, c: 3 }] (略過null欄連同其值，有限數字視同字串)
 *
 * console.log(keysmat2ltdt(['a'], [[null], ['']]))
 * // => [{ a: null }, { a: '' }] (只有一個空元素之列為有效列)
 *
 * console.log(keysmat2ltdt(['a', 'b'], [[1, 2], 'xy'], { returnWithStateAndMsg: true }))
 * // => { state: 'error', msg: 'invalid mat[1]: must be a non-empty array' }
 *
 * console.log(keysmat2ltdt([null, ''], [[1, 2]], { returnWithStateAndMsg: true }))
 * // => { state: 'error', msg: 'invalid keys: must contain at least one non-empty string or finite number' } (keys全被略過)
 *
 */
function keysmat2ltdt(keys, mat, opt = {}) {

    //returnWithStateAndMsg
    let returnWithStateAndMsg = get(opt, 'returnWithStateAndMsg', null)
    if (!isbol(returnWithStateAndMsg)) {
        returnWithStateAndMsg = false
    }

    //core, 一律回傳{ state, msg }
    let r = _keysmat2ltdtCore(keys, mat, opt, { fn: 'keysmat2ltdt', rowOffset: 0, keysLabel: 'keys' })

    if (returnWithStateAndMsg) {
        return r
    }
    if (r.state === 'error') {
        return []
    }
    return r.msg
}


export default keysmat2ltdt
