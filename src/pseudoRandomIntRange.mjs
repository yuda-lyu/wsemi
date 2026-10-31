import optVal from './_optVal.mjs'
import pseudoRandom from './pseudoRandom.mjs'


//vstart, vend: opt類參數(JSDoc [參數=預設]), 須為有效整數(iseint, use: 'safe'), 非預期(含小數、非安全整數、Infinity、'0x10'、包裝物件等)視為未給、改用預設0與100, 不報錯; seed不在此列, 維持原樣
let RULE_VSTART = { fn: 'pseudoRandomIntRange', name: 'vstart', kind: 'eint', chk: { use: 'safe' } }
let RULE_VEND = { fn: 'pseudoRandomIntRange', name: 'vend', kind: 'eint', chk: { use: 'safe' } }


/**
 * 產生位於指定範圍內偽隨機整數，值域為[vstart,vend]，代表值會大於等於vstart且小於等於vend
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/pseudoRandomIntRange.test.mjs Github}
 * @memberOf wsemi
 * @param {Number|String} [vstart=0] 輸入範圍最小值，opt類參數(有效整數，安全整數範圍，數字字串亦可，去頭尾空白後取值)，非預期之輸入(非有效整數、小數、超出安全整數範圍、Infinity、'0x10'、包裝物件等)視為未給而改用預設，不報錯，預設0
 * @param {Number|String} [vend=100] 輸入範圍最大值，規則同vstart，預設100；若vstart大於vend則拋出錯誤
 * @param {Integer|Number|String} [seed='start1'] 輸入種子seed，給予'start1'為使用初始值1並且隨呼叫次數自增，若為其他則代表使用為指定seed，預設'start1'
 * @returns {Integer} 回傳位於指定範圍內隨機整數
 * @example
 *
 * let r
 *
 * r = pseudoRandomIntRange()
 * console.log('pseudoRandomIntRange', r)
 * // => pseudoRandomIntRange 43 (預設範圍為0至100)
 *
 * r = pseudoRandomIntRange(0, 100)
 * console.log('pseudoRandomIntRange(0, 100)', r)
 * // => pseudoRandomIntRange(0, 100) 57 //因第2次呼叫故值會不同, 但維持呼叫次數順序時重複執行仍會相同
 *
 * r = pseudoRandomIntRange(123, 4567)
 * console.log('pseudoRandomIntRange(123, 4567)', r)
 * // => pseudoRandomIntRange(123, 4567) 2571
 *
 * r = pseudoRandomIntRange(null, null, 123)
 * console.log('pseudoRandomIntRange(null, null, 123)', r)
 * // => pseudoRandomIntRange(null, null, 123) 70
 *
 * r = pseudoRandomIntRange(null, null, 12.3)
 * console.log('pseudoRandomIntRange(null, null, 12.3)', r)
 * // => pseudoRandomIntRange(null, null, 12.3) 85
 *
 * r = pseudoRandomIntRange(null, null, 'abc')
 * console.log('pseudoRandomIntRange(null, null, "abc")', r)
 * // => pseudoRandomIntRange(null, null, "abc") 63
 *
 * r = pseudoRandomIntRange(null, null, 'abc')
 * console.log('pseudoRandomIntRange(null, null, "abc")', r)
 * // => pseudoRandomIntRange(null, null, "abc") 63
 *
 * r = pseudoRandomIntRange(null, null, 'def')
 * console.log('pseudoRandomIntRange(null, null, "def")', r)
 * // => pseudoRandomIntRange(null, null, "def") 98
 *
 * r = pseudoRandomIntRange(null, null, 'BH01S123')
 * console.log('pseudoRandomIntRange(null, null, "BH01S123")', r)
 * // => pseudoRandomIntRange(null, null, "BH01S123") 0
 *
 * r = pseudoRandomIntRange(null, null, 'BH-01:S-123')
 * console.log('pseudoRandomIntRange(null, null, "BH-01:S-123")', r)
 * // => pseudoRandomIntRange(null, null, "BH-01:S-123") 96
 *
 * r = pseudoRandomIntRange(0, 100, 123)
 * console.log('pseudoRandomIntRange(0, 100, 123)', r)
 * // => pseudoRandomIntRange(0, 100, 123) 70
 *
 * r = pseudoRandomIntRange(0, 100, 12.3)
 * console.log('pseudoRandomIntRange(0, 100, 12.3)', r)
 * // => pseudoRandomIntRange(0, 100, 12.3) 85
 *
 * r = pseudoRandomIntRange(0, 100, 'abc')
 * console.log('pseudoRandomIntRange(0, 100, "abc")', r)
 * // => pseudoRandomIntRange(0, 100, "abc") 63
 *
 * r = pseudoRandomIntRange(0, 100, 'abc')
 * console.log('pseudoRandomIntRange(0, 100, "abc")', r)
 * // => pseudoRandomIntRange(0, 100, "abc") 63
 *
 * r = pseudoRandomIntRange(0, 100, 'def')
 * console.log('pseudoRandomIntRange(0, 100, "def")', r)
 * // => pseudoRandomIntRange(0, 100, "def") 98
 *
 * r = pseudoRandomIntRange(0, 100, 'BH01S123')
 * console.log('pseudoRandomIntRange(0, 100, "BH01S123")', r)
 * // => pseudoRandomIntRange(0, 100, "BH01S123") 0
 *
 * r = pseudoRandomIntRange(0, 100, 'BH-01:S-123')
 * console.log('pseudoRandomIntRange(0, 100, "BH-01:S-123")', r)
 * // => pseudoRandomIntRange(0, 100, "BH-01:S-123") 96
 *
 * r = pseudoRandomIntRange(123, 4567, 123)
 * console.log('pseudoRandomIntRange(123, 4567, 123)', r)
 * // => pseudoRandomIntRange(123, 4567, 123) 3218
 *
 * r = pseudoRandomIntRange(123, 4567, 12.3)
 * console.log('pseudoRandomIntRange(123, 4567, 12.3)', r)
 * // => pseudoRandomIntRange(123, 4567, 12.3) 3906
 *
 * r = pseudoRandomIntRange(123, 4567, 'abc')
 * console.log('pseudoRandomIntRange(123, 456.7, "abc")', r)
 * // => pseudoRandomIntRange(123, 456.7, "abc") 2929
 *
 * r = pseudoRandomIntRange(123, 4567, 'abc')
 * console.log('pseudoRandomIntRange(123, 456.7, "abc")', r)
 * // => pseudoRandomIntRange(123, 456.7, "abc") 2929
 *
 * r = pseudoRandomIntRange(123, 4567, 'def')
 * console.log('pseudoRandomIntRange(123, 456.7, "def")', r)
 * // => pseudoRandomIntRange(123, 456.7, "def") 4453
 *
 * r = pseudoRandomIntRange(123, 4567, 'BH01S123')
 * console.log('pseudoRandomIntRange(123, 456.7, "BH01S123")', r)
 * // => pseudoRandomIntRange(123, 456.7, "BH01S123") 158
 *
 * r = pseudoRandomIntRange(123, 4567, 'BH-01:S-123')
 * console.log('pseudoRandomIntRange(123, 456.7, "BH-01:S-123")', r)
 * // => pseudoRandomIntRange(123, 456.7, "BH-01:S-123") 4381
 *
 */
function pseudoRandomIntRange(vstart = 0, vend = 100, seed = 'start1') {

    //vstart, 非預期改用預設0
    vstart = optVal(vstart, 0, RULE_VSTART)

    //vend, 非預期改用預設100
    vend = optVal(vend, 100, RULE_VEND)

    //check
    if (vstart > vend) {
        throw new Error(`vstart[${vstart}] > vend[${vend}]`)
    }

    //pseudoRandom, [0,1)
    let pr = pseudoRandom(seed)

    //r
    let rng = vend - vstart + 1 //要額外+1才能使取ceil時讓各整數出現機率一致
    let r = pr * rng + vstart
    r = Math.floor(r)

    return r
}


export default pseudoRandomIntRange
