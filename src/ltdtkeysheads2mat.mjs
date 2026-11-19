import get from 'lodash-es/get.js'
import isbol from './isbol.mjs'
import isarr from './isarr.mjs'
import iseobj from './iseobj.mjs'
import _cellText from './_cellText.mjs'
import _ltdtkeys2matCore from './_ltdtkeys2matCore.mjs'


/**
 * keys轉heads，物件陣列ltdt使用keys取值，兩者合併轉出二維陣列mat
 *
 * 資料列同ltdtkeys2mat：每列須為物件({}與只有繼承鍵者為有效列)，非物件之列訊息指出列號(invalid ltdt[i]: must be an object)；keys為null、undefined或[]時由ltdt提取，非陣列時為'invalid keys: must be an array'，元素全部無效時為'invalid keys: must contain at least one non-empty string or finite number'，無效元素之欄略過(同位置之表頭一併略過)；取值只讀自有欄位，缺值給opt.empty；值之表示同ltdtkeys2mat
 * 表頭：kphead為有效物件(至少一個自有可列舉字串鍵)時，各欄之表頭取kphead之自有同名鍵之值(不解析路徑、不讀繼承鍵)並原樣放入(數字、null、''、陣列等皆原樣)，值為函數時視為null，kphead缺該鍵(或其值為undefined)時給opt.emptyHead；未給kphead或kphead無效(非物件、{}、只有繼承鍵者)時以鍵名當表頭
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/ltdtkeysheads2mat.test.mjs Github}
 * @memberOf wsemi
 * @param {Array} ltdt 輸入物件陣列
 * @param {Array} [keys=[]] 輸入欄位名陣列(元素為字串或有限數字)，若為null、undefined或[]則由ltdt提取，預設[]
 * @param {Object} [kphead={}] 輸入字典物件，內含keys對應表頭之物件，供keys查詢得表頭，若不輸入或無效則以鍵名當表頭，預設為{}
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {*} [opt.emptyHead=''] 輸入kphead有給但缺某鍵之對應時給予之表頭(原樣放入)，函數視為null，預設''
 * @param {*} [opt.empty=''] 輸入資料列缺該欄或其值為undefined時給予之值(轉交ltdtkeys2mat之opt.empty)，函數視為null，預設''
 * @param {Boolean} [opt.returnWithStateAndMsg=false] 輸入是否回傳含狀態與訊息物件布林值，若為true則回傳{ state, msg }物件，state為'success'或'error'，msg於success時為回傳結果、於error時為錯誤訊息字串，預設false
 * @returns {Array|Object} 回傳資料陣列，ltdt為空陣列(合法資料，不含表頭列)、無效、keys無效或任一列非物件時回傳空陣列；若opt.returnWithStateAndMsg為true則回傳{ state, msg }物件，ltdt為空陣列時為{ state: 'success', msg: [] }，ltdt無效、keys無效或任一列非物件時為{ state: 'error', msg }
 * 失敗之辨識：預設模式於本函數所偵測之失敗(輸入無效或轉換失敗)時不拋錯而回傳空陣列[]，而空陣列[]亦為合法輸入之結果(如ltdtkeysheads2mat([]))，故不可由回傳值判斷成敗；須辨識失敗時請設opt.returnWithStateAndMsg為true，以回傳之state === 'error'判定(只涵蓋本函數所偵測之失敗，msg為錯誤訊息)
 * @example
 *
 * console.log(ltdtkeysheads2mat([{ a: 12, b: 34.56 }, { a: '123', b: 'xyz' }], ['a', 'b'], { a: 'c1', b: 'c2' }))
 * // => [['c1', 'c2'], [12, 34.56], ['123', 'xyz']]
 *
 * console.log(ltdtkeysheads2mat([], ['a', 'b'], { a: 'c1', b: 'c2' }, { returnWithStateAndMsg: true }))
 * // => { state: 'success', msg: [] } (空陣列為合法資料，不是失敗，不含表頭列)
 *
 * console.log(ltdtkeysheads2mat([{ a: 1, b: 2 }], ['a', 'b'], { a: 'c1' }))
 * // => [['c1', ''], [1, 2]] (kphead缺b之對應，表頭給opt.emptyHead)
 *
 * console.log(ltdtkeysheads2mat([{ a: 1, b: 2 }], ['a', 'b'], { a: 'c1' }, { emptyHead: null }))
 * // => [['c1', null], [1, 2]]
 *
 * console.log(ltdtkeysheads2mat([{ a: 1 }, {}], ['a', null]))
 * // => [['a'], [1], ['']] (未給kphead以鍵名當表頭，略過null欄與其表頭，{}為有效列)
 *
 */
function ltdtkeysheads2mat(ltdt, keys = [], kphead = {}, opt = {}) {

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

    //空陣列為合法資料, 不是失敗, 轉出空陣列(不含表頭列, 每次新陣列)
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

    //check, 列與keys, 與ltdtkeys2mat同一判定
    let rk = _ltdtkeys2matCore.chkRowsKeys(ltdt, keys)
    if (rk.state === 'error') {
        return retError(rk.msg)
    }
    let ks = rk.msg

    //emptyHead, empty, 函數視為null
    let emptyHead = _cellText.readFill(opt, 'emptyHead', '')
    let empty = _cellText.readFill(opt, 'empty', '')

    //h, kphead有效時取自有同名鍵之值(原樣, 函數視為null, 缺者給emptyHead), 否則以鍵名當表頭
    let h
    if (iseobj(kphead)) {
        h = ks.map((k) => {
            let v = _cellText.getOwn(kphead, k)
            if (v === undefined) {
                return emptyHead
            }
            if (typeof v === 'function') {
                return null
            }
            return v
        })
    }
    else {
        h = ks.slice()
    }

    //m, 資料列同ltdtkeys2mat
    let m = _ltdtkeys2matCore.toMat(rk.rows, ks, empty)

    //mat
    let mat = [h, ...m]

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


export default ltdtkeysheads2mat
