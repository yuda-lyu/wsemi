import isnum from './isnum.mjs'
import ispint from './ispint.mjs'
import cdbl from './cdbl.mjs'
import cint from './cint.mjs'
import pseudoRandom from './pseudoRandom.mjs'


/**
 * 產生位於指定範圍內偽隨機數陣列，各元素值域為[vstart,vend)，代表值會大於等於vstart但小於vend
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/pseudoRandomsRange.test.mjs Github}
 * @memberOf wsemi
 * @param {Number} [vstart=0] 輸入範圍最小值，預設0
 * @param {Number} [vend=1] 輸入範圍最大值，預設1
 * @param {Integer} [n=1] 輸入產生數量整數，預設1
 * @param {Integer|Number|String} [seed='start1'] 輸入種子seed，給予'start1'為使用初始值1並且隨呼叫次數自增，若為其他則代表使用為指定seed，預設'start1'
 * @returns {Number} 回傳位於指定範圍內隨機數字
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

    //n
    if (!ispint(n)) {
        n = 1
    }
    n = cint(n)

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
