import get from 'lodash-es/get.js'
import diagIfAsked from './_diagIfAsked.mjs'
import realErrorToStr from './_realErrorToStr.mjs'
import cv from './_jsonType.mjs'
import isbol from './isbol.mjs'
import isundefined from './isundefined.mjs'
import isstr from './isstr.mjs'
import isarr from './isarr.mjs'
import pickOpt from './_pickOpt.mjs'


/**
 * 任意資料轉字串，可支援內含Uint8Array與Uint16Array數據
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/obj2str.test.mjs Github}
 * @memberOf wsemi
 * @param {*} data 輸入任意資料，為undefined時回傳空字串；其中之真Error(含子類別)轉為'名稱: 訊息'字串，同obj2stru8arr
 * @param {String|Array} [ext='Uint8Array'] 輸入擴充數據種類字串或陣列，非字串亦非陣列時回退為'Uint8Array'，預設'Uint8Array'
 * @param {Object} [opt={}] 輸入設定物件，讀取拋錯(已撤銷之Proxy、存取器拋錯)者視為未給，預設{}
 * @param {Boolean} [opt.returnWithStateAndMsg=false] 輸入是否回傳含狀態與訊息物件布林值，若為true則回傳{ state, msg }物件，state為'success'或'error'，msg於success時為回傳結果、於error時為錯誤訊息字串(序列化失敗為固定訊息'invalid data: must be serializable to JSON'，不含原生錯誤之文字)，預設false
 * @param {Boolean} [opt.logDetail=false] 輸入序列化失敗時是否輸出遮罩後之細節布林值(經getDiag之出口)，須為true才生效，預設false(靜默)
 * @param {Function} [opt.funLog=null] 輸入序列化失敗時之診斷輸出函數，格式為(label, safe, detail)=>{}，給予時診斷交給它(label為'[wsemi obj2str] can not serialize')，同getDiag，預設null
 * @returns {String|Object} 回傳轉換後字串，data為undefined或無法轉為JSON時回傳空字串；若opt.returnWithStateAndMsg為true則回傳{ state, msg }物件
 * 失敗之辨識：預設模式於本函數所偵測之失敗(輸入無效或轉換失敗)時不拋錯而回傳空字串''；須可靠辨識失敗時請設opt.returnWithStateAndMsg為true，以回傳之state === 'error'判定(只涵蓋本函數所偵測之失敗，msg為錯誤訊息)
 * @example
 *
 * let o = {
 *     a: 'abc',
 *     b: 12.3,
 *     u8a: new Uint8Array([66, 97, 115]),
 *     u16a: new Uint16Array([11, 79, 6]),
 * }
 * console.log(obj2str(o))
 * // => '{"a":"abc","b":12.3,"u8a":"[Uint8Array]::QmFz","u16a":{"0":11,"1":79,"2":6}}'
 *
 * console.log(obj2str(o, ['Uint8Array', 'Uint16Array']}))
 * // => '{"a":"abc","b":12.3,"u8a":"[Uint8Array]::QmFz","u16a":"[Uint16Array]::CwBPAAYA"}'
 *
 */
function obj2str(data, ext = 'Uint8Array', opt = {}) {

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
            return ''
        }
    }

    //check
    if (isundefined(data)) {
        return retError('invalid data: must not be undefined')
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

    //replacer
    function replacer(k, v) {

        //真Error(含子類別、DOMException、跨realm之Error、Error之Proxy)轉字串, 其餘(含恰帶字串name與message之一般資料類別)照一般物件序列化, 同obj2stru8arr
        //  toString為Object預設者或無可呼叫之toString者(如以null為原型)以Error.prototype.toString之語意('名稱: 訊息'), 見_realErrorToStr
        //  須先於escape, 轉出之字串若恰與標記同形亦須被跳脫
        v = realErrorToStr(v)

        //escape, 須先於二進位轉換套用, 否則剛產生之標記字串會被再次跳脫; 只對字串生效故二進位不受影響
        v = cv.escape(v)

        if (ext.indexOf('Uint8Array') >= 0) {
            v = cv.u8arr2b64(v)
        }
        if (ext.indexOf('Uint16Array') >= 0) {
            v = cv.u16arr2b64(v)
        }
        return v
    }

    //s, 序列化失敗(如含BigInt、循環參照)原為catch吞掉回'', 與「本就轉出空字串」無從分辨
    let s = ''
    try {
        s = JSON.stringify(data, replacer)
    }
    catch (err) {
        //try內會執行呼叫端之toJSON、getter與Proxy陷阱, 可拋出任意值(含null、無原型物件); 原生訊息帶輸入內容(循環參照之構造器名與屬性名、toJSON所拋之文字), 故回固定訊息(V19、V20), 細節經opt之診斷出口(預設靜默)
        diagIfAsked(opt, '[wsemi obj2str] can not serialize', err)
        return retError('invalid data: must be serializable to JSON')
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


export default obj2str
