import fs from 'fs'
import path from 'path'
import { pathToFileURL } from 'url'
import isfun from './isfun.mjs'
import chkFsPath from './_chkFsPath.mjs'
import { fsErrCode, fsErrSan } from './_fsErrMsg.mjs'


//載入目標檔時之Node原生錯誤: 帶錯誤碼之真Error, 且碼為Node內部錯誤碼(ERR_起頭, 如ERR_MODULE_NOT_FOUND)或為系統錯誤(帶syscall, 如ENOENT); 目標檔頂層求值時自拋之錯誤(自訂之code如'ECONFIG')不是, 原樣向外
function isNodeNativeErr(err) {
    try {
        let c = fsErrCode(err)
        return c !== null && (c.startsWith('ERR_') || typeof err.syscall === 'string')
    }
    catch (e) {
        return false
    }
}


/**
 * 後端nodejs動態載入並執行指定mjs檔之default匯出函數
 *
 * 該mjs須export default一個函數(可為async或sync)，opt將整包傳入該函數作為其輸入參數，並回傳該函數之執行結果
 *
 * fpJsCode為相對於專案根(process.cwd())之路徑字串，例如'./d06_p1Factors/genP1Factors_rp.mjs'，因觸發腳本由專案根執行故cwd即為專案根，path.resolve(fpJsCode)以cwd為基準解析成絕對路徑。Windows下動態import絕對路徑須轉file:// URL(否則'd:'被當成protocol而擲ERR_UNSUPPORTED_ESM_URL_SCHEME)，內部已用pathToFileURL處理
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/execJsCode.test.mjs Github}
 * @memberOf wsemi
 * @param {String} fpJsCode 輸入待執行mjs檔之路徑字串，相對於專案根(process.cwd())解析。必須參數，須為非空之原始字串且不含NUL字元(undefined、null、數字、布林、物件、陣列、函數、包裝字串、空字串皆無效，不轉型)，無效時於載入任何檔案之前reject固定訊息之Error'invalid fpJsCode: must be a non-empty string'或'invalid fpJsCode: must not contain a NUL character'(不含路徑之值，與「檔案不存在」分開)；路徑不是既存之檔案時reject'invalid fpJsCode: must be an existing file'；目標檔之default匯出不是函數時reject'invalid fpJsCode: must be a module whose default export is a function'；載入目標檔時之Node原生錯誤(帶錯誤碼且碼為ERR_起頭之Node內部錯誤碼或帶syscall之系統錯誤者，如目標檔所依賴之模組不存在ERR_MODULE_NOT_FOUND)改為固定詞彙加錯誤碼'operation failed (code ERR_MODULE_NOT_FOUND)'(其message帶出路徑，保留code)，其餘(如目標檔之語法錯誤、目標檔頂層求值時自拋之自訂錯誤碼之錯誤)原樣向外
 * @param {Object} [opt={}] 輸入設定物件，預設{}。整份原樣交給目標mjs之default函數作為其輸入參數(同一個物件、不複製、不檢測、不改寫)，逐鍵由目標函數自行處置(V8轉傳之鍵由下游檢)，故null、字串、陣列等亦原樣傳入，只有undefined取預設{}
 * @returns {Promise} 回傳Promise，resolve回傳目標mjs之default函數執行結果，reject為Error：參數無效、檔案不存在、無default匯出為上述固定訊息，載入錯誤見fpJsCode，目標函數內部拋出之錯誤原樣向外傳遞(不經本函數處置)；本函數不同步拋錯
 * @example
 * //need test in nodejs
 *
 * //假設有檔案 ./myCode.mjs 內容為:
 * //   async function run(opt) {
 * //       return { sum: opt.a + opt.b }
 * //   }
 * //   export default run
 *
 * if (true) {
 *     let r = await execJsCode('./myCode.mjs', { a: 3, b: 4 })
 *     console.log(r)
 *     // => { sum: 7 }
 * }
 *
 * if (true) {
 *     execJsCode('./myCode.mjs', { a: 1, b: 2 })
 *         .then(function(data) {
 *             console.log('then', data)
 *             // => then { sum: 3 }
 *         })
 *         .catch(function(err) {
 *             console.log('catch', err)
 *         })
 * }
 *
 */
async function execJsCode(fpJsCode, opt = {}) {

    //check fpJsCode, 必須參數(R-EXEC-ARG-01): 非空之原始字串且不含NUL, 不轉型, 無效以固定訊息拒絕(同R-FS-INVALID-PATH-01, 不含路徑之值), 先於載入任何檔案(V17); async函數故為reject不同步拋錯
    let msg = chkFsPath(fpJsCode, 'fpJsCode')
    if (msg !== null) {
        throw new Error(msg)
    }

    //轉絕對路徑
    fpJsCode = path.resolve(fpJsCode)

    //檔案不存在與參數無效分開: 路徑須為既存之檔案(跟隨連結), 否則固定訊息(不含路徑之值); 先於載入, 目標檔所依賴之模組不存在者另由下方載入之錯誤回報
    let bFile = false
    try {
        bFile = fs.statSync(fpJsCode).isFile()
    }
    catch (err) {
        bFile = false
    }
    if (!bFile) {
        throw new Error('invalid fpJsCode: must be an existing file')
    }

    //func, 使用動態import(Windows 須 pathToFileURL); 載入錯誤之Node原生錯誤(帶錯誤碼者)訊息含路徑, 改固定詞彙加錯誤碼(V20, 同fs家族之W-23作法)
    let mod = null
    try {
        mod = await import(pathToFileURL(fpJsCode).href)
    }
    catch (err) {
        throw isNodeNativeErr(err) ? fsErrSan(err) : err
    }
    let func = mod.default

    //check, 目標檔須 export default 一個函數
    if (!isfun(func)) {
        throw new Error('invalid fpJsCode: must be a module whose default export is a function')
    }

    //執行
    let r = await func(opt)

    return r
}


export default execJsCode
