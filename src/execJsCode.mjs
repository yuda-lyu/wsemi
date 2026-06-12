import path from 'path'
import { pathToFileURL } from 'url'
import isfun from './isfun.mjs'


/**
 * 後端nodejs動態載入並執行指定mjs檔之default匯出函數
 *
 * 該mjs須export default一個函數(可為async或sync)，opt將整包傳入該函數作為其輸入參數，並回傳該函數之執行結果
 *
 * fpJsCode為相對於專案根(process.cwd())之路徑字串，例如'./d06_p1Factors/genP1Factors_rp.mjs'，因觸發腳本由專案根執行故cwd即為專案根，path.resolve(fpJsCode)以cwd為基準解析成絕對路徑。Windows下動態import絕對路徑須轉file:// URL(否則'd:'被當成protocol而擲ERR_UNSUPPORTED_ESM_URL_SCHEME)，內部已用pathToFileURL處理
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/execJsCode.test.mjs Github}
 * @memberOf wsemi
 * @param {String} fpJsCode 輸入待執行mjs檔之路徑字串，相對於專案根(process.cwd())解析
 * @param {Object} [opt={}] 輸入設定物件，將整包傳入目標mjs之default函數作為其輸入參數，預設{}
 * @returns {Promise} 回傳Promise，resolve回傳目標mjs之default函數執行結果，reject回傳錯誤訊息(如檔案不存在、無default匯出、或目標函數內部拋錯)
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

    //轉絕對路徑
    fpJsCode = path.resolve(fpJsCode)

    //func, 使用動態import(Windows 須 pathToFileURL)
    let mod = await import(pathToFileURL(fpJsCode).href)
    let func = mod.default

    //check, 目標檔須 export default 一個函數
    if (!isfun(func)) {
        throw new Error(`the default export of [${fpJsCode}] is not a function`)
    }

    //執行
    let r = await func(opt)

    return r
}


export default execJsCode
