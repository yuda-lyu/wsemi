import fs from 'fs'
import fsCreateFolderCore from './fsCreateFolderCore.mjs'


/**
 * 後端nodejs建立資料夾
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsCreateFolder.test.mjs Github}
 * @memberOf wsemi
 * @param {String} pah 輸入資料夾路徑字串
 * @returns {Object} 回傳結果物件，提供鍵success代表成功訊息，提供鍵error代表錯誤訊息
 * @example
 * need test in nodejs.
 *
 * let test = () => {
 *
 *     let ms = []
 *
 *     let fdt = './_test_fsCreateFolder'
 *
 *     let b1 = fsIsFolder(fdt)
 *     console.log('fsCreateFolder(before)', b1)
 *     ms.push({ 'fsCreateFolder(before)': b1 })
 *
 *     fsCreateFolder(fdt) //創建臨時任務資料夾
 *
 *     let b2 = fsIsFolder(fdt)
 *     console.log('fsCreateFolder(after)', b2)
 *     ms.push({ 'fsCreateFolder(after)': b2 })
 *
 *     fsDeleteFolder(fdt) //刪除臨時任務資料夾
 *
 *     console.log('ms', ms)
 *     return ms
 * }
 * test()
 * // fsCreateFolder(before) false
 * // fsCreateFolder(after) true
 * // ms [
 * //   { 'fsCreateFolder(before)': false },
 * //   { 'fsCreateFolder(after)': true }
 * // ]
 *
 */
function fsCreateFolder(pah) {
    return fsCreateFolderCore(pah, { fs })
}


export default fsCreateFolder
