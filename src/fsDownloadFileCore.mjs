// import fs from 'fs'
import get from 'lodash-es/get.js'
import genPm from './genPm.mjs'
import isestr from './isestr.mjs'
import isfun from './isfun.mjs'
import getPathParent from './getPathParent.mjs'
import getErrorMessage from './getErrorMessage.mjs'
import fsIsFolderCore from './fsIsFolderCore.mjs'
import fsCreateFolderCore from './fsCreateFolderCore.mjs'


/**
 * 後端nodejs下載網址成為檔案
 *
 * 下載內容先寫入暫存檔`${fpOut}.download`，傳輸完成後才改名為fpOut，故中途失敗時fpOut不會殘留截斷檔。回應帶content-length且未經內容編碼與分塊傳輸時，改名前核對暫存檔大小。任何失敗(非2xx回應、連線被拒、下載中途斷線、大小不符、寫檔錯誤)皆reject字串`failed to download url[urlIn] to file[fpOut]: 原因`並清除暫存檔。同一fpOut之併發下載由呼叫端自行避免
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsDownloadFile.test.mjs Github}
 * @memberOf wsemi
 * @param {String} urlIn 輸入下載網址字串
 * @param {String} fpOut 輸入儲存檔案路徑字串
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Object} [opt.fs=null] 輸入fs，預設null
 * @param {Function} [opt.Readable=null] 輸入stream之Readable，預設null
 * @param {Function} [opt.pipeline=null] 輸入stream/promises之pipeline，預設null
 * @returns {Promise} 回傳Promise，resolve回傳下載後檔案路徑，reject回傳錯誤訊息字串
 * @example
 * //need test in nodejs
 *
 * //see fsDownloadFile
 *
 */
async function fsDownloadFileCore(urlIn, fpOut, opt = {}) {

    //fs
    let fs = get(opt, 'fs')

    //Readable
    let Readable = get(opt, 'Readable')

    //pipeline
    let pipeline = get(opt, 'pipeline')

    //check urlIn
    if (!isestr(urlIn)) {
        throw new Error(`urlIn in not an effective string`)
    }

    //check fpOut
    if (!isestr(fpOut)) {
        throw new Error(`fpOut is not an effective string`)
    }

    //check pipeline
    if (!isfun(pipeline)) {
        throw new Error(`opt.pipeline is not a function`)
    }

    //getPathParent
    let fdOut = getPathParent(fpOut)
    // console.log('fdOut', fdOut)

    //check
    if (!fsIsFolderCore(fdOut, { fs })) {
        fsCreateFolderCore(fdOut, { fs })
    }

    //fpTemp, 先寫暫存檔, 成功才改名為正式檔名, 中斷時正式檔名不存在, 下次自然重新下載
    let fpTemp = `${fpOut}.download`

    //pm
    let pm = genPm()

    //fail, 清除暫存檔並以帶脈絡之訊息reject
    let fail = (reason) => {
        try {
            fs.unlinkSync(fpTemp)
        }
        catch (err) {}
        pm.reject(`failed to download url[${urlIn}] to file[${fpOut}]: ${reason}`)
    }

    //攔截錯誤, 串流錯誤由pipeline轉為reject, 故與fetch、寫檔、改名之錯誤走同一個catch
    try {

        //fetch
        let res = await fetch(urlIn)
        if (!res.ok) {
            //取消body以釋放連線, 失敗不影響結果
            try {
                await res.body.cancel()
            }
            catch (err) {}
            fail(`status[${res.status}] ${res.statusText}`)
            return pm
        }

        //sizeExpected, 回應帶content-length且未經內容編碼與分塊傳輸時, 傳輸完核對大小
        //  content-encoding(gzip等)時fetch自動解壓而標頭為壓縮後大小, transfer-encoding存在時依RFC須忽略content-length, 兩者皆不核對否則誤判為截斷
        let sizeExpected = null
        let cl = res.headers.get('content-length')
        let ce = res.headers.get('content-encoding')
        let te = res.headers.get('transfer-encoding')
        if (isestr(cl) && /^\d+$/.test(cl.trim()) && (!isestr(ce) || ce.trim().toLowerCase() === 'identity') && !isestr(te)) {
            sizeExpected = Number(cl.trim())
        }

        //pipeline, 讀取端與寫入端任一錯誤皆reject並銷毀兩端串流
        //  不用pipe, 因pipe不會把來源錯誤傳給目的端, 下載中途斷線時來源之error事件無人監聽, 呼叫端未掛uncaughtException即崩潰, 掛了則Promise永久pending
        await pipeline(Readable.fromWeb(res.body), fs.createWriteStream(fpTemp))

        //check size
        if (sizeExpected !== null) {
            let size = fs.statSync(fpTemp).size
            if (size !== sizeExpected) {
                fail(`size mismatch, content-length[${sizeExpected}] received[${size}]`)
                return pm
            }
        }

        //rename, 既有fpOut會被取代
        fs.renameSync(fpTemp, fpOut)

        pm.resolve(fpOut)
    }
    catch (err) {
        fail(getErrorMessage(err, { useCause: true }))
    }

    return pm
}


export default fsDownloadFileCore
