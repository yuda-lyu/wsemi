import optVal from './_optVal.mjs'
import pseudoRandom from './pseudoRandom.mjs'


//vstart, vend, n: opt類參數(JSDoc [參數=預設]或程式碼有回退), vstart與vend須為有效整數(iseint, use: 'safe'), n須為個數1~4294967295(iseint, use: 'count', min: 1); 非預期(含小數、超出範圍、Infinity、'0x10'、包裝物件等)視為未給、改用預設0、100與1, 不報錯; seed不在此列, 維持原樣
let RULE_VSTART = { fn: 'pseudoRandomIntsRange', name: 'vstart', kind: 'eint', chk: { use: 'safe' } }
let RULE_VEND = { fn: 'pseudoRandomIntsRange', name: 'vend', kind: 'eint', chk: { use: 'safe' } }
let RULE_N = { fn: 'pseudoRandomIntsRange', name: 'n', kind: 'eint', chk: { use: 'count', min: 1 } }


/**
 * 產生位於指定範圍內偽隨機整數陣列，各元素值域為[vstart,vend]，代表值會大於等於vstart且小於等於vend
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/pseudoRandomIntsRange.test.mjs Github}
 * @memberOf wsemi
 * @param {Number|String} [vstart=0] 輸入範圍最小值，opt類參數(有效整數，安全整數範圍，數字字串亦可，去頭尾空白後取值)，非預期之輸入(非有效整數、小數、超出安全整數範圍、Infinity、'0x10'、包裝物件等)視為未給而改用預設，不報錯，預設0
 * @param {Number|String} [vend=100] 輸入範圍最大值，規則同vstart，預設100；若vstart大於vend則拋出錯誤
 * @param {Number|String} [n=1] 輸入產生數量，opt類參數(有效整數，個數1~4294967295，數字字串亦可，去頭尾空白後取值)，非預期之輸入(非有效整數、小於1、超過4294967295、Infinity、'0x10'、包裝物件等)視為未給而改用預設，不報錯，預設1
 * @param {Integer|Number|String} [seed='start1'] 輸入種子seed，給予'start1'為使用初始值1並且隨呼叫次數自增，若為其他則代表使用為指定seed，預設'start1'
 * @returns {Integer} 回傳位於指定範圍內隨機整數
 * @example
 *
 * let rs
 *
 * rs = pseudoRandomIntsRange()
 * console.log('pseudoRandomIntsRange', rs)
 * // => pseudoRandomIntsRange [ 42 ] (預設範圍為0至100)
 *
 * rs = pseudoRandomIntsRange(0, 100)
 * console.log('pseudoRandomIntsRange(0, 100)', rs)
 * // => pseudoRandomIntsRange(0, 100) [ 57 ] //因第2次呼叫故值會不同, 但維持呼叫次數順序時重複執行仍會相同
 *
 * rs = pseudoRandomIntsRange(0, 100, 2)
 * console.log('pseudoRandomIntsRange(0, 100)', rs)
 * // => pseudoRandomIntsRange(0, 100) [ 55, 93 ]
 *
 * rs = pseudoRandomIntsRange(123, 4567)
 * console.log('pseudoRandomIntsRange(123, 4567)', rs)
 * // => pseudoRandomIntsRange(123, 4567) [ 280 ]
 *
 * rs = pseudoRandomIntsRange(null, null, 2, 123)
 * console.log('pseudoRandomIntsRange(null, null, 2, 123)', rs)
 * // => pseudoRandomIntsRange(null, null, 2, 123) [ 70, 28 ]
 *
 * rs = pseudoRandomIntsRange(null, null, 2, 12.3)
 * console.log('pseudoRandomIntsRange(null, null, 2, 12.3)', rs)
 * // => pseudoRandomIntsRange(null, null, 2, 12.3) [ 85, 55 ]
 *
 * rs = pseudoRandomIntsRange(null, null, 2, 'abc')
 * console.log('pseudoRandomIntsRange(null, null, 2, "abc")', rs)
 * // => pseudoRandomIntsRange(null, null, 2, "abc") [ 63, 72 ]
 *
 * rs = pseudoRandomIntsRange(null, null, 2, 'abc')
 * console.log('pseudoRandomIntsRange(null, null, 2, "abc")', rs)
 * // => pseudoRandomIntsRange(null, null, 2, "abc") [ 63, 72 ]
 *
 * rs = pseudoRandomIntsRange(null, null, 2, 'def')
 * console.log('pseudoRandomIntsRange(null, null, 2, "def")', rs)
 * // => pseudoRandomIntsRange(null, null, 2, "def") [ 98, 65 ]
 *
 * rs = pseudoRandomIntsRange(null, null, 2, 'BH01S123')
 * console.log('pseudoRandomIntsRange(null, null, 2, "BH01S123")', rs)
 * // => pseudoRandomIntsRange(null, null, 2, "BH01S123") [ 0, 56 ]
 *
 * rs = pseudoRandomIntsRange(null, null, 2, 'BH-01:S-123')
 * console.log('pseudoRandomIntsRange(null, null, 2, "BH-01:S-123")', rs)
 * // => pseudoRandomIntsRange(null, null, 2, "BH-01:S-123") [ 96, 25 ]
 *
 * rs = pseudoRandomIntsRange(0, 100, 2, 123)
 * console.log('pseudoRandomIntsRange(0, 100, 2, 123)', rs)
 * // => pseudoRandomIntsRange(0, 100, 2, 123) [ 70, 28 ]
 *
 * rs = pseudoRandomIntsRange(0, 100, 2, 12.3)
 * console.log('pseudoRandomIntsRange(0, 100, 2, 12.3)', rs)
 * // => pseudoRandomIntsRange(0, 100, 2, 12.3) [ 85, 55 ]
 *
 * rs = pseudoRandomIntsRange(0, 100, 2, 'abc')
 * console.log('pseudoRandomIntsRange(0, 100, 2, "abc")', rs)
 * // => pseudoRandomIntsRange(0, 100, 2, "abc") [ 63, 72 ]
 *
 * rs = pseudoRandomIntsRange(0, 100, 2, 'abc')
 * console.log('pseudoRandomIntsRange(0, 100, 2, "abc")', rs)
 * // => pseudoRandomIntsRange(0, 100, 2, "abc") [ 63, 72 ]
 *
 * rs = pseudoRandomIntsRange(0, 100, 2, 'def')
 * console.log('pseudoRandomIntsRange(0, 100, 2, "def")', rs)
 * // => pseudoRandomIntsRange(0, 100, 2, "def") [ 98, 65 ]
 *
 * rs = pseudoRandomIntsRange(0, 100, 2, 'BH-01:S-123')
 * console.log('pseudoRandomIntsRange(0, 100, 2, "BH-01:S-123")', rs)
 * // => pseudoRandomIntsRange(0, 100, 2, "BH-01:S-123") [ 96, 25 ]
 *
 * rs = pseudoRandomIntsRange(123, 4567, 2, 123)
 * console.log('pseudoRandomIntsRange(123, 4567, 2, 123)', rs)
 * // => pseudoRandomIntsRange(123, 4567, 2, 123) [ 3218, 1374 ]
 *
 * rs = pseudoRandomIntsRange(123, 4567, 2, 12.3)
 * console.log('pseudoRandomIntsRange(123, 4567, 2, 12.3)', rs)
 * // => pseudoRandomIntsRange(123, 4567, 2, 12.3) [ 3906, 2565 ]
 *
 * rs = pseudoRandomIntsRange(123, 4567, 2, 'abc')
 * console.log('pseudoRandomIntsRange(123, 456.7, 2, "abc")', rs)
 * // => pseudoRandomIntsRange(123, 456.7, 2, "abc") [ 2929, 3305 ]
 *
 * rs = pseudoRandomIntsRange(123, 4567, 2, 'abc')
 * console.log('pseudoRandomIntsRange(123, 456.7, 2, "abc")', rs)
 * // => pseudoRandomIntsRange(123, 456.7, 2, "abc") [ 2929, 3305 ]
 *
 * rs = pseudoRandomIntsRange(123, 4567, 2, 'def')
 * console.log('pseudoRandomIntsRange(123, 456.7, 2, "def")', rs)
 * // => pseudoRandomIntsRange(123, 456.7, 2, "def") [ 4453, 3018 ]
 *
 * rs = pseudoRandomIntsRange(123, 4567, 2, 'BH01S123')
 * console.log('pseudoRandomIntsRange(123, 456.7, 2, "BH01S123")', rs)
 * // => pseudoRandomIntsRange(123, 456.7, 2, "BH01S123") [ 158, 2628 ]
 *
 * rs = pseudoRandomIntsRange(123, 4567, 2, 'BH-01:S-123')
 * console.log('pseudoRandomIntsRange(123, 456.7, 2, "BH-01:S-123")', rs)
 * // => pseudoRandomIntsRange(123, 456.7, 2, "BH-01:S-123") [ 4381, 1227 ]
 *
 */
function pseudoRandomIntsRange(vstart = 0, vend = 100, n, seed = 'start1') {

    //vstart, 非預期改用預設0
    vstart = optVal(vstart, 0, RULE_VSTART)

    //vend, 非預期改用預設100
    vend = optVal(vend, 100, RULE_VEND)

    //n, 非預期改用預設1
    n = optVal(n, 1, RULE_N)

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
        r = Math.floor(r)

        //push
        rs.push(r)

    }

    return rs
}


export default pseudoRandomIntsRange
