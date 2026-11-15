//本檔為內部使用, 不由index匯出


/**
 * 欄位名之正規化(單一擁有者, 供arr2dt、dtmapping、ltdtmapping共用): 回傳欄位名字串, 或null表示略過
 *
 * 規格: 使用者2026-11-14(排程第430項第二批, 裁定表〈三、arr2dt〉〈四、dtmapping〉):
 *   略過: 空字串''、null、undefined(含陣列空洞)、物件(含陣列、包裝物件)、函數、Symbol(鍵只看字串鍵)
 *   數字視同字串(String(k)); 其餘原始值(布林、BigInt)依String(k)取欄位名, 同修前(zipObject與lodash get皆以字串為鍵)
 *
 * @param {*} k 輸入欄位名
 * @returns {String|null} 回傳欄位名字串, 或null表示略過
 */
function _normKey(k) {
    if (typeof k === 'string') {
        return k !== '' ? k : null
    }
    if (k === null || k === undefined) {
        return null
    }
    if (typeof k === 'object' || typeof k === 'function' || typeof k === 'symbol') {
        return null
    }
    return String(k) //number、boolean、bigint
}


/**
 * 欄位鍵之正規化(keysmat2ltdt、mat2ltdt之表頭、ltdtkeys2mat、ltdtkeysheads2mat之keys): 同_normKey, 另略過布林與非有限數字(NaN、±Infinity)
 *
 * 規格: 使用者2026-11-15(排程第430項第三批, 裁定表〈一、keysmat2ltdt〉〈四、ltdtkeys2mat〉): keys元素為''、null、undefined、空位、物件、陣列、布林、Symbol、非有限數字時該欄略過, 有限數字視同字串;
 *   函數比照物件略過, BigInt裁定未列而同_normKey以String(k)(同修前zipObject與haskey以字串為鍵)
 *
 * @param {*} k 輸入欄位名
 * @returns {String|null} 回傳欄位名字串, 或null表示略過
 */
function normKeyField(k) {
    if (typeof k === 'boolean') {
        return null
    }
    if (typeof k === 'number' && !Number.isFinite(k)) {
        return null
    }
    return _normKey(k)
}


_normKey.field = normKeyField


export default _normKey
