import every from 'lodash-es/every.js'
import differenceBy from 'lodash-es/differenceBy.js'
import isarr from './isarr.mjs'
import isestr from './isestr.mjs'
import isobj from './isobj.mjs'


/**
 * 由ltdtAll陣列移除ltdtDel陣列，只會針對ltdtDel內各元素的指定key來查找
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/ltdtpull.test.mjs Github}
 * @memberOf wsemi
 * @param {Array} ltdtAll 輸入要被刪除的物件陣列
 * @param {Array} ltdtDel 輸入要刪除的物件陣列
 * @param {String} key 輸入要比對物件的key值
 * @returns {Array} 回傳被刪除的物件陣列
 * @example
 *
 * console.log(ltdtpull([{ x: 1, y: 'y1' }, { x: 2, y: 'y2' }], [{ x: 1, y: 'y3' }], 'x'))
 * // => [ { x: 2, y: 'y2' } ]
 *
 * console.log(ltdtpull([{ id: 1, v: 'v1' }, { id: 2, v: 'v2' }, { id: 3, v: 'v3' }], [{ id: 1, v: '-v1' }, { id: 3, v: '-v3' }], 'id'))
 * // => [ { id: 2, v: 'v2' } ]
 *
 */
function ltdtpull(ltdtAll, ltdtDel, key) {

    //check
    if (!isarr(ltdtAll)) { //可能會傳空陣列, 故需要isarr
        return []
    }
    if (!isarr(ltdtDel)) { //可能會傳空陣列, 故需要isarr
        return []
    }
    if (!isestr(key)) {
        return []
    }

    //check
    let bAll = every(ltdtAll, (v) => {
        return isobj(v)
    })
    if (!bAll) {
        return []
    }

    //check
    if (ltdtDel.length === 0) { //傳空陣列就不刪除
        return ltdtAll
    }

    //check
    let bDel = every(ltdtDel, (v) => {
        return isobj(v)
    })
    if (!bDel) {
        return []
    }

    //differenceBy
    let t = differenceBy(ltdtAll, ltdtDel, key)

    return t
}


export default ltdtpull
