import size from 'lodash/size'
import each from 'lodash/each'
import isarr from './isarr.mjs'
import cdbl from './cdbl.mjs'


/**
 * 各陣列內元素相加
 * v1與v2需輸入同長度之陣列，v3至v5為可選輸入。其內皆需為數字，若非數字將自動轉數字
 * 若需使用之陣列長度不同，則回傳空陣列
 * @export
 * @param {Array} v1 輸入第1個陣列
 * @param {Array} v2 輸入第2個陣列
 * @param {Array} [v3=undefined] 輸入第3個陣列，預設不使用
 * @param {Array} [v4=undefined] 輸入第4個陣列，預設不使用
 * @param {Array} [v5=undefined] 輸入第5個陣列，預設不使用
 * @returns {Array} 回傳各元素相加後陣列
 */
export default function arradd(v1, v2, v3 = undefined, v4 = undefined, v5 = undefined) {

    //check
    if (!isarr(v1)) {
        return []
    }
    if (!isarr(v2)) {
        return []
    }

    //b3,b4,b5
    let b3 = isarr(v3)
    let b4 = isarr(v4)
    let b5 = isarr(v5)

    //check size
    if (size(v1) !== size(v2)) {
        //console.log('v1與v2長度不同')
        return []
    }
    if (b3) {
        if (size(v1) !== size(v3)) {
            //console.log('v1與v3長度不同')
            return []
        }
    }
    if (b4) {
        if (size(v1) !== size(v4)) {
            //console.log('v1與v4長度不同')
            return []
        }
    }
    if (b5) {
        if (size(v1) !== size(v5)) {
            //console.log('v1與v5長度不同')
            return []
        }
    }

    let r = []
    each(v1, function(v, k) {
        let t = cdbl(v1[k]) + cdbl(v2[k])
        if (b3) {
            t += cdbl(v3[k])
        }
        if (b4) {
            t += cdbl(v4[k])
        }
        if (b5) {
            t += cdbl(v5[k])
        }
        r.push(t)
    })

    return r
}
