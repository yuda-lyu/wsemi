import rangeVal from './_rangeVal.mjs'
import random from './random.mjs'


//vstart, vend: 範圍參數, 未給(undefined或null)用預設0與1; 有給則須為有效數字(isenum, 無範圍限制), 否則throw Error('invalid vstart: must be a valid number')等, 訊息不帶值(使用者2026-11-12, dspec〈輸入參數之檢測機制〉§11 Q1-b: 隨機範圍無效即同步拋錯, 不再視為opt類而改用預設), 由_rangeVal.mjs統一判定


/**
 * 產生位於指定範圍內隨機數，值域為[vstart,vend)，代表值會大於等於vstart但小於vend
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/randomRange.test.mjs Github}
 * @memberOf wsemi
 * @param {Number|String} [vstart=0] 輸入範圍最小值，未給(undefined或null)時用預設0；有給則須為有效數字(數字字串亦可，去頭尾空白後取值)，非預期之輸入(非有效數字、Infinity、'0x10'、包裝物件、非數字字串、布林等)throw Error('invalid vstart: must be a valid number')，訊息不帶輸入值
 * @param {Number|String} [vend=1] 輸入範圍最大值，規則同vstart，未給時用預設1，非預期之輸入throw Error('invalid vend: must be a valid number')；若vstart大於vend則拋出錯誤
 * @returns {Number} 回傳位於指定範圍內隨機數字
 * @throws {Error} vstart或vend有給而非有效數字時throw Error('invalid vstart: must be a valid number')或Error('invalid vend: must be a valid number')(先檢vstart)；vstart大於vend時throw Error('vstart[<vstart>] > vend[<vend>]')
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
 * try {
 *     randomRange(0, 'abc')
 * }
 * catch (err) {
 *     console.log(err.message)
 * }
 * // => invalid vend: must be a valid number
 *
 */
function randomRange(vstart = 0, vend = 1) {

    //vstart, 未給用預設0, 有給而無效throw(訊息不帶值), 有效則取轉換值
    vstart = rangeVal(vstart, 0, 'vstart', 'enum')

    //vend, 未給用預設1, 有給而無效throw(訊息不帶值), 有效則取轉換值
    vend = rangeVal(vend, 1, 'vend', 'enum')

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
