import fs from 'fs'
import fsIsFileCore from './fsIsFileCore.mjs'


/**
 * 後端nodejs判斷是否為檔案
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsIsFile.test.mjs Github}
 * @memberOf wsemi
 * @param {String} pah 輸入路徑字串
 * @returns {Boolean} 回傳是否布林值
 * @example
 * need test in nodejs.
 *
 * let test = () => {
 *
 *     let ms = []
 *
 *     let fdt = './_test_fsIsFile'
 *     fsCreateFolder(fdt) //創建臨時任務資料夾
 *
 *     let fn = 't1.txt'
 *     let fp = `${fdt}/${fn}`
 *
 *     let b1 = fsIsFile(fp)
 *     console.log('fsIsFile(before)', b1)
 *     ms.push({ 'fsIsFile(before)': b1 })
 *
 *     fsCreateFile(fp, 'abc', { encoding: 'utf8' })
 *
 *     let b2 = fsIsFile(fp)
 *     console.log('fsIsFile(after)', b2)
 *     ms.push({ 'fsIsFile(after)': b2 })
 *
 *     fsDeleteFile(fdt)
 *
 *     fsDeleteFolder(fdt) //刪除臨時任務資料夾
 *
 *     console.log('ms', ms)
 *     return ms
 * }
 * test()
 * // fsIsFile(before) false
 * // fsIsFile(after) true
 * // ms [ { 'fsIsFile(before)': false }, { 'fsIsFile(after)': true } ]
 *
 */
function fsIsFile(pah) {
    return fsIsFileCore(pah, { fs })
}


export default fsIsFile
