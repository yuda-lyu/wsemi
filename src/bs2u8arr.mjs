import get from 'lodash-es/get.js'
import isbol from './isbol.mjs'
import isestr from './isestr.mjs'


/**
 * BinaryString轉Unit8Array，BinaryString為UTF-16編碼
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/bs2u8arr.test.mjs Github}
 * @memberOf wsemi
 * @param {String} bs 輸入BinaryString字串
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Boolean} [opt.returnWithStateAndMsg=false] 輸入是否回傳含狀態與訊息物件布林值，若為true則回傳{ state, msg }物件，state為'success'或'error'，msg於success時為回傳結果、於error時為錯誤訊息字串，預設false
 * @returns {Unit8Array|Object} 回傳Unit8Array資料，輸入非有效字串時回傳空Unit8Array；若opt.returnWithStateAndMsg為true則回傳{ state, msg }物件
 * @example
 *
 * console.log(bs2u8arr('abc'))
 * // => new Uint8Array([97, 98, 99])
 *
 */
function bs2u8arr(str, opt = {}) {

    //returnWithStateAndMsg
    let returnWithStateAndMsg = get(opt, 'returnWithStateAndMsg', null)
    if (!isbol(returnWithStateAndMsg)) {
        returnWithStateAndMsg = false
    }

    //retError
    let retError = (msg) => {
        if (returnWithStateAndMsg) {
            return {
                state: 'error',
                msg,
            }
        }
        else {
            return new Uint8Array()
        }
    }

    //check
    if (!isestr(str)) {
        return retError('invalid bs')
    }

    //u8a, 須攔截非預期錯誤, 否則會外拋至呼叫端
    let u8a = null
    try {
        let l = str.length
        u8a = new Uint8Array(l)
        for (let i = 0; i < l; i++) {
            u8a[i] = str.charCodeAt(i)
        }
    }
    catch (err) {
        return retError(err.toString())
    }

    if (returnWithStateAndMsg) {
        return {
            state: 'success',
            msg: u8a,
        }
    }
    else {
        return u8a
    }
}


export default bs2u8arr
