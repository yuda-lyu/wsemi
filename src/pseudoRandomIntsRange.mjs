import isint from './isint.mjs'
import ispint from './ispint.mjs'
import cint from './cint.mjs'
import pseudoRandom from './pseudoRandom.mjs'


/**
 * 產生位於指定範圍內偽隨機整數陣列，各元素值域為[vstart,vend]，代表值會大於等於vstart且小於等於vend
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/pseudoRandomIntsRange.test.mjs Github}
 * @memberOf wsemi
 * @param {Integer} [vstart=0] 輸入範圍最小值整數，預設0
 * @param {Integer} [vend=100] 輸入範圍最大值整數，預設100
 * @param {Integer} [n=1] 輸入產生數量整數，預設1
 * @param {Integer|Number|String} [seed='start1'] 輸入種子seed，給予'start1'為使用初始值1並且隨呼叫次數自增，若為其他則代表使用為指定seed，預設'start1'
 * @returns {Integer} 回傳位於指定範圍內隨機整數
 * @example
 *
 * let rs
 *
 * rs = pseudoRandomIntsRange()
 * console.log('pseudoRandomIntsRange', rs)
 * // => pseudoRandomIntsRange [ 43 ] (預設範圍為0至100)
 *
 * rs = pseudoRandomIntsRange(0, 100)
 * console.log('pseudoRandomIntsRange(0,100)', rs)
 * // => pseudoRandomIntsRange(0,100) [ 58 ] //因第2次呼叫故值會不同, 但維持呼叫次數順序時重複執行仍會相同
 *
 * rs = pseudoRandomIntsRange(0, 100, 2)
 * console.log('pseudoRandomIntsRange(0,100)', rs)
 * // => pseudoRandomIntsRange(0,100) [ 56, 94 ]
 *
 * rs = pseudoRandomIntsRange(123, 4567)
 * console.log('pseudoRandomIntsRange(123,4567)', rs)
 * // => pseudoRandomIntsRange(123,4567) [ 281 ]
 *
 * rs = pseudoRandomIntsRange(null, null, 2, 123)
 * console.log('pseudoRandomIntsRange(null,null,2,123)', rs)
 * // => pseudoRandomIntsRange(null,null,2,123) [ 71, 29 ]
 *
 * rs = pseudoRandomIntsRange(null, null, 2, 12.3)
 * console.log('pseudoRandomIntsRange(null,null,2,12.3)', rs)
 * // => pseudoRandomIntsRange(null,null,2,12.3) [ 86, 56 ]
 *
 * rs = pseudoRandomIntsRange(null, null, 2, 'abc')
 * console.log('pseudoRandomIntsRange(null,null,2,"abc")', rs)
 * // => pseudoRandomIntsRange(null,null,2,"abc") [ 64, 73 ]
 *
 * rs = pseudoRandomIntsRange(null, null, 2, 'abc')
 * console.log('pseudoRandomIntsRange(null,null,2,"abc")', rs)
 * // => pseudoRandomIntsRange(null,null,2,"abc") [ 64, 73 ]
 *
 * rs = pseudoRandomIntsRange(null, null, 2, 'def')
 * console.log('pseudoRandomIntsRange(null,null,2,"def")', rs)
 * // => pseudoRandomIntsRange(null,null,2,"def") [ 99, 66 ]
 *
 * rs = pseudoRandomIntsRange(null, null, 2, 'BH01S123')
 * console.log('pseudoRandomIntsRange(null,null,2,"BH01S123")', rs)
 * // => pseudoRandomIntsRange(null,null,2,"BH01S123") [ 1, 57 ]
 *
 * rs = pseudoRandomIntsRange(null, null, 2, 'BH-01:S-123')
 * console.log('pseudoRandomIntsRange(null,null,2,"BH-01:S-123")', rs)
 * // => pseudoRandomIntsRange(null,null,2,"BH-01:S-123") [ 97, 26 ]
 *
 * rs = pseudoRandomIntsRange(0, 100, 2, 123)
 * console.log('pseudoRandomIntsRange(0,100,2,123)', rs)
 * // => pseudoRandomIntsRange(0,100,2,123) [ 71, 29 ]
 *
 * rs = pseudoRandomIntsRange(0, 100, 2, 12.3)
 * console.log('pseudoRandomIntsRange(0,100,2,12.3)', rs)
 * // => pseudoRandomIntsRange(0,100,2,12.3) [ 86, 56 ]
 *
 * rs = pseudoRandomIntsRange(0, 100, 2, 'abc')
 * console.log('pseudoRandomIntsRange(0,100,2,"abc")', rs)
 * // => pseudoRandomIntsRange(0,100,2,"abc") [ 64, 73 ]
 *
 * rs = pseudoRandomIntsRange(0, 100, 2, 'abc')
 * console.log('pseudoRandomIntsRange(0,100,2,"abc")', rs)
 * // => pseudoRandomIntsRange(0,100,2,"abc") [ 64, 73 ]
 *
 * rs = pseudoRandomIntsRange(0, 100, 2, 'def')
 * console.log('pseudoRandomIntsRange(0,100,2,"def")', rs)
 * // => pseudoRandomIntsRange(0,100,2,"def") [ 99, 66 ]
 *
 * rs = pseudoRandomIntsRange(0, 100, 2, 'BH-01:S-123')
 * console.log('pseudoRandomIntsRange(0,100,2,"BH-01:S-123")', rs)
 * // => pseudoRandomIntsRange(0,100,2,"BH-01:S-123") [ 97, 26 ]
 *
 * rs = pseudoRandomIntsRange(123, 4567, 2, 123)
 * console.log('pseudoRandomIntsRange(123,4567,2,123)', rs)
 * // => pseudoRandomIntsRange(123,4567,2,123) [ 3219, 1375 ]
 *
 * rs = pseudoRandomIntsRange(123, 4567, 2, 12.3)
 * console.log('pseudoRandomIntsRange(123,4567,2,12.3)', rs)
 * // => pseudoRandomIntsRange(123,4567,2,12.3) [ 3907, 2566 ]
 *
 * rs = pseudoRandomIntsRange(123, 4567, 2, 'abc')
 * console.log('pseudoRandomIntsRange(123,456.7,2,"abc")', rs)
 * // => pseudoRandomIntsRange(123,456.7,2,"abc") [ 2930, 3306 ]
 *
 * rs = pseudoRandomIntsRange(123, 4567, 2, 'abc')
 * console.log('pseudoRandomIntsRange(123,456.7,2,"abc")', rs)
 * // => pseudoRandomIntsRange(123,456.7,2,"abc") [ 2930, 3306 ]
 *
 * rs = pseudoRandomIntsRange(123, 4567, 2, 'def')
 * console.log('pseudoRandomIntsRange(123,456.7,2,"def")', rs)
 * // => pseudoRandomIntsRange(123,456.7,2,"def") [ 4454, 3019 ]
 *
 * rs = pseudoRandomIntsRange(123, 4567, 2, 'BH01S123')
 * console.log('pseudoRandomIntsRange(123,456.7,2,"BH01S123")', rs)
 * // => pseudoRandomIntsRange(123,456.7,2,"BH01S123") [ 159, 2629 ]
 *
 * rs = pseudoRandomIntsRange(123, 4567, 2, 'BH-01:S-123')
 * console.log('pseudoRandomIntsRange(123,456.7,2,"BH-01:S-123")', rs)
 * // => pseudoRandomIntsRange(123,456.7,2,"BH-01:S-123") [ 4382, 1228 ]
 *
 */
function pseudoRandomIntsRange(vstart = 0, vend = 100, n, seed = 'start1') {

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
    for (let i = 1; i <= n; i++) {

        //pr
        let pr = fpr()

        //r
        let rng = vend - vstart + 1 //要額外+1才能使取ceil時讓各整數出現機率一致
        let r = pr * rng + vstart
        r = Math.ceil(r)

        //push
        rs.push(r)

    }

    return rs
}


export default pseudoRandomIntsRange
