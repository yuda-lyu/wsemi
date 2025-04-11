import fs from 'fs'
import fsCreateFileCore from './fsCreateFileCore.mjs'


/**
 * 後端nodejs建立檔案
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsCreateFile.test.mjs Github}
 * @memberOf wsemi
 * @param {String} pah 輸入檔案路徑字串
 * @param {Buffer|TypedArray|DataView} data 輸入檔案內容資料
 * @param {Object|String} [opt={}] 輸入寫入設定物件或字串，可給予writeFileSync設定物件，或是編碼字串(例如'utf8')，預設{}
 * @param {String} [opt.encoding='utf8'] 輸入編碼字串，預設'utf8'
 * @param {Integer} [opt.mode=0o666] 輸入寫入模式數字，預設0o666
 * @param {String} [opt.flag='w'] 輸入寫入標誌字串，預設'w'
 * @returns {Object} 回傳結果物件，提供鍵success代表成功訊息，提供鍵error代表錯誤訊息
 * @example
 * need test in nodejs.
 *
 * let test = () => {
 *
 *     let ms = []
 *
 *     let fdt = './_test_fsCreateFile'
 *     fsCreateFolder(fdt) //創建臨時任務資料夾
 *
 *     let fn = 't1.txt'
 *     let fp = `${fdt}/abc/${fn}`
 *
 *     let b1 = fsIsFile(fp)
 *     console.log('fsCreateFile(before)', b1)
 *     ms.push({ 'fsCreateFile(before)': b1 })
 *
 *     let b2 = fsCreateFile(fp, 'abc', { encoding: 'utf8' })
 *     console.log('fsCreateFile', b2)
 *     ms.push({ 'fsCreateFile': b2 })
 *
 *     let b3 = fsIsFile(fp)
 *     console.log('fsCreateFile(after)', b3)
 *     ms.push({ 'fsCreateFile(after)': b3 })
 *
 *     let c = fs.readFileSync(fp, 'utf8')
 *     console.log('readFileSync', c)
 *     ms.push({ 'readFileSync': c })
 *
 *     fsDeleteFolder(fdt) //刪除臨時任務資料夾
 *
 *     console.log('ms', ms)
 *     return ms
 * }
 * test()
 * // fsCreateFile(before) false
 * // fsCreateFile { success: 'done: ./_test_fsCreateFile/abc/t1.txt' }
 * // fsCreateFile(after) true
 * // readFileSync abc
 * // ms [
 * //   { 'fsCreateFile(before)': false },
 * //   { fsCreateFile: { success: 'done: ./_test_fsCreateFile/abc/t1.txt' } },
 * //   { 'fsCreateFile(after)': true },
 * //   { readFileSync: 'abc' }
 * // ]
 *
 */
function fsCreateFile(pah, data, opt = {}) {
    return fsCreateFileCore(pah, data, { fs, ...opt })
}


export default fsCreateFile
