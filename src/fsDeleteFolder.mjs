import fs from 'fs'
import fsDeleteFolderCore from './fsDeleteFolderCore.mjs'


/**
 * 後端nodejs刪除資料夾
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsDeleteFolder.test.mjs Github}
 * @memberOf wsemi
 * @param {String} pah 輸入欲刪除資料夾路徑字串
 * @returns {Object} 回傳結果物件，提供鍵success代表成功訊息，提供鍵error代表錯誤訊息
 * @example
 * need test in nodejs.
 *
 * let test = () => {
 *
 *     let ms = []
 *
 *     let fdt = './_test_fsDeleteFolder'
 *
 *     fsCreateFolder(fdt) //創建臨時任務資料夾
 *
 *     let rfl = fsCreateFile(`${fdt}/abc/abc.txt`, 'abc', { encoding: 'utf8' })
 *     console.log('rfl', rfl)
 *     ms.push({ 'fsCreateFile(before)': rfl })
 *
 *     let rfd = fsCreateFolder(`${fdt}/def/mno`)
 *     console.log('rfd', rfd)
 *     ms.push({ 'fsCreateFolder(before)': rfd })
 *
 *     let b1 = fsIsFile(`${fdt}/abc/abc.txt`)
 *     console.log('fsIsFile(before)', b1)
 *     ms.push({ 'fsIsFile(before)': b1 })
 *
 *     let b2 = fsIsFolder(`${fdt}/def/mno`)
 *     console.log('fsIsFolder(before)', b2)
 *     ms.push({ 'fsIsFolder(before)': b2 })
 *
 *     fsDeleteFolder(fdt)
 *
 *     let b3 = fsIsFile(`${fdt}/abc/abc.txt`)
 *     console.log('fsIsFile(after)', b3)
 *     ms.push({ 'fsIsFile(after)': b3 })
 *
 *     let b4 = fsIsFolder(`${fdt}/def/mno`)
 *     console.log('fsIsFolder(after)', b4)
 *     ms.push({ 'fsIsFolder(after)': b4 })
 *
 *     console.log('ms', ms)
 *     return ms
 * }
 * test()
 * // rfl { success: 'done: ./_test_fsDeleteFolder/abc/abc.txt' }
 * // rfd { success: 'done: ./_test_fsDeleteFolder/def/mno' }
 * // fsIsFile(before) true
 * // fsIsFolder(before) true
 * // fsIsFile(after) false
 * // fsIsFolder(after) false
 * // ms [
 * //   {
 * //     'fsCreateFile(before)': { success: 'done: ./_test_fsDeleteFolder/abc/abc.txt' }
 * //   },
 * //   {
 * //     'fsCreateFolder(before)': { success: 'done: ./_test_fsDeleteFolder/def/mno' }
 * //   },
 * //   { 'fsIsFile(before)': true },
 * //   { 'fsIsFolder(before)': true },
 * //   { 'fsIsFile(after)': false },
 * //   { 'fsIsFolder(after)': false }
 * // ]
 *
 */
function fsDeleteFolder(pah) {
    return fsDeleteFolderCore(pah, { fs })
}


export default fsDeleteFolder
