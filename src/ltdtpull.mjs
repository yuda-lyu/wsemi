import every from 'lodash-es/every.js'
import differenceBy from 'lodash-es/differenceBy.js'
import isarr from './isarr.mjs'
import isestr from './isestr.mjs'
import isobj from './isobj.mjs'


/**
 * 由ltdtAll陣列移除ltdtDel陣列，只會針對ltdtDel內各元素的指定key來查找
 *
 * ltdtAll、ltdtDel與key皆為必須參數，型別檢測與有無資料無關，檢測順序為ltdtAll(陣列、各元素為物件)、ltdtDel(陣列、各元素為物件)、key(非空字串)，無效throw Error('invalid ltdtAll: must be an array')、Error('invalid ltdtAll: must be an array of objects')、Error('invalid ltdtDel: must be an array')、Error('invalid ltdtDel: must be an array of objects')或Error('invalid key: must be a non-empty string')，訊息不帶輸入值；空陣列為合法資料不報錯：ltdtAll為[]回傳[]，ltdtDel為[]則不刪除並回傳ltdtAll(原陣列，非複本)
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/ltdtpull.test.mjs Github}
 * @memberOf wsemi
 * @param {Array} ltdtAll 輸入要被刪除的物件陣列，必須參數，須為物件陣列(空陣列合法)
 * @param {Array} ltdtDel 輸入要刪除的物件陣列，必須參數，須為物件陣列(空陣列合法，代表不刪除)
 * @param {String} key 輸入要比對物件的key值，必須參數，須為非空字串
 * @returns {Array} 回傳移除後剩餘的物件陣列；ltdtAll為[]時回傳[]，ltdtDel為[]時回傳ltdtAll
 * @throws {Error} ltdtAll或ltdtDel非陣列、或有元素非物件時throw Error('invalid ltdtAll: must be an array')、Error('invalid ltdtAll: must be an array of objects')、Error('invalid ltdtDel: must be an array')、Error('invalid ltdtDel: must be an array of objects')；key非非空字串時throw Error('invalid key: must be a non-empty string')；訊息皆不帶輸入值
 * @example
 *
 * console.log(ltdtpull([{ x: 1, y: 'y1' }, { x: 2, y: 'y2' }], [{ x: 1, y: 'y3' }], 'x'))
 * // => [ { x: 2, y: 'y2' } ]
 *
 * console.log(ltdtpull([{ id: 1, v: 'v1' }, { id: 2, v: 'v2' }, { id: 3, v: 'v3' }], [{ id: 1, v: '-v1' }, { id: 3, v: '-v3' }], 'id'))
 * // => [ { id: 2, v: 'v2' } ]
 *
 * console.log(ltdtpull([], [{ id: 1 }], 'id'))
 * // => []
 *
 * try {
 *     ltdtpull([], 'x', 'id')
 * }
 * catch (err) {
 *     console.log(err.message)
 * }
 * // => invalid ltdtDel: must be an array
 *
 */
function ltdtpull(ltdtAll, ltdtDel, key) {

    //check, ltdtAll、ltdtDel、key為必須參數(與有無資料無關), 依ltdtAll(陣列, 元素)、ltdtDel(陣列, 元素)、key序, 無效throw(訊息不帶值)
    if (!isarr(ltdtAll)) { //可能會傳空陣列, 故需要isarr
        throw new Error('invalid ltdtAll: must be an array')
    }
    if (!every(ltdtAll, isobj)) { //lodash every依索引走訪, 空洞視為undefined而無效
        throw new Error('invalid ltdtAll: must be an array of objects')
    }
    if (!isarr(ltdtDel)) { //可能會傳空陣列, 故需要isarr
        throw new Error('invalid ltdtDel: must be an array')
    }
    if (!every(ltdtDel, isobj)) {
        throw new Error('invalid ltdtDel: must be an array of objects')
    }
    if (!isestr(key)) {
        throw new Error('invalid key: must be a non-empty string')
    }

    //check
    if (ltdtDel.length === 0) { //傳空陣列就不刪除
        return ltdtAll
    }

    //differenceBy
    let t = differenceBy(ltdtAll, ltdtDel, key)

    return t
}


export default ltdtpull
