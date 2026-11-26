import get from 'lodash-es/get.js'
import diagIfAsked from './_diagIfAsked.mjs'
import cv from './_jsonType.mjs'
import isbol from './isbol.mjs'
import isstr from './isstr.mjs'
import isarr from './isarr.mjs'
import pickOpt from './_pickOpt.mjs'


/**
 * 字串轉任意資料，可支援內含Uint8Array與Uint16Array數據
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/str2obj.test.mjs Github}
 * @memberOf wsemi
 * @param {*} data 輸入任意資料
 * @param {String|Array} [ext='Uint8Array'] 輸入擴充數據種類字串或陣列，非字串亦非陣列時回退為'Uint8Array'，預設'Uint8Array'
 * @param {Object} [opt={}] 輸入設定物件，讀取拋錯(已撤銷之Proxy、存取器拋錯)者視為未給，預設{}
 * @param {Boolean} [opt.returnWithStateAndMsg=false] 輸入是否回傳含狀態與訊息物件布林值，若為true則回傳{ state, msg }物件，state為'success'或'error'，msg於success時為回傳結果、於error時為錯誤訊息字串，預設false
 * @param {Boolean} [opt.logDetail=false] 輸入讀取呼叫端之值或轉換失敗時是否輸出遮罩後之細節布林值(經getDiag之出口)，須為true才生效，狀態模式之msg為固定詞彙(不含呼叫端所拋出之文字)，預設false(靜默)
 * @param {Function} [opt.funLog=null] 輸入讀取呼叫端之值或轉換失敗時之診斷輸出函數，格式為(label, safe, detail)=>{}，給予時診斷交給它(label為'[wsemi str2obj] can not parse'，同getDiag)，預設null
 * @returns {Object} 回傳轉換後資料，data非字串或無法解析為JSON時回傳空物件；若opt.returnWithStateAndMsg為true則回傳{ state, msg }物件
 * 失敗之辨識：預設模式於本函數所偵測之失敗(輸入無效或轉換失敗)時不拋錯而回傳空物件{}，而空物件{}亦為合法輸入之結果(如str2obj('{}'))，故不可由回傳值判斷成敗；須辨識失敗時請設opt.returnWithStateAndMsg為true，以回傳之state === 'error'判定(只涵蓋本函數所偵測之失敗，msg為錯誤訊息)
 * @example
 *
 * console.log(str2obj('{"a":"abc","b":12.3,"u8a":"[Uint8Array]::QmFz","u16a":{"0":11,"1":79,"2":6}}'))
 * // => {
 * // =>   a: 'abc',
 * // =>   b: 12.3,
 * // =>   u8a: Uint8Array [ 66, 97, 115 ],
 * // =>   u16a: { '0': 11, '1': 79, '2': 6 }
 * // => }
 *
 * console.log(str2obj('{"a":"abc","b":12.3,"u8a":"[Uint8Array]::QmFz","u16a":"[Uint16Array]::CwBPAAYA"}', ['Uint8Array', 'Uint16Array']}))
 * // => {
 * // =>   a: 'abc',
 * // =>   b: 12.3,
 * // =>   u8a: Uint8Array [ 66, 97, 115 ],
 * // =>   u16a: Uint16Array [ 11, 79, 6 ]
 * // => }
 *
 */
function str2obj(data, ext = 'Uint8Array', opt = {}) {

    //opt, 取快照: 讀取拋錯(已撤銷之Proxy、getter拋錯、陷阱拋錯)之opt或其鍵視為未給, 不拋錯(C1/K3: 無法轉型回預設值, 不拋錯)
    let optSnap = pickOpt(opt, ['returnWithStateAndMsg'], [])

    //returnWithStateAndMsg
    let returnWithStateAndMsg = get(optSnap, 'returnWithStateAndMsg', null)
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

    //check, 原碼無此檢查, 非字串輸入交JSON.parse後由catch吞掉回{}
    if (!isstr(data)) {
        return retError('invalid data: must be a string')
    }

    //ext, 無效時回退預設值
    //回退值須為陣列而非字串, 以與isstr分支轉出之型別一致, 否則後續ext.indexOf將由陣列比對變為字串子字串搜尋
    if (isstr(ext)) {
        ext = [ext]
    }
    else if (isarr(ext)) {
        //none
    }
    else {
        ext = ['Uint8Array']
    }

    //extBad, 讀呼叫端之ext(元素存取拋錯之陣列、陷阱拋錯之Proxy陣列等)可拋出任意值(含其文字), 不可轉出; 以此旗標與引擎自身之錯誤(如巢狀過深之RangeError)區分
    let extBad = false
    let hasExt = (name) => {
        try {
            return ext.indexOf(name) >= 0
        }
        catch (err) {
            extBad = true
            throw err
        }
    }

    //replacer
    function replacer(k, v) {
        if (hasExt('Uint8Array')) {
            v = cv.b642u8arr(v)
        }
        if (hasExt('Uint16Array')) {
            v = cv.b642u16arr(v)
        }

        //unescape, 須後於二進位還原套用, 已還原為二進位者非字串故不受影響
        v = cv.unescape(v)

        return v
    }

    //s, 解析失敗原為catch吞掉回{}, 與「輸入本就是{}」無從分辨
    let s = {}
    try {
        s = JSON.parse(data, replacer)
    }
    catch (err) {
        //訊息為固定詞彙(V19、V20): SyntaxError之訊息帶輸入片段; replacer讀ext所拋之值可含呼叫端之文字; 細節經opt之診斷出口(預設靜默)
        if (extBad) {
            diagIfAsked(opt, '[wsemi str2obj] can not parse', err)
            return retError('invalid ext: must be a readable array')
        }
        let isSyntax = false
        try {
            isSyntax = err instanceof SyntaxError
        }
        catch (err2) {
            //instanceof對呼叫端拋出之Proxy會觸發其getPrototypeOf陷阱而拋錯, 視為非SyntaxError(不外拋)
        }
        if (!isSyntax) {
            diagIfAsked(opt, '[wsemi str2obj] can not parse', err)
        }
        return retError('invalid data: must be a valid JSON text')
    }

    if (returnWithStateAndMsg) {
        return {
            state: 'success',
            msg: s,
        }
    }
    else {
        return s
    }
}


export default str2obj
