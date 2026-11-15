import isarr from './isarr.mjs'
import optVal from './_optVal.mjs'
import parseNumOpt from './_numOpt.mjs'
import _normKey from './_normKey.mjs'
import _setOwnKey from './_setOwnKey.mjs'


//本檔為內部使用, 不由index匯出


/**
 * keysmat2ltdt之核心(單一擁有者, 供keysmat2ltdt與mat2ltdt共用), 一律回傳{ state, msg }, 由呼叫端轉為各自之回傳模式
 *
 * 規格: 使用者2026-11-15(排程第430項第三批, 裁定表〈一、keysmat2ltdt〉〈二、mat2ltdt〉):
 *   keys非陣列或[]、或元素全被略過(_normKey.field) → error 'invalid keys'; keys元素為''、null、undefined、空位、物件、陣列、布林、Symbol、非有限數字者該欄連同其值略過, 其餘位置不變; 有限數字視同字串; 重複者後者覆蓋前者
 *   mat為[] → success [](keys仍須有效); mat非陣列 → error 'invalid mat'; 任一列非陣列或為[](不限第一列) → error 'invalid mat, row[i] is not an effective array'(i以呼叫端之mat計, 只含索引)
 *   列只有一個空元素(['']、[null]、[{}])為有效列; 列短於keys補''、長於keys丟棄多出之值; 值為undefined或列內空位補''; 值為函數視為null(不執行、不複製)
 *   列長度與keys不同且opt.debug === true時, 經opt.funLog或console.warn提示列號與兩者長度(不含值; 同原因每個行程一次, 去重鍵<fn>|length|mat), 只在首次遇到長度不同時讀一次opt(V11)
 *
 * @param {Array} keys 輸入欄位名陣列
 * @param {Array} mat 輸入資料列陣列
 * @param {Object} opt 輸入呼叫端之設定物件(供讀取debug與funLog)
 * @param {Object} ctx 輸入呼叫端資訊{ fn: 函數名, rowOffset: 列號之位移(mat2ltdt之資料列由mat第1列起為1), keysLabel: 警告訊息中keys之稱呼 }
 * @returns {Object} 回傳{ state: 'success'|'error', msg }
 */
function _keysmat2ltdtCore(keys, mat, opt, ctx) {
    let { fn, rowOffset, keysLabel } = ctx

    //keys, 參數層: 非陣列或[]無效
    if (!isarr(keys) || keys.length === 0) {
        return { state: 'error', msg: 'invalid keys' }
    }

    //ks, 依位置正規化(略過者為null), 全被略過視同keys無效
    let ks = []
    let nk = 0
    for (let j = 0; j < keys.length; j++) {
        let k = _normKey.field(keys[j])
        ks.push(k)
        if (k !== null) {
            nk++
        }
    }
    if (nk === 0) {
        return { state: 'error', msg: 'invalid keys' }
    }

    //空陣列為合法資料, 不是失敗, 轉出空陣列(每次新陣列)
    if (isarr(mat) && mat.length === 0) {
        return { state: 'success', msg: [] }
    }
    if (!isarr(mat)) {
        return { state: 'error', msg: 'invalid mat' }
    }

    //每列皆須為非空陣列(不限第一列; 空位視為非陣列), 先於任何轉換; rows為快照(每列只讀一次, 檢查之列即其後使用之列)
    let rows = []
    for (let i = 0; i < mat.length; i++) {
        let r = mat[i]
        if (!isarr(r) || r.length === 0) {
            return { state: 'error', msg: `invalid mat, row[${i + rowOffset}] is not an effective array` }
        }
        rows.push(r)
    }

    //ltdt
    let dbg = null
    let ltdt = []
    for (let i = 0; i < rows.length; i++) {
        let r = rows[i]

        //長度不同: 維持補''與丟棄多出之值, opt.debug時提示(只含列號與長度)
        if (r.length !== keys.length) {
            if (dbg === null) {
                dbg = optVal.readDbg(opt)
            }
            if (dbg.debug) {
                parseNumOpt.warnOnce(`${fn}|length|mat`, `[wsemi ${fn}] invalid mat[${i + rowOffset}]: must have the same length as ${keysLabel} (row ${r.length}, ${keysLabel} ${keys.length}), filling missing values with '' and dropping extra values`, { fn, reason: 'length', key: 'mat' }, dbg.funLog)
            }
        }

        let o = {}
        for (let j = 0; j < keys.length; j++) {
            let k = ks[j]
            if (k === null) {
                continue //略過該欄連同其值
            }
            let v = j < r.length ? r[j] : undefined
            if (v === undefined) {
                v = '' //短於keys、值為undefined、列內空位
            }
            else if (typeof v === 'function') {
                v = null //函數視為null
            }
            _setOwnKey(o, k, v)
        }
        ltdt.push(o)
    }

    return { state: 'success', msg: ltdt }
}


export default _keysmat2ltdtCore
