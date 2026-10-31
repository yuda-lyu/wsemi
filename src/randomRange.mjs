import optVal from './_optVal.mjs'
import random from './random.mjs'


//vstart, vend: opt類參數(JSDoc [參數=預設]), 須為有效數字(isenum, 無範圍限制), 非預期(非有效數字、Infinity、'0x10'、包裝物件等)視為未給、改用預設0與1, 不報錯
let RULE_VSTART = { fn: 'randomRange', name: 'vstart', kind: 'enum' }
let RULE_VEND = { fn: 'randomRange', name: 'vend', kind: 'enum' }


/**
 * 產生位於指定範圍內隨機數，值域為[vstart,vend)，代表值會大於等於vstart但小於vend
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/randomRange.test.mjs Github}
 * @memberOf wsemi
 * @param {Number|String} [vstart=0] 輸入範圍最小值，opt類參數(有效數字，數字字串亦可，去頭尾空白後取值)，非預期之輸入(非有效數字、Infinity、'0x10'、包裝物件等)視為未給而改用預設，不報錯，預設0
 * @param {Number|String} [vend=1] 輸入範圍最大值，規則同vstart，預設1；若vstart大於vend則拋出錯誤
 * @returns {Number} 回傳位於指定範圍內隨機數字
 * @example
 *
 * let r
 *
 * r = randomRange()
 * console.log('randomRange', r)
 * // => randomRange random [0,1) (預設範圍為0至1)
 *
 * r = randomRange(0, 1)
 * console.log('randomRange(0,1)', r)
 * // => randomRange(0,1) random [0,1)
 *
 * r = randomRange(12.3, 456.7)
 * console.log('randomRange(12.3, 456.7)', r)
 * // => randomRange(12.3, 456.7) random [12.3, 456.7)
 *
 */
function randomRange(vstart = 0, vend = 1) {

    //vstart, 非預期改用預設0
    vstart = optVal(vstart, 0, RULE_VSTART)

    //vend, 非預期改用預設1
    vend = optVal(vend, 1, RULE_VEND)

    //check
    if (vstart > vend) {
        throw new Error(`vstart[${vstart}] > vend[${vend}]`)
    }

    //random, [0,1)
    let pr = random()

    //r
    let rng = vend - vstart
    let r = pr * rng + vstart

    return r
}


export default randomRange
