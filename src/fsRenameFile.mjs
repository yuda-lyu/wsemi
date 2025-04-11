import fs from 'fs'
import fsRenameFileCore from './fsRenameFileCore.mjs'


/**
 * 後端nodejs重新命名檔案
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsRenameFile.test.mjs Github}
 * @memberOf wsemi
 * @param {String} pahOld 輸入檔案原本路徑字串
 * @param {String} pahNew 輸入檔案更名路徑字串
 * @returns {Object} 回傳結果物件，提供鍵success代表成功訊息，提供鍵error代表錯誤訊息
 * @example
 * need test in nodejs.
 *
 * let test = () => {
 *
 *     let ms = []
 *
 *     let fdt = './_test_fsRenameFile'
 *     fsCreateFolder(fdt) //創建臨時任務資料夾
 *
 *     let fn = 't1.txt'
 *     let fpSrc = `${fdt}/abc/${fn}`
 *     let fpTar = `${fdt}/def/ijk/${fn}`
 *
 *     fsWriteText(fpSrc, 'xyz')
 *
 *     let b1 = fsIsFile(fpSrc)
 *     console.log('fsRenameFile(src)(before)', b1)
 *     ms.push({ 'fsRenameFile(src)(before)': b1 })
 *
 *     let b2 = fsIsFile(fpTar)
 *     console.log('fsRenameFile(tar)(before)', b2)
 *     ms.push({ 'fsRenameFile(tar)(before)': b2 })
 *
 *     let r = fsRenameFile(fpSrc, fpTar)
 *     console.log('fsRenameFile', r)
 *     ms.push({ 'fsRenameFile': r })
 *
 *     let b3 = fsIsFile(fpSrc)
 *     console.log('fsRenameFile(src)(after)', b3)
 *     ms.push({ 'fsRenameFile(src)(after)': b3 })
 *
 *     let b4 = fsIsFile(fpTar)
 *     console.log('fsRenameFile(tar)(after)', b4)
 *     ms.push({ 'fsRenameFile(tar)(after)': b4 })
 *
 *     fsDeleteFolder(fdt) //刪除臨時任務資料夾
 *
 *     console.log('ms', ms)
 *     return ms
 * }
 * test()
 * // fsRenameFile(src)(before) true
 * // fsRenameFile(tar)(before) false
 * // fsRenameFile { success: 'done: ./_test_fsRenameFile/def/ijk/t1.txt' }
 * // fsRenameFile(src)(after) false
 * // fsRenameFile(tar)(after) true
 * // ms [
 * //   { 'fsRenameFile(src)(before)': true },
 * //   { 'fsRenameFile(tar)(before)': false },
 * //   {
 * //     fsRenameFile: { success: 'done: ./_test_fsRenameFile/def/ijk/t1.txt' }
 * //   },
 * //   { 'fsRenameFile(src)(after)': false },
 * //   { 'fsRenameFile(tar)(after)': true }
 * // ]
 *
 */
function fsRenameFile(pahOld, pahNew) {
    return fsRenameFileCore(pahOld, pahNew, { fs })
}


export default fsRenameFile
