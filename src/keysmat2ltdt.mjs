import map from 'lodash-es/map.js'
import each from 'lodash-es/each.js'
import zipObject from 'lodash-es/zipObject.js'
import get from 'lodash-es/get.js'
import isbol from './isbol.mjs'
import isearr from './isearr.mjs'


/**
 * 由keys與二維陣列mdata轉ltdt
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/keysmat2ltdt.test.mjs Github}
 * @memberOf wsemi
 * @param {Array} keys 輸入字串陣列
 * @param {Array} mat 輸入資料陣列
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Boolean} [opt.returnWithStateAndMsg=false] 輸入是否回傳含狀態與訊息物件布林值，若為true則回傳{ state, msg }物件，state為'success'或'error'，msg於success時為回傳結果、於error時為錯誤訊息字串，預設false
 * @returns {Array|Object} 回傳物件陣列，keys或mat無效時回傳空陣列；若opt.returnWithStateAndMsg為true則回傳{ state, msg }物件
 * @example
 *
 * console.log(keysmat2ltdt(['a', 'b'], [[12, 34.56], ['123', 'xyz']]))
 * // => [{ a: 12, b: 34.56 }, { a: '123', b: 'xyz' }]
 *
 */
function keysmat2ltdt(keys, mat, opt = {}) {

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
            return []
        }
    }

    //check, 原碼三種失敗皆回[], 與「本就轉出空陣列」無從分辨
    if (!isearr(keys)) {
        return retError('invalid keys')
    }
    if (!isearr(mat)) {
        return retError('invalid mat')
    }
    if (!isearr(mat[0])) {
        return retError('invalid mat, the first row is not an effective array')
    }

    let ltdt = map(mat, function(r) {

        //o
        let o = zipObject(keys, r)

        //clear undefined
        each(o, function(v, k) {
            if (v === undefined) {
                o[k] = ''
            }
        })

        return o
    })

    if (returnWithStateAndMsg) {
        return {
            state: 'success',
            msg: ltdt,
        }
    }
    else {
        return ltdt
    }
}


export default keysmat2ltdt
