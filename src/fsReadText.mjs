import fs from 'fs'
import fsReadTextCore from './fsReadTextCore.mjs'


/**
 * 後端nodejs由檔案讀取utf-8文字
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsReadText.test.mjs Github}
 * @memberOf wsemi
 * @param {String} fp 輸入檔案名稱
 * @returns {String} 回傳檔案內容字串
 * @example
 * need test in nodejs.
 *
 * let test = () => {
 *
 *     let ms = []
 *
 *     let fdt = './_test_fsReadText'
 *     fsCreateFolder(fdt) //創建臨時任務資料夾
 *
 *     let fn = 't1.txt'
 *     let fp = `${fdt}/abc/${fn}`
 *
 *     let b1 = fsIsFile(fp)
 *     console.log('fsIsFile(before)', b1)
 *     ms.push({ 'fsIsFile(before)': b1 })
 *
 *     let rw = fsWriteText(fp, 'abc', { encoding: 'utf8' })
 *     console.log('fsWriteText', rw)
 *     ms.push({ 'fsWriteText': rw })
 *
 *     let b2 = fsIsFile(fp)
 *     console.log('fsIsFile(after)', b2)
 *     ms.push({ 'fsIsFile(after)': b2 })
 *
 *     let rr = fsReadText(fp, 'abc', { encoding: 'utf8' })
 *     console.log('fsReadText', rr)
 *     ms.push({ 'fsReadText': rr })
 *
 *     fsDeleteFolder(fdt) //刪除臨時任務資料夾
 *
 *     console.log('ms', ms)
 *     return ms
 * }
 * test()
 * // fsIsFile(before) false
 * // fsWriteText { success: './_test_fsReadText/abc/t1.txt' }
 * // fsIsFile(after) true
 * // fsReadText { success: 'abc' }
 * // ms [
 * //   { 'fsIsFile(before)': false },
 * //   { fsWriteText: { success: './_test_fsReadText/abc/t1.txt' } },
 * //   { 'fsIsFile(after)': true },
 * //   { fsReadText: { success: 'abc' } }
 * // ]
 *
 */
function fsReadText(fp) {
    return fsReadTextCore(fp, { fs })
}


export default fsReadText
