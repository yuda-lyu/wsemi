import each from 'lodash-es/each.js'
import get from 'lodash-es/get.js'
import map from 'lodash-es/map.js'
import concat from 'lodash-es/concat.js'
import isbol from './isbol.mjs'
import isearr from './isearr.mjs'
import iseobj from './iseobj.mjs'
import getltdtkeys from './getltdtkeys.mjs'
import ltdtkeys2mat from './ltdtkeys2mat.mjs'


/**
 * keys轉heads，物件陣列ltdt使用keys取值，兩者合併轉出二維陣列mat
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/ltdtkeysheads2mat.test.mjs Github}
 * @memberOf wsemi
 * @param {Array} ltdt 輸入物件陣列
 * @param {Array} [keys=[]] 輸入字串陣列，若不輸入則由ltdt提取，預設[]
 * @param {Object} [kphead={}] 輸入字典物件，內含keys對應values之物件，供keys查詢得values，若不輸入則由keys提取，預設為{}
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Boolean} [opt.returnWithStateAndMsg=false] 輸入是否回傳含狀態與訊息物件布林值，若為true則回傳{ state, msg }物件，state為'success'或'error'，msg於success時為回傳結果、於error時為錯誤訊息字串，預設false
 * @returns {Array|Object} 回傳資料陣列，ltdt無效或任一元素非有效物件時回傳空陣列；若opt.returnWithStateAndMsg為true則回傳{ state, msg }物件
 * @example
 *
 * console.log(ltdtkeysheads2mat([{ a: 12, b: 34.56 }, { a: '123', b: 'xyz' }], ['a', 'b'], { a: 'c1', b: 'c2' }))
 * // => [['c1', 'c2'], [12, 34.56], ['123', 'xyz']]
 *
 */
function ltdtkeysheads2mat(ltdt, keys = [], kphead = {}, opt = {}) {

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

    //check, 原碼兩種失敗皆回[], 與「本就轉出空陣列」無從分辨
    if (!isearr(ltdt)) {
        return retError('invalid ltdt')
    }

    //keys
    if (!isearr(keys)) {
        keys = getltdtkeys(ltdt)
    }

    //kphead
    if (!iseobj(kphead)) {
        kphead = {}
        each(keys, (v) => {
            kphead[v] = v
        })
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

    //h
    let h = map(keys, function(key) {
        return get(kphead, key)
    })

    //m, 內部一律以returnWithStateAndMsg取狀態, 判識後才把結果交給下一步, 錯誤訊息前置來源函數名以利分辨是哪一步出錯
    let rm = ltdtkeys2mat(ltdt, keys, { returnWithStateAndMsg: true })
    if (rm.state === 'error') {
        return retError(`ltdtkeys2mat: ${rm.msg}`)
    }
    let m = rm.msg

    //mat
    let mat = concat([h], m)

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


export default ltdtkeysheads2mat
