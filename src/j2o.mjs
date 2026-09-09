import get from 'lodash-es/get.js'
import isbol from './isbol.mjs'
import isestr from './isestr.mjs'


/**
 * json文字轉任意資料
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/j2o.test.mjs Github}
 * @memberOf wsemi
 * @param {String} v 輸入json格式字串
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Boolean} [opt.returnWithStateAndMsg=false] 輸入是否回傳含狀態與訊息物件布林值，若為true則回傳{ state, msg }物件，state為'success'或'error'，msg於success時為回傳結果、於error時為錯誤訊息字串，預設false
 * @returns {*} 回傳任意資料，輸入非有效字串或解析失敗時回傳空物件；若opt.returnWithStateAndMsg為true則回傳{ state, msg }物件
 * @example
 *
 * console.log(j2o('[1,"3","abc"]'))
 * // => [1, '3', 'abc']
 *
 * console.log(j2o('{"a":12.34,"b":"abc"}'))
 * // => { a: 12.34, b: 'abc' }
 *
 */
function j2o(v, opt = {}) {

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
    if (!isestr(v)) {
        return retError('invalid v')
    }

    //c, 解析失敗原為catch吞掉回{}, 與「輸入本就是{}」無從分辨
    let c = {}
    try {
        c = JSON.parse(v)
    }
    catch (err) {
        return retError(err.toString())
    }

    if (returnWithStateAndMsg) {
        return {
            state: 'success',
            msg: c,
        }
    }
    else {
        return c
    }
}


export default j2o
