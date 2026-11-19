import take from 'lodash-es/take.js'
import map from 'lodash-es/map.js'
import optVal from './_optVal.mjs'
import rangeVal from './_rangeVal.mjs'
import arrSort from './arrSort.mjs'
import pseudoRandom from './pseudoRandom.mjs'


//vstart, vend: 範圍參數, 未給(undefined或null)用預設0與100; 有給則須為有效整數(iseint, use: 'safe'), 否則throw Error('invalid vstart: must be an integer')等, 訊息不帶值(使用者2026-11-12, dspec〈輸入參數之檢測機制〉§11 Q1-b: 隨機範圍無效即同步拋錯, 不再視為opt類而改用預設), 由_rangeVal.mjs統一判定
//n: opt類參數(JSDoc [n=1]或程式碼有回退), 須為個數1~4294967295(iseint, use: 'count', min: 1); 非預期(含小數、超出範圍、Infinity、'0x10'、包裝物件等)視為未給、改用預設1, 不報錯; 位置參數無opt物件可帶debug, 故不警告
//seed不在此列, 維持原樣
let RULE_N = { fn: 'pseudoRandomIntsNdpRange', name: 'n', kind: 'eint', chk: { use: 'count', min: 1 } }


/**
 * 產生位於指定範圍內不重複之偽隨機整數陣列，各元素值域為[vstart,vend]，代表值會大於等於vstart且小於等於vend
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/pseudoRandomIntsNdpRange.test.mjs Github}
 * @memberOf wsemi
 * @param {Integer|String} [vstart=0] 輸入範圍最小值，未給(undefined或null)時用預設0；有給則須為有效整數(安全整數範圍，數字字串亦可，去頭尾空白後取值)，非預期之輸入(非有效整數、小數、超出安全整數範圍、Infinity、'0x10'、包裝物件、非數字字串、布林等)throw Error('invalid vstart: must be an integer')，訊息不帶輸入值
 * @param {Integer|String} [vend=100] 輸入範圍最大值，規則同vstart，未給時用預設100，非預期之輸入throw Error('invalid vend: must be an integer')；若vstart大於vend則拋出錯誤
 * @param {Integer|String} [n=1] 輸入產生數量，opt類參數(有效整數，個數1~4294967295，數字字串亦可，去頭尾空白後取值)，非預期之輸入(非有效整數、小於1、超過4294967295、Infinity、'0x10'、包裝物件等)視為未給而改用預設，不報錯，最長為vend-vstart+1個，預設1
 * @param {Integer|Number|String} [seed='start1'] 輸入種子seed，給予'start1'為使用初始值1並且隨呼叫次數自增，若為其他則代表使用為指定seed，預設'start1'
 * @returns {Array} 回傳位於指定範圍[vstart,vend]內不重複之偽隨機整數陣列(長度為n與vend-vstart+1之較小者)；vstart為0時與同seed之修前結果相同，vstart不為0時各值為同seed、vstart為0(範圍0至vend-vstart)之結果加上vstart(seed為'start1'時每次呼叫自增，不在此限)
 * @throws {Error} vstart或vend有給而非有效整數時throw Error('invalid vstart: must be an integer')或Error('invalid vend: must be an integer')(先檢vstart)；vstart大於vend時throw Error('invalid vstart: must be <= vend')(訊息不帶值)
 * @example
 *
 * let rs
 *
 * rs = pseudoRandomIntsNdpRange()
 * console.log('pseudoRandomIntsNdpRange', rs)
 * // => pseudoRandomIntsNdpRange [ 1 ] (預設範圍為0至100)
 *
 * rs = pseudoRandomIntsNdpRange(0, 100)
 * console.log('pseudoRandomIntsNdpRange(0, 100)', rs)
 * // => pseudoRandomIntsNdpRange(0, 100) [ 85 ] //因第2次呼叫故值會不同, 但維持呼叫次數順序時重複執行仍會相同
 *
 * rs = pseudoRandomIntsNdpRange(0, 100, 2)
 * console.log('pseudoRandomIntsNdpRange(0, 100)', rs)
 * // => pseudoRandomIntsNdpRange(0, 100) [ 59, 20 ]
 *
 * rs = pseudoRandomIntsNdpRange(123, 4567)
 * console.log('pseudoRandomIntsNdpRange(123, 4567)', rs)
 * // => pseudoRandomIntsNdpRange(123, 4567) [ 4074 ] (值落於[123,4567])
 *
 * rs = pseudoRandomIntsNdpRange(null, null, 2, 123)
 * console.log('pseudoRandomIntsNdpRange(null, null, 2, 123)', rs)
 * // => pseudoRandomIntsNdpRange(null, null, 2, 123) [ 94, 76 ]
 *
 * rs = pseudoRandomIntsNdpRange(null, null, 2, 12.3)
 * console.log('pseudoRandomIntsNdpRange(null, null, 2, 12.3)', rs)
 * // => pseudoRandomIntsNdpRange(null, null, 2, 12.3) [ 69, 82 ]
 *
 * rs = pseudoRandomIntsNdpRange(null, null, 2, 'abc')
 * console.log('pseudoRandomIntsNdpRange(null, null, 2, "abc")', rs)
 * // => pseudoRandomIntsNdpRange(null, null, 2, "abc") [ 20, 28 ]
 *
 * rs = pseudoRandomIntsNdpRange(null, null, 2, 'abc')
 * console.log('pseudoRandomIntsNdpRange(null, null, 2, "abc")', rs)
 * // => pseudoRandomIntsNdpRange(null, null, 2, "abc") [ 20, 28 ]
 *
 * rs = pseudoRandomIntsNdpRange(null, null, 2, 'def')
 * console.log('pseudoRandomIntsNdpRange(null, null, 2, "def")', rs)
 * // => pseudoRandomIntsNdpRange(null, null, 2, "def") [ 64, 34 ]
 *
 * rs = pseudoRandomIntsNdpRange(null, null, 2, 'BH01S123')
 * console.log('pseudoRandomIntsNdpRange(null, null, 2, "BH01S123")', rs)
 * // => pseudoRandomIntsNdpRange(null, null, 2, "BH01S123") [ 0, 26 ]
 *
 * rs = pseudoRandomIntsNdpRange(null, null, 2, 'BH-01:S-123')
 * console.log('pseudoRandomIntsNdpRange(null, null, 2, "BH-01:S-123")', rs)
 * // => pseudoRandomIntsNdpRange(null, null, 2, "BH-01:S-123") [ 71, 77 ]
 *
 * rs = pseudoRandomIntsNdpRange(0, 100, 2, 123)
 * console.log('pseudoRandomIntsNdpRange(0, 100, 2, 123)', rs)
 * // => pseudoRandomIntsNdpRange(0, 100, 2, 123) [ 94, 76 ]
 *
 * rs = pseudoRandomIntsNdpRange(0, 100, 2, 12.3)
 * console.log('pseudoRandomIntsNdpRange(0, 100, 2, 12.3)', rs)
 * // => pseudoRandomIntsNdpRange(0, 100, 2, 12.3) [ 69, 82 ]
 *
 * rs = pseudoRandomIntsNdpRange(0, 100, 2, 'abc')
 * console.log('pseudoRandomIntsNdpRange(0, 100, 2, "abc")', rs)
 * // => pseudoRandomIntsNdpRange(0, 100, 2, "abc") [ 20, 28 ]
 *
 * rs = pseudoRandomIntsNdpRange(0, 100, 2, 'abc')
 * console.log('pseudoRandomIntsNdpRange(0, 100, 2, "abc")', rs)
 * // => pseudoRandomIntsNdpRange(0, 100, 2, "abc") [ 20, 28 ]
 *
 * rs = pseudoRandomIntsNdpRange(0, 100, 2, 'def')
 * console.log('pseudoRandomIntsNdpRange(0, 100, 2, "def")', rs)
 * // => pseudoRandomIntsNdpRange(0, 100, 2, "def") [ 64, 34 ]
 *
 * rs = pseudoRandomIntsNdpRange(0, 100, 2, 'BH-01:S-123')
 * console.log('pseudoRandomIntsNdpRange(0, 100, 2, "BH-01:S-123")', rs)
 * // => pseudoRandomIntsNdpRange(0, 100, 2, "BH-01:S-123") [ 71, 77 ]
 *
 * rs = pseudoRandomIntsNdpRange(123, 4567, 2, 123)
 * console.log('pseudoRandomIntsNdpRange(123, 4567, 2, 123)', rs)
 * // => pseudoRandomIntsNdpRange(123, 4567, 2, 123) [ 2651, 3977 ]
 *
 * rs = pseudoRandomIntsNdpRange(123, 4567, 2, 12.3)
 * console.log('pseudoRandomIntsNdpRange(123, 4567, 2, 12.3)', rs)
 * // => pseudoRandomIntsNdpRange(123, 4567, 2, 12.3) [ 1941, 4457 ]
 *
 * rs = pseudoRandomIntsNdpRange(123, 4567, 2, 'abc')
 * console.log('pseudoRandomIntsNdpRange(123, 4567, 2, "abc")', rs)
 * // => pseudoRandomIntsNdpRange(123, 4567, 2, "abc") [ 601, 3426 ]
 *
 * rs = pseudoRandomIntsNdpRange(123, 4567, 2, 'abc')
 * console.log('pseudoRandomIntsNdpRange(123, 4567, 2, "abc")', rs)
 * // => pseudoRandomIntsNdpRange(123, 4567, 2, "abc") [ 601, 3426 ]
 *
 * rs = pseudoRandomIntsNdpRange(123, 4567, 2, 'def')
 * console.log('pseudoRandomIntsNdpRange(123, 4567, 2, "def")', rs)
 * // => pseudoRandomIntsNdpRange(123, 4567, 2, "def") [ 1106, 3256 ]
 *
 * rs = pseudoRandomIntsNdpRange(123, 4567, 2, 'BH01S123')
 * console.log('pseudoRandomIntsNdpRange(123, 4567, 2, "BH01S123")', rs)
 * // => pseudoRandomIntsNdpRange(123, 4567, 2, "BH01S123") [ 2989, 306 ]
 *
 * rs = pseudoRandomIntsNdpRange(123, 4567, 2, 'BH-01:S-123')
 * console.log('pseudoRandomIntsNdpRange(123, 4567, 2, "BH-01:S-123")', rs)
 * // => pseudoRandomIntsNdpRange(123, 4567, 2, "BH-01:S-123") [ 4011, 372 ]
 *
 */
