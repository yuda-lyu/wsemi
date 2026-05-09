/**
 * 判斷是否為BigInt
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
    let c = Object.prototype.toString.call(v)
    return c === '[object BigInt]'
}


export default isbigint
