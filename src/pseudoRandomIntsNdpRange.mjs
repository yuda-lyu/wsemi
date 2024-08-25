import take from 'lodash-es/take.js'
import isint from './isint.mjs'
import ispint from './ispint.mjs'
import cint from './cint.mjs'
import arrSort from './arrSort.mjs'
import pseudoRandom from './pseudoRandom.mjs'


/**
 * 產生位於指定範圍內不重複之偽隨機整數陣列，各元素值域為[vstart,vend]，代表值會大於等於vstart且小於等於vend
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/pseudoRandomIntsNdpRange.test.mjs Github}
 * @memberOf wsemi
 * @param {Integer} [vstart=0] 輸入範圍最小值整數，預設0
 * @param {Integer} [vend=100] 輸入範圍最大值整數，預設100
 * @param {Integer} [n=1] 輸入產生數量整數，最長為vend-vstart+1個，預設1
 * @param {Integer|Number|String} [seed='start1'] 輸入種子seed，給予'start1'為使用初始值1並且隨呼叫次數自增，若為其他則代表使用為指定seed，預設'start1'
 * @returns {Integer} 回傳位於指定範圍內隨機整數
 * @example
 *
 * let rs
 *
 * rs = pseudoRandomIntsNdpRange()
 * console.log('pseudoRandomIntsNdpRange', rs)
 * // => pseudoRandomIntsNdpRange [ 1 ] (預設範圍為0至100)
 *
 * rs = pseudoRandomIntsNdpRange(0, 100)
 * console.log('pseudoRandomIntsNdpRange(0, 100)', rs)
 * // => pseudoRandomIntsNdpRange(0, 100) [ 85 ] //因第2次呼叫故值會不同, 但維持呼叫次數順序時重複執行仍會相同
 *
 * rs = pseudoRandomIntsNdpRange(0, 100, 2)
 * console.log('pseudoRandomIntsNdpRange(0, 100)', rs)
 * // => pseudoRandomIntsNdpRange(0, 100) [ 59, 20 ]
 *
 * rs = pseudoRandomIntsNdpRange(123, 4567)
 * console.log('pseudoRandomIntsNdpRange(123, 4567)', rs)
 * // => pseudoRandomIntsNdpRange(123, 4567) [ 3951 ]
 *
 * rs = pseudoRandomIntsNdpRange(null, null, 2, 123)
 * console.log('pseudoRandomIntsNdpRange(null, null, 2, 123)', rs)
 * // => pseudoRandomIntsNdpRange(null, null, 2, 123) [ 94, 76 ]
 *
 * rs = pseudoRandomIntsNdpRange(null, null, 2, 12.3)
 * console.log('pseudoRandomIntsNdpRange(null, null, 2, 12.3)', rs)
 * // => pseudoRandomIntsNdpRange(null, null, 2, 12.3) [ 69, 82 ]
 *
 * rs = pseudoRandomIntsNdpRange(null, null, 2, 'abc')
 * console.log('pseudoRandomIntsNdpRange(null, null, 2, "abc")', rs)
 * // => pseudoRandomIntsNdpRange(null, null, 2, "abc") [ 20, 28 ]
 *
 * rs = pseudoRandomIntsNdpRange(null, null, 2, 'abc')
 * console.log('pseudoRandomIntsNdpRange(null, null, 2, "abc")', rs)
 * // => pseudoRandomIntsNdpRange(null, null, 2, "abc") [ 20, 28 ]
 *
 * rs = pseudoRandomIntsNdpRange(null, null, 2, 'def')
 * console.log('pseudoRandomIntsNdpRange(null, null, 2, "def")', rs)
 * // => pseudoRandomIntsNdpRange(null, null, 2, "def") [ 64, 34 ]
 *
 * rs = pseudoRandomIntsNdpRange(null, null, 2, 'BH01S123')
 * console.log('pseudoRandomIntsNdpRange(null, null, 2, "BH01S123")', rs)
 * // => pseudoRandomIntsNdpRange(null, null, 2, "BH01S123") [ 0, 26 ]
 *
 * rs = pseudoRandomIntsNdpRange(null, null, 2, 'BH-01:S-123')
 * console.log('pseudoRandomIntsNdpRange(null, null, 2, "BH-01:S-123")', rs)
 * // => pseudoRandomIntsNdpRange(null, null, 2, "BH-01:S-123") [ 71, 77 ]
 *
 * rs = pseudoRandomIntsNdpRange(0, 100, 2, 123)
 * console.log('pseudoRandomIntsNdpRange(0, 100, 2, 123)', rs)
 * // => pseudoRandomIntsNdpRange(0, 100, 2, 123) [ 94, 76 ]
 *
 * rs = pseudoRandomIntsNdpRange(0, 100, 2, 12.3)
 * console.log('pseudoRandomIntsNdpRange(0, 100, 2, 12.3)', rs)
 * // => pseudoRandomIntsNdpRange(0, 100, 2, 12.3) [ 69, 82 ]
 *
 * rs = pseudoRandomIntsNdpRange(0, 100, 2, 'abc')
 * console.log('pseudoRandomIntsNdpRange(0, 100, 2, "abc")', rs)
 * // => pseudoRandomIntsNdpRange(0, 100, 2, "abc") [ 20, 28 ]
 *
 * rs = pseudoRandomIntsNdpRange(0, 100, 2, 'abc')
 * console.log('pseudoRandomIntsNdpRange(0, 100, 2, "abc")', rs)
 * // => pseudoRandomIntsNdpRange(0, 100, 2, "abc") [ 20, 28 ]
 *
 * rs = pseudoRandomIntsNdpRange(0, 100, 2, 'def')
 * console.log('pseudoRandomIntsNdpRange(0, 100, 2, "def")', rs)
 * // => pseudoRandomIntsNdpRange(0, 100, 2, "def") [ 64, 34 ]
 *
 * rs = pseudoRandomIntsNdpRange(0, 100, 2, 'BH-01:S-123')
 * console.log('pseudoRandomIntsNdpRange(0, 100, 2, "BH-01:S-123")', rs)
 * // => pseudoRandomIntsNdpRange(0, 100, 2, "BH-01:S-123") [ 71, 77 ]
 *
 * rs = pseudoRandomIntsNdpRange(123, 4567, 2, 123)
 * console.log('pseudoRandomIntsNdpRange(123, 4567, 2, 123)', rs)
 * // => pseudoRandomIntsNdpRange(123, 4567, 2, 123) [ 2528, 3854 ]
 *
 * rs = pseudoRandomIntsNdpRange(123, 4567, 2, 12.3)
 * console.log('pseudoRandomIntsNdpRange(123, 4567, 2, 12.3)', rs)
 * // => pseudoRandomIntsNdpRange(123, 4567, 2, 12.3) [ 1818, 4334 ]
 *
 * rs = pseudoRandomIntsNdpRange(123, 4567, 2, 'abc')
 * console.log('pseudoRandomIntsNdpRange(123, 456.7, 2, "abc")', rs)
 * // => pseudoRandomIntsNdpRange(123, 456.7, 2, "abc") [ 478, 3303 ]
 *
 * rs = pseudoRandomIntsNdpRange(123, 4567, 2, 'abc')
 * console.log('pseudoRandomIntsNdpRange(123, 456.7, 2, "abc")', rs)
 * // => pseudoRandomIntsNdpRange(123, 456.7, 2, "abc") [ 478, 3303 ]
 *
 * rs = pseudoRandomIntsNdpRange(123, 4567, 2, 'def')
 * console.log('pseudoRandomIntsNdpRange(123, 456.7, 2, "def")', rs)
 * // => pseudoRandomIntsNdpRange(123, 456.7, 2, "def") [ 983, 3133 ]
 *
 * rs = pseudoRandomIntsNdpRange(123, 4567, 2, 'BH01S123')
 * console.log('pseudoRandomIntsNdpRange(123, 456.7, 2, "BH01S123")', rs)
 * // => pseudoRandomIntsNdpRange(123, 456.7, 2, "BH01S123") [ 2866, 183 ]
 *
 * rs = pseudoRandomIntsNdpRange(123, 4567, 2, 'BH-01:S-123')
 * console.log('pseudoRandomIntsNdpRange(123, 456.7, 2, "BH-01:S-123")', rs)
 * // => pseudoRandomIntsNdpRange(123, 456.7, 2, "BH-01:S-123") [ 3888, 249 ]
 *
 */
function pseudoRandomIntsNdpRange(vstart = 0, vend = 100, n, seed = 'start1') {

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

    //fpr function, [0,1)
    let fpr = pseudoRandom(seed, true)

    //rs
    let rs = []
    let _vstart = 0
    let _vend = vend - vstart
    for (let i = _vstart; i <= _vend; i++) {

        //pr
        let pr = fpr()

        //r
        let rng = vend - vstart + 1 //要額外+1才能使取ceil時讓各整數出現機率一致
        let r = pr * rng + vstart
        r = Math.floor(r)

        //push
        rs.push(r)

    }

    //arrSort
    let inds = arrSort(rs, { returnIndex: true })

    //take
    inds = take(inds, n)

    return inds
}


export default pseudoRandomIntsNdpRange
