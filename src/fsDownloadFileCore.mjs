// import fs from 'fs'
import get from 'lodash-es/get.js'
import genPm from './genPm.mjs'
import isestr from './isestr.mjs'
import getPathParent from './getPathParent.mjs'
import getFileName from './getFileName.mjs'
import fsIsFolderCore from './fsIsFolderCore.mjs'
import fsCreateFolderCore from './fsCreateFolderCore.mjs'


/**
 * 後端nodejs下載網址成為檔案
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsDownloadFileCore.test.mjs Github}
 * @memberOf wsemi
 * @param {String} urlIn 輸入下載網址字串
 * @param {String} fpOut 輸入儲存檔案路徑字串
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {String} [opt.fs=null] 輸入fs，預設null
 * @param {String} [opt.Readable=null] 輸入Readable，預設null
 * @returns {Promise} 回傳Promise，resolve回傳下載後檔案路徑，reject回傳錯誤訊息
 * @example
 * //need test in nodejs
 *
 * //see fsDownloadFile
 *
 */
async function fsDownloadFileCore(urlIn, fpOut, opt = {}) {
    let errTemp = ''

    //fs
    let fs = get(opt, 'fs')

    //Readable
    let Readable = get(opt, 'Readable')

    //check urlIn
    if (!isestr(urlIn)) {
        throw new Error(`urlIn in not an effective string`)
    }

    //getPathParent
    let fdOut = getPathParent(fpOut)
    // console.log('fdOut', fdOut)

    //getFileName
    let fnOut = get(opt, 'fnOut', '')
    if (!isestr(fnOut)) {
        fnOut = getFileName(fpOut)
    }

    //check
    if (!fsIsFolderCore(fdOut, { fs })) {
        fsCreateFolderCore(fdOut, { fs })
    }

    //pm
    let pm = genPm()

    //攔截錯誤, 注意stream是非同步故try catch是無法攔截的, 須各自監聽read與write串流的error事件處理, 此處是攔截串流以外的錯誤
    try {

        //fetch
        let res = await fetch(urlIn)
        if (!res.ok) {
            pm.reject(res.statusText)
            return pm
        }

        //streamWrite
        let streamWrite = fs.createWriteStream(fpOut)

        //streamNode
        let streamNode = Readable.fromWeb(res.body)

        //pipe
        streamNode.pipe(streamWrite)

        //finish
        streamWrite.on('finish', () => {
            pm.resolve(fpOut)
        })

        //error, 若有error則不會觸發finish
        streamWrite.on('error', (err) => {
            errTemp = err.message
            pm.reject(errTemp)
        })

    }
    catch (err) {
        errTemp = err.message
        pm.reject(errTemp)
    }

    return pm
}


export default fsDownloadFileCore
