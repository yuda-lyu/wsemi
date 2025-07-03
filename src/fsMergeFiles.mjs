import fs from 'fs'
import fsMergeFilesCore from './fsMergeFilesCore.mjs'


/**
 * 後端nodejs合併多檔案
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsMergeFiles.test.mjs Github}
 * @memberOf wsemi
 * @param {Array} fpsIn 輸入合併前各切片檔案路徑陣列
 * @param {String} fpOut 輸入合併後檔案路徑字串
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {String} [opt.fnOut=getFileName(fpOut)] 輸入合併後檔案名稱字串，僅回傳時會使用，預設getFileName(fpOut)
 * @returns {Promise} 回傳Promise，resolve回傳合併後物件，reject回傳錯誤訊息
 * @example
 * //need test in nodejs
 *
 * let test = async () => {
 *     let ms = []
 *
 *     let fdt = './_test_fsMergeFiles'
 *     fsCreateFolder(fdt) //創建任務資料夾
 *
 *     fs.writeFileSync(`${fdt}/t1.txt`, 'abc', 'utf8')
 *     fs.writeFileSync(`${fdt}/t2.txt`, 'def', 'utf8')
 *     fs.writeFileSync(`${fdt}/t3.txt`, '中文', 'utf8')
 *     fs.writeFileSync(`${fdt}/t4.txt`, '測 試', 'utf8')
 *     fs.writeFileSync(`${fdt}/t5.txt`, '&*#$%', 'utf8')
 *
 *     let fnOut = '合併檔案.txt'
 *     let fpsIn = [
 *         `${fdt}/t1.txt`,
 *         `${fdt}/t2.txt`,
 *         `${fdt}/t3.txt`,
 *         `${fdt}/t4.txt`,
 *         `${fdt}/t5.txt`,
 *     ]
 *     let fpOut = `${fdt}/m.txt`
 *     await fsMergeFiles(fpsIn, fpOut, { fnOut })
 *         .then((res) => {
 *             console.log('res', res)
 *             ms.push(res)
 *         })
 *         .catch((err) => {
 *             console.log('err', err)
 *         })
 *
 *     let c = fs.readFileSync(fpOut, 'utf8')
 *     console.log('c', c)
 *     ms.push({ content: c })
 *
 *     fsDeleteFolder(fdt) //最終階段清除任務資料夾
 *
 *     console.log('ms', ms)
 *     return ms
 * }
 * await test()
 *     .catch((err) => {
 *         console.log(err)
 *     })
 * // fpIn ./_test_fsMergeFiles/t1.txt
 * // fpIn ./_test_fsMergeFiles/t2.txt
 * // fpIn ./_test_fsMergeFiles/t3.txt
 * // fpIn ./_test_fsMergeFiles/t4.txt
 * // fpIn ./_test_fsMergeFiles/t5.txt
 * // res { filename: '合併檔案.txt', path: './_test_fsMergeFiles/m.txt' }
 * // c abcdef中文測 試&*#$%
 * // ms [
 * //   { filename: '合併檔案.txt', path: './_test_fsMergeFiles/m.txt' },
 * //   { content: 'abcdef中文測 試&*#$%' }
 * // ]
 *
 */
async function fsMergeFiles(fpsIn, fpOut, opt = {}) {
    return fsMergeFilesCore(fpsIn, fpOut, { fs, ...opt })
}


export default fsMergeFiles
