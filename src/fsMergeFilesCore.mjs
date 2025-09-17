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

    //攔截錯誤, 注意stream是非同步故try catch是無法攔截的, 須各自監聽read與write串流的error事件處理, 此處是攔截串流以外的錯誤
    try {

        //streamWrite
        let streamWrite = fs.createWriteStream(fpOut)

        // pathUploadTemp, packageId, chunkTotal, filename,

        for (let i = 0; i < fpsIn.length; i++) {

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

            //transfer
            let transfer = () => {
                let pmc = genPm()

                //streamRead
                let streamRead = fs.createReadStream(fpIn)
                // console.log('fpIn',fpIn)

                //監測錯誤
                streamRead.on('error', (err) => {
                    errTemp = err.message
                    pmc.reject(err)
                })

                //監測串流結束
                streamRead.on('end', () => {
                    fsDeleteFileCore(fpIn, { fs })
                    pmc.resolve()
                })

                //pipe, 將讀取流接入寫入流, 會自動調節讀寫速率處理背壓
                //注意pipe不會自動處理錯誤, 若read出錯也不會因pipe轉移至write, 故read的錯誤得要獨立監聽處理
                streamRead.pipe(streamWrite, { end: false })

                return pmc
            }
            await transfer()

        }

        //end
        streamWrite.end()

        //error, 若有error則不會觸發finish
        streamWrite.on('error', (err) => {
            // console.log(`merge filename[${filename}] err`, err)
            errTemp = err.message
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

    }
    catch (err) {
        errTemp = err.message
        pm.reject(errTemp)
    }

    return pm
}


export default fsMergeFilesCore
