import fs from 'fs'
import genPm from './genPm.mjs'
import isearr from './isearr.mjs'
import getPathParent from './getPathParent.mjs'
import fsIsFolder from './fsIsFolder.mjs'
import fsIsFile from './fsIsFile.mjs'
import fsCreateFolder from './fsCreateFolder.mjs'
import fsDeleteFile from './fsDeleteFile.mjs'


/**
 * 後端nodejs合併多檔案
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsMergeFiles.test.mjs Github}
 * @memberOf wsemi
 * @param {String} fn 輸入實際檔名字串
 * @param {Array} fpsIn 輸入合併前各切片檔案路徑陣列
 * @param {String} fpOut 輸入合併後檔案路徑字串
 * @returns {Promise} 回傳Promise，resolve回傳合併後物件，reject回傳錯誤訊息
 * @example
 * //need test in nodejs
 *
 * let test = async () => {
 *     let ms = []
 *
 *     let fdt = './_test_fsMergeFiles'
 *     fsCreateFolder(fdt) //創建任務資料夾
 *
 *     fs.writeFileSync(`${fdt}/t1.txt`, 'abc', 'utf8')
 *     fs.writeFileSync(`${fdt}/t2.txt`, 'def', 'utf8')
 *     fs.writeFileSync(`${fdt}/t3.txt`, '中文', 'utf8')
 *     fs.writeFileSync(`${fdt}/t4.txt`, '測 試', 'utf8')
 *     fs.writeFileSync(`${fdt}/t5.txt`, '&*#$%', 'utf8')
 *
 *     let fn = '合併檔案.txt'
 *     let fpsIn = [
 *         `${fdt}/t1.txt`,
 *         `${fdt}/t2.txt`,
 *         `${fdt}/t3.txt`,
 *         `${fdt}/t4.txt`,
 *         `${fdt}/t5.txt`,
 *     ]
 *     let fpOut = `${fdt}/m.txt`
 *     await fsMergeFiles(fn, fpsIn, fpOut)
 *         .then((res) => {
 *             console.log('res', res)
 *             ms.push(res)
 *         })
 *         .catch((err) => {
 *             console.log('err', err)
 *         })
 *
 *     let c = fs.readFileSync(fpOut, 'utf8')
 *     console.log('c', c)
 *     ms.push({ content: c })
 *
 *     fsDeleteFolder(fdt) //最終階段清除任務資料夾
 *
 *     console.log('ms', ms)
 *     return ms
 * }
 * test()
 *     .catch(() => {})
 * // fpIn ./_test_fsMergeFiles/t1.txt
 * // fpIn ./_test_fsMergeFiles/t2.txt
 * // fpIn ./_test_fsMergeFiles/t3.txt
 * // fpIn ./_test_fsMergeFiles/t4.txt
 * // fpIn ./_test_fsMergeFiles/t5.txt
 * // res { filename: '合併檔案.txt', path: './_test_fsMergeFiles/m.txt' }
 * // c abcdef中文測 試&*#$%
 * // ms [
 * //   { filename: '合併檔案.txt', path: './_test_fsMergeFiles/m.txt' },
 * //   { content: 'abcdef中文測 試&*#$%' }
 * // ]
 *
 */
async function fsMergeFiles(fn, fpsIn, fpOut) {
    let errTemp = ''

    //check fpsIn
    if (!isearr(fpsIn)) {
        throw new Error(`fpsIn in not an effective array`)
    }

    //getPathParent
    let fd = getPathParent(fpOut)

    //check
    if (!fsIsFolder(fd)) {
        fsCreateFolder(fd)
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
            if (!fsIsFile(fpIn)) {
                throw new Error(`fpIn[${fpIn}] is not a file`)
            }

            //使用readFileSync會忽略背壓, 若寫入相對慢就會儲存至記憶體, 導致記憶體超量使用, 得要偵測與控制背壓
            // //chunkData
            // let chunkData = fs.readFileSync(fpIn)
            // //write
            // streamWrite.write(chunkData)
            // //fsDeleteFile
            // fsDeleteFile(fpIn)

            //transfer
            let transfer = () => {
                let pmc = genPm()

                //streamRead
                let streamRead = fs.createReadStream(fpIn)

                //監測錯誤
                streamRead.on('error', (err) => {
                    errTemp = err.message
                    pmc.reject(err)
                })

                //監測串流結束
                streamRead.on('end', () => {
                    fsDeleteFile(fpIn)
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
                filename: fn,
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


export default fsMergeFiles
