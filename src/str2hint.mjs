import isstr from './isstr.mjs'


/**
 * 一般字串轉hash整數
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/str2hint.test.mjs Github}
 * @memberOf wsemi
 * @param {String} str 輸入一般字串
 * @returns {String} 回傳轉換後整數
 * @example
 *
 * console.log(str2hint('abc'))
 * // => 807794786
 *
 * console.log(str2hint('123'))
 * // => 408093746
 *
 * console.log(str2hint('12.3'))
 * // => 10159942
 *
 * console.log(str2hint(''))
 * // => 0
 *
 * console.log(str2hint(null))
 * // => null
 *
 */
function str2hint(str) {

    //check
    if (!isstr(str)) {
        return null
    }
    if (str === '') {
        return 0
    }

    // let _int = ''
    // let dig = 3
    // for (let i = 0; i < str.length; i++) {
    //     let c = String(str.charCodeAt(i))
    //     for (let a = 0; a < dig - c.length; a++) {
    //         _int += 0
    //     }
    //     _int += c
    // }
    // let i = Number(_int)
    // return i
    let arr = str.split('')
    let i = arr.reduce(
        (hashCode, currentVal) =>
            (hashCode =
                  currentVal.charCodeAt(0) +
                  (hashCode << 6) +
                  (hashCode << 16) -
                  hashCode),
        0
    )
    // console.log(i)
    return i
}


export default str2hint
