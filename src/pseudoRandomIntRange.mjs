import isint from './isint.mjs'
import cint from './cint.mjs'
import pseudoRandom from './pseudoRandom.mjs'


/**
 * 產生位於指定範圍內偽隨機整數，值域為[vstart,vend]，代表值會大於等於vstart且小於等於vend
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/pseudoRandomIntRange.test.mjs Github}
 * @memberOf wsemi
 * @param {Integer} [vstart=0] 輸入範圍最小值整數，預設0
 * @param {Integer} [vend=100] 輸入範圍最大值整數，預設100
 * @param {Integer|Number|String} [seed='start1'] 輸入種子seed，給予'start1'為使用初始值1並且隨呼叫次數自增，若為其他則代表使用為指定seed，預設'start1'
 * @returns {Integer} 回傳位於指定範圍內隨機整數
 * @example
 *
 * let r
 *
 * r = pseudoRandomIntRange()
 * console.log('pseudoRandomIntRange', r)
 * // => pseudoRandomIntRange 43 (預設範圍為0至100)
 *
 * r = pseudoRandomIntRange(0, 100)
 * console.log('pseudoRandomIntRange(0,100)', r)
 * // => pseudoRandomIntRange(0,100) 58 //因第2次呼叫故值會不同, 但維持呼叫次數順序時重複執行仍會相同
 *
 * r = pseudoRandomIntRange(123, 4567)
 * console.log('pseudoRandomIntRange(123,4567)', r)
 * // => pseudoRandomIntRange(123,4567) 2572
 *
 * r = pseudoRandomIntRange(null, null, 123)
 * console.log('pseudoRandomIntRange(null,null,123)', r)
 * // => pseudoRandomIntRange(null,null,123) 71
 *
 * r = pseudoRandomIntRange(null, null, 12.3)
 * console.log('pseudoRandomIntRange(null,null,12.3)', r)
 * // => pseudoRandomIntRange(null,null,12.3) 86
 *
 * r = pseudoRandomIntRange(null, null, 'abc')
 * console.log('pseudoRandomIntRange(null,null,"abc")', r)
 * // => pseudoRandomIntRange(null,null,"abc") 34
 *
 * r = pseudoRandomIntRange(null, null, 'abc')
 * console.log('pseudoRandomIntRange(null,null,"abc")', r)
 * // => pseudoRandomIntRange(null,null,"abc") 34
 *
 * r = pseudoRandomIntRange(null, null, 'def')
 * console.log('pseudoRandomIntRange(null,null,"def")', r)
 * // => pseudoRandomIntRange(null,null,"def") 52
 *
 * r = pseudoRandomIntRange(null, null, 'BH-01:S-123')
 * console.log('pseudoRandomIntRange(null,null,"BH-01:S-123")', r)
 * // => pseudoRandomIntRange(null,null,"BH-01:S-123") 46
 *
 * r = pseudoRandomIntRange(0, 100, 123)
 * console.log('pseudoRandomIntRange(0,100,123)', r)
 * // => pseudoRandomIntRange(0,100,123) 71
 *
 * r = pseudoRandomIntRange(0, 100, 12.3)
 * console.log('pseudoRandomIntRange(0,100,12.3)', r)
 * // => pseudoRandomIntRange(0,100,12.3) 86
 *
 * r = pseudoRandomIntRange(0, 100, 'abc')
 * console.log('pseudoRandomIntRange(0,100,"abc")', r)
 * // => pseudoRandomIntRange(0,100,"abc") 34
 *
 * r = pseudoRandomIntRange(0, 100, 'abc')
 * console.log('pseudoRandomIntRange(0,100,"abc")', r)
 * // => pseudoRandomIntRange(0,100,"abc") 34
 *
 * r = pseudoRandomIntRange(0, 100, 'def')
 * console.log('pseudoRandomIntRange(0,100,"def")', r)
 * // => pseudoRandomIntRange(0,100,"def") 52
 *
 * r = pseudoRandomIntRange(0, 100, 'BH-01:S-123')
 * console.log('pseudoRandomIntRange(0,100,"BH-01:S-123")', r)
 * // => pseudoRandomIntRange(0,100,"BH-01:S-123") 46
 *
 * r = pseudoRandomIntRange(123, 4567, 123)
 * console.log('pseudoRandomIntRange(123,4567,123)', r)
 * // => pseudoRandomIntRange(123,4567,123) 3219
 *
 * r = pseudoRandomIntRange(123, 4567, 12.3)
 * console.log('pseudoRandomIntRange(123,4567,12.3)', r)
 * // => pseudoRandomIntRange(123,4567,12.3) 3907
 *
 * r = pseudoRandomIntRange(123, 4567, 'abc')
 * console.log('pseudoRandomIntRange(123,456.7,"abc")', r)
 * // => pseudoRandomIntRange(123,456.7,"abc") 1594
 *
 * r = pseudoRandomIntRange(123, 4567, 'abc')
 * console.log('pseudoRandomIntRange(123,456.7,"abc")', r)
 * // => pseudoRandomIntRange(123,456.7,"abc") 1594
 *
 * r = pseudoRandomIntRange(123, 4567, 'def')
 * console.log('pseudoRandomIntRange(123,456.7,"def")', r)
 * // => pseudoRandomIntRange(123,456.7,"def") 2400
 *
 * r = pseudoRandomIntRange(123, 4567, 'BH-01:S-123')
 * console.log('pseudoRandomIntRange(123,456.7,"BH-01:S-123")', r)
 * // => pseudoRandomIntRange(123,456.7,"BH-01:S-123") 2119
 *
 */
function pseudoRandomIntRange(vstart = 0, vend = 100, seed = 'start1') {

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
    let pr = pseudoRandom(seed)

    //r
    let rng = vend - vstart + 1 //要額外+1才能使取ceil時讓各整數出現機率一致
    let r = pr * rng + vstart
    r = Math.ceil(r)

    return r
}


export default pseudoRandomIntRange
