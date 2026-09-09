import get from 'lodash-es/get.js'
import each from 'lodash-es/each.js'
import map from 'lodash-es/map.js'
import size from 'lodash-es/size.js'
import isearr from './isearr.mjs'
import iseobj from './iseobj.mjs'
import isstr from './isstr.mjs'
import isnum from './isnum.mjs'
import isbol from './isbol.mjs'
import haskey from './haskey.mjs'
import o2j from './o2j.mjs'
import getltdtkeys from './getltdtkeys.mjs'


/**
 * 由物件陣列ltdt並使用keys取值轉二維陣列mat
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/ltdtkeys2mat.test.mjs Github}
 * @memberOf wsemi
 * @param {Array} ltdt 輸入物件陣列
 * @param {Array} [keys=null] 輸入字串陣列，若不輸入則由ltdt提取，預設為null
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {String|Number|Array|Object} [opt.empty=''] 輸入若無鍵值時給予之預設值，預設''
 * @param {Boolean} [opt.returnWithStateAndMsg=false] 輸入是否回傳含狀態與訊息物件布林值，若為true則回傳{ state, msg }物件，state為'success'或'error'，msg於success時為回傳結果、於error時為錯誤訊息字串，預設false
 * @returns {Array|Object} 回傳資料陣列，ltdt無效、無法取得keys或任一元素非有效物件時回傳空陣列；若opt.returnWithStateAndMsg為true則回傳{ state, msg }物件
 * @example
 *
 * console.log(ltdtkeys2mat([{ a: 12, b: 34.56 }, { a: '123', b: 'xyz' }], ['a', 'b']))
 * // => [[12, 34.56], ['123', 'xyz']]
 *
 */
function ltdtkeys2mat(ltdt, keys = null, opt = {}) {

    //returnWithStateAndMsg, 本函數原就有opt參數(opt.empty), 故併入同一opt而非新增參數
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
    if (!isearr(ltdt)) {
        return retError('invalid ltdt')
    }

    //keys
    if (!isearr(keys)) {
        keys = getltdtkeys(ltdt)
    }

    //check
    if (size(keys) === 0) {
        return retError('invalid keys, can not extract any key from ltdt')
    }

    //check
    let b = false
    each(ltdt, function(v) {
        if (!iseobj(v)) {
            b = true
        }
    })
    if (b) {
        return retError('invalid ltdt, every element must be an effective object')
    }

    //empty
    let empty = get(opt, 'empty', '')

    //mat
    let mat = []
    each(ltdt, function(v) {
        let r = map(keys, function(k) {
            if (!haskey(v, k)) {
                return empty
            }
            else if (isbol(v[k])) {
                return v[k] ? 'true' : 'false'
            }
            else if (!isstr(v[k]) && !isnum(v[k])) {
                return o2j(v[k])
            }
            return v[k]
        })
        mat.push(r)
    })

    if (returnWithStateAndMsg) {
        return {
            state: 'success',
            msg: mat,
        }
    }
    else {
        return mat
    }
}


export default ltdtkeys2mat
