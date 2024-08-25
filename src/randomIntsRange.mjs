import isint from './isint.mjs'
import ispint from './ispint.mjs'
import cint from './cint.mjs'
import random from './random.mjs'


/**
 * 產生位於指定範圍內隨機整數陣列，各元素值域為[vstart,vend]，代表值會大於等於vstart且小於等於vend
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/randomIntsRange.test.mjs Github}
 * @memberOf wsemi
 * @param {Integer} [vstart=0] 輸入範圍最小值整數，預設0
 * @param {Integer} [vend=100] 輸入範圍最大值整數，預設100
 * @param {Integer} [n=1] 輸入產生數量整數，預設1
 * @returns {Integer} 回傳位於指定範圍內隨機整數
 * @example
 *
 * let rs
 *
 * rs = randomIntsRange()
 * console.log('randomIntsRange', rs)
 * // => randomIntsRange [ [0,100] ] (預設範圍為0至100)
 *
 * rs = randomIntsRange(0, 100)
 * console.log('randomIntsRange(0, 100)', rs)
 * // => randomIntsRange(0, 100) [ [0,100] ]
 *
 * rs = randomIntsRange(0, 100, 2)
 * console.log('randomIntsRange(0, 100, 2)', rs)
 * // => randomIntsRange(0, 100, 2) [ [0,100], [0,100] ]
 *
 * rs = randomIntsRange(123, 4567)
 * console.log('randomIntsRange(123, 4567)', rs)
 * // => randomIntsRange(123, 4567) [ [123,4567] ]
 *
 * rs = randomIntsRange(123, 4567, 2)
 * console.log('randomIntsRange(123, 4567, 2)', rs)
 * // => randomIntsRange(123, 4567, 2) [ [123,4567], [123,4567] ]
 *
 */
function randomIntsRange(vstart = 0, vend = 100, n) {

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

    //n
    if (!ispint(n)) {
        n = 1
    }
    n = cint(n)

    //check
    if (vstart > vend) {
        throw new Error(`vstart[${vstart}] > vend[${vend}]`)
    }

    //rs
    let rs = []
    for (let i = 1; i <= n; i++) {

        //random, [0,1)
        let pr = random()

        //r
        let rng = vend - vstart + 1 //要額外+1才能使取ceil時讓各整數出現機率一致
        let r = pr * rng + vstart
        r = Math.floor(r)

        //push
        rs.push(r)

    }

    return rs
}


export default randomIntsRange
