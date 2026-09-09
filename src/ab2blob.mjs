import get from 'lodash-es/get.js'
import isbol from './isbol.mjs'
import isab from './isab.mjs'
import ab2u8arr from './ab2u8arr.mjs'


/**
 * ArrayBuffer資料轉Blob資料
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/ab2blob.test.mjs Github}
 * @memberOf wsemi
 * @param {ArrayBuffer} ab 輸入ArrayBuffer資料
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Boolean} [opt.returnWithStateAndMsg=false] 輸入是否回傳含狀態與訊息物件布林值，若為true則回傳{ state, msg }物件，state為'success'或'error'，msg於success時為回傳結果、於error時為錯誤訊息字串，預設false
 * @returns {Blob|Object} 回傳Blob資料，輸入非ArrayBuffer時回傳空Blob；若opt.returnWithStateAndMsg為true則回傳{ state, msg }物件
 * @example
 * need test in browser
 *
 * let ab = (new Uint8Array([66, 97, 115])).buffer
 * let bb = ab2blob(ab)
 * console.log(bb)
 * // => Blob {size: 3, type: ""}
 *
 * console.log(ab2blob('abc', { returnWithStateAndMsg: true }))
 * // => { state: 'error', msg: 'invalid ab' }
 *
 */
function ab2blob(ab, opt = {}) {

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
            return new Blob()
        }
    }

    //check, 原碼無此檢查, 無效輸入會經ab2u8arr得空Uint8Array再包成空Blob, 使失敗無從辨識
    if (!isab(ab)) {
        return retError('invalid ab')
    }

    //bb, 內部一律以returnWithStateAndMsg取狀態, 判識後才把結果交給下一步, 錯誤訊息前置來源函數名以利分辨是哪一步出錯; 另須攔截非預期錯誤(如執行環境無Blob), 否則會外拋至呼叫端
    let bb = null
    try {

        let ru8a = ab2u8arr(ab, { returnWithStateAndMsg: true })
        if (ru8a.state === 'error') {
            return retError(`ab2u8arr: ${ru8a.msg}`)
        }

        bb = new Blob([ru8a.msg])

    }
    catch (err) {
        return retError(err.toString())
    }

    if (returnWithStateAndMsg) {
        return {
            state: 'success',
            msg: bb,
        }
    }
    else {
        return bb
    }
}


export default ab2blob
