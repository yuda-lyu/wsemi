import get from 'lodash-es/get.js'
import errToStr from './_errToStr.mjs'
import isbol from './isbol.mjs'
import isu8arr from './isu8arr.mjs'
import getBufferSize from './getBufferSize.mjs'
import bufReadDbl from './bufReadDbl.mjs'
import u8arr2str from './u8arr2str.mjs'
import stru8arr2obj from './stru8arr2obj.mjs'


//checkLenHead, 檢查封包標頭記載之分塊資訊區長度, 回傳不符原因字串, 符合則回傳空字串
//取自封包標頭(網路/檔案來源, 不可信), 須為非負整數且不逾封包資料區之位元組數: 小數與負數經slice被靜默截斷或自尾端算而得同一分割(非正規編碼), NaN與Infinity亦然
function checkLenHead(lenHead, size) {
    if (!Number.isInteger(lenHead) || lenHead < 0 || lenHead > size) {
        return 'head length must be a non-negative integer not exceeding the packet'
    }
    return ''
}


//checkPks, 檢查分塊資訊, 回傳不符原因字串, 全符合則回傳空字串
//分塊資訊取自封包標頭(網路/檔案來源, 不可信), 須在迭代與配置記憶體前驗證(R-OBJ-ITER-01規則6), 否則偽造{"length":N}會使迭代依N次並逐次配置Uint8Array
//  1. 須為真陣列(Array.isArray), 帶length鍵之物件或字串等不得依其length迭代
//  2. 各項須為非負有限整數(Number.isInteger擋小數、字串、null、Infinity等, 1e999經JSON.parse為Infinity)
//  3. 累計總量不得逾各分塊區(封包標頭之後)之位元組數, 邊累加邊比對, 超過即停止
//  4. 分塊數量須與主區塊可容納之二進位標記數相符(見下)
function checkPks(inds, size) {
    if (!Array.isArray(inds)) {
        return 'not an array'
    }
    for (let k = 0; k < inds.length; k++) {
        let n = inds[k]
        if (!Number.isInteger(n) || n < 0) {
            return 'every item must be a non-negative finite integer'
        }
    }
    let sum = 0
    for (let k = 0; k < inds.length; k++) {
        sum += inds[k]
        if (sum > size) {
            return 'total length exceeds the packet'
        }
    }
    //  4. 分塊數量: 首個分塊為主區塊(results文字), 其後每個分塊在主區塊內必有一個二進位標記字串(JSON字串形式至少25位元組, 如"[BlazeForUint8Array]::0"),
    //     故分塊數(扣除主區塊)乘25不得逾主區塊長度; 否則大量零長度或1位元組分塊(標頭每項約2位元組)會各配置一個Uint8Array而放大配置量(約為封包位元組數之百倍堆積)
    if (inds.length > 1 && (inds.length - 1) * 25 > inds[0]) {
        return 'too many chunks for the main block'
    }
    return ''
}


//sliceU8arr, 依各分塊長度切出各分塊, inds須已通過checkPks
function sliceU8arr(u8a, inds) {
    let i = 0
    let j = 0
    let r = []
    for (let k = 0; k < inds.length; k++) {
        j = i + inds[k]
        let t = u8a.slice(i, j)
        i = j
        r.push(t)
    }
    return r
}


/**
 * Uint8Array轉物件或陣列資料
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/u8arr2obj.test.mjs Github}
 * @memberOf wsemi
 * @param {Uint8Array} u8a 輸入Uint8Array
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Boolean} [opt.returnWithStateAndMsg=false] 輸入是否回傳含狀態與訊息物件布林值，若為true則回傳{ state, msg }物件，state為'success'或'error'，msg於success時為回傳結果、於error時為錯誤訊息字串，預設false
 * @returns {Object|Array} 回傳物件或陣列資料，其內二進位數據依標記所記之原型別還原，Uint8Array、Uint16Array、ArrayBuffer皆原型別原數值返回；輸入非Uint8Array或封包損毀時回傳空物件，封包標頭記載之分塊資訊區長度非非負整數或逾封包資料區長度(含封包短於8位元組)、分塊資訊非真陣列、含非負有限整數以外之項、總量逾封包長度、或分塊數量逾主區塊可容納之二進位標記數(每個分塊在主區塊內至少有一個25位元組之標記)亦視為損毀(msg為'invalid pks, <原因>')；同一二進位索引被引用多次亦視為損毀；若opt.returnWithStateAndMsg為true則回傳{ state, msg }物件
 * @example
 *
 * let u8a = new Uint8Array([
 *     64, 24, 0, 0, 0, 0, 0, 0, 91, 54, 54, 44,
 *     51, 93, 123, 34, 97, 34, 58, 91, 49, 50, 51, 44,
 *     52, 53, 46, 54, 55, 44, 34, 116, 101, 115, 116, 228,
 *     184, 173, 230, 150, 135, 34, 93, 44, 34, 98, 34, 58,
 *     123, 34, 99, 34, 58, 34, 91, 66, 108, 97, 122, 101,
 *     70, 111, 114, 85, 105, 110, 116, 56, 65, 114, 114, 97,
 *     121, 93, 58, 58, 48, 34, 125, 125, 66, 97, 115
 * ])
 * let data = u8arr2obj(u8a)
 * console.log(data)
 * // => { a: [ 123, 45.67, 'test中文' ], b: { c: Uint8Array [ 66, 97, 115 ] } }
 *
 * console.log(u8arr2obj(new Uint8Array([1, 2, 3]), { returnWithStateAndMsg: true }))
 * // => {
 * //     state: 'error',
 * //     msg: 'invalid pks, head length must be a non-negative integer not exceeding the packet'
 * // }
 *
 */
