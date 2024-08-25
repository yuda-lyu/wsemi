import range from 'lodash-es/range.js'
import sampleSize from 'lodash-es/sampleSize.js'
import isint from './isint.mjs'
import ispint from './ispint.mjs'
import cint from './cint.mjs'


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
    let rs = sampleSize(range(vstart, vend + 1), n)

    return rs
}


export default randomIntsNdpRange
