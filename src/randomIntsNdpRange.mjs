import range from 'lodash-es/range.js'
import sampleSize from 'lodash-es/sampleSize.js'
import optVal from './_optVal.mjs'


//vstart, vend, n: opt類參數(JSDoc [參數=預設]或程式碼有回退), vstart與vend須為有效整數(iseint, use: 'safe'), n須為個數1~4294967295(iseint, use: 'count', min: 1); 非預期(含小數、超出範圍、Infinity、'0x10'、包裝物件等)視為未給、改用預設0、100與1, 不報錯; 位置參數無opt物件可帶debug, 故不警告
let RULE_VSTART = { fn: 'randomIntsNdpRange', name: 'vstart', kind: 'eint', chk: { use: 'safe' } }
let RULE_VEND = { fn: 'randomIntsNdpRange', name: 'vend', kind: 'eint', chk: { use: 'safe' } }
let RULE_N = { fn: 'randomIntsNdpRange', name: 'n', kind: 'eint', chk: { use: 'count', min: 1 } }


/**
 * 產生位於指定範圍內不重複之偽隨機整數陣列，各元素值域為[vstart,vend]，代表值會大於等於vstart且小於等於vend
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/randomIntsNdpRange.test.mjs Github}
 * @memberOf wsemi
 * @param {Integer|String} [vstart=0] 輸入範圍最小值，opt類參數(有效整數，安全整數範圍，數字字串亦可，去頭尾空白後取值)，非預期之輸入(非有效整數、小數、超出安全整數範圍、Infinity、'0x10'、包裝物件等)視為未給而改用預設，不報錯，預設0
 * @param {Integer|String} [vend=100] 輸入範圍最大值，規則同vstart，預設100；若vstart大於vend則拋出錯誤
 * @param {Integer|String} [n=1] 輸入產生數量，opt類參數(有效整數，個數1~4294967295，數字字串亦可，去頭尾空白後取值)，非預期之輸入(非有效整數、小於1、超過4294967295、Infinity、'0x10'、包裝物件等)視為未給而改用預設，不報錯，最長為vend-vstart+1個，預設1
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
 * console.log('randomIntsNdpRange(0, 100)', rs)
 * // => randomIntsNdpRange(0, 100) [ [0,100] ]
 *
 * rs = randomIntsNdpRange(0, 100, 2)
 * console.log('randomIntsNdpRange(0, 100)', rs)
 * // => randomIntsNdpRange(0, 100, 2) [ [0,100], [0,100] ]
 *
 * rs = randomIntsNdpRange(123, 4567)
 * console.log('randomIntsNdpRange(123, 4567)', rs)
 * // => randomIntsNdpRange(123, 4567) [ [123,4567], [123,4567] ]
 *
 * rs = randomIntsNdpRange(123, 4567, 2)
 * console.log('randomIntsNdpRange(123, 4567, 2)', rs)
 * // => randomIntsNdpRange(123, 4567, 2) [ [123,4567], [123,4567] ]
 *
 */
function randomIntsNdpRange(vstart = 0, vend = 100, n) {

    //vstart, 非預期改用預設0, 有效則取轉換值
    vstart = optVal(vstart, 0, RULE_VSTART)

    //vend, 非預期改用預設100, 有效則取轉換值
    vend = optVal(vend, 100, RULE_VEND)

    //n, 非預期改用預設1, 有效則取轉換值
    n = optVal(n, 1, RULE_N)

    //check
    if (vstart > vend) {
        throw new Error(`vstart[${vstart}] > vend[${vend}]`)
    }

    //rs
    let rs = sampleSize(range(vstart, vend + 1), n)

    return rs
}


export default randomIntsNdpRange
