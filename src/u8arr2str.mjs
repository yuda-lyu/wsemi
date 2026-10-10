import get from 'lodash-es/get.js'
import isbol from './isbol.mjs'
import isu8arr from './isu8arr.mjs'


/**
 * Uint8Array轉字串
 *
 * 以原生TextDecoder解碼UTF-8，保留開頭之BOM(U+FEFF)，非合法UTF-8時視為轉換失敗(不靜默換成U+FFFD)
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/u8arr2str.test.mjs Github}
 * @memberOf wsemi
 * @param {Uint8Array} u8a 輸入Uint8Array
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Boolean} [opt.returnWithStateAndMsg=false] 輸入是否回傳含狀態與訊息物件布林值，若為true則回傳{ state, msg }物件，state為'success'或'error'，msg於success時為回傳結果、於error時為錯誤訊息字串，預設false
 * @returns {String|Object} 回傳一般字串，輸入非Uint8Array、非合法UTF-8或轉換失敗時回傳空字串；若opt.returnWithStateAndMsg為true則回傳{ state, msg }物件
 * @example
 *
 * console.log(u8arr2str(new Uint8Array([116, 101, 115, 116, 228, 184, 173, 230, 150, 135])))
 * // => test中文
 *
 * console.log(u8arr2str('abc', { returnWithStateAndMsg: true }))
 * // => { state: 'error', msg: 'invalid u8a' }
 *
 */
function u8arr2str(u8a, opt = {}) {

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
    if (!isu8arr(u8a)) {
        return retError('invalid u8a')
    }

    //r, fatal模式於非合法UTF-8時拋錯而視為失敗, 不靜默換成U+FFFD; ignoreBOM保留開頭之BOM, 與str2u8arr往返一致; 須攔截錯誤, 否則會外拋至呼叫端
    let r = ''
    try {
        r = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(u8a)
    }
    catch (err) {
        return retError(err.toString())
    }

    if (returnWithStateAndMsg) {
        return {
            state: 'success',
            msg: r,
        }
    }
    else {
        return r
    }
}


export default u8arr2str
