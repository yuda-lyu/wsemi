import optVal from './_optVal.mjs'
import rangeVal from './_rangeVal.mjs'
import pseudoRandom from './pseudoRandom.mjs'


//vstart, vend: 範圍參數, 未給(undefined或null)用預設0與1; 有給則須為有效數字(isenum, 無範圍限制), 否則throw Error('invalid vstart: must be a valid number')等, 訊息不帶值(使用者2026-11-12, dspec〈輸入參數之檢測機制〉§11 Q1-b: 隨機範圍無效即同步拋錯, 不再視為opt類而改用預設), 由_rangeVal.mjs統一判定
//n: opt類參數(JSDoc [n=1]或程式碼有回退), 須為個數1~4294967295(iseint, use: 'count', min: 1); 非預期(含小數、超出範圍、Infinity、'0x10'、包裝物件等)視為未給、改用預設1, 不報錯; 位置參數無opt物件可帶debug, 故不警告
//seed不在此列, 維持原樣
let RULE_N = { fn: 'pseudoRandomsRange', name: 'n', kind: 'eint', chk: { use: 'count', min: 1 } }


/**
 * 產生位於指定範圍內偽隨機數陣列，各元素值域為[vstart,vend)，代表值會大於等於vstart但小於vend
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/pseudoRandomsRange.test.mjs Github}
 * @memberOf wsemi
 * @param {Number|String} [vstart=0] 輸入範圍最小值，未給(undefined或null)時用預設0；有給則須為有效數字(數字字串亦可，去頭尾空白後取值)，非預期之輸入(非有效數字、Infinity、'0x10'、包裝物件、非數字字串、布林等)throw Error('invalid vstart: must be a valid number')，訊息不帶輸入值
 * @param {Number|String} [vend=1] 輸入範圍最大值，規則同vstart，未給時用預設1，非預期之輸入throw Error('invalid vend: must be a valid number')；若vstart大於vend則拋出錯誤
 * @param {Number|String} [n=1] 輸入產生數量，opt類參數(有效整數，個數1~4294967295，數字字串亦可，去頭尾空白後取值)，非預期之輸入(非有效整數、小於1、超過4294967295、Infinity、'0x10'、包裝物件等)視為未給而改用預設，不報錯，預設1
 * @param {Integer|Number|String} [seed='start1'] 輸入種子seed，給予'start1'為使用初始值1並且隨呼叫次數自增，若為其他則代表使用為指定seed，預設'start1'
 * @returns {Array} 回傳位於指定範圍內隨機數字之陣列(長度為n)
 * @throws {Error} vstart或vend有給而非有效數字時throw Error('invalid vstart: must be a valid number')或Error('invalid vend: must be a valid number')(先檢vstart)；vstart大於vend時throw Error('vstart[<vstart>] > vend[<vend>]')
 * @example
 *
 * let rs
 *
 * rs = pseudoRandomsRange()
 * console.log('pseudoRandomsRange', rs)
 * // => pseudoRandomsRange [ 0.4170219984371215 ] (預設範圍為0至1)
 *
 * rs = pseudoRandomsRange(0, 1)
 * console.log('pseudoRandomsRange(0,1)', rs)
 * // => pseudoRandomsRange(0,1) [ 0.5665697017684579 ] //因第2次呼叫故值會不同, 但維持呼叫次數順序時重複執行仍會相同
 *
 * rs = pseudoRandomsRange(0, 1, 2)
 * console.log('pseudoRandomsRange(0,1,2)', rs)
 * // => pseudoRandomsRange(0,1,2) [ 0.5507979043759406, 0.9240253241732717 ]
 *
 * rs = pseudoRandomsRange(12.3, 456.7)
 * console.log('pseudoRandomsRange(12.3, 456.7)', rs)
 * // => pseudoRandomsRange(12.3, 456.7) [ 28.09080612603575 ]
 *
 * rs = pseudoRandomsRange(12.3, 456.7, 2)
 * console.log('pseudoRandomsRange(12.3, 456.7, 2)', rs)
 * // => pseudoRandomsRange(12.3, 456.7, 2) [ 110.95376535998656, 36.822045660205184 ]
 *
 * rs = pseudoRandomsRange(null, null, 2, 123)
 * console.log('pseudoRandomsRange(null, null, 2, 123)', rs)
 * // => pseudoRandomsRange(null, null, 2, 123) [ 0.6964691872708499, 0.28155276202596724 ]
 *
 * rs = pseudoRandomsRange(null, null, 2, 12.3)
 * console.log('pseudoRandomsRange(null, null, 2, 12.3)', rs)
 * // => pseudoRandomsRange(null, null, 2, 12.3) [ 0.8510874302592129, 0.5495069304015487 ]
 *
 * rs = pseudoRandomsRange(null, null, 2, 'abc')
 * console.log('pseudoRandomsRange(null, null, 2, "abc")', rs)
 * // => pseudoRandomsRange(null, null, 2, 'abc') [ 0.6314232510048896, 0.7160592079162598 ]
 *
 * rs = pseudoRandomsRange(null, null, 2, 'abc')
 * console.log('pseudoRandomsRange(null, null, 2, "abc")', rs)
 * // => pseudoRandomsRange(null, null, 2, 'abc') [ 0.6314232510048896, 0.7160592079162598 ]
 *
 * rs = pseudoRandomsRange(null, null, 2, 'def')
 * console.log('pseudoRandomsRange(null, null, 2, "def")', rs)
 * // => pseudoRandomsRange(null, null, 2, 'def') [ 0.9743434484116733, 0.6514900834299624 ]
 *
 * rs = pseudoRandomsRange(null, null, 2, 'BH01S123')
 * console.log('pseudoRandomsRange(null, null, 2, "BH01S123")', rs)
 * // => pseudoRandomsRange(null, null, 2, 'BH01S123') [ 0.007978770649060607, 0.5637312876060605 ]
 *
 * rs = pseudoRandomsRange(null, null, 2, 'BH-01:S-123')
 * console.log('pseudoRandomsRange(null, null, 2, "BH-01:S-123")', rs)
 * // => pseudoRandomsRange(null, null, 2, 'BH-01:S-123') [ 0.9579511017072946, 0.24845449766144156 ]
 *
 * rs = pseudoRandomsRange(12.3, 456.7, 2, 123)
 * console.log('pseudoRandomsRange(12.3, 456.7, 2, 123)', rs)
 * // => pseudoRandomsRange(12.3, 456.7, 2, 123) [ 321.81090682316574, 137.42204744433985 ]
 *
 * rs = pseudoRandomsRange(12.3, 456.7, 2, 12.3)
 * console.log('pseudoRandomsRange(12.3, 456.7, 2, 12.3)', rs)
 * // => pseudoRandomsRange(12.3, 456.7, 2, 12.3) [ 390.52325400719417, 256.5008798704483 ]
 *
 * rs = pseudoRandomsRange(12.3, 456.7, 2, 'abc')
 * console.log('pseudoRandomsRange(12.3, 456.7, 2, "abc")', rs)
 * // => pseudoRandomsRange(12.3, 456.7, 2, 'abc') [ 292.90449274657294, 330.51671199798585 ]
 *
 * rs = pseudoRandomsRange(12.3, 456.7, 2, 'abc')
 * console.log('pseudoRandomsRange(12.3, 456.7, 2, "abc")', rs)
 * // => pseudoRandomsRange(12.3, 456.7, 2, 'abc') [ 292.90449274657294, 330.51671199798585 ]
 *
 * rs = pseudoRandomsRange(12.3, 456.7, 2, 'def')
 * console.log('pseudoRandomsRange(12.3, 456.7, 2, "def")', rs)
 * // => pseudoRandomsRange(12.3, 456.7, 2, 'def') [ 445.2982284741476, 301.8221930762753 ]
 *
 * rs = pseudoRandomsRange(12.3, 456.7, 2, 'BH01S123')
 * console.log('pseudoRandomsRange(12.3, 456.7, 2, "BH01S123")', rs)
 * // => pseudoRandomsRange(12.3, 456.7, 2, 'BH01S123') [ 15.845765676442534, 262.82218421213327 ]
 *
 * rs = pseudoRandomsRange(12.3, 456.7, 2, 'BH-01:S-123')
 * console.log('pseudoRandomsRange(12.3, 456.7, 2, "BH-01:S-123")', rs)
 * // => pseudoRandomsRange(12.3, 456.7, 2, 'BH-01:S-123') [ 438.0134695987217, 122.71317876074463 ]
 *
 */
function pseudoRandomsRange(vstart = 0, vend = 1, n = 1, seed = 'start1') {

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

    //fpr function, [0,1)
    let fpr = pseudoRandom(seed, true)

    //rs
    let rs = []
    for (let i = 1; i <= n; i++) {

        //pr
        let pr = fpr()

        //r
        let rng = vend - vstart
        let r = pr * rng + vstart

        //push
        rs.push(r)

    }

    return rs
}


export default pseudoRandomsRange
