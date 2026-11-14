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


export default _normKey
