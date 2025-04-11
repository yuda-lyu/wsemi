import path from 'path'
import fs from 'fs'
import fsCleanFolderCore from './fsCleanFolderCore.mjs'


/**
 * 後端nodejs清空資料夾
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsCleanFolder.test.mjs Github}
 * @memberOf wsemi
 * @param {String} pah 輸入欲清空資料夾路徑字串
 * @returns {Object} 回傳結果物件，提供鍵success代表成功訊息，提供鍵error代表錯誤訊息
 * @example
 * need test in nodejs.
 *
 * let test = () => {
 *
 *     let ms = []
 *
 *     let fdt = './_test_fsCleanFolder'
 *     fsCreateFolder(fdt) //創建臨時任務資料夾
 *
 *     fsCreateFolder(`${fdt}/abc1`)
 *     fsCreateFolder(`${fdt}/def1/def2/def3`)
 *     fsCreateFile(`${fdt}/zzz.txt`, 'zzz')
 *     fsCreateFile(`${fdt}/def1/def2/def3/def3.txt`, 'def')
 *
 *     let b1 = fsIsFile(`${fdt}/zzz.txt`)
 *     console.log('fsIsFile1(before)', b1)
 *     ms.push({ 'fsIsFile1(before)': b1 })
 *
 *     let b2 = fsIsFile(`${fdt}/def1/def2/def3/def3.txt`)
 *     console.log('fsIsFile2(before)', b2)
 *     ms.push({ 'fsIsFile2(before)': b2 })
 *
 *     let b3 = fsIsFolder(`${fdt}/abc1`)
 *     console.log('fsIsFolder1(before)', b3)
 *     ms.push({ 'fsIsFolder1(before)': b3 })
 *
 *     let b4 = fsIsFolder(`${fdt}/def1/def2/def3`)
 *     console.log('fsIsFolder2(before)', b4)
 *     ms.push({ 'fsIsFolder2(before)': b4 })
 *
 *     let r = fsCleanFolder(fdt)
 *     ms.push({ 'fsCleanFolder': r })
 *
 *     let b5 = fsIsFile(`${fdt}/zzz.txt`)
 *     console.log('fsIsFile1(after)', b5)
 *     ms.push({ 'fsIsFile1(after)': b5 })
 *
 *     let b6 = fsIsFile(`${fdt}/def1/def2/def3/def3.txt`)
 *     console.log('fsIsFile2(after)', b6)
 *     ms.push({ 'fsIsFile2(after)': b6 })
 *
 *     let b7 = fsIsFolder(`${fdt}/abc1`)
 *     console.log('fsIsFolder1(after)', b7)
 *     ms.push({ 'fsIsFolder1(after)': b7 })
 *
 *     let b8 = fsIsFolder(`${fdt}/def1/def2/def3`)
 *     console.log('fsIsFolder2(after)', b8)
 *     ms.push({ 'fsIsFolder2(after)': b8 })
 *
 *     fsDeleteFolder(fdt) //刪除臨時任務資料夾
 *
 *     console.log('ms', ms)
 *     return ms
 * }
 * test()
 * // fsIsFile1(before) true
 * // fsIsFile2(before) true
 * // fsIsFolder1(before) true
 * // fsIsFolder2(before) true
 * // fsIsFile1(after) false
 * // fsIsFile2(after) false
 * // fsIsFolder1(after) false
 * // fsIsFolder2(after) false
 * // ms [
 * //   { 'fsIsFile1(before)': true },
 * //   { 'fsIsFile2(before)': true },
 * //   { 'fsIsFolder1(before)': true },
 * //   { 'fsIsFolder2(before)': true },
 * //   { fsCleanFolder: { success: 'done: ./_test_fsCleanFolder' } },
 * //   { 'fsIsFile1(after)': false },
 * //   { 'fsIsFile2(after)': false },
 * //   { 'fsIsFolder1(after)': false },
 * //   { 'fsIsFolder2(after)': false }
 * // ]
 *
 */
function fsCleanFolder(pah) {
    return fsCleanFolderCore(pah, { path, fs })
}


export default fsCleanFolder
