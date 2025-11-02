import fs from 'fs'
import fsWriteTextCore from './fsWriteTextCore.mjs'


/**
 * 後端nodejs寫入utf-8文字至檔案
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsWriteText.test.mjs Github}
 * @memberOf wsemi
 * @param {String} fp 輸入檔案名稱
 * @param {String} c 輸入utf-8文字數據
 * @example
 * need test in nodejs.
 *
 * let test = () => {
 *
 *     let ms = []
 *
 *     let fdt = './_test_fsWriteText'
 *     fsCreateFolder(fdt) //創建臨時任務資料夾
 *
 *     let fn = 't1.txt'
 *     let fp = `${fdt}/abc/${fn}`
 *
 *     let b1 = fsIsFile(fp)
 *     console.log('fsWriteText(before)', b1)
 *     ms.push({ 'fsWriteText(before)': b1 })
 *
 *     let b2 = fsWriteText(fp, 'abc')
 *     console.log('fsWriteText', b2)
 *     ms.push({ 'fsWriteText': b2 })
 *
 *     let b3 = fsIsFile(fp)
 *     console.log('fsWriteText(after)', b3)
 *     ms.push({ 'fsWriteText(after)': b3 })
 *
 *     let c = fs.readFileSync(fp, 'utf8')
 *     console.log('readFileSync', c)
 *     ms.push({ 'readFileSync': c })
 *
 *     fsDeleteFolder(fdt) //刪除臨時任務資料夾
 *
 *     console.log('ms', ms)
 *     return ms
 * }
 * test()
 * // fsWriteText(before) false
 * // fsWriteText { success: './_test_fsWriteText/abc/t1.txt' }
 * // fsWriteText(after) true
 * // readFileSync abc
 * // ms [
 * //   { 'fsWriteText(before)': false },
 * //   { fsWriteText: { success: './_test_fsWriteText/abc/t1.txt' } },
 * //   { 'fsWriteText(after)': true },
 * //   { readFileSync: 'abc' }
 * // ]
 *
 */
function fsWriteText(fp, c) {
    return fsWriteTextCore(fp, c, { fs })
}


export default fsWriteText
