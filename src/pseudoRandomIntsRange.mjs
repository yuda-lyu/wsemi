import optVal from './_optVal.mjs'
import rangeVal from './_rangeVal.mjs'
import pseudoRandom from './pseudoRandom.mjs'


//vstart, vend: 範圍參數, 未給(undefined或null)用預設0與100; 有給則須為有效整數(iseint, use: 'safe'), 否則throw Error('invalid vstart: must be an integer')等, 訊息不帶值(使用者2026-11-12, dspec〈輸入參數之檢測機制〉§11 Q1-b: 隨機範圍無效即同步拋錯, 不再視為opt類而改用預設), 由_rangeVal.mjs統一判定
//n: opt類參數(JSDoc [n=1]或程式碼有回退), 須為個數1~4294967295(iseint, use: 'count', min: 1); 非預期(含小數、超出範圍、Infinity、'0x10'、包裝物件等)視為未給、改用預設1, 不報錯; 位置參數無opt物件可帶debug, 故不警告
//seed不在此列, 維持原樣
let RULE_N = { fn: 'pseudoRandomIntsRange', name: 'n', kind: 'eint', chk: { use: 'count', min: 1 } }


/**
 * 產生位於指定範圍內偽隨機整數陣列，各元素值域為[vstart,vend]，代表值會大於等於vstart且小於等於vend
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/pseudoRandomIntsRange.test.mjs Github}
 * @memberOf wsemi
 * @param {Number|String} [vstart=0] 輸入範圍最小值，未給(undefined或null)時用預設0；有給則須為有效整數(安全整數範圍，數字字串亦可，去頭尾空白後取值)，非預期之輸入(非有效整數、小數、超出安全整數範圍、Infinity、'0x10'、包裝物件、非數字字串、布林等)throw Error('invalid vstart: must be an integer')，訊息不帶輸入值
 * @param {Number|String} [vend=100] 輸入範圍最大值，規則同vstart，未給時用預設100，非預期之輸入throw Error('invalid vend: must be an integer')；若vstart大於vend則拋出錯誤
 * @param {Number|String} [n=1] 輸入產生數量，opt類參數(有效整數，個數1~4294967295，數字字串亦可，去頭尾空白後取值)，非預期之輸入(非有效整數、小於1、超過4294967295、Infinity、'0x10'、包裝物件等)視為未給而改用預設，不報錯，預設1
 * @param {Integer|Number|String} [seed='start1'] 輸入種子seed，給予'start1'為使用初始值1並且隨呼叫次數自增，若為其他則代表使用為指定seed，預設'start1'
 * @returns {Array} 回傳位於指定範圍內隨機整數之陣列(長度為n)
 * @throws {Error} vstart或vend有給而非有效整數時throw Error('invalid vstart: must be an integer')或Error('invalid vend: must be an integer')(先檢vstart)；vstart大於vend時throw Error('vstart[<vstart>] > vend[<vend>]')
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

    //vstart, 未給用預設0, 有給而無效throw(訊息不帶值), 有效則取轉換值
    vstart = rangeVal(vstart, 0, 'vstart', 'eint')

    //vend, 未給用預設100, 有給而無效throw(訊息不帶值), 有效則取轉換值
    vend = rangeVal(vend, 100, 'vend', 'eint')

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

        //vstart、vend位於安全整數邊界時, pr * rng + vstart超過2^53而捨入, 可能大於vend, 故鉗制至vend, 使結果恆在[vstart, vend]
        if (r > vend) {
            r = vend
        }

        //push
        rs.push(r)

    }

    return rs
}


export default pseudoRandomIntsRange
