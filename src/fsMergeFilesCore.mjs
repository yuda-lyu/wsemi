import { once } from 'events'
import get from 'lodash-es/get.js'
import genPm from './genPm.mjs'
import isearr from './isearr.mjs'
import isestr from './isestr.mjs'
import getPathParent from './getPathParent.mjs'
import getFileName from './getFileName.mjs'
import fsIsFolderCore from './fsIsFolderCore.mjs'
import fsIsFileCore from './fsIsFileCore.mjs'
import fsCreateFolderCore from './fsCreateFolderCore.mjs'
import fsDeleteFileCore from './fsDeleteFileCore.mjs'


/**
 * 後端nodejs合併多檔案
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsMergeFilesCore.test.mjs Github}
 * @memberOf wsemi
 * @param {String} fn 輸入實際檔名字串
 * @param {Array} fpsIn 輸入合併前各切片檔案路徑陣列
 * @param {String} fpOut 輸入合併後檔案路徑字串
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {String} [opt.fnOut=getFileName(fpOut)] 輸入合併後檔案名稱字串，僅回傳時會使用，預設getFileName(fpOut)
 * @returns {Promise} 回傳Promise，resolve回傳合併後物件，reject回傳錯誤訊息
 * @example
 * //need test in nodejs
 *
 * //see fsMergeFiles
 *
 */
async function fsMergeFilesCore(fpsIn, fpOut, opt = {}) {
    let errTemp = ''

    //fs
    let fs = get(opt, 'fs')

    //check fpsIn
    if (!isearr(fpsIn)) {
        throw new Error(`fpsIn in not an effective array`)
    }

    //getPathParent
    let fdOut = getPathParent(fpOut)

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
    pm.catch(() => {}) //寫入流之error監聽會於逐片await期間(本函數尚未return pm, 無人持有pm)即reject, 無此空catch即成為unhandledRejection; 呼叫端持有之async外層promise會adopt此rejection, 呼叫端未接時仍會被回報, 不會吞錯

    //streamWrite, errWrite, pmWrite
    //寫入流之error監聽須於建立後立即掛上, 不可等到全部切片pipe完才掛: 開檔失敗(EISDIR/EACCES/EPERM/ENOENT)或寫入中出錯(ENOSPC)之error事件
    //會在逐片await期間發出, 無人監聽即成為uncaughtException(於worker內即為崩潰), 且該片之promise永不settle使呼叫端永久懸置
    //pmWrite供等待drain時競速: 寫入流出錯後drain永不觸發, 無競速即懸置
    let streamWrite = null
    let errWrite = null
    let pmWrite = genPm()
    pmWrite.catch(() => {}) //write於兩片之間(無人race時)出錯, pmWrite之reject會成為unhandledRejection, 故先掛空catch標記已處理; 實際處置在下方error監聽與迴圈頂端之errWrite檢查

    //攔截錯誤, 注意stream是非同步故try catch是無法攔截的, 須各自監聽read與write串流的error事件處理, 此處是攔截串流以外的錯誤
    try {

        //streamWrite
        streamWrite = fs.createWriteStream(fpOut)

        //error, 若有error則不會觸發finish
        streamWrite.on('error', (err) => {
            // console.log(`merge filename[${filename}] err`, err)
            errWrite = err
            errTemp = err.message
            pmWrite.reject(err)
            pm.reject(errTemp)
        })

        //finish, end之後檔案未必完成寫入會有時間差, 得要監聽finish才能確定寫入檔案完成
        streamWrite.on('finish', () => {
            // console.log(`merge filename[${filename}] end`)

            //r
            let r = {
                filename: fnOut,
                path: fpOut,
            }
            // let s = fs.statSync(fpOut)
            // console.log('s.size', s.size)

            //resolve
            pm.resolve(r)

        })

        // pathUploadTemp, packageId, chunkTotal, filename,

        for (let i = 0; i < fpsIn.length; i++) {

            //check, 寫入流已出錯則不再處理後續切片
            if (errWrite !== null) {
                throw errWrite
            }

            //fpIn
            let fpIn = fpsIn[i]
            // console.log('fpIn', fpIn)

            //check
            if (!fsIsFileCore(fpIn, { fs })) {
                throw new Error(`fpIn[${fpIn}] is not a file`)
            }

            //使用readFileSync會忽略背壓, 若寫入相對慢就會儲存至記憶體, 導致記憶體超量使用, 得要偵測與控制背壓
            // //chunkData
            // let chunkData = fs.readFileSync(fpIn)
            // //write
            // streamWrite.write(chunkData)
            // //fsDeleteFileCore
            // fsDeleteFileCore(fpIn)

            //transfer, 逐chunk讀取並寫入, 以本片最後一個chunk之write callback作為「本片已完整寫入」之屏障, 確認無誤後才刪除切片
            //不用pipe+read'end'刪切片: read之end只代表資料已交給寫入流之緩衝, 寫入是否成功要等write callback(真實ENOSPC為非同步回報),
            //小切片會end先於error到達而把資料未寫成功之切片誤刪; 零長度write亦不可當屏障(Writable會直接短路回呼不進佇列)
            let transfer = async () => {

                //streamRead, for await之下read出錯會直接拋出, 中途throw亦會自動destroy
                let streamRead = fs.createReadStream(fpIn)
                // console.log('fpIn',fpIn)

                //pmLast, 本片最後一個chunk之write callback
                let pmLast = null

                for await (let chunk of streamRead) {

                    //check, 寫入流已出錯則中止本片
                    if (errWrite !== null) {
                        throw errWrite
                    }

                    //write, callback依序觸發, 故最後一個callback成功即代表本片全部chunk皆已寫入成功
                    let needDrain = false
                    let pmw = new Promise((resolve, reject) => {
                        needDrain = !streamWrite.write(chunk, (err) => {
                            if (err) {
                                reject(err)
                            }
                            else {
                                resolve()
                            }
                        })
                    })
                    pmw.catch(() => {}) //僅await最後一個, 其餘先掛空catch避免成為unhandledRejection
                    pmLast = pmw

                    //背壓, write回傳false時等待drain; 須與pmWrite競速, 否則寫入流出錯後drain永不觸發而懸置
                    if (needDrain) {
                        await Promise.race([once(streamWrite, 'drain'), pmWrite])
                    }

                }

                //屏障, 等待本片最後一個write完成(出錯即拋出)
                if (pmLast !== null) {
                    await pmLast
                }
                if (errWrite !== null) {
                    throw errWrite
                }

                //fsDeleteFileCore, 本片確認寫入成功後才刪除
                fsDeleteFileCore(fpIn, { fs })

            }
            await transfer()

        }

        //end
        streamWrite.end()

    }
    catch (err) {
        errTemp = get(err, 'message', String(err))

        //destroy, 釋放fd: throw路徑(如切片缺失)之寫入流已成功開檔, 不destroy則fd殘留至程序結束; 已出錯之寫入流destroy為無害重複
        try {
            streamWrite.destroy()
        }
        catch (e) {}

        pm.reject(errTemp)
    }

    return pm
}


export default fsMergeFilesCore
