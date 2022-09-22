import get from 'lodash/get'
import map from 'lodash/map'
import isearr from './isearr.mjs'
import isestr from './isestr.mjs'
import isbol from './isbol.mjs'
import isnum from './isnum.mjs'
import cdbl from './cdbl.mjs'
import arrReduce from './arrReduce.mjs'


/**
 * 找尋陣列內元素最大值
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/arrMax.test.mjs Github}
 * @memberOf wsemi
 * @param {Array} vall 輸入原始陣列
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Boolean} [opt.returnIndex=false] 輸入是否回傳排序指標陣列布林值，預設false
 * @param {String} [opt.compareKey=null] 輸入當vall為物件陣列時，指定取compareKey欄位出來排序，compareKey需為有效字串，預設null
 * @returns {Number|Object} 回傳最大值數字或判斷具有最大值之物件
 * @example
 *
 * let r
 *
 * r = arrMax([100000, 1, 30, 4, 21])
 * console.log(r)
 * // => 100000
 *
 * r = arrMax([1, 30, 4, 21, 100000])
 * console.log(r)
 * // => 100000
 *
 * r = arrMax([1, 30, 4, 100000, 21])
 * console.log(r)
 * // => 100000
 *
 * r = arrMax([1, 30, 4, 100000, 21], { returnIndex: true })
 * console.log(r)
 * // => 3
 *
 * r = arrMax(['March', 'Jan', 'Feb', 'Dec'])
 * console.log(r)
 * // => null
 *
 * r = arrMax(['1', '30', '  4  ', '100000', '21'])
 * console.log(r)
 * // => 100000
 *
 * r = arrMax(['1', '30', '  4  ', '100000', 21])
 * console.log(r)
 * // => 100000
 *
 * r = arrMax(['a1', 'b30', '  4  ', '100000', 21])
 * console.log(r)
 * // => 100000
 *
 * r = arrMax(
 *     [{ s: 'March', i: 1 }, { s: 'Jan', i: 4 }, { s: 'Feb', i: 100000 }, { s: 'Dec', i: 30 }, { s: 'Nov', i: 'a25' }],
 *     { compareKey: 'i' }
 * )
 * console.log(r)
 * // => { s: 'Feb', i: 100000 }
 *
 * r = arrMax(
 *     [{ s: 'March', i: 1 }, { s: 'Jan', i: 4 }, { s: 'Feb', i: 100000 }, { s: 'Dec', i: 30 }, { s: 'Nov', i: 'a25' }],
 *     { compareKey: 's' }
 * )
 * console.log(r)
 * // => null
 *
 * r = arrMax(
 *     [{ s: 'March', i: 1 }, { s: 'Jan', i: 4 }, { s: 'Feb', i: 100000 }, { s: 'Dec', i: 30 }, { s: 'Nov', i: 'a25' }],
 *     { compareKey: 'i', returnIndex: true }
 * )
 * console.log(r)
 * // => 2
 *
 */
function arrMax(vall, opt = {}) {

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

            //max
            vTemp = Math.max(vTemp, vNow)
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


export default arrMax
