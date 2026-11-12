import get from 'lodash-es/get.js'
import isbol from './isbol.mjs'
import isu8arr from './isu8arr.mjs'


/**
 * Unit8Array轉BinaryString，BinaryString為UTF-16編碼
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/u8arr2bs.test.mjs Github}
 * @memberOf wsemi
 * @param {Unit8Array} u8a 輸入Unit8Array資料
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Boolean} [opt.returnWithStateAndMsg=false] 輸入是否回傳含狀態與訊息物件布林值，若為true則回傳{ state, msg }物件，state為'success'或'error'，msg於success時為回傳結果、於error時為錯誤訊息字串，預設false
 * @returns {String|Object} 回傳BinaryString字串，輸入非Unit8Array時回傳空字串；若opt.returnWithStateAndMsg為true則回傳{ state, msg }物件
 * 失敗之辨識：預設模式於本函數所偵測之失敗(輸入無效或轉換失敗)時不拋錯而回傳空字串''，而空字串''亦為合法輸入之結果(如u8arr2bs(new Uint8Array(0)))，故不可由回傳值判斷成敗；須辨識失敗時請設opt.returnWithStateAndMsg為true，以回傳之state === 'error'判定(只涵蓋本函數所偵測之失敗，msg為錯誤訊息)
 * @example
 *
 * console.log(u8arr2bs(new Uint8Array([97, 98, 99])))
 * // => 'abc'
 *
 * console.log(u8arr2bs('abc', { returnWithStateAndMsg: true }))
 * // => { state: 'error', msg: 'invalid u8a' }
 *
 */
function u8arr2bs(u8a, opt = {}) {

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

    //c, 須攔截非預期錯誤(如過大資料使字串超出長度上限), 否則會外拋至呼叫端
    let c = ''
    try {
        let l = u8a.length
        for (let i = 0; i < l; i++) {
            c += String.fromCharCode(u8a[i])
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


export default u8arr2bs
