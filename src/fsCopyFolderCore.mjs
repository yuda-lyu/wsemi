// import path from 'path'
// import fs from 'fs'
import get from 'lodash-es/get.js'
import isbol from './isbol.mjs'
import fsIsFolderCore from './fsIsFolderCore.mjs'
import fsCreateFolderCore from './fsCreateFolderCore.mjs'


function fsCopyFolderCoreSync(fpSrc, fpTar, opt = {}) {

    //path, fs
    let path = get(opt, 'path')
    let fs = get(opt, 'fs')

    //check
    if (!fsIsFolderCore(fpSrc, { fs })) {
        return {
            error: `fpSrc[${fpSrc}] is not a folder`
        }
    }

    //複製資料夾
    try {

        fs.readdirSync(fpSrc).forEach(function(file) {

            //fpSrcTemp, fpTarTemp
            let fpSrcTemp = path.resolve(fpSrc, file)
            let fpTarTemp = path.resolve(fpTar, file)

            //current
            let current = fs.lstatSync(fpSrcTemp)

            //proc
            if (current.isDirectory()) {

                //fsCreateFolderCore
                fsCreateFolderCore(fpTarTemp, { fs })

                //fsCopyFolderCoreSync
                fsCopyFolderCoreSync(fpSrcTemp, fpTarTemp, { path, fs })

            }
            else if (current.isSymbolicLink()) {

                //symlinkSync
                let symlink = fs.readlinkSync(fpSrcTemp)
                fs.symlinkSync(symlink, fpTarTemp)

            }
            else {

                //fsCreateFolderCore
                fsCreateFolderCore(path.dirname(fpTarTemp), { fs })

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


async function fsCopyFolderCoreAsync(fpSrc, fpTar, opt = {}) {

    //path, fs
    let path = get(opt, 'path')
    let fs = get(opt, 'fs')

    //check
    if (!fsIsFolderCore(fpSrc, { fs })) {
        return {
            error: `fpSrc[${fpSrc}] is not a folder`
        }
    }

    //fsCopyFolderCoreAsyncCore
    let fsCopyFolderCoreAsyncCore = async (fpSrc, fpTar) => {

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

                //fsCreateFolderCore
                fsCreateFolderCore(fpTarTemp, { fs })

                //fsCopyFolderCoreAsyncCore, 遞迴複製子資料夾
                await fsCopyFolderCoreAsyncCore(fpSrcTemp, fpTarTemp)

            }
            else if (current.isSymbolicLink()) {

                //symlinkSync
                let symlink = fs.readlinkSync(fpSrcTemp)
                fs.symlinkSync(symlink, fpTarTemp)

            }
            else {

                //fsCreateFolderCore
                fsCreateFolderCore(path.dirname(fpTarTemp), { fs })

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

    //fsCopyFolderCoreAsyncCore
    let r = null
    await fsCopyFolderCoreAsyncCore(fpSrc, fpTar)
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
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsCopyFolderCore.test.mjs Github}
 * @memberOf wsemi
 * @param {String} fpSrc 輸入來源資料夾路徑字串
 * @param {String} fpTar 輸入目的資料夾路徑字串
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Boolean} [opt.useSync=true] 輸入是否使用同步函數布林值，預設true
 * @returns {Object|Promise} 若useSync=true回傳結果物件，提供鍵success代表成功訊息，提供鍵error代表錯誤訊息，若useSync=false則回傳Promise，resolve回傳結果物件，提供鍵success代表成功訊息，提供鍵error代表錯誤訊息，不觸發reject
 * @example
 * need test in nodejs.
 *
 * //see fsCopyFolder
 *
 */
function fsCopyFolderCore(fpSrc, fpTar, opt = {}) {

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
        r = fsCopyFolderCoreSync(fpSrc, fpTar, { path, fs })
    }
    else {
        r = fsCopyFolderCoreAsync(fpSrc, fpTar, { path, fs })
    }

    return r
}


export default fsCopyFolderCore
