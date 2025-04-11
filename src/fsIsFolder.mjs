import fs from 'fs'
import fsIsFolderCore from './fsIsFolderCore.mjs'


/**
 * 後端nodejs判斷是否為資料夾
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsIsFolder.test.mjs Github}
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
 *     let fdt = './_test_fsIsFolder'
 *
 *     let b1 = fsIsFolder(fdt)
 *     console.log('fsIsFolder(before)', b1)
 *     ms.push({ 'fsIsFolder(before)': b1 })
 *
 *     fsCreateFolder(fdt)
 *
 *     let b2 = fsIsFolder(fdt)
 *     console.log('fsIsFolder(after)', b2)
 *     ms.push({ 'fsIsFolder(after)': b2 })
 *
 *     fsDeleteFolder(fdt)
 *
 *     console.log('ms', ms)
 *     return ms
 * }
 * test()
 * // fsIsFolder(before) false
 * // fsIsFolder(after) true
 * // ms [ { 'fsIsFolder(before)': false }, { 'fsIsFolder(after)': true } ]
 *
 */
function fsIsFolder(pah) {
    return fsIsFolderCore(pah, { fs })
}


export default fsIsFolder
