import isestr from './isestr.mjs'


/**
 * 自字串解析版本號(取第一個「數字.數字.數字」)
 *
 * @param {String} v 輸入字串
 * @returns {Array|null} 回傳三段整數陣列, 無法解析回傳null
 */
function parseVersion(v) {
    if (!isestr(v)) {
        return null
    }
    let m = v.match(/(\d+)\.(\d+)\.(\d+)/)
    if (!m) {
        return null
    }
    return [Number(m[1]), Number(m[2]), Number(m[3])]
}


/**
 * 比較2版本號字串之大小，自各字串取第一個「數字.數字.數字」後逐段以數值比較，可直接餵入CLI之--version輸出(如'agy 1.1.27 (build 3)')，預發布標籤(如-beta.1)不處理
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/strCompareForVersion.test.mjs Github}
 * @memberOf wsemi
 * @param {String} v1 輸入版本號字串
 * @param {String} v2 輸入版本號字串
 * @returns {Number|null} 回傳比較結果，v1大於v2回傳1，相等回傳0，小於回傳-1，任一方無法解析出三段版本號回傳null
 * @example
 *
 * console.log(strCompareForVersion('1.1.27', '1.1.11'))
 * // => 1
 *
 * console.log(strCompareForVersion('1.1.11', '1.1.11'))
 * // => 0
 *
 * console.log(strCompareForVersion('1.0.0', '1.1.11'))
 * // => -1
 *
 * console.log(strCompareForVersion('v1.2.10', '1.2.9'))
 * // => 1
 *
 * console.log(strCompareForVersion('agy 1.1.27 (build 3)', '1.1.11'))
 * // => 1
 *
 * console.log(strCompareForVersion('abc', '1.0.0'))
 * // => null
 *
 * console.log(strCompareForVersion('1.2', '1.2.0'))
 * // => null
 *
 */
function strCompareForVersion(v1, v2) {
    let a = parseVersion(v1)
    let b = parseVersion(v2)
    if (a === null || b === null) {
        return null
    }
    for (let i = 0; i < 3; i++) {
        if (a[i] > b[i]) {
            return 1
        }
        if (a[i] < b[i]) {
            return -1
        }
    }
    return 0
}


export default strCompareForVersion
