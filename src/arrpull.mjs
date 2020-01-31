import cloneDeep from 'lodash/cloneDeep'
import pullAll from 'lodash/pullAll'
import every from 'lodash/every'
import differenceBy from 'lodash/differenceBy'
import isarr from './isarr.mjs'
import isestr from './isestr.mjs'
import isobj from './isobj.mjs'


/**
 * 由vall陣列移除vdel陣列
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/arrpull.test.js Github}
 * @memberOf wsemi
 * @param {Array} vall 輸入要被刪除的任意資料陣列
 * @param {Array} vdel 輸入要刪除的任意資料陣列
 * @param {String} [key=null] 輸入要比對的物件key值，所傳入的陣列各元素需為物件，預設null
 * @returns {Array} 回傳被刪除的任意資料陣列
 * @example
 * console.log(arrpull([{ x: 1, y: 'y1' }, { x: 2, y: 'y2' }], [{ x: 1, y: 'y3' }], 'x'))
 * // => [ { x: 2, y: 'y2' } ]
 *
 * console.log(arrpull([1, 2, '3', 4, '3', 'abc'], [2]))
 * // => [1, '3', 4, '3', 'abc']
 *
 * console.log(arrpull([1, 2, '3', 4, '3', 'abc'], [2, '3']))
 * // => [1, 4, 'abc']
 */
function arrpull(vall, vdel, key = null) {

    //check
    if (!isarr(vall)) { //可能會傳空陣列, 故需要isarr
        return []
    }
    if (!isarr(vdel)) { //可能會傳空陣列, 故需要isarr
        return []
    }

    //t
    let t
    if (key === null) {

        //pullAll
        t = cloneDeep(vall)
        pullAll(t, vdel)

    }
    else {

        //check
        if (!isestr(key)) {
            return []
        }

        //bAll
        let bAll = every(vall, (v) => {
            return isobj(v)
        })

        //check
        if (!bAll) {
            return []
        }

        //bDel
        let bDel = every(vdel, (v) => {
            return isobj(v)
        })

        //check
        if (!bDel) {
            return []
        }

        //differenceBy
        t = differenceBy(vall, vdel, key)

    }

    return t
}


export default arrpull
