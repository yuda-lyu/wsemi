//本檔為內部使用, 不由index匯出


/**
 * 以自有資料屬性寫入鍵值(單一擁有者, 供dtpick、dtmapping、arr2dt、ltdtDiffByKey等組裝結果物件之函數共用)
 *
 * 鍵先轉為屬性鍵(Symbol原樣, 其餘String), 鍵'__proto__'以defineProperty設為自有之可列舉、可寫、可設定之資料屬性(一般賦值會改結果物件之原型而非新增欄位), 其餘鍵以一般賦值寫入
 *
 * 規格: 使用者2026-11-14(排程第430項第二批, dspec〈輸入參數之檢測機制〉§11〈第二批〉): 鍵一律只看自有可列舉字串鍵, __proto__為自有欄位時以一般欄位寫入
 *
 * @param {Object} o 輸入要寫入之物件
 * @param {*} k 輸入鍵
 * @param {*} v 輸入值
 */
function _setOwnKey(o, k, v) {
    let pk = typeof k === 'symbol' ? k : String(k)
    if (pk === '__proto__') {
        Object.defineProperty(o, pk, { value: v, writable: true, enumerable: true, configurable: true })
    }
    else {
        o[pk] = v
    }
}


export default _setOwnKey
