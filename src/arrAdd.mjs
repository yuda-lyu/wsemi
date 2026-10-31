import size from 'lodash-es/size.js'
import each from 'lodash-es/each.js'
import isarr from './isarr.mjs'
import isenum from './isenum.mjs'


function core(v1, v2) {

    //check
    if (!isarr(v1)) {
        return []
    }
    if (!isarr(v2)) {
        return []
    }

    //check size
    if (size(v1) !== size(v2)) {
        return []
    }

    let r = []
    each(v1, function(v, k) {

        //凡非有效數字(isenum)一律以預設值0計算, 有效數字取值為去頭尾空白後Number; 兩者皆非有效數字時該位置為0
        let t = 0
        if (isenum(v1[k])) {
            t += Number(v1[k])
        }
        if (isenum(v2[k])) {
            t += Number(v2[k])
        }
        r.push(t)

    })

    return r
}


/**
 * 各陣列內元素相加，可輸入n個同長度陣列，若需輸入之陣列長度不同則回傳空陣列
 *
 * 各元素以isenum判定是否為有效數字(有限數字，或去頭尾空白後為十進位寫法之數字字串)，有效者取其數值參與相加；
 * 凡非有效數字(含標記字串'-'、'NP'、''、null、undefined、布林、NaN、Infinity、'Infinity'、'0x10'、'1e400'、包裝物件等)，一律以該函數之預設值0計算，不報錯、不略過；
 * 同位置元素皆非有效數字者，該位置結果為0。
 * 陣列容器之處置不變：參數少於2個、非陣列、長度不同，回傳空陣列。
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/arrAdd.test.mjs Github}
 * @memberOf wsemi
 * @param {Array} arguments 輸入n個陣列，需同長度，各陣列針對各位置元素進行相加總；元素為有效數字(數字或數字字串，定義見isenum)者取其數值，非有效數字者一律以預設值0計算
 * @returns {Array} 回傳各元素相加後陣列
 * @example
 *
 * let v1 = [1, 2, 3, 4]
 * let v2 = [0.1, 0.1, 0.1, 0.1]
 * let v3 = [11, 22, 33, 44]
 *
 * console.log(arrAdd(v1, v2))
 * // => [ 1.1, 2.1, 3.1, 4.1 ]
 *
 * console.log(arrAdd(v1, v2, v3))
 * // => [ 12.1, 24.1, 36.1, 48.1 ]
 *
 * console.log(arrAdd([1, '2', ' 3 ', 4], [10, '-', null, Infinity]))
 * // => [ 11, 2, 3, 4 ] (非有效數字以0計算)
 *
 * console.log(arrAdd(['-', 'NP'], [null, '0x10']))
 * // => [ 0, 0 ] (同位置皆非有效數字為0)
 *
 */
function arrAdd() {

    //check
    if (size(arguments) < 2) {
        return []
    }

    let r = arguments[0]
    for (let i = 1; i < size(arguments); i++) {
        let v = arguments[i]
        r = core(r, v)
    }

    return r
}


export default arrAdd