function pseudoRandomIntsNdpRange(vstart = 0, vend = 100, n, seed = 'start1') {

    //vstart, 未給用預設0, 有給而無效throw(訊息不帶值), 有效則取轉換值
    vstart = rangeVal(vstart, 0, 'vstart', 'eint')

    //vend, 未給用預設100, 有給而無效throw(訊息不帶值), 有效則取轉換值
    vend = rangeVal(vend, 100, 'vend', 'eint')

    //n, 非預期改用預設1, 有效則取轉換值
    n = optVal(n, 1, RULE_N)

    //check
    if (vstart > vend) {
        throw new Error('invalid vstart: must be <= vend')
    }

    //fpr function, [0,1)
    let fpr = pseudoRandom(seed, true)

    //rs
    let rs = []
    let _vstart = 0
    let _vend = vend - vstart
    for (let i = _vstart; i <= _vend; i++) {

        //pr
        let pr = fpr()

        //r
        let rng = vend - vstart + 1 //要額外+1才能使取ceil時讓各整數出現機率一致
        let r = pr * rng //排序用之值, 不含vstart: 只決定0~(vend-vstart)之排列, vstart於取n個後再加(使結果恆等於同seed、vstart=0之結果平移vstart, 不因vstart很大時浮點捨入而改變排列)
        r = Math.floor(r)

        //push
        rs.push(r)

    }

    //arrSort
    let inds = arrSort(rs, { returnIndex: true })

    //take, 取前n個, inds為0~(vend-vstart)之不重複排列(索引), 須加上vstart偏移使值落於[vstart,vend](同randomIntsNdpRange; 原未加偏移而值落在範圍外)
    inds = take(inds, n)
    inds = map(inds, (ind) => {
        return ind + vstart
    })

    return inds
}


export default pseudoRandomIntsNdpRange
