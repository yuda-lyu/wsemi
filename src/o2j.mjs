import get from 'lodash-es/get.js'
import isbol from './isbol.mjs'
import isundefined from './isundefined.mjs'


/**
 * 任意資料轉json文字
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/o2j.test.mjs Github}
 * @memberOf wsemi
 * @param {*} v 輸入任意資料
 * @param {Boolean} [bFormat=false] 輸入是否格式化布林值，預設為false
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Boolean} [opt.returnWithStateAndMsg=false] 輸入是否回傳含狀態與訊息物件布林值，若為true則回傳{ state, msg }物件，state為'success'或'error'，msg於success時為回傳結果、於error時為錯誤訊息字串，預設false
 * @returns {String|Object} 回傳json格式字串，輸入為undefined或序列化失敗(如含BigInt、循環參照)時回傳空字串；若opt.returnWithStateAndMsg為true則回傳{ state, msg }物件
 * @example
 *
 * console.log(o2j([1, '3', 'abc']))
 * // => '[1,"3","abc"]'
 *
 * console.log(o2j({ a: 12.34, b: 'abc' }))
 * // => '{"a":12.34,"b":"abc"}'
 *
 * console.log(o2j({ a: 12.34, b: 'abc' }, true))
 * // => {
 *   "a": 12.34,
 *   "b": "abc"
 * }
 *
 */
function o2j(v, bFormat = false, opt = {}) {

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
            return ''
        }
    }

    //check
    if (isundefined(v)) {
        return retError('invalid v')
    }

    //c, 序列化失敗(如含BigInt、循環參照)原為catch吞掉回'', 與「本就轉出空字串」無從分辨
    let c = ''
    try {
        if (bFormat) {
            c = JSON.stringify(v, null, 2)
        }
        else {
            c = JSON.stringify(v)
        }
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


export default o2j
