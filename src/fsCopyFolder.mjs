import path from 'path'
import fs from 'fs'
import get from 'lodash-es/get.js'
import isbol from './isbol.mjs'
import fsCopyFolderCore from './fsCopyFolderCore.mjs'
import toResultError from './_toResultError.mjs'


/**
 * 後端nodejs複製資料夾
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsCopyFolder.test.mjs Github}
 * @memberOf wsemi
 * @param {String} fpSrc 輸入來源資料夾路徑字串
 * @param {String} fpTar 輸入目的資料夾路徑字串
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Boolean} [opt.useSync=true] 輸入是否使用同步函數布林值，預設true
 * @returns {Object|Promise} 若useSync=true回傳結果物件，提供鍵success代表成功訊息，提供鍵error代表錯誤訊息(說明字串或Error物件)，若useSync=false則回傳Promise，resolve回傳結果物件，提供鍵success代表成功訊息，提供鍵error代表錯誤訊息(說明字串或Error物件)，不觸發reject
 * @example
 * need test in nodejs.
 *
 * let testSyncEmpty = async () => {
 *     let ms = []
 *
 *     let fpSrc = './_test_fsCopyFolder_src'
 *     let fpTar = './_test_fsCopyFolder_tar'
 *     fsCreateFolder(fpSrc)
 *     fsDeleteFolder(fpTar)
 *
 *     fsCreateFolder(`${fpSrc}/lay1/lay2`)
 *     fsCreateFolder(`${fpSrc}/lay1/lay2/lay3/lay4`)
 *
 *     // fs.writeFileSync(`${fpSrc}/lay1/t1.txt`, 'abc', 'utf8')
 *     // fs.writeFileSync(`${fpSrc}/lay1/lay2/t2.txt`, 'def', 'utf8')
 *     // fs.writeFileSync(`${fpSrc}/lay1/lay2/lay3/t3.txt`, '中文', 'utf8')
 *     // fs.writeFileSync(`${fpSrc}/lay1/lay2/lay3/lay4/t4.txt`, '測 試', 'utf8')
 *
 *     let rc = fsCopyFolder(fpSrc, fpTar)
 *     ms.push({ 'sync-empty-copy-folder': rc })
 *
 *     let b1 = fsIsFolder(`${fpTar}/lay1/lay2/lay3`)
 *     ms.push({ 'sync-empty-is-folder-1': b1 })
 *     let b2 = fsIsFolder(`${fpTar}/lay1/lay2/lay3/lay4`)
 *     ms.push({ 'sync-empty-is-folder-2': b2 })
 *     let b3 = fsIsFile(`${fpTar}/lay1/lay2/lay3/t3.txt`)
 *     ms.push({ 'sync-empty-is-file-1': b3 })
 *     let b4 = fsIsFile(`${fpTar}/lay1/lay2/lay3/lay4/t4.txt`)
 *     ms.push({ 'sync-empty-is-file-2': b4 })
 *
 *     fsDeleteFolder(fpSrc)
 *     fsDeleteFolder(fpTar)
 *
 *     // console.log('ms', ms)
 *     return ms
 * }
 *
 * let testSync = async () => {
 *     let ms = []
 *
 *     let fpSrc = './_test_fsCopyFolder_src'
 *     let fpTar = './_test_fsCopyFolder_tar'
 *     fsCreateFolder(fpSrc)
 *
 *     fsCreateFolder(`${fpSrc}/lay1/lay2`)
 *     fsCreateFolder(`${fpSrc}/lay1/lay2/lay3/lay4`)
 *
 *     fs.writeFileSync(`${fpSrc}/lay1/t1.txt`, 'abc', 'utf8')
 *     fs.writeFileSync(`${fpSrc}/lay1/lay2/t2.txt`, 'def', 'utf8')
 *     fs.writeFileSync(`${fpSrc}/lay1/lay2/lay3/t3.txt`, '中文', 'utf8')
 *     fs.writeFileSync(`${fpSrc}/lay1/lay2/lay3/lay4/t4.txt`, '測 試', 'utf8')
 *
 *     let rc = fsCopyFolder(fpSrc, fpTar)
 *     ms.push({ 'sync-copy-folder': rc })
 *
 *     let b1 = fsIsFolder(`${fpTar}/lay1/lay2/lay3`)
 *     ms.push({ 'sync-is-folder-1': b1 })
 *     let b2 = fsIsFolder(`${fpTar}/lay1/lay2/lay3/lay4`)
 *     ms.push({ 'sync-is-folder-2': b2 })
 *     let b3 = fsIsFile(`${fpTar}/lay1/lay2/lay3/t3.txt`)
 *     ms.push({ 'sync-is-file-1': b3 })
 *     let b4 = fsIsFile(`${fpTar}/lay1/lay2/lay3/lay4/t4.txt`)
 *     ms.push({ 'sync-is-file-2': b4 })
 *
 *     fsDeleteFolder(fpSrc)
 *     fsDeleteFolder(fpTar)
 *
 *     // console.log('ms', ms)
 *     return ms
 * }
 *
 * let testAsyncEmpty = async () => {
 *     let ms = []
 *
 *     let fpSrc = './_test_fsCopyFolder_src'
 *     let fpTar = './_test_fsCopyFolder_tar'
 *     fsCreateFolder(fpSrc)
 *
 *     fsCreateFolder(`${fpSrc}/lay1/lay2`)
 *     fsCreateFolder(`${fpSrc}/lay1/lay2/lay3/lay4`)
 *
 *     // fs.writeFileSync(`${fpSrc}/lay1/t1.txt`, 'abc', 'utf8')
 *     // fs.writeFileSync(`${fpSrc}/lay1/lay2/t2.txt`, 'def', 'utf8')
 *     // fs.writeFileSync(`${fpSrc}/lay1/lay2/lay3/t3.txt`, '中文', 'utf8')
 *     // fs.writeFileSync(`${fpSrc}/lay1/lay2/lay3/lay4/t4.txt`, '測 試', 'utf8')
 *
 *     await fsCopyFolder(fpSrc, fpTar, { useSync: false })
 *         .then((res) => {
 *             // console.log('res', res)
 *             ms.push({ 'async-empty-copy-folder': res })
 *         })
 *         .catch((err) => {
 *             console.log('err', err)
 *         })
 *
 *     let b1 = fsIsFolder(`${fpTar}/lay1/lay2/lay3`)
 *     ms.push({ 'async-empty-is-folder-1': b1 })
 *     let b2 = fsIsFolder(`${fpTar}/lay1/lay2/lay3/lay4`)
 *     ms.push({ 'async-empty-is-folder-2': b2 })
 *     let b3 = fsIsFile(`${fpTar}/lay1/lay2/lay3/t3.txt`)
 *     ms.push({ 'async-empty-is-file-1': b3 })
 *     let b4 = fsIsFile(`${fpTar}/lay1/lay2/lay3/lay4/t4.txt`)
 *     ms.push({ 'async-empty-is-file-2': b4 })
 *
 *     fsDeleteFolder(fpSrc)
 *     fsDeleteFolder(fpTar)
 *
 *     // console.log('ms', ms)
 *     return ms
 * }
 *
 * let testAsync = async () => {
 *     let ms = []
 *
 *     let fpSrc = './_test_fsCopyFolder_src'
 *     let fpTar = './_test_fsCopyFolder_tar'
 *     fsCreateFolder(fpSrc)
 *
 *     fsCreateFolder(`${fpSrc}/lay1/lay2`)
 *     fsCreateFolder(`${fpSrc}/lay1/lay2/lay3/lay4`)
 *
 *     fs.writeFileSync(`${fpSrc}/lay1/t1.txt`, 'abc', 'utf8')
 *     fs.writeFileSync(`${fpSrc}/lay1/lay2/t2.txt`, 'def', 'utf8')
 *     fs.writeFileSync(`${fpSrc}/lay1/lay2/lay3/t3.txt`, '中文', 'utf8')
 *     fs.writeFileSync(`${fpSrc}/lay1/lay2/lay3/lay4/t4.txt`, '測 試', 'utf8')
 *
 *     await fsCopyFolder(fpSrc, fpTar, { useSync: false })
 *         .then((res) => {
 *             // console.log('res', res)
 *             ms.push({ 'async-copy-folder': res })
 *         })
 *         .catch((err) => {
 *             console.log('err', err)
 *         })
 *
 *     let b1 = fsIsFolder(`${fpTar}/lay1/lay2/lay3`)
 *     ms.push({ 'async-is-folder-1': b1 })
 *     let b2 = fsIsFolder(`${fpTar}/lay1/lay2/lay3/lay4`)
 *     ms.push({ 'async-is-folder-2': b2 })
 *     let b3 = fsIsFile(`${fpTar}/lay1/lay2/lay3/t3.txt`)
 *     ms.push({ 'async-is-file-1': b3 })
 *     let b4 = fsIsFile(`${fpTar}/lay1/lay2/lay3/lay4/t4.txt`)
 *     ms.push({ 'async-is-file-2': b4 })
 *
 *     fsDeleteFolder(fpSrc)
 *     fsDeleteFolder(fpTar)
 *
 *     // console.log('ms', ms)
 *     return ms
 * }
 *
 * let test = async () => {
 *     let ms = []
 *     ms = [...ms, ...await testSyncEmpty()]
 *     ms = [...ms, ...await testSync()]
 *     ms = [...ms, ...await testAsyncEmpty()]
 *     ms = [...ms, ...await testAsync()]
 *     console.log('ms', ms)
 *     return ms
 * }
 * await test()
 *     .catch((err) => {
 *         console.log(err)
 *     })
 * // => ms [
 * //   {
 * //     'sync-empty-copy-folder': { success: 'done: ./_test_fsCopyFolder_tar' }
 * //   },
 * //   { 'sync-empty-is-folder-1': true },
 * //   { 'sync-empty-is-folder-2': true },
 * //   { 'sync-empty-is-file-1': false },
 * //   { 'sync-empty-is-file-2': false },
 * //   { 'sync-copy-folder': { success: 'done: ./_test_fsCopyFolder_tar' } },
 * //   { 'sync-is-folder-1': true },
 * //   { 'sync-is-folder-2': true },
 * //   { 'sync-is-file-1': true },
 * //   { 'sync-is-file-2': true },
 * //   {
 * //     'async-empty-copy-folder': { success: 'done: ./_test_fsCopyFolder_tar' }
 * //   },
 * //   { 'async-empty-is-folder-1': true },
 * //   { 'async-empty-is-folder-2': true },
 * //   { 'async-empty-is-file-1': false },
 * //   { 'async-empty-is-file-2': false },
 * //   {
 * //     'async-copy-folder': { success: 'done: ./_test_fsCopyFolder_tar' }
 * //   },
 * //   { 'async-is-folder-1': true },
 * //   { 'async-is-folder-2': true },
 * //   { 'async-is-file-1': true },
 * //   { 'async-is-file-2': true }
 * // ]
 *
 */
function fsCopyFolder(fpSrc, fpTar, opt = {}) {
    try {
        return fsCopyFolderCore(fpSrc, fpTar, { path, fs, ...opt })
    }
    catch (err) {

        //opt本身或其屬性不可讀(getter拋錯、已撤銷之Proxy)時展開即拋出, 轉為結果物件而不同步拋出; 回傳形式同fsCopyFolderCore: useSync可讀且為false時以Promise resolve, 不可讀時視為預設true
        let useSync = null
        try {
            useSync = get(opt, 'useSync', '')
        }
        catch (e) {}
        if (!isbol(useSync)) {
            useSync = true
        }
        let r = {
            error: toResultError(err), //Error原樣, 其餘轉字串, 恆為truthy
        }
        return useSync ? r : Promise.resolve(r)

    }
}


export default fsCopyFolder