function u8arr2obj(u8a, opt = {}) {
    let data = {}

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
            return {}
        }
    }

    //check
    if (!isu8arr(u8a)) {
        return retError('invalid u8a')
    }

    try {

        //bHead, bOthers
        let ibHead = 8 //預設用開頭8 bytes來儲存分塊資訊區之長度
        let bHead = u8a.slice(0, ibHead) //分塊資訊區長度之二進位數據(Uint8Array)
        let bOthers = u8a.slice(ibHead, getBufferSize(u8a)) //其他之二進位數據(Uint8Array)

        //lenHead
        let lenHead = bufReadDbl(bHead) //讀取分塊資訊區長度
        let errHead = checkLenHead(lenHead, getBufferSize(bOthers)) //來自封包(不可信), 須先驗證才可用於切分
        if (errHead !== '') {
            return retError(`invalid pks, ${errHead}`)
        }
        let bvPks = bOthers.slice(0, lenHead) //分塊資訊區之二進位數據(Uint8Array)
        let bbPks = bOthers.slice(lenHead, getBufferSize(bOthers)) //各分塊區之二進位數據(Uint8Array)

        //vPks, 內部各轉換函數一律以returnWithStateAndMsg取狀態, 逐一判識後才把結果交給下一步, 錯誤訊息前置來源函數名以利分辨是哪一步出錯
        let rcvPks = u8arr2str(bvPks, { returnWithStateAndMsg: true }) //取得分塊資訊區二進位數據(Uint8Array)內文字
        if (rcvPks.state === 'error') {
            return retError(`u8arr2str: ${rcvPks.msg}`)
        }
        let cvPks = rcvPks.msg
        let vPks = JSON.parse(cvPks) //算得分塊資訊, 應為陣列, 各元素代表各分塊長度, 但來自封包不可信, 須經checkPks驗證

        //check vPks, 須先驗證才可迭代, 不依其內容配置記憶體
        let errPks = checkPks(vPks, getBufferSize(bbPks))
        if (errPks !== '') {
            return retError(`invalid pks, ${errPks}`)
        }

        //bPks
        let bPks = sliceU8arr(bbPks, vPks) //依照各分塊長度切出分各分塊之二進位數據(Uint8Array)

        //results, to sb.results
        let bMain = bPks.shift() //bPks[0], 第1區塊為無Uint8Array序列化字串之二進位數據(Uint8Array)
        let rresults = u8arr2str(bMain, { returnWithStateAndMsg: true }) //取得無Uint8Array序列化字串
        if (rresults.state === 'error') {
            return retError(`u8arr2str: ${rresults.msg}`)
        }
        let results = rresults.msg

        //binarys , to sb.binarys
        let binarys = bPks //others, 其他塊皆為Uint8Array之二進位數據(Uint8Array)

        //data
        let r = stru8arr2obj({ results, binarys }, { returnWithStateAndMsg: true }) //反序列化數據, 由無Uint8Array序列化字串與Uint8Array之二進位數據算得原本資料
        if (r.state === 'error') {
            return retError(`stru8arr2obj: ${r.msg}`)
        }
        data = r.msg

    }
    catch (err) {
        return retError(errToStr(err)) //try內會讀呼叫端之Uint8Array(偽造標籤之物件、覆寫slice者等)可拋出任意值, 不可直接err.toString()
    }

    if (returnWithStateAndMsg) {
        return {
            state: 'success',
            msg: data,
        }
    }
    else {
        return data
    }
}


export default u8arr2obj
