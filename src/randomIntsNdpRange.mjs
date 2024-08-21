import take from 'lodash-es/take.js'
import isint from './isint.mjs'
import ispint from './ispint.mjs'
import cint from './cint.mjs'
import arrSort from './arrSort.mjs'
import random from './random.mjs'


/**
 * 產生位於指定範圍內不重複之偽隨機整數陣列，各元素值域為[vstart,vend]，代表值會大於等於vstart且小於等於vend
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/randomIntsNdpRange.test.mjs Github}
 * @memberOf wsemi
 * @param {Integer} [vstart=0] 輸入範圍最小值整數，預設0
 * @param {Integer} [vend=100] 輸入範圍最大值整數，預設100
 * @param {Integer} [n=1] 輸入產生數量整數，最長為vend-vstart+1個，預設1
 * @returns {Integer} 回傳位於指定範圍內隨機整數
 * @example
 *
 * let rs
 *
 * rs = randomIntsNdpRange()
 * console.log('randomIntsNdpRange', rs)
 * // => randomIntsNdpRange [ [0,100] ] (預設範圍為0至100)
 *
 * rs = randomIntsNdpRange(0, 100)
 * console.log('randomIntsNdpRange(0,100)', rs)
 * // => randomIntsNdpRange(0,100) [ [0,100] ]
 *
 * rs = randomIntsNdpRange(0, 100, 2)
 * console.log('randomIntsNdpRange(0,100)', rs)
 * // => randomIntsNdpRange(0,100,2) [ [0,100], [0,100] ]
 *
 * rs = randomIntsNdpRange(123, 4567)
 * console.log('randomIntsNdpRange(123,4567)', rs)
 * // => randomIntsNdpRange(123,4567) [ [123,4567], [123,4567] ]
 *
 * rs = randomIntsNdpRange(123, 4567, 2)
 * console.log('randomIntsNdpRange(123,4567,2)', rs)
 * // => randomIntsNdpRange(123,4567,2) [ [123,4567], [123,4567] ]
 *
 */
function randomIntsNdpRange(vstart = 0, vend = 100, n) {

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
    let _vstart = 0
    let _vend = vend - vstart
    for (let i = _vstart; i <= _vend; i++) {

        //random, [0,1)
        let pr = random()

        //r
        let rng = vend - vstart + 1 //要額外+1才能使取ceil時讓各整數出現機率一致
        let r = pr * rng + vstart
        r = Math.ceil(r)

        //push
        rs.push(r)

    }

    //arrSort
    let inds = arrSort(rs, { returnIndex: true })

    //take
    inds = take(inds, n)

    return inds
}


export default randomIntsNdpRange
