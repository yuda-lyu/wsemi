import path from 'path'
import fs from 'fs'
import get from 'lodash-es/get.js'
import isbol from './isbol.mjs'
import fsIsFolder from './fsIsFolder.mjs'
import fsCreateFolder from './fsCreateFolder.mjs'


function fsCopyFolderSync(fpSrc, fpTar) {

    //check
    if (!fsIsFolder(fpSrc)) {
        return {
            error: `fpSrc[${fpSrc}] is not a folder`
        }
    }

    //複製資料夾
    try {

        fs.readdirSync(fpSrc).forEach(function(file) {

            //fpSrcTemp, fpTarTemp
            let fpSrcTemp = fpSrc + '/' + file
            let fpTarTemp = fpTar + '/' + file

            //current
            let current = fs.lstatSync(fpSrcTemp)

            //proc
            if (current.isDirectory()) {

                //fsCreateFolder
                fsCreateFolder(path.dirname(fpTarTemp))

                //fsCopyFolder
                fsCopyFolder(fpSrcTemp, fpTarTemp)

            }
            else if (current.isSymbolicLink()) {

                //symlinkSync
                let symlink = fs.readlinkSync(fpSrcTemp)
                fs.symlinkSync(symlink, fpTarTemp)

            }
            else {

                //fsCreateFolder
                fsCreateFolder(path.dirname(fpTarTemp))

                //copyFileSync
                fs.copyFileSync(fpSrcTemp, fpTarTemp)

            }

        })

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


async function fsCopyFolderAsync(fpSrc, fpTar) {

    //check
    if (!fsIsFolder(fpSrc)) {
        return {
            error: `fpSrc[${fpSrc}] is not a folder`
        }
    }

    //fsCopyFolderAsyncCore
    let fsCopyFolderAsyncCore = async (fpSrc, fpTar) => {

        //讀取來源資料夾內容
        let entries = fs.readdirSync(fpSrc)
        // console.log('entries', entries)

        for (let entry of entries) {
            // console.log('entry', entry)

            //fpSrcTemp
            let fpSrcTemp = path.join(fpSrc, entry)
            // console.log('fpSrcTemp', fpSrcTemp)

            //fpTarTemp
            let fpTarTemp = path.join(fpTar, entry)
            // console.log('fpTarTemp', fpTarTemp)

            //current
            let current = fs.lstatSync(fpSrcTemp)
            // console.log('current', current)

            //遍歷
            if (current.isDirectory()) {

                //fsCreateFolder
                fsCreateFolder(fpTarTemp)
                // console.log('fsCreateFolder', fpTarTemp)

                //fsCopyFolderAsyncCore, 遞迴複製子資料夾
                await fsCopyFolderAsyncCore(fpSrcTemp, fpTarTemp)

            }
            else if (current.isSymbolicLink()) {

                //symlinkSync
                let symlink = fs.readlinkSync(fpSrcTemp)
                fs.symlinkSync(symlink, fpTarTemp)

            }
            else {

                //使用串流方式複製檔案
                await new Promise((resolve, reject) => {

                    //streamRead, streanWrite
                    let streamRead = fs.createReadStream(fpSrcTemp)
                    let streanWrite = fs.createWriteStream(fpTarTemp)

                    //on
                    streamRead.on('error', reject)
                    streanWrite.on('error', reject)
                    streanWrite.on('finish', resolve)

                    //pipe
                    streamRead.pipe(streanWrite)

                })

            }

        }

    }

    //fsCopyFolderAsyncCore
    let r = null
    await fsCopyFolderAsyncCore(fpSrc, fpTar)
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
 * 後端nodejs複製資料夾
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsCopyFolder.test.mjs Github}
 * @memberOf wsemi
 * @param {String} fpSrc 輸入來源資料夾路徑字串
 * @param {String} fpTar 輸入目的資料夾路徑字串
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Boolean} [opt.useSync=true] 輸入是否使用同步函數布林值，預設true
 * @returns {Object|Promise} 若useSync=true回傳結果物件，提供鍵success代表成功訊息，提供鍵error代表錯誤訊息，若useSync=false則回傳Promise，resolve回傳結果物件，提供鍵success代表成功訊息，提供鍵error代表錯誤訊息，不觸發reject
 * @example
 * need test in nodejs.
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
 *     let b1 = fsIsFolder(`${fpSrc}/lay1/lay2/lay3`)
 *     ms.push({ 'sync-is-folder': b1 })
 *     let b2 = fsIsFile(`${fpSrc}/lay1/lay2/lay3/lay4/t4.txt`)
 *     ms.push({ 'sync-is-file': b2 })
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
 *     let b1 = fsIsFolder(`${fpSrc}/lay1/lay2/lay3`)
 *     ms.push({ 'async-is-folder': b1 })
 *     let b2 = fsIsFile(`${fpSrc}/lay1/lay2/lay3/lay4/t4.txt`)
 *     ms.push({ 'async-is-file': b2 })
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
 * //   { 'sync-copy-folder': { success: 'done: ./_test_fsCopyFolder_tar' } },
 * //   { 'sync-is-folder': true },
 * //   { 'sync-is-file': true },
 * //   {
 * //     'async-copy-folder': { success: 'done: ./_test_fsCopyFolder_tar' }
 * //   },
 * //   { 'async-is-folder': true },
 * //   { 'async-is-file': true }
 * // ]
 *
 */
function fsCopyFolder(fpSrc, fpTar, opt = {}) {

    //useSync
    let useSync = get(opt, 'useSync', '')
    if (!isbol(useSync)) {
        useSync = true
    }

    let r = ''
    if (useSync) {
        r = fsCopyFolderSync(fpSrc, fpTar)
    }
    else {
        r = fsCopyFolderAsync(fpSrc, fpTar)
    }

    return r
}


export default fsCopyFolder
