import range from 'lodash-es/range.js'
import at from 'lodash-es/at.js'
import isearr from './isearr.mjs'
import isp0int from './isp0int.mjs'
import iser from './iser.mjs'
import cint from './cint.mjs'


/**
 * 由vall陣列提取指定欄位(或欄位範圍)之資料
 * 若istart與iend有效, 提取istart~iend欄位
 * 若僅istart有效, 提取istart欄位
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/arrAt.test.mjs Github}
 * @memberOf wsemi
 * @param {Array} vall 輸入要被提取的任意資料陣列
 * @param {Integer} istart 輸入起始的欄位指標整數
 * @param {Integer} [iend=null] 輸入結束的欄位指標整數，若不使用則等同於istart，預設null
 * @returns {Array} 回傳提取的任意資料陣列
 * @example
 *
 * console.log(arrAt([1, 2, 3, '4', 5, 'abc'], 1))
 * // => [2]
 *
 * console.log(arrAt([1, 2, 3, '4', 5, 'abc'], 1, 4))
 * // => [2, 3, '4', 5]
 *
 */
function arrAt(vall, istart, iend = null) {

    //check
    if (!isearr(vall)) {
        return []
    }
    if (!isp0int(istart)) {
        return []
    }
    else {
        istart = cint(istart)
    }

    let t
    if (!iser(iend)) {

        //check
        if (!isp0int(iend)) {
            return []
        }
        else {
            iend = cint(iend)
        }

        //check
        if (istart >= vall.length || iend >= vall.length) {
            return []
        }

        let inds = range(istart, iend + 1)
        t = at(vall, inds)

    }
    else {

        //check
        if (istart >= vall.length) {
            return []
        }

        t = at(vall, istart)

    }

    return t
}


export default arrAt
