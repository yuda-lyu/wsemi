import fs from 'fs'
import fsDeleteFolderSafeCore from './fsDeleteFolderSafeCore.mjs'


/**
 * 後端nodejs刪除資料夾，支援失敗重試機制
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsDeleteFolderSafe.test.mjs Github}
 * @memberOf wsemi
 * @param {String} pah 輸入欲刪除資料夾路徑字串
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Integer} [opt.numRetry=5] 輸入嘗試刪除次數整數，預設5
 * @returns {Promise} 回傳Promise，resolve回傳成功訊息，reject回傳錯誤訊息
 * @example
 * need test in nodejs.
 *
 * let test = async () => {
 *
 *     let ms = []
 *
 *     let fdt = './_test_fsDeleteFolderSafe'
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
 *     await fsDeleteFolderSafe(fdt)
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
 * // rfl { success: 'done: ./_test_fsDeleteFolderSafe/abc/abc.txt' }
 * // rfd { success: 'done: ./_test_fsDeleteFolderSafe/def/mno' }
 * // fsIsFile(before) true
 * // fsIsFolder(before) true
 * // fsIsFile(after) false
 * // fsIsFolder(after) false
 * // ms [
 * //   {
 * //     'fsCreateFile(before)': { success: 'done: ./_test_fsDeleteFolderSafe/abc/abc.txt' }
 * //   },
 * //   {
 * //     'fsCreateFolder(before)': { success: 'done: ./_test_fsDeleteFolderSafe/def/mno' }
 * //   },
 * //   { 'fsIsFile(before)': true },
 * //   { 'fsIsFolder(before)': true },
 * //   { 'fsIsFile(after)': false },
 * //   { 'fsIsFolder(after)': false }
 * // ]
 *
 */
async function fsDeleteFolderSafe(pah, opt = {}) {
    return await fsDeleteFolderSafeCore(pah, { fs, ...opt })
}


export default fsDeleteFolderSafe
