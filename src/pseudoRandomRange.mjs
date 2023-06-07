import isnum from './isnum.mjs'
import cdbl from './cdbl.mjs'
import pseudoRandom from './pseudoRandom.mjs'


/**
 * 產生位於指定範圍內偽隨機數，值域為[vstart,vend)，代表值會大於等於vstart但小於vend
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/pseudoRandomRange.test.mjs Github}
 * @memberOf wsemi
 * @param {Number} [vstart=0] 輸入範圍最小值，預設0
 * @param {Number} [vend=1] 輸入範圍最大值，預設1
 * @returns {Number} 回傳位於指定範圍內隨機數字
 * @example
 *
 * let r
 *
 * r = pseudoRandomRange()
 * console.log('pseudoRandomRange', r)
 * // => 0.4170219984371215 (預設範圍為0至1)
 *
 * r = pseudoRandomRange(0, 1)
 * console.log('pseudoRandomRange(0,1)', r)
 * // => 0.5665697017684579 //因第2次呼叫故值會不同, 但維持呼叫次數順序時重複執行仍會相同
 *
 * r = pseudoRandomRange(12.3, 456.7)
 * console.log('pseudoRandomRange(12.3,456.7)', r)
 * // => 257.074588704668
 *
 */
function pseudoRandomRange(vstart = 0, vend = 1) {

    //vstart
    if (!isnum(vstart)) {
        vstart = 0
    }
    vstart = cdbl(vstart)

    //vend
    if (!isnum(vend)) {
        vend = 1
    }
    vend = cdbl(vend)

    //check
    if (vstart > vend) {
        throw new Error(`vstart[${vstart}] > vend[${vend}]`)
    }

    //pseudoRandom, [0,1)
    let pr = pseudoRandom()

    //r
    let rng = vend - vstart
    let r = pr * rng + vstart

    return r
}


export default pseudoRandomRange
