import isint from './isint.mjs'
import cint from './cint.mjs'
import pseudoRandom from './pseudoRandom.mjs'


/**
 * 產生位於指定範圍內偽隨機整數，值域為[vstart,vend]，代表值會大於等於vstart且小於等於vend
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/pseudoRandomIntRange.test.mjs Github}
 * @memberOf wsemi
 * @param {Number} [vstart=0] 輸入範圍最小值整數，預設0
 * @param {Number} [vend=100] 輸入範圍最大值整數，預設100
 * @returns {Number} 回傳位於指定範圍內隨機數字
 * @example
 *
 * let r
 *
 * r = pseudoRandomIntRange()
 * console.log('pseudoRandomIntRange', r)
 * // => 43 (預設範圍為0至100)
 *
 * r = pseudoRandomIntRange(0, 100)
 * console.log('pseudoRandomIntRange(0,100)', r)
 * // => 58 //因第2次呼叫故值會不同, 但維持呼叫次數順序時重複執行仍會相同
 *
 * r = pseudoRandomIntRange(123, 4567)
 * console.log('pseudoRandomIntRange(12.3,456.7)', r)
 * // => 2572
 *
 */
function pseudoRandomIntRange(vstart = 0, vend = 100) {

    //vstart
    if (!isint(vstart)) {
        vstart = 0
    }
    vstart = cint(vstart)

    //vend
    if (!isint(vend)) {
        vend = 100
    }
    vend = cint(vend)

    //check
    if (vstart > vend) {
        throw new Error(`vstart[${vstart}] > vend[${vend}]`)
    }

    //pseudoRandom, [0,1)
    let pr = pseudoRandom()

    //r
    let rng = vend - vstart + 1 //要額外+1才能使取ceil時讓各整數出現機率一致
    let r = pr * rng + vstart
    r = Math.ceil(r)

    return r
}


export default pseudoRandomIntRange
