import optVal from './_optVal.mjs'
import random from './random.mjs'


//vstart, vend: opt類參數(JSDoc [參數=預設]), 有效整數(iseint, use: 'safe'); 非預期(含小數、超出安全整數範圍、Infinity、'0x10'、包裝物件等)視為未給、改用預設0與100, 不報錯; 位置參數無opt物件可帶debug, 故不警告
let RULE_VSTART = { fn: 'randomIntRange', name: 'vstart', kind: 'eint', chk: { use: 'safe' } }
let RULE_VEND = { fn: 'randomIntRange', name: 'vend', kind: 'eint', chk: { use: 'safe' } }


/**
 * 產生位於指定範圍內隨機整數，值域為[vstart,vend]，代表值會大於等於vstart且小於等於vend
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/randomIntRange.test.mjs Github}
 * @memberOf wsemi
 * @param {Integer|String} [vstart=0] 輸入範圍最小值，opt類參數(有效整數，安全整數範圍，數字字串亦可，去頭尾空白後取值)，非預期之輸入(非有效整數、小數、超出安全整數範圍、Infinity、'0x10'、包裝物件等)視為未給而改用預設，不報錯，預設0
 * @param {Integer|String} [vend=100] 輸入範圍最大值，規則同vstart，預設100；若vstart大於vend則拋出錯誤
 * @returns {Integer} 回傳位於指定範圍內隨機整數
 * @example
 *
 * let r
 *
 * r = randomIntRange()
 * console.log('randomIntRange', r)
 * // => randomIntRange [0,100] (預設範圍為0至100)
 *
 * r = randomIntRange(0, 100)
 * console.log('randomIntRange(0, 100)', r)
 * // => randomIntRange(0, 100) [0,100]
 *
 * r = randomIntRange(123, 4567)
 * console.log('randomIntRange(123, 4567)', r)
 * // => randomIntRange(123, 4567) [123,4567]
 *
 */
function randomIntRange(vstart = 0, vend = 100) {

    //vstart, 非預期改用預設0, 有效則取轉換值
    vstart = optVal(vstart, 0, RULE_VSTART)

    //vend, 非預期改用預設100, 有效則取轉換值
    vend = optVal(vend, 100, RULE_VEND)

    //check
    if (vstart > vend) {
        throw new Error(`vstart[${vstart}] > vend[${vend}]`)
    }

    //random, [0,1)
    let pr = random()

    //r
    let rng = vend - vstart + 1 //要額外+1才能使取ceil時讓各整數出現機率一致
    let r = pr * rng + vstart
    r = Math.floor(r)

    //vstart、vend位於安全整數邊界時, pr * rng + vstart超過2^53而捨入, 可能大於vend, 故鉗制至vend, 使結果恆在[vstart, vend]
    if (r > vend) {
        r = vend
    }

    return r
}


export default randomIntRange
