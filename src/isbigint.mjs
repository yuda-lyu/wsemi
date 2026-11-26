/**
 * 判斷是否為BigInt
 *
 * 只收原始BigInt(語言原生判定typeof v === 'bigint'，不讀Symbol.toStringTag)：包裝物件Object(1n)與偽造Symbol.toStringTag為'BigInt'之物件為false(同isstr，判斷函數只收原始值；要把包裝物件轉成字串請用轉型函數cstr，其照舊拆包)
 * 對任何輸入皆不拋錯(含已撤銷之Proxy、讀取內部標籤即拋錯之物件)
 *
 * BigInt為ES2020新增之原生型別，typeof值為'bigint'，與Number(typeof 'number')互不相容。
 * 由於BigInt與Number無法直接做混合算術運算(`1n + 1`、`Math.floor(1n)` 皆擲TypeError)，
 * 故本函式獨立於isnum/isnbr，提供BigInt之專屬判斷。常見場景如金融API回傳之大整數識別碼
 * (Binance orderId/algoId常超過Number.MAX_SAFE_INTEGER即2^53-1)。
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/isbigint.test.mjs Github}
 * @memberOf wsemi
 * @param {*} v 輸入任意資料
 * @returns {Boolean} 回傳判斷布林值
 * @example
 *
 * console.log(isbigint(123n))
 * // => true
 *
 * console.log(isbigint(BigInt(123)))
 * // => true
 *
 * console.log(isbigint(BigInt('9007199254740993')))
 * // => true
 *
 * console.log(isbigint(123))
 * // => false
 *
 * console.log(isbigint('123'))
 * // => false
 *
 */
function isbigint(v) {
    return typeof v === 'bigint'
}


export default isbigint
