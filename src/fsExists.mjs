import fs from 'fs'
import fsExistsCore from './fsExistsCore.mjs'


/**
 * 後端nodejs判斷是否為檔案
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsExists.test.mjs Github}
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
 *     let fdt = './_test_fsExists'
 *     fsCreateFolder(fdt) //創建臨時任務資料夾
 *
 *     let fn
 *     let fp
 *
 *     fn = 't1.txt'
 *     fp = `${fdt}/${fn}`
 *
 *     let b1 = fsExists(fp)
 *     console.log('fsExists file(before)', b1)
 *     ms.push({ 'fsExists file(before)': b1 })
 *
 *     fsCreateFile(fp, 'abc', { encoding: 'utf8' })
 *
 *     let b2 = fsExists(fp)
 *     console.log('fsExists file(after)', b2)
 *     ms.push({ 'fsExists file(after)': b2 })
 *
 *     fn = 't2'
 *     fp = `${fdt}/${fn}`
 *
 *     let b3 = fsExists(fp)
 *     console.log('fsExists folder(before)', b3)
 *     ms.push({ 'fsExists folder(before)': b3 })
 *
 *     fsCreateFolder(fp)
 *
 *     let b4 = fsExists(fp)
 *     console.log('fsExists folder(after)', b4)
 *     ms.push({ 'fsExists folder(after)': b4 })
 *
 *     fsDeleteFolder(fdt) //刪除臨時任務資料夾
 *
 *     console.log('ms', ms)
 *     return ms
 * }
 * test()
 * // fsExists file(before) false
 * // fsExists file(after) true
 * // fsExists folder(before) false
 * // fsExists folder(after) true
 * // ms [
 * //   { 'fsExists file(before)': false },
 * //   { 'fsExists file(after)': true },
 * //   { 'fsExists folder(before)': false },
 * //   { 'fsExists folder(after)': true }
 * // ]
 *
 */
function fsExists(pah) {
    return fsExistsCore(pah, { fs })
}


export default fsExists
