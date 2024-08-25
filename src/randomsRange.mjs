import isnum from './isnum.mjs'
import ispint from './ispint.mjs'
import cdbl from './cdbl.mjs'
import cint from './cint.mjs'
import random from './random.mjs'


/**
 * 產生位於指定範圍內隨機數陣列，各元素值域為[vstart,vend)，代表值會大於等於vstart但小於vend
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/randomsRange.test.mjs Github}
 * @memberOf wsemi
 * @param {Number} [vstart=0] 輸入範圍最小值，預設0
 * @param {Number} [vend=1] 輸入範圍最大值，預設1
 * @param {Integer} [n=1] 輸入產生數量整數，預設1
 * @returns {Number} 回傳位於指定範圍內隨機數字
 * @example
 *
 * let rs
 *
 * rs = randomsRange()
 * console.log('randomsRange', rs)
 * // => randomsRange [ [0,1) ] (預設範圍為0至1)
 *
 * rs = randomsRange(0, 1)
 * console.log('randomsRange(0,1)', rs)
 * // => randomsRange(0,1) [ [0,1) ]
 *
 * rs = randomsRange(0, 1, 2)
 * console.log('randomsRange(0,1,2)', rs)
 * // => randomsRange(0,1,2) [ [0,1), [0,1) ]
 *
 * rs = randomsRange(12.3, 456.7)
 * console.log('randomsRange(12.3, 456.7)', rs)
 * // => randomsRange(12.3, 456.7) [ [12.3, 456.7) ]
 *
 * rs = randomsRange(12.3, 456.7, 2)
 * console.log('randomsRange(12.3, 456.7, 2)', rs)
 * // => randomsRange(12.3, 456.7, 2) [ [12.3, 456.7), [12.3, 456.7) ]
 *
 */
function randomsRange(vstart = 0, vend = 1, n = 1) {

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
        let rng = vend - vstart
        let r = pr * rng + vstart

        //push
        rs.push(r)

    }

    return rs
}


export default randomsRange
