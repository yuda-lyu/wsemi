import optVal from './_optVal.mjs'
import random from './random.mjs'


//vstart, vend, n: opt類參數(JSDoc [參數=預設]), vstart與vend須為有效數字(isenum, 無範圍限制), n須為有效整數且為個數1~4294967295(iseint, use: 'count', min: 1); 非預期(含超出範圍、Infinity、'0x10'、包裝物件等)視為未給、改用預設0、1與1, 不報錯
let RULE_VSTART = { fn: 'randomsRange', name: 'vstart', kind: 'enum' }
let RULE_VEND = { fn: 'randomsRange', name: 'vend', kind: 'enum' }
let RULE_N = { fn: 'randomsRange', name: 'n', kind: 'eint', chk: { use: 'count', min: 1 } }


/**
 * 產生位於指定範圍內隨機數陣列，各元素值域為[vstart,vend)，代表值會大於等於vstart但小於vend
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/randomsRange.test.mjs Github}
 * @memberOf wsemi
 * @param {Number|String} [vstart=0] 輸入範圍最小值，opt類參數(有效數字，數字字串亦可，去頭尾空白後取值)，非預期之輸入(非有效數字、Infinity、'0x10'、包裝物件等)視為未給而改用預設，不報錯，預設0
 * @param {Number|String} [vend=1] 輸入範圍最大值，規則同vstart，預設1；若vstart大於vend則拋出錯誤
 * @param {Number|String} [n=1] 輸入產生數量，opt類參數(有效整數，個數1~4294967295，數字字串亦可，去頭尾空白後取值)，非預期之輸入(非有效整數、小於1、超過4294967295、Infinity、'0x10'、包裝物件等)視為未給而改用預設，不報錯，預設1
 * @returns {Number} 回傳位於指定範圍內隨機數字
 * @example
 *
 * let rs
 *
 * rs = randomsRange()
 * console.log('randomsRange', rs)
 * // => randomsRange [ [0,1) ] (預設範圍為0至1)
 *
 * rs = randomsRange(0, 1)
 * console.log('randomsRange(0,1)', rs)
 * // => randomsRange(0,1) [ [0,1) ]
 *
 * rs = randomsRange(0, 1, 2)
 * console.log('randomsRange(0,1,2)', rs)
 * // => randomsRange(0,1,2) [ [0,1), [0,1) ]
 *
 * rs = randomsRange(12.3, 456.7)
 * console.log('randomsRange(12.3, 456.7)', rs)
 * // => randomsRange(12.3, 456.7) [ [12.3, 456.7) ]
 *
 * rs = randomsRange(12.3, 456.7, 2)
 * console.log('randomsRange(12.3, 456.7, 2)', rs)
 * // => randomsRange(12.3, 456.7, 2) [ [12.3, 456.7), [12.3, 456.7) ]
 *
 */
function randomsRange(vstart = 0, vend = 1, n = 1) {

    //vstart, 非預期改用預設0
    vstart = optVal(vstart, 0, RULE_VSTART)

    //vend, 非預期改用預設1
    vend = optVal(vend, 1, RULE_VEND)

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
        let rng = vend - vstart
        let r = pr * rng + vstart

        //push
        rs.push(r)

    }

    return rs
}


export default randomsRange
