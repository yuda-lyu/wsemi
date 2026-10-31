import get from 'lodash-es/get.js'
import map from 'lodash-es/map.js'
import isarr from './isarr.mjs'
import isestr from './isestr.mjs'
import isbol from './isbol.mjs'
import isenum from './isenum.mjs'
import arrReduce from './arrReduce.mjs'


/**
 * 找尋陣列內元素最小值
 *
 * 只取有效數字(isenum: 有限數字，或去頭尾空白後為十進位寫法之數字字串)比較，其餘元素(含標記字串'-'、'NP'、''、null、undefined、布林、NaN、Infinity、'Infinity'、'0x10'、'1e400'、包裝物件等)略過不參與；
 * vall內沒有任何有效數字(含空陣列)時throw Error('invalid vall: must contain a valid number')，vall不是陣列時throw Error('invalid vall: must be an array')，訊息不帶值。
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/arrMin.test.mjs Github}
 * @memberOf wsemi
 * @param {Array} vall 輸入原始陣列，需含至少一個有效數字(定義見isenum，不收Infinity與'0x10'等)，否則throw
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Boolean} [opt.returnIndex=false] 輸入是否回傳排序指標陣列布林值，預設false
 * @param {String} [opt.compareKey=null] 輸入當vall為物件陣列時，指定取compareKey欄位出來排序，compareKey需為有效字串，預設null
 * @returns {Number|Object} 回傳最小值數字或判斷具有最小值之物件，沒有任何有效數字時throw
 * @example
 *
 * let r
 *
 * r = arrMin([100000, 1, 30, 4, 21])
 * console.log(r)
 * // => 1
 *
 * r = arrMin([1, 30, 4, 21, 100000])
 * console.log(r)
 * // => 1
 *
 * r = arrMin([1, 30, 4, 100000, 21])
 * console.log(r)
 * // => 1
 *
 * r = arrMin([1, 30, 4, 100000, 21], { returnIndex: true })
 * console.log(r)
 * // => 0
 *
 * try {
 *     arrMin(['March', 'Jan', 'Feb', 'Dec'])
 * }
 * catch (err) {
 *     console.log(err.message)
 * }
 * // => invalid vall: must contain a valid number
 *
 * r = arrMin(['1', '30', '  4  ', '100000', '21'])
 * console.log(r)
 * // => 1
 *
 * r = arrMin(['1', '30', '  4  ', '100000', 21])
 * console.log(r)
 * // => 1
 *
 * r = arrMin(['a1', 'b30', '  4  ', '100000', 21])
 * console.log(r)
 * // => 4
 *
 * r = arrMin(
 *     [{ s: 'March', i: 1 }, { s: 'Jan', i: 4 }, { s: 'Feb', i: 100000 }, { s: 'Dec', i: 30 }, { s: 'Nov', i: 'a25' }],
 *     { compareKey: 'i' }
 * )
 * console.log(r)
 * // => { s: 'March', i: 1 }
 *
 * try {
 *     arrMin(
 *         [{ s: 'March', i: 1 }, { s: 'Jan', i: 4 }, { s: 'Feb', i: 100000 }, { s: 'Dec', i: 30 }, { s: 'Nov', i: 'a25' }],
 *         { compareKey: 's' }
 *     )
 * }
 * catch (err) {
 *     console.log(err.message)
 * }
 * // => invalid vall: must contain a valid number
 *
 * r = arrMin([5, -Infinity, '0x10', '-', null, 3])
 * console.log(r)
 * // => 3 (-Infinity與'0x10'不是有效數字, 略過)
 *
 * r = arrMin(
 *     [{ s: 'March', i: 1 }, { s: 'Jan', i: 4 }, { s: 'Feb', i: 100000 }, { s: 'Dec', i: 30 }, { s: 'Nov', i: 'a25' }],
 *     { compareKey: 'i', returnIndex: true }
 * )
 * console.log(r)
 * // => 0
 *
 */
function arrMin(vall, opt = {}) {

    //check
    if (!isarr(vall)) {
        throw new Error('invalid vall: must be an array')
    }

    //returnIndex
    let returnIndex = get(opt, 'returnIndex')
    if (!isbol(returnIndex)) {
        returnIndex = false
    }

    //compareKey
    let compareKey = get(opt, 'compareKey', null)

    //vallTrans
    let vallTrans = vall
    if (isestr(compareKey)) {
        vallTrans = map(vall, (v, k) => {
            return get(v, compareKey, '')
        })
    }

    //arrReduce
    let vRes = null
    let ind = arrReduce(
        vallTrans,
        (vTemp, vNow) => {

            //check, 只取有效數字
            if (!isenum(vNow)) {
                return vTemp
            }

            //取值為去頭尾空白後Number
            vNow = Number(vNow)

            //check
            if (vTemp === null) {
                vRes = vNow //save as
                return vNow
            }

            //min
            vTemp = Math.min(vTemp, vNow)
            vRes = vTemp //save as

            return vTemp

        },
        { returnIndex: true }
    )

    //check, 沒有任何有效數字(含空陣列)無從得出結果, 報錯(vRes於首個有效數字時才設定)
    if (vRes === null) {
        throw new Error('invalid vall: must contain a valid number')
    }

    //check
    if (returnIndex) {
        return ind
    }

    //vv
    let vv = null
    if (ind >= 0) {

        //compareKey
        if (isestr(compareKey)) {
            vv = vall[ind]
        }
        else {
            vv = vRes
        }

    }

    return vv
}


export default arrMin
