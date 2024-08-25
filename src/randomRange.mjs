import isnum from './isnum.mjs'
import cdbl from './cdbl.mjs'
import random from './random.mjs'


/**
 * 產生位於指定範圍內隨機數，值域為[vstart,vend)，代表值會大於等於vstart但小於vend
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/randomRange.test.mjs Github}
 * @memberOf wsemi
 * @param {Number} [vstart=0] 輸入範圍最小值，預設0
 * @param {Number} [vend=1] 輸入範圍最大值，預設1
 * @returns {Number} 回傳位於指定範圍內隨機數字
 * @example
 *
 * let r
 *
 * r = randomRange()
 * console.log('randomRange', r)
 * // => randomRange random [0,1) (預設範圍為0至1)
 *
 * r = randomRange(0, 1)
 * console.log('randomRange(0,1)', r)
 * // => randomRange(0,1) random [0,1)
 *
 * r = randomRange(12.3, 456.7)
 * console.log('randomRange(12.3, 456.7)', r)
 * // => randomRange(12.3, 456.7) random [12.3, 456.7)
 *
 */
function randomRange(vstart = 0, vend = 1) {

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

    //random, [0,1)
    let pr = random()

    //r
    let rng = vend - vstart
    let r = pr * rng + vstart

    return r
}


export default randomRange
