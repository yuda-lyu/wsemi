import optVal from './_optVal.mjs'
import rangeVal from './_rangeVal.mjs'
import random from './random.mjs'


//vstart, vend: 範圍參數, 未給(undefined或null)用預設0與1; 有給則須為有效數字(isenum, 無範圍限制), 否則throw Error('invalid vstart: must be a valid number')等, 訊息不帶值(使用者2026-11-12, dspec〈輸入參數之檢測機制〉§11 Q1-b: 隨機範圍無效即同步拋錯, 不再視為opt類而改用預設), 由_rangeVal.mjs統一判定
//n: opt類參數(JSDoc [n=1]或程式碼有回退), 須為個數1~4294967295(iseint, use: 'count', min: 1); 非預期(含小數、超出範圍、Infinity、'0x10'、包裝物件等)視為未給、改用預設1, 不報錯; 位置參數無opt物件可帶debug, 故不警告
let RULE_N = { fn: 'randomsRange', name: 'n', kind: 'eint', chk: { use: 'count', min: 1 } }


/**
 * 產生位於指定範圍內隨機數陣列，各元素值域為[vstart,vend)，代表值會大於等於vstart但小於vend
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/randomsRange.test.mjs Github}
 * @memberOf wsemi
 * @param {Number|String} [vstart=0] 輸入範圍最小值，未給(undefined或null)時用預設0；有給則須為有效數字(數字字串亦可，去頭尾空白後取值)，非預期之輸入(非有效數字、Infinity、'0x10'、包裝物件、非數字字串、布林等)throw Error('invalid vstart: must be a valid number')，訊息不帶輸入值
 * @param {Number|String} [vend=1] 輸入範圍最大值，規則同vstart，未給時用預設1，非預期之輸入throw Error('invalid vend: must be a valid number')；若vstart大於vend則拋出錯誤
 * @param {Number|String} [n=1] 輸入產生數量，opt類參數(有效整數，個數1~4294967295，數字字串亦可，去頭尾空白後取值)，非預期之輸入(非有效整數、小於1、超過4294967295、Infinity、'0x10'、包裝物件等)視為未給而改用預設，不報錯，預設1
 * @returns {Array} 回傳位於指定範圍內隨機數字之陣列(長度為n)
 * @throws {Error} vstart或vend有給而非有效數字時throw Error('invalid vstart: must be a valid number')或Error('invalid vend: must be a valid number')(先檢vstart)；vstart大於vend時throw Error('vstart[<vstart>] > vend[<vend>]')
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

    //vstart, 未給用預設0, 有給而無效throw(訊息不帶值), 有效則取轉換值
    vstart = rangeVal(vstart, 0, 'vstart', 'enum')

    //vend, 未給用預設1, 有給而無效throw(訊息不帶值), 有效則取轉換值
    vend = rangeVal(vend, 1, 'vend', 'enum')

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
