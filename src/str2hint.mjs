import get from 'lodash-es/get.js'
import isbol from './isbol.mjs'
import isstr from './isstr.mjs'


/**
 * 一般字串轉hash整數
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/str2hint.test.mjs Github}
 * @memberOf wsemi
 * @param {String} str 輸入一般字串
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Boolean} [opt.returnWithStateAndMsg=false] 輸入是否回傳含狀態與訊息物件布林值，若為true則回傳{ state, msg }物件，state為'success'或'error'，msg於success時為回傳結果、於error時為錯誤訊息字串，預設false
 * @returns {Integer|Object} 回傳轉換後整數，輸入非字串時回傳null，輸入空字串時回傳0；若opt.returnWithStateAndMsg為true則回傳{ state, msg }物件
 * @example
 *
 * console.log(str2hint('abc'))
 * // => 807794786
 *
 * console.log(str2hint('123'))
 * // => 408093746
 *
 * console.log(str2hint('12.3'))
 * // => 10159942
 *
 * console.log(str2hint(''))
 * // => 0
 *
 * console.log(str2hint(null))
 * // => null
 *
 */
function str2hint(str, opt = {}) {

    //returnWithStateAndMsg
    let returnWithStateAndMsg = get(opt, 'returnWithStateAndMsg', null)
    if (!isbol(returnWithStateAndMsg)) {
        returnWithStateAndMsg = false
    }

    //retSuccess
    let retSuccess = (msg) => {
        if (returnWithStateAndMsg) {
            return {
                state: 'success',
                msg,
            }
        }
        else {
            return msg
        }
    }

    //check
    if (!isstr(str)) {
        if (returnWithStateAndMsg) {
            return {
                state: 'error',
                msg: 'invalid str',
            }
        }
        else {
            return null
        }
    }
    if (str === '') {
        return retSuccess(0) //空字串為合法輸入, 對應0, 非失敗
    }

    // let _int = ''
    // let dig = 3
    // for (let i = 0; i < str.length; i++) {
    //     let c = String(str.charCodeAt(i))
    //     for (let a = 0; a < dig - c.length; a++) {
    //         _int += 0
    //     }
    //     _int += c
    // }
    // let i = Number(_int)
    // return i
    let arr = str.split('')
    let i = arr.reduce(
        (hashCode, currentVal) =>
            (hashCode =
                  currentVal.charCodeAt(0) +
                  (hashCode << 6) +
                  (hashCode << 16) -
                  hashCode),
        0
    )
    // console.log(i)
    return retSuccess(i)
}


export default str2hint
