import each from 'lodash-es/each.js'
import reverse from 'lodash-es/reverse.js'
import size from 'lodash-es/size.js'
import range from 'lodash-es/range.js'
import isEqual from 'lodash-es/isEqual.js'
import get from 'lodash-es/get.js'
import isbol from './isbol.mjs'
import isearr from './isearr.mjs'
import isarr from './isarr.mjs'
import iseobj from './iseobj.mjs'
import arrHas from './arrHas.mjs'
import getltdtkeys from './getltdtkeys.mjs'


/**
 * 由物件陣列ltdt轉陣列vrtable(使用value,style,rowspan儲存)
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/ltdt2vrtsable.test.mjs Github}
 * @memberOf wsemi
 * @param {Array} ltdt 輸入物件陣列
 * @param {Array} [mergerowkeys=[]] 輸入需合併列的關鍵字keys，為字串陣列，預設為空陣列
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Boolean} [opt.returnWithStateAndMsg=false] 輸入是否回傳含狀態與訊息物件布林值，若為true則回傳{ state, msg }物件，state為'success'或'error'，msg於success時為回傳結果、於error時為錯誤訊息字串，預設false
 * @returns {Array|Object} 回傳物件陣列，ltdt為空陣列(合法資料)、ltdt或mergerowkeys無效、或ltdt任一元素非有效物件時回傳空陣列；若opt.returnWithStateAndMsg為true則回傳{ state, msg }物件，ltdt為空陣列(且mergerowkeys有效)時為{ state: 'success', msg: [] }，ltdt或mergerowkeys無效、或ltdt任一元素非有效物件時為{ state: 'error', msg }
 * 失敗之辨識：預設模式於本函數所偵測之失敗(輸入無效或轉換失敗)時不拋錯而回傳空陣列[]，而空陣列[]亦為合法輸入之結果(如ltdt2vrtsable([]))，故不可由回傳值判斷成敗；須辨識失敗時請設opt.returnWithStateAndMsg為true，以回傳之state === 'error'判定(只涵蓋本函數所偵測之失敗，msg為錯誤訊息)；注意：儲存格之值為null等非預期型別時現行實作直接拋出TypeError，預設模式與狀態模式皆同(未經狀態模式，既有行為)
 * @example
 *
 * console.log(ltdt2vrtsable([{"a":{"value":"123","style":{}},"b":{"value":34.56,"style":{}}},{"a":{"value":"123","style":{}},"b":{"value":"xyz","style":{}}}], ['a']))
 * // => [{"a":{"rowspan":2,"value":"123","style":{}},"b":{"rowspan":1,"value":34.56,"style":{}}},{"a":{"rowspan":null,"value":"123","style":{}},"b":{"rowspan":1,"value":"xyz","style":{}}}]
 *
 * console.log(ltdt2vrtsable([], [], { returnWithStateAndMsg: true }))
 * // => { state: 'success', msg: [] } (空陣列為合法資料，不是失敗)
 *
 */
function ltdt2vrtsable(ltdt, mergerowkeys = [], opt = {}) {

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

    //check, 原碼三種失敗皆回[], 與「本就轉出空陣列」無從分辨; ltdt為空陣列是合法資料(非失敗), 但mergerowkeys型別無效仍為失敗(型別檢測與資料有無無關)
    let isEmptyLtdt = isarr(ltdt) && ltdt.length === 0
    if (!isEmptyLtdt && !isearr(ltdt)) {
        return retError('invalid ltdt')
    }
    if (!isarr(mergerowkeys)) {
        return retError('invalid mergerowkeys')
    }

    //空陣列為合法資料, 轉出空陣列(每次新陣列)
    if (isEmptyLtdt) {
        if (returnWithStateAndMsg) {
            return {
                state: 'success',
                msg: [],
            }
        }
        else {
            return []
        }
    }

    //check ltdt
    let b = false
    each(ltdt, function(v) {
        if (!iseobj(v)) {
            b = true
        }
    })
    if (b) {
        return retError('invalid ltdt, every element must be an effective object')
    }

    //tabkeys
    let tabkeys = getltdtkeys(ltdt)

    //ws, 轉為正規化陣列
    let ws = []
    each(ltdt, function(r) {
        let item = {}
        each(tabkeys, function(key) {
            //結構資料, r[key]需有value與style
            item[key] = {
                value: r[key].value, //使用value屬性
                style: r[key].style, //使用style屬性
                rowspan: 1, //全表儲存格預設1
            }
        })
        ws.push(item)
    })

    //計算rowspan
    let qs = reverse(ws) //逆序
    let n = size(qs)
    each(tabkeys, function(key) {
        if (arrHas(key, mergerowkeys)) {
            let veq = range(0, n, 0)
            let veqlast = range(0, n, 0)
            let vsum = range(1, n + 1, 0)
            each(qs, function(r, ind) {
                if (ind > 0) {
                    let v1 = qs[ind - 1][key].value
                    let v0 = qs[ind][key].value
                    if (isEqual(v1, v0)) { //若值等於前面元素
                        veq[ind - 1] = 1 //前面元素標為1
                        veq[ind] = 1 //當前元素標為1
                        vsum[ind] = vsum[ind - 1] + 1 //累計數量, 為日後rowspan
                    }
                    if (veq[ind - 1] === 1 && veq[ind] === 1) { //查找重複元素之最後者
                        veqlast[ind - 1] = 0 //前者元素標回0
                        veqlast[ind] = 1 //當前元素標為1
                    }
                }
            })
            each(qs, function(r, ind) {
                if (veq[ind] === 1) { //屬於有重複元素者
                    if (veqlast[ind] === 1) {
                        qs[ind][key].rowspan = vsum[ind] //最後者設為sum
                    }
                    else {
                        qs[ind][key].rowspan = null //否則都清空為null
                    }
                }
            })
        }
    })
    let tabrows = reverse(qs) //轉回正序

    if (returnWithStateAndMsg) {
        return {
            state: 'success',
            msg: tabrows,
        }
    }
    else {
        return tabrows
    }
}


export default ltdt2vrtsable
