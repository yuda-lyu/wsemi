import get from 'lodash-es/get.js'
import map from 'lodash-es/map.js'
import isearr from './isearr.mjs'
import isestr from './isestr.mjs'
import isbol from './isbol.mjs'
import isnum from './isnum.mjs'
import cdbl from './cdbl.mjs'
import arrReduce from './arrReduce.mjs'


/**
 * 找尋陣列內元素最小值
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/arrMin.test.mjs Github}
 * @memberOf wsemi
 * @param {Array} vall 輸入原始陣列
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Boolean} [opt.returnIndex=false] 輸入是否回傳排序指標陣列布林值，預設false
 * @param {String} [opt.compareKey=null] 輸入當vall為物件陣列時，指定取compareKey欄位出來排序，compareKey需為有效字串，預設null
 * @returns {Number|Object} 回傳最小值數字或判斷具有最小值之物件
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
 * r = arrMin(['March', 'Jan', 'Feb', 'Dec'])
 * console.log(r)
 * // => null
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
 * r = arrMin(
 *     [{ s: 'March', i: 1 }, { s: 'Jan', i: 4 }, { s: 'Feb', i: 100000 }, { s: 'Dec', i: 30 }, { s: 'Nov', i: 'a25' }],
 *     { compareKey: 's' }
 * )
 * console.log(r)
 * // => null
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
    if (!isearr(vall)) {
        return null
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

            //check
            if (!isnum(vNow)) {
                return vTemp
            }

            //cdbl
            vNow = cdbl(vNow)

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
