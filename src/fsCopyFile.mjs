import path from 'path'
import fs from 'fs'
import get from 'lodash-es/get.js'
import isbol from './isbol.mjs'
import fsIsFile from './fsIsFile.mjs'
import fsCreateFolder from './fsCreateFolder.mjs'


function fsCopyFileSync(fpSrc, fpTar) {

    //check
    if (!fsIsFile(fpSrc)) {
        return {
            error: `fpSrc[${fpSrc}] is not a file`
        }
    }

    //複製檔案
    try {

        //fsCreateFolder
        fsCreateFolder(path.dirname(fpTar))

        //copyFileSync
        fs.copyFileSync(fpSrc, fpTar)

    }
    catch (err) {
        return {
            error: err
        }
    }

    return {
        success: 'done: ' + fpTar
    }
}


async function fsCopyFileAsync(fpSrc, fpTar) {

    //check
    if (!fsIsFile(fpSrc)) {
        return {
            error: `fpSrc[${fpSrc}] is not a file`
        }
    }

    //fsCopyFileAsyncCore
    let fsCopyFileAsyncCore = async (fpSrc, fpTar) => {

        //fsCreateFolder
        fsCreateFolder(path.dirname(fpTar))

        //使用串流方式複製檔案
        await new Promise((resolve, reject) => {

            //streamRead, streanWrite
            let streamRead = fs.createReadStream(fpSrc)
            let streanWrite = fs.createWriteStream(fpTar)

            //on
            streamRead.on('error', reject)
            streanWrite.on('error', reject)
            streanWrite.on('finish', resolve)

            //pipe
            streamRead.pipe(streanWrite)

        })

    }

    //fsCopyFileAsyncCore
    let r = null
    await fsCopyFileAsyncCore(fpSrc, fpTar)
        .then(() => {
            r = {
                success: 'done: ' + fpTar
            }
        })
        .catch((err) => {
            r = {
                error: err
            }
        })

    return r
}


/**
 * 後端nodejs複製檔案
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsCopyFile.test.mjs Github}
 * @memberOf wsemi
 * @param {String} fpSrc 輸入來源檔案路徑字串
 * @param {String} fpTar 輸入目的檔案路徑字串
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Boolean} [opt.useSync=true] 輸入是否使用同步函數布林值，預設true
 * @returns {Object|Promise} 若useSync=true回傳結果物件，提供鍵success代表成功訊息，提供鍵error代表錯誤訊息，若useSync=false則回傳Promise，resolve回傳結果物件，提供鍵success代表成功訊息，提供鍵error代表錯誤訊息，不觸發reject
 * @example
 * need test in nodejs.
 *
 * let testSync = async () => {
 *     let ms = []
 *
 *     let fpSrc = './_test_fsCopyFile_src'
 *     let fpTar = './_test_fsCopyFile_tar'
 *     fsCreateFolder(fpSrc)
 *     fsCreateFolder(fpTar)
 *
 *     fs.writeFileSync(`${fpSrc}/t1.txt`, 'abc', 'utf8')
 *
 *     let rc = fsCopyFile(`${fpSrc}/t1.txt`, `${fpTar}/_t1.txt`)
 *     ms.push({ 'sync-copy-file': rc })
 *
 *     let b1 = fsIsFile(`${fpTar}/_t1.txt`)
 *     ms.push({ 'sync-is-file': b1 })
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
 *     let fpSrc = './_test_fsCopyFile_src'
 *     let fpTar = './_test_fsCopyFile_tar'
 *     fsCreateFolder(fpSrc)
 *     fsCreateFolder(fpTar)
 *
 *     fs.writeFileSync(`${fpSrc}/t1.txt`, 'abc', 'utf8')
 *
 *     await fsCopyFile(`${fpSrc}/t1.txt`, `${fpTar}/_t1.txt`, { useSync: false })
 *         .then((res) => {
 *             // console.log('res', res)
 *             ms.push({ 'async-copy-folder': res })
 *         })
 *         .catch((err) => {
 *             console.log('err', err)
 *         })
 *
 *     let b1 = fsIsFile(`${fpTar}/_t1.txt`)
 *     ms.push({ 'async-is-file': b1 })
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
 *     let msSync = await testSync()
 *     ms = [...ms, ...msSync]
 *     let msAsync = await testAsync()
 *     ms = [...ms, ...msAsync]
 *     console.log('ms', ms)
 *     return ms
 * }
 * test()
 *     .catch(() => {})
 * // => ms [
 * //   {
 * //     'sync-copy-file': { success: 'done: ./_test_fsCopyFile_tar/_t1.txt' }
 * //   },
 * //   { 'sync-is-file': true },
 * //   {
 * //     'async-copy-folder': { success: 'done: ./_test_fsCopyFile_tar/_t1.txt' }
 * //   },
 * //   { 'async-is-file': true }
 * // ]
 *
 */
function fsCopyFile(fpSrc, fpTar, opt = {}) {

    //useSync
    let useSync = get(opt, 'useSync', '')
    if (!isbol(useSync)) {
        useSync = true
    }

    let r = ''
    if (useSync) {
        r = fsCopyFileSync(fpSrc, fpTar)
    }
    else {
        r = fsCopyFileAsync(fpSrc, fpTar)
    }

    return r
}


export default fsCopyFile
