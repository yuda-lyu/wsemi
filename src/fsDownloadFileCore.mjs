// import fs from 'fs'
import get from 'lodash-es/get.js'
import genPm from './genPm.mjs'
import isestr from './isestr.mjs'
import getPathParent from './getPathParent.mjs'
import getErrorMessage from './getErrorMessage.mjs'
import fsIsFolderCore from './fsIsFolderCore.mjs'
import fsCreateFolderCore from './fsCreateFolderCore.mjs'
import errToStr from './_errToStr.mjs'
import chkFsPath from './_chkFsPath.mjs'
import chkFsDeps from './_chkFsDeps.mjs'


/**
 * 後端nodejs下載網址成為檔案
 *
 * 下載內容先寫入暫存檔`${fpOut}.download`，傳輸完成後才改名為fpOut，故中途失敗時fpOut不會殘留截斷檔。回應帶content-length且未經內容編碼與分塊傳輸時，改名前核對暫存檔大小。任何失敗(非2xx回應、連線被拒、下載中途斷線、大小不符、寫檔錯誤)皆reject字串`failed to download url[urlIn] to file[fpOut]: 原因`並清除暫存檔；輸入檢查不通過(urlIn、fpOut非有效字串、未給opt.pipeline)時reject說明字串。同一fpOut之併發下載由呼叫端自行避免
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsDownloadFile.test.mjs Github}
 * @memberOf wsemi
 * @param {String} urlIn 輸入下載網址字串，須為非空字串、可解析之http或https網址且不帶帳密(user:password@)；不合者reject說明字串'invalid urlIn: must be a non-empty string'、'invalid urlIn: must be a valid http or https url'、'invalid urlIn: must not contain credentials'(不帶輸入值)，先於fetch與寫檔
 * @param {String} fpOut 輸入儲存檔案路徑字串，須為非空字串且不含NUL字元(非字串含包裝String物件皆無效)；不合者reject說明字串'invalid fpOut: must be a non-empty string'或'invalid fpOut: must not contain a NUL character'(不帶輸入值，與路徑不存在分開)，先於fetch與寫檔
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Object} opt.fs 輸入fs，Core不自行匯入須由呼叫端注入，須提供statSync、lstatSync、createWriteStream、renameSync(資料夾之mkdirSync、失敗清理之unlinkSync於用到時才檢查)；缺漏(未給、null、非物件、缺少必要方法)為相依無效，reject說明字串'invalid opt.fs: must be an object providing statSync, lstatSync, createWriteStream, renameSync'(不帶輸入值，先於建立資料夾、fetch與寫檔)
 * @param {Function} opt.Readable 輸入stream之Readable，須提供fromWeb；缺漏同opt.fs，reject說明字串'invalid opt.Readable: must be an object providing fromWeb'
 * @param {Function} opt.pipeline 輸入stream/promises之pipeline，須為函數；缺漏同opt.fs，reject說明字串'invalid opt.pipeline: must be a function'
 * @returns {Promise} 回傳Promise，resolve回傳下載後檔案路徑，reject回傳錯誤訊息字串
 * @example
 * //need test in nodejs
 *
 * //see fsDownloadFile
 *
 */
async function fsDownloadFileCore(urlIn, fpOut, opt = {}) {
    //check urlIn, 網址(S4): 須為非空字串、可解析之http或https網址、不帶帳密(使用全域fetch無法安全處理帳密, 與fsDownloadFileVerifyCore一致); 與其他失敗一致以字串reject, 訊息依V19且不帶輸入值(V20)
    if (typeof urlIn !== 'string' || urlIn.trim() === '') {
        return Promise.reject(`invalid urlIn: must be a non-empty string`)
    }
    let u = null
    try {
        u = new URL(urlIn)
    }
    catch (err) {
        return Promise.reject(`invalid urlIn: must be a valid http or https url`)
    }
    if (u.protocol !== 'http:' && u.protocol !== 'https:') {
        return Promise.reject(`invalid urlIn: must be a valid http or https url`)
    }
    if (u.username !== '' || u.password !== '') {
        return Promise.reject(`invalid urlIn: must not contain credentials`)
    }

    //check fpOut, 路徑須為非空字串且不含NUL(R-FS-INVALID-PATH-01; 非字串含包裝String物件皆無效), 先於fetch與寫檔
    let msgFpOut = chkFsPath(fpOut, 'fpOut')
    if (msgFpOut) {
        return Promise.reject(msgFpOut)
    }

    let fs = null
    let Readable = null
    let pipeline = null

    //讀取opt置於try內: opt本身或其屬性不可讀(getter拋錯、已撤銷之Proxy)時get拋出, 於async函數內未捕捉即以Error物件reject; 非下載失敗, 依通則轉字串; 必須參數(urlIn、fpOut)之檢查先於讀取opt(opt之getter拋錯不得蓋過之)
    try {

        //fs
        fs = get(opt, 'fs')

        //Readable
        Readable = get(opt, 'Readable')

        //pipeline
        pipeline = get(opt, 'pipeline')

    }
    catch (err) {
        return Promise.reject(errToStr(err))
    }

    //check, 注入之fs、Readable、pipeline缺漏為相依無效(R-FS-DEPS-01), 先於建立資料夾、fetch與寫檔, 以說明字串reject(不帶輸入值)
    let msgDeps = chkFsDeps({ fs, Readable, pipeline }, {
        fs: ['statSync', 'lstatSync', 'createWriteStream', 'renameSync'],
        Readable: ['fromWeb'],
        pipeline: 'function',
    })
    if (msgDeps) {
        return Promise.reject(msgDeps)
    }

    //getPathParent
    let fdOut = getPathParent(fpOut)
    // console.log('fdOut', fdOut)

    //check, 注入之fs之lstatSync可拋出任意值, 於此轉字串reject(原以原值reject)
    try {
        if (!fsIsFolderCore(fdOut, { fs })) {
            fsCreateFolderCore(fdOut, { fs })
        }
    }
    catch (err) {
        return Promise.reject(`failed to download url[${urlIn}] to file[${fpOut}]: ${getErrorMessage(err, { useCause: true })}`)
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
