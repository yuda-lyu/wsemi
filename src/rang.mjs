import cdbl from './cdbl.mjs'
import cint from './cint.mjs'
import isnum from './isnum.mjs'
import ispint from './ispint.mjs'


/**
 * 依照起訖值與切分數量產生陣列，切分數量代表間隔數量，故切3份時包含起訖點就會有4點
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/rang.test.mjs Github}
 * @memberOf wsemi
 * @param {Number} rStart 輸入起始數字
 * @param {Number} rEnd 輸入結束數字
 * @param {Integer} [num=2] 輸入切分數量正整數，預設2
 * @returns {Boolean} 回傳判斷布林值
 * @example
 *
 * let r
 *
 * r = rang(0, 10)
 * console.log(r)
 * // => [ 0, 5, 10 ]
 *
 * r = rang(0, 10, 10)
 * console.log(r)
 * // => [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ]
 *
 * r = rang(0, 10, 3)
 * console.log(r)
 * // => [ 0, 3.3333333333333335, 6.666666666666667, 10 ]
 *
 * r = rang(0, 10, 4)
 * console.log(r)
 * // => [ 0, 2.5, 5, 7.5, 10 ]
 *
 */
function rang(rStart, rEnd, num = 2) {

    //check rStart
    if (!isnum(rStart)) {
        // throw new Error('rStart is not a number')
        return []
    }
    rStart = cdbl(rStart)

    //check rEnd
    if (!isnum(rEnd)) {
        // throw new Error('rEnd is not a number')
        return []
    }
    rEnd = cdbl(rEnd)

    //check num
    if (!ispint(num)) {
        num = 2
    }
    num = cint(num)
    if (num <= 0) {
        throw new Error(`num[${num}] <= 0`)
    }

    //dx
    let dx = (rEnd - rStart) / num

    let r = rStart
    let rs = []
    for (let i = 0; i <= num; i++) {
        rs.push(r)
        r += dx
    }

    return rs
}


export default rang
