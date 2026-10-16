import fs from 'fs'
import fsDeleteFileSafeCore from './fsDeleteFileSafeCore.mjs'
import errToStr from './_errToStr.mjs'


/**
 * 後端nodejs刪除檔案，支援失敗重試機制
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsDeleteFileSafe.test.mjs Github}
 * @memberOf wsemi
 * @param {String} pah 輸入路徑字串
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Object} [opt.fs=null] 輸入設定物件，預設null
 * @param {Integer} [opt.numRetry=5] 輸入嘗試刪除次數整數，預設5
 * @returns {Promise} 回傳Promise，resolve回傳成功訊息，reject回傳錯誤訊息字串(含重試耗盡仍被占用)
 * @example
 * need test in nodejs.
 *
 * let test = async () => {
 *
 *     let ms = []
 *
 *     let fdt = './_test_fsDeleteFileSafe'
 *
 *     fsCreateFolder(fdt) //創建臨時任務資料夾
 *
 *     let fn = 'abc.txt'
 *     let fp = `${fdt}/${fn}`
 *
 *     fsCreateFile(fp, 'abc', { encoding: 'utf8' })
 *
 *     let b1 = fsIsFile(fp)
 *     console.log('fsDeleteFileSafe(before)', b1)
 *     ms.push({ 'fsDeleteFileSafe(before)': b1 })
 *
 *     await fsDeleteFileSafe(fp)
 *
 *     let b2 = fsIsFile(fp)
 *     console.log('fsDeleteFileSafe(after)', b2)
 *     ms.push({ 'fsDeleteFileSafe(after)': b2 })
 *
 *     fsDeleteFolder(fdt) //刪除臨時任務資料夾
 *
 *     console.log('ms', ms)
 *     return ms
 * }
 * test()
 * // fsDeleteFileSafe(before) true
 * // fsDeleteFileSafe(after) false
 * // ms [ { 'fsDeleteFileSafe(before)': true }, { 'fsDeleteFileSafe(after)': false } ]
 *
 */
async function fsDeleteFileSafe(pah, opt = {}) {

    //o, 展開置於try內: opt本身或其屬性不可讀(getter拋錯、已撤銷之Proxy)時展開即拋出, 於async函數內未捕捉即以Error物件reject
    let o = null
    try {
        o = { fs, ...opt }
    }
    catch (err) {
        return Promise.reject(errToStr(err))
    }

    return await fsDeleteFileSafeCore(pah, o)
}


export default fsDeleteFileSafe
