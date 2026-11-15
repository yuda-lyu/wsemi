import isarr from './isarr.mjs'
import isobj from './isobj.mjs'
import getltdtkeys from './getltdtkeys.mjs'
import _normKey from './_normKey.mjs'
import _cellText from './_cellText.mjs'


//本檔為內部使用, 不由index匯出


/**
 * ltdtkeys2mat之列與keys之判定(單一擁有者, 供ltdtkeys2mat與ltdtkeysheads2mat共用同一判定)
 *
 * 規格: 使用者2026-11-15(排程第430項第三批, 裁定表〈四、ltdtkeys2mat〉〈五、ltdtkeysheads2mat〉):
 *   每列須為物件(isobj): {}與只有繼承鍵者為有效列(沒有自有欄位之紀錄); 非物件(null、陣列、字串、空位等)→ error 'invalid ltdt, row[i] is not an object'(只含索引)
 *   keys為null、undefined或[]時由ltdt提取(getltdtkeys, 只取自有可列舉字串鍵), 提取不到任何鍵 → error 'invalid keys, can not extract any key from ltdt'(同修前)
 *   keys非陣列 → error 'invalid keys'; 元素依_normKey.field略過('', null, undefined, 空位, 物件, 陣列, 布林, Symbol, 非有限數字), 有限數字視同字串, 重複者保留(重複之欄); 全被略過 → error 'invalid keys'
 *   檢測序: 列 → keys
 *
 * @param {Array} ltdt 輸入物件陣列(呼叫端已確認為非空陣列)
 * @param {*} keys 輸入keys
 * @returns {Object} 回傳{ state, msg, rows }, success時msg為正規化後之欄位名陣列(BigInt元素原樣保留, 見函數內註解), rows為各列之快照(其後一律使用之, 不再讀ltdt)
 */
function chkRowsKeys(ltdt, keys) {

    //每列須為物件; rows為快照(每列只讀一次, 檢查之列即其後使用之列)
    let rows = []
    for (let i = 0; i < ltdt.length; i++) {
        let r = ltdt[i]
        if (!isobj(r)) {
            return { state: 'error', msg: `invalid ltdt, row[${i}] is not an object` }
        }
        rows.push(r)
    }

    //keys為null、undefined或[]時由ltdt提取
    if (keys === null || keys === undefined || (isarr(keys) && keys.length === 0)) {
        let ks = getltdtkeys(rows)
        if (ks.length === 0) {
            return { state: 'error', msg: 'invalid keys, can not extract any key from ltdt' }
        }
        return { state: 'success', msg: ks, rows }
    }

    //keys非陣列無效; 元素無效者該欄略過, 全被略過視同無效
    if (!isarr(keys)) {
        return { state: 'error', msg: 'invalid keys' }
    }
    let ks = []
    for (let j = 0; j < keys.length; j++) {
        let kv = keys[j]
        if (typeof kv === 'bigint') {
            ks.push(kv) //裁定表〈四〉未列BigInt: 同修前保留該欄而取值恆為缺值(修前haskey不收BigInt鍵)、表頭為原BigInt(ws430c2外審T4)
            continue
        }
        let k = _normKey.field(kv)
        if (k !== null) {
            ks.push(k)
        }
    }
    if (ks.length === 0) {
        return { state: 'error', msg: 'invalid keys' }
    }
    return { state: 'success', msg: ks, rows }
}


/**
 * 依已判定之列與欄位名轉二維陣列: 只讀各列之自有可列舉同名欄位(不解析路徑、不讀繼承鍵), 缺該欄或其值為undefined給empty(原樣), 其餘依_cellText.cellRep
 *
 * @param {Array} ltdt 輸入物件陣列(已判定)
 * @param {Array} ks 輸入欄位名陣列(已正規化)
 * @param {*} empty 輸入缺值時給予之值
 * @returns {Array} 回傳二維陣列(每次新陣列)
 */
function toMat(ltdt, ks, empty) {
    let mat = []
    for (let i = 0; i < ltdt.length; i++) {
        let v = ltdt[i]
        let r = []
        for (let j = 0; j < ks.length; j++) {
            let k = ks[j]
            let c = typeof k === 'bigint' ? undefined : _cellText.cellRep(_cellText.getOwn(v, k))
            r.push(c === undefined ? empty : c)
        }
        mat.push(r)
    }
    return mat
}


let _ltdtkeys2matCore = {
    chkRowsKeys,
    toMat,
}


export default _ltdtkeys2matCore
