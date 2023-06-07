import isnum from './isnum.mjs'
import cdbl from './cdbl.mjs'
import pseudoRandom from './pseudoRandom.mjs'


/**
 * 產生位於指定範圍內偽隨機數，值域為[vstart,vend)，代表值會大於等於vstart但小於vend
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/pseudoRandomRange.test.mjs Github}
 * @memberOf wsemi
 * @param {Number} [vstart=0] 輸入範圍最小值，預設0
 * @param {Number} [vend=1] 輸入範圍最大值，預設1
 * @param {Integer|Number|String} [seed='start1'] 輸入種子seed，給予'start1'為使用初始值1並且隨呼叫次數自增，若為其他則代表使用為指定seed，預設'start1'
 * @returns {Number} 回傳位於指定範圍內隨機數字
 * @example
 *
 * let r
 *
 * r = pseudoRandomRange()
 * console.log('pseudoRandomRange', r)
 * // => pseudoRandomRange 0.4170219984371215 (預設範圍為0至1)
 *
 * r = pseudoRandomRange(0, 1)
 * console.log('pseudoRandomRange(0,1)', r)
 * // => pseudoRandomRange(0,1) 0.5665697017684579 //因第2次呼叫故值會不同, 但維持呼叫次數順序時重複執行仍會相同
 *
 * r = pseudoRandomRange(12.3, 456.7)
 * console.log('pseudoRandomRange(12.3,456.7)', r)
 * // => pseudoRandomRange(12.3,456.7) 257.074588704668
 *
 * r = pseudoRandomRange(null, null, 123)
 * console.log('pseudoRandomRange(null,null,123)', r)
 * // => pseudoRandomRange(null,null,123) 0.6964691872708499
 *
 * r = pseudoRandomRange(null, null, 12.3)
 * console.log('pseudoRandomRange(null,null,12.3)', r)
 * // => pseudoRandomRange(null,null,12.3) 0.8510874302592129
 *
 * r = pseudoRandomRange(null, null, 'abc')
 * console.log('pseudoRandomRange(null,null,"abc")', r)
 * // => pseudoRandomRange(null,null,'abc') 0.6314232510048896
 *
 * r = pseudoRandomRange(null, null, 'abc')
 * console.log('pseudoRandomRange(null,null,"abc")', r)
 * // => pseudoRandomRange(null,null,'abc') 0.6314232510048896
 *
 * r = pseudoRandomRange(null, null, 'def')
 * console.log('pseudoRandomRange(null,null,"def")', r)
 * // => pseudoRandomRange(null,null,'def') 0.9743434484116733
 *
 * r = pseudoRandomRange(null, null, 'BH01S123')
 * console.log('pseudoRandomRange(null,null,"BH01S123")', r)
 * // => pseudoRandomRange(null,null,'BH01S123') 0.007978770649060607
 *
 * r = pseudoRandomRange(null, null, 'BH-01:S-123')
 * console.log('pseudoRandomRange(null,null,"BH-01:S-123")', r)
 * // => pseudoRandomRange(null,null,'BH-01:S-123') 0.9579511017072946
 *
 * r = pseudoRandomRange(12.3, 456.7, 123)
 * console.log('pseudoRandomRange(12.3,456.7,123)', r)
 * // => pseudoRandomRange(12.3,456.7,123) 321.81090682316574
 *
 * r = pseudoRandomRange(12.3, 456.7, 12.3)
 * console.log('pseudoRandomRange(12.3,456.7,12.3)', r)
 * // => pseudoRandomRange(12.3,456.7,12.3) 390.52325400719417
 *
 * r = pseudoRandomRange(12.3, 456.7, 'abc')
 * console.log('pseudoRandomRange(12.3,456.7,"abc")', r)
 * // => pseudoRandomRange(12.3,456.7,'abc') 292.90449274657294
 *
 * r = pseudoRandomRange(12.3, 456.7, 'abc')
 * console.log('pseudoRandomRange(12.3,456.7,"abc")', r)
 * // => pseudoRandomRange(12.3,456.7,'abc') 292.90449274657294
 *
 * r = pseudoRandomRange(12.3, 456.7, 'def')
 * console.log('pseudoRandomRange(12.3,456.7,"def")', r)
 * // => pseudoRandomRange(12.3,456.7,'def') 445.2982284741476
 *
 * r = pseudoRandomRange(12.3, 456.7, 'BH01S123')
 * console.log('pseudoRandomRange(12.3,456.7,"BH01S123")', r)
 * // => pseudoRandomRange(12.3,456.7,'BH01S123') 15.845765676442534
 *
 * r = pseudoRandomRange(12.3, 456.7, 'BH-01:S-123')
 * console.log('pseudoRandomRange(12.3,456.7,"BH-01:S-123")', r)
 * // => pseudoRandomRange(12.3,456.7,'BH-01:S-123') 438.0134695987217
 *
 */
function pseudoRandomRange(vstart = 0, vend = 1, seed = 'start1') {

    //vstart
    if (!isnum(vstart)) {
        vstart = 0
    }
    vstart = cdbl(vstart)

    //vend
    if (!isnum(vend)) {
        vend = 1
    }
    vend = cdbl(vend)

    //check
    if (vstart > vend) {
        throw new Error(`vstart[${vstart}] > vend[${vend}]`)
    }

    //pseudoRandom, [0,1)
    let pr = pseudoRandom(seed)

    //r
    let rng = vend - vstart
    let r = pr * rng + vstart

    return r
}


export default pseudoRandomRange
