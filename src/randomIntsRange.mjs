import optVal from './_optVal.mjs'
import random from './random.mjs'


//vstart, vend, n: opt類參數(JSDoc [參數=預設]或程式碼有回退), vstart與vend須為有效整數(iseint, use: 'safe'), n須為個數1~4294967295(iseint, use: 'count', min: 1); 非預期(含小數、超出範圍、Infinity、'0x10'、包裝物件等)視為未給、改用預設0、100與1, 不報錯
let RULE_VSTART = { fn: 'randomIntsRange', name: 'vstart', kind: 'eint', chk: { use: 'safe' } }
let RULE_VEND = { fn: 'randomIntsRange', name: 'vend', kind: 'eint', chk: { use: 'safe' } }
let RULE_N = { fn: 'randomIntsRange', name: 'n', kind: 'eint', chk: { use: 'count', min: 1 } }


/**
 * 產生位於指定範圍內隨機整數陣列，各元素值域為[vstart,vend]，代表值會大於等於vstart且小於等於vend
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/randomIntsRange.test.mjs Github}
 * @memberOf wsemi
 * @param {Number|String} [vstart=0] 輸入範圍最小值，opt類參數(有效整數，安全整數範圍，數字字串亦可，去頭尾空白後取值)，非預期之輸入(非有效整數、小數、超出安全整數範圍、Infinity、'0x10'、包裝物件等)視為未給而改用預設，不報錯，預設0
 * @param {Number|String} [vend=100] 輸入範圍最大值，規則同vstart，預設100；若vstart大於vend則拋出錯誤
 * @param {Number|String} [n=1] 輸入產生數量，opt類參數(有效整數，個數1~4294967295，數字字串亦可，去頭尾空白後取值)，非預期之輸入(非有效整數、小於1、超過4294967295、Infinity、'0x10'、包裝物件等)視為未給而改用預設，不報錯，預設1
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
