import rangeVal from './_rangeVal.mjs'
import random from './random.mjs'


//vstart, vend: 範圍參數, 未給(undefined或null)用預設0與100; 有給則須為有效整數(iseint, use: 'safe'), 否則throw Error('invalid vstart: must be an integer')等, 訊息不帶值(使用者2026-11-12, dspec〈輸入參數之檢測機制〉§11 Q1-b: 隨機範圍無效即同步拋錯, 不再視為opt類而改用預設), 由_rangeVal.mjs統一判定


/**
 * 產生位於指定範圍內隨機整數，值域為[vstart,vend]，代表值會大於等於vstart且小於等於vend
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/randomIntRange.test.mjs Github}
 * @memberOf wsemi
 * @param {Integer|String} [vstart=0] 輸入範圍最小值，未給(undefined或null)時用預設0；有給則須為有效整數(安全整數範圍，數字字串亦可，去頭尾空白後取值)，非預期之輸入(非有效整數、小數、超出安全整數範圍、Infinity、'0x10'、包裝物件、非數字字串、布林等)throw Error('invalid vstart: must be an integer')，訊息不帶輸入值
 * @param {Integer|String} [vend=100] 輸入範圍最大值，規則同vstart，未給時用預設100，非預期之輸入throw Error('invalid vend: must be an integer')；若vstart大於vend則拋出錯誤
 * @returns {Integer} 回傳位於指定範圍內隨機整數
 * @throws {Error} vstart或vend有給而非有效整數時throw Error('invalid vstart: must be an integer')或Error('invalid vend: must be an integer')(先檢vstart)；vstart大於vend時throw Error('vstart[<vstart>] > vend[<vend>]')
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
 * r = randomIntRange(null, 5)
 * console.log('randomIntRange(null, 5)', r)
 * // => randomIntRange(null, 5) [0,5] (null視為未給, 用預設0)
 *
 * try {
 *     randomIntRange('a', 2)
 * }
 * catch (err) {
 *     console.log(err.message)
 * }
 * // => invalid vstart: must be an integer
 *
 */
function randomIntRange(vstart = 0, vend = 100) {

    //vstart, 未給用預設0, 有給而無效throw(訊息不帶值), 有效則取轉換值
    vstart = rangeVal(vstart, 0, 'vstart', 'eint')

    //vend, 未給用預設100, 有給而無效throw(訊息不帶值), 有效則取轉換值
    vend = rangeVal(vend, 100, 'vend', 'eint')

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
