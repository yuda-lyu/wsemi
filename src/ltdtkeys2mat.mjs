import get from 'lodash-es/get.js'
import isarr from './isarr.mjs'
import isbol from './isbol.mjs'
import _cellText from './_cellText.mjs'
import _ltdtkeys2matCore from './_ltdtkeys2matCore.mjs'


/**
 * 由物件陣列ltdt並使用keys取值轉二維陣列mat
 *
 * ltdt之每列須為物件，空物件{}與只有繼承鍵之物件為有效列(沒有自有欄位之紀錄，各欄給opt.empty)；任一列非物件(null、陣列、字串、空位等)時視為ltdt無效，訊息指出列號(invalid ltdt[i]: must be an object，只含索引不含值)
 * keys為null、undefined或[]時由ltdt提取(各列之自有可列舉字串鍵)；keys非陣列或其元素全部無效時視為keys無效；元素為''、null、undefined、空位、物件、陣列、布林、Symbol、非有限數字時該欄略過，有限數字視同字串，重複之鍵產生重複之欄
 * 取值只讀各列之自有同名欄位(不解析路徑、不讀繼承鍵)；缺該欄或其值為undefined時給opt.empty
 * 值之表示：字串與有限數字為原值，布林為'true'或'false'，null為'null'(可藉以與缺鍵區分)，NaN與±Infinity為字串'NaN'、'Infinity'、'-Infinity'，物件與陣列為JSON字串，Date為ISO字串(不帶引號)，函數視為null即'null'，BigInt為String(v)
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/ltdtkeys2mat.test.mjs Github}
 * @memberOf wsemi
 * @param {Array} ltdt 輸入物件陣列
 * @param {Array} [keys=null] 輸入欄位名陣列(元素為字串或有限數字)，若為null、undefined或[]則由ltdt提取，預設為null
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {*} [opt.empty=''] 輸入缺該欄或其值為undefined時給予之值(原樣放入)，函數視為null，預設''
 * @param {Boolean} [opt.returnWithStateAndMsg=false] 輸入是否回傳含狀態與訊息物件布林值，若為true則回傳{ state, msg }物件，state為'success'或'error'，msg於success時為回傳結果、於error時為錯誤訊息字串，預設false
 * @returns {Array|Object} 回傳資料陣列，ltdt為空陣列(合法資料)、無效、keys無效、無法取得keys或任一列非物件時回傳空陣列；若opt.returnWithStateAndMsg為true則回傳{ state, msg }物件，ltdt為空陣列時為{ state: 'success', msg: [] }，ltdt無效、keys無效、無法取得keys或任一列非物件時為{ state: 'error', msg }
 * 失敗之辨識：預設模式於本函數所偵測之失敗(輸入無效或轉換失敗)時不拋錯而回傳空陣列[]，而空陣列[]亦為合法輸入之結果(如ltdtkeys2mat([]))，故不可由回傳值判斷成敗；須辨識失敗時請設opt.returnWithStateAndMsg為true，以回傳之state === 'error'判定(只涵蓋本函數所偵測之失敗，msg為錯誤訊息)
 * @example
 *
 * console.log(ltdtkeys2mat([{ a: 12, b: 34.56 }, { a: '123', b: 'xyz' }], ['a', 'b']))
 * // => [[12, 34.56], ['123', 'xyz']]
 *
 * console.log(ltdtkeys2mat([], ['a', 'b'], { returnWithStateAndMsg: true }))
 * // => { state: 'success', msg: [] } (空陣列為合法資料，不是失敗)
 *
 * console.log(ltdtkeys2mat('x', ['a', 'b'], { returnWithStateAndMsg: true }))
 * // => { state: 'error', msg: 'invalid ltdt: must be an array' }
 *
 * console.log(ltdtkeys2mat([{ a: null, b: true }, {}], ['a', 'b']))
 * // => [['null', 'true'], ['', '']] ({}為有效列，各欄給opt.empty)
 *
 * console.log(ltdtkeys2mat([{ a: NaN, b: { y: 1, x: 2 } }], ['a', '', 'b']))
 * // => [['NaN', '{"y":1,"x":2}']] (略過''欄)
 *
 * console.log(ltdtkeys2mat([{ a: 1 }, null], ['a'], { returnWithStateAndMsg: true }))
 * // => { state: 'error', msg: 'invalid ltdt[1]: must be an object' }
 *
 * console.log(ltdtkeys2mat([{ a: 1 }], 'a', { returnWithStateAndMsg: true }))
 * // => { state: 'error', msg: 'invalid keys: must be an array' }
 *
 */
function ltdtkeys2mat(ltdt, keys = null, opt = {}) {

    //returnWithStateAndMsg, 本函數原就有opt參數(opt.empty), 故併入同一opt而非新增參數
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
    if (isarr(ltdt) && ltdt.length === 0) {
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

    //check, 參數層非陣列
    if (!isarr(ltdt)) {
        return retError('invalid ltdt: must be an array')
    }

    //check, 列與keys
    let rk = _ltdtkeys2matCore.chkRowsKeys(ltdt, keys)
    if (rk.state === 'error') {
        return retError(rk.msg)
    }

    //empty, 函數視為null
    let empty = _cellText.readFill(opt, 'empty', '')

    //mat
    let mat = _ltdtkeys2matCore.toMat(rk.rows, rk.msg, empty)

    if (returnWithStateAndMsg) {
        return {
            state: 'success',
            msg: mat,
        }
    }
    else {
        return mat
    }
}


export default ltdtkeys2mat
