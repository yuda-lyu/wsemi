import fs from 'fs'
import fsDeleteFileCore from './fsDeleteFileCore.mjs'


/**
 * 後端nodejs刪除檔案
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsDeleteFile.test.mjs Github}
 * @memberOf wsemi
 * @param {String} pah 輸入路徑字串
 * @returns {Object} 回傳結果物件，提供鍵success代表成功訊息，提供鍵error代表錯誤訊息
 * @example
 * need test in nodejs.
 *
 * let test = () => {
 *
 *     let ms = []
 *
 *     let fdt = './_test_fsDeleteFile'
 *
 *     fsCreateFolder(fdt) //創建臨時任務資料夾
 *
 *     let fn = 'abc.txt'
 *     let fp = `${fdt}/${fn}`
 *
 *     fsCreateFile(fp, 'abc', { encoding: 'utf8' })
 *
 *     let b1 = fsIsFile(fp)
 *     console.log('fsDeleteFile(before)', b1)
 *     ms.push({ 'fsDeleteFile(before)': b1 })
 *
 *     fsDeleteFile(fp)
 *
 *     let b2 = fsIsFile(fp)
 *     console.log('fsDeleteFile(after)', b2)
 *     ms.push({ 'fsDeleteFile(after)': b2 })
 *
 *     fsDeleteFolder(fdt) //刪除臨時任務資料夾
 *
 *     console.log('ms', ms)
 *     return ms
 * }
 * test()
 * // fsDeleteFile(before) true
 * // fsDeleteFile(after) false
 * // ms [ { 'fsDeleteFile(before)': true }, { 'fsDeleteFile(after)': false } ]
 *
 */
function fsDeleteFile(pah) {
    return fsDeleteFileCore(pah, { fs })
}


export default fsDeleteFile
