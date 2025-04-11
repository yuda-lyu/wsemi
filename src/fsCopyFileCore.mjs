// import path from 'path'
// import fs from 'fs'
import get from 'lodash-es/get.js'
import isbol from './isbol.mjs'
import fsIsFileCore from './fsIsFileCore.mjs'
import fsCreateFolderCore from './fsCreateFolderCore.mjs'


function fsCopyFileSyncCore(fpSrc, fpTar, opt = {}) {

    //path, fs
    let path = get(opt, 'path')
    let fs = get(opt, 'fs')

    //check
    if (!fsIsFileCore(fpSrc, { fs })) {
        return {
            error: `fpSrc[${fpSrc}] is not a file`
        }
    }

    //複製檔案
    try {

        //fsCreateFolderCore
        fsCreateFolderCore(path.dirname(fpTar), { fs })

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


async function fsCopyFileCoreAsync(fpSrc, fpTar, opt = {}) {

    //path, fs
    let path = get(opt, 'path')
    let fs = get(opt, 'fs')

    //check
    if (!fsIsFileCore(fpSrc, { fs })) {
        return {
            error: `fpSrc[${fpSrc}] is not a file`
        }
    }

    //fsCopyFileCoreAsyncCore
    let fsCopyFileCoreAsyncCore = async (fpSrc, fpTar) => {

        //fsCreateFolderCore
        fsCreateFolderCore(path.dirname(fpTar), { fs })

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

    //fsCopyFileCoreAsyncCore
    let r = null
    await fsCopyFileCoreAsyncCore(fpSrc, fpTar)
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
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsCopyFileCore.test.mjs Github}
 * @memberOf wsemi
 * @param {String} fpSrc 輸入來源檔案路徑字串
 * @param {String} fpTar 輸入目的檔案路徑字串
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Boolean} [opt.useSync=true] 輸入是否使用同步函數布林值，預設true
 * @returns {Object|Promise} 若useSync=true回傳結果物件，提供鍵success代表成功訊息，提供鍵error代表錯誤訊息，若useSync=false則回傳Promise，resolve回傳結果物件，提供鍵success代表成功訊息，提供鍵error代表錯誤訊息，不觸發reject
 * @example
 * need test in nodejs.
 *
 * //see fsCopyFile
 *
 */
function fsCopyFileCore(fpSrc, fpTar, opt = {}) {

    //path, fs
    let path = get(opt, 'path')
    let fs = get(opt, 'fs')

    //useSync
    let useSync = get(opt, 'useSync', '')
    if (!isbol(useSync)) {
        useSync = true
    }

    let r = ''
    if (useSync) {
        r = fsCopyFileSyncCore(fpSrc, fpTar, { path, fs })
    }
    else {
        r = fsCopyFileCoreAsync(fpSrc, fpTar, { path, fs })
    }

    return r
}


export default fsCopyFileCore
