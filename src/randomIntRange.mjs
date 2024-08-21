import isint from './isint.mjs'
import cint from './cint.mjs'
import random from './random.mjs'


/**
 * 產生位於指定範圍內隨機整數，值域為[vstart,vend]，代表值會大於等於vstart且小於等於vend
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/randomIntRange.test.mjs Github}
 * @memberOf wsemi
 * @param {Integer} [vstart=0] 輸入範圍最小值整數，預設0
 * @param {Integer} [vend=100] 輸入範圍最大值整數，預設100
 * @returns {Integer} 回傳位於指定範圍內隨機整數
 * @example
 *
 * let r
 *
 * r = randomIntRange()
 * console.log('randomIntRange', r)
 * // => randomIntRange [0,100] (預設範圍為0至100)
 *
 * r = randomIntRange(0, 100)
 * console.log('randomIntRange(0,100)', r)
 * // => randomIntRange(0,100) [0,100]
 *
 * r = randomIntRange(123, 4567)
 * console.log('randomIntRange(123,4567)', r)
 * // => randomIntRange(123,4567) [123,4567]
 *
 */
function randomIntRange(vstart = 0, vend = 100) {

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

    //random, [0,1)
    let pr = random()

    //r
    let rng = vend - vstart + 1 //要額外+1才能使取ceil時讓各整數出現機率一致
    let r = pr * rng + vstart
    r = Math.ceil(r)

    return r
}


export default randomIntRange
