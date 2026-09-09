import get from 'lodash-es/get.js'
import isbol from './isbol.mjs'
import isstr from './isstr.mjs'
import b642str from './b642str.mjs'
import j2o from './j2o.mjs'


/**
 * base64字串轉任意資料
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/b642obj.test.mjs Github}
 * @memberOf wsemi
 * @param {String} b64 輸入base64字串
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Boolean} [opt.returnWithStateAndMsg=false] 輸入是否回傳含狀態與訊息物件布林值，若為true則回傳{ state, msg }物件，state為'success'或'error'，msg於success時為回傳結果、於error時為錯誤訊息字串，預設false
 * @returns {*} 回傳任意物件，輸入非字串或解析失敗時回傳空物件；若opt.returnWithStateAndMsg為true則回傳{ state, msg }物件
 * @example
 *
 * console.log(b642obj('eyJhIjoxfQ=='))
 * // => { a: 1 }
 *
 * console.log(b642obj(NaN, { returnWithStateAndMsg: true }))
 * // => { state: 'error', msg: 'invalid b64' }
 *
 */
function b642obj(b64, opt = {}) {

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
            return {}
        }
    }

    //check
    if (!isstr(b64)) {
        return retError('invalid b64')
    }

    //obj, 內部一律以returnWithStateAndMsg取狀態, 逐一判識後才把結果交給下一步, 錯誤訊息前置來源函數名以利分辨是哪一步出錯; 另須攔截非預期錯誤, 否則會外拋至呼叫端
    let obj = {}
    try {

        let rstr = b642str(b64, { returnWithStateAndMsg: true })
        if (rstr.state === 'error') {
            return retError(`b642str: ${rstr.msg}`)
        }

        let rj = j2o(rstr.msg, { returnWithStateAndMsg: true })
        if (rj.state === 'error') {
            return retError(`j2o: ${rj.msg}`)
        }
        obj = rj.msg

    }
    catch (err) {
        return retError(err.toString())
    }

    if (returnWithStateAndMsg) {
        return {
            state: 'success',
            msg: obj,
        }
    }
    else {
        return obj
    }
}


export default b642obj
