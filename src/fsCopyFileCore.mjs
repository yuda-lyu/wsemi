import get from 'lodash-es/get.js'
import isbol from './isbol.mjs'
import fsIsFileCore from './fsIsFileCore.mjs'
import fsCreateFolderCore from './fsCreateFolderCore.mjs'
import toResultError from './_toResultError.mjs'


function fsCopyFileCoreSync(fpSrc, fpTar, opt = {}) {

    //path, fs
    let path = get(opt, 'path')
    let fs = get(opt, 'fs')

    //複製檔案
    try {

        //check, 置於try內: 注入之fs之lstatSync可拋錯, 於try外即成同步拋錯
        if (!fsIsFileCore(fpSrc, { fs })) {
            return {
                error: `fpSrc[${fpSrc}] is not a file`
            }
        }

        //fsCreateFolderCore
        fsCreateFolderCore(path.dirname(fpTar), { fs })

        //copyFileSync
        fs.copyFileSync(fpSrc, fpTar)

    }
    catch (err) {
        return {
            error: toResultError(err) //Error或非空字串原樣, 其餘(null、undefined等)轉字串, 恆為truthy
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

    //fsCopyFileCoreAsyncCore
    let fsCopyFileCoreAsyncCore = async (fpSrc, fpTar) => {

        //check, 置於async內: 注入之fs之lstatSync拋錯時轉為結果物件, 不觸發reject
        if (!fsIsFileCore(fpSrc, { fs })) {
            return `fpSrc[${fpSrc}] is not a file`
        }

        //fsCreateFolderCore
        fsCreateFolderCore(path.dirname(fpTar), { fs })

        //使用串流方式複製檔案
        await new Promise((resolve, reject) => {

            //streamRead, streanWrite
            let streamRead = null
            let streanWrite = null

            //fail, 任一端出錯即銷毀兩端: pipe不會於來源出錯時關閉目的端、亦不會於目的端出錯時關閉來源, 未銷毀者之fd殘留
            let fail = (err) => {
                try {
                    if (streamRead !== null) {
                        streamRead.destroy()
                    }
                }
                catch (e) {}
                try {
                    if (streanWrite !== null) {
                        streanWrite.destroy()
                    }
                }
                catch (e) {}
                reject(err)
            }

            //create, 寫入流之建構子可同步拋錯(如fpTar含NUL), 此時已建立之讀取流須銷毀
            try {
                streamRead = fs.createReadStream(fpSrc)
                streanWrite = fs.createWriteStream(fpTar)
            }
            catch (err) {
                fail(err)
                return
            }

            //on
            streamRead.on('error', fail)
            streanWrite.on('error', fail)
            streanWrite.on('finish', resolve)

            //pipe
            streamRead.pipe(streanWrite)

        })

    }

    //fsCopyFileCoreAsyncCore
    let r = null
    await fsCopyFileCoreAsyncCore(fpSrc, fpTar)
        .then((msgErr) => {
            if (msgErr) {
                r = {
                    error: msgErr
                }
                return
            }
            r = {
                success: 'done: ' + fpTar
            }
        })
        .catch((err) => {
            r = {
                error: toResultError(err) //Error或非空字串原樣, 其餘(如串流以null出錯)轉字串, 恆為truthy
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
 * @returns {Object|Promise} 若useSync=true回傳結果物件，提供鍵success代表成功訊息，提供鍵error代表錯誤訊息(說明字串或Error物件)，若useSync=false則回傳Promise，resolve回傳結果物件，提供鍵success代表成功訊息，提供鍵error代表錯誤訊息(說明字串或Error物件)，不觸發reject
 * @example
 * need test in nodejs.
 *
 * //see fsCopyFile
 *
 */
function fsCopyFileCore(fpSrc, fpTar, opt = {}) {

    //useSync, 先讀以決定失敗時之回傳形式; opt本身或其屬性不可讀時視為預設true
    let useSync = null
    try {
        useSync = get(opt, 'useSync', '')
    }
    catch (err) {}
    if (!isbol(useSync)) {
        useSync = true
    }

    //path, fs, 讀取opt置於try內: opt本身或其屬性不可讀(getter拋錯、已撤銷之Proxy)時get拋出, 轉為結果物件而不同步拋出(useSync=false時以Promise resolve)
    let path = null
    let fs = null
    try {
        path = get(opt, 'path')
        fs = get(opt, 'fs')
    }
    catch (err) {
        let rErr = {
            error: toResultError(err), //Error原樣, 其餘轉字串, 恆為truthy
        }
        return useSync ? rErr : Promise.resolve(rErr)
    }

    let r = ''
    if (useSync) {
        r = fsCopyFileCoreSync(fpSrc, fpTar, { path, fs })
    }
    else {
        r = fsCopyFileCoreAsync(fpSrc, fpTar, { path, fs })
    }

    return r
}


export default fsCopyFileCore
