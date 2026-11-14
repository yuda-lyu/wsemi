import each from 'lodash-es/each.js'
import reverse from 'lodash-es/reverse.js'
import size from 'lodash-es/size.js'
import range from 'lodash-es/range.js'
import isEqual from 'lodash-es/isEqual.js'
import get from 'lodash-es/get.js'
import isbol from './isbol.mjs'
import isearr from './isearr.mjs'
import isarr from './isarr.mjs'
import isobj from './isobj.mjs'
import iseobj from './iseobj.mjs'
import arrHas from './arrHas.mjs'
import getltdtkeys from './getltdtkeys.mjs'
import _setOwnKey from './_setOwnKey.mjs'


//MSG_CELL, 儲存格不合{ value, style }格式之錯誤訊息(使用者2026-11-14裁定之固定訊息)
let MSG_CELL = 'invalid ltdt, every row must have a cell {value, style} for every column'


/**
 * 由物件陣列ltdt轉陣列vrtable(使用value,style,rowspan儲存)
 *
 * 輸入格式：ltdt每列為物件，每欄之值為儲存格物件{ value, style }，value為必要，style可省略(預設{})；全部列之欄位(各列自有可列舉鍵之聯集)每列皆須有，任一列缺任一欄、儲存格非物件(單純值、字串等)、儲存格為null或缺value時判為輸入無效
 * 輸出格式：每列每欄之儲存格固定為{ value, style, rowspan }，style與輸入共用(不複製；省略者為新的{})；mergerowkeys所列之欄依值相等(lodash isEqual)合併連續列，空白值('')之連續格亦合併，各欄獨立合併(不受前一欄分組之限制)，被合併之首格rowspan為合併列數、其餘格為null，未合併之格為1
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/ltdt2vrtsable.test.mjs Github}
 * @memberOf wsemi
 * @param {Array} ltdt 輸入物件陣列
 * @param {Array} [mergerowkeys=[]] 輸入需合併列的關鍵字keys，為字串陣列，預設為空陣列
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Boolean} [opt.returnWithStateAndMsg=false] 輸入是否回傳含狀態與訊息物件布林值，若為true則回傳{ state, msg }物件，state為'success'或'error'，msg於success時為回傳結果、於error時為錯誤訊息字串，預設false
 * @returns {Array|Object} 回傳物件陣列，ltdt為空陣列(合法資料)、ltdt或mergerowkeys無效、ltdt任一元素非有效物件、或儲存格不合{ value, style }格式時回傳空陣列；若opt.returnWithStateAndMsg為true則回傳{ state, msg }物件，ltdt為空陣列(且mergerowkeys有效)時為{ state: 'success', msg: [] }，ltdt或mergerowkeys無效、或ltdt任一元素非有效物件時為{ state: 'error', msg }，儲存格不合格式時為{ state: 'error', msg: 'invalid ltdt, every row must have a cell {value, style} for every column' }
 * 失敗之辨識：預設模式於本函數所偵測之失敗(輸入無效或轉換失敗)時不拋錯而回傳空陣列[]，而空陣列[]亦為合法輸入之結果(如ltdt2vrtsable([]))，故不可由回傳值判斷成敗；須辨識失敗時請設opt.returnWithStateAndMsg為true，以回傳之state === 'error'判定(msg為錯誤訊息)
 * @example
 *
 * console.log(ltdt2vrtsable([{"a":{"value":"123","style":{}},"b":{"value":34.56,"style":{}}},{"a":{"value":"123","style":{}},"b":{"value":"xyz","style":{}}}], ['a']))
 * // => [{"a":{"value":"123","style":{},"rowspan":2},"b":{"value":34.56,"style":{},"rowspan":1}},{"a":{"value":"123","style":{},"rowspan":null},"b":{"value":"xyz","style":{},"rowspan":1}}]
 *
 * console.log(ltdt2vrtsable([{ a: { value: 'x' } }, { a: { value: 'x' } }], ['a']))
 * // => [{"a":{"value":"x","style":{},"rowspan":2}},{"a":{"value":"x","style":{},"rowspan":null}}] (style可省略, 預設{})
 *
 * console.log(ltdt2vrtsable([{ a: { value: 1 }, b: { value: 2 } }, { a: { value: 1 } }], ['a'], { returnWithStateAndMsg: true }))
 * // => { state: 'error', msg: 'invalid ltdt, every row must have a cell {value, style} for every column' } (第2列缺欄b)
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

    //ws, 轉為正規化陣列; 每列每欄須為{ value, style }之儲存格(value必要、style可省略預設{}), 任一列缺任一欄、格非物件(單純值、字串)或為null即判輸入無效(使用者2026-11-14, 第430項第二批: 原直接讀r[key].value, 缺欄或null格拋原生TypeError, 狀態模式亦然)
    let ws = []
    for (let i = 0; i < ltdt.length; i++) {
        let r = ltdt[i]
        let item = {}
        for (let key of tabkeys) {
            if (!Object.prototype.propertyIsEnumerable.call(r, key)) {
                return retError(MSG_CELL)
            }
            let cell = r[key]
            if (!isobj(cell) || !Object.prototype.propertyIsEnumerable.call(cell, 'value')) {
                return retError(MSG_CELL)
            }
            let style = Object.prototype.propertyIsEnumerable.call(cell, 'style') ? cell.style : undefined //只取自有可列舉之style(外審agy-hydrogen T5)
            if (style === undefined) {
                style = {} //style可省略, 預設{}(每格一個新物件)
            }
            _setOwnKey(item, key, {
                value: cell.value, //使用value屬性
                style, //使用style屬性, 與輸入共用
                rowspan: 1, //全表儲存格預設1
            })
        }
        ws.push(item)
    }

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
