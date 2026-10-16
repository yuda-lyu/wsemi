import fs from 'fs'
import genPm from './genPm.mjs'
import errToStr from './_errToStr.mjs'


/**
 * 使用stream寫入utf8文字至檔案
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsBuildWriteStreamText.test.mjs Github}
 * @memberOf wsemi
 * @returns {Object} 回傳函數物件，提供creat、write、end函數，create代表創建stream，可輸入fp為檔案路徑字串，回傳Promise，寫入完成(finish)時resolve，開檔或寫入失敗(含fp無效)時reject錯誤訊息字串，不同步拋出，該Promise已標記為已處理(呼叫端未接時不成為未處理之rejection，await者仍收到reject)，write代表寫入字串，輸入c為字串(預設為行)，須於create後呼叫(未create即呼叫則同步拋錯)，create失敗後呼叫則不動作，end代表結束stream，無輸入，回傳Promise，於stream關閉(close)後resolve，未create或stream已關閉(如開檔失敗)時直接resolve
 * @example
 * need test in nodejs.
 *
 * let test = async () => {
 *
 *     let ms = []
 *
 *     let fdt = './_test_fsBuildWriteStreamText'
 *     fsCreateFolder(fdt) //創建臨時任務資料夾
 *
 *     let fn = 't1.txt'
 *     let fp = `${fdt}/${fn}`
 *
 *     let bdw = fsBuildWriteStreamText()
 *
 *     let pm = bdw.create(fp)
 *     ms.push({ 'create': '' })
 *
 *     bdw.write('abc')
 *     ms.push({ 'write': 'abc' })
 *     bdw.write('中文')
 *     ms.push({ 'write': '中文' })
 *     bdw.end()
 *
 *     await pm
 *
 *     let c = fs.readFileSync(fp, 'utf8')
 *     ms.push({ 'readFileSync': c })
 *
 *     fsDeleteFolder(fdt) //刪除臨時任務資料夾
 *
 *     console.log('ms', ms)
 *     return ms
 * }
 * await test()
 * // ms [
 * //   { create: '' },
 * //   { write: 'abc' },
 * //   { write: '中文' },
 * //   { readFileSync: 'abc\n中文\n' }
 * // ]
 *
 */
function fsBuildWriteStreamText() {

    //stream
    let stream = null

    //failed, 已呼叫create而串流失敗(createWriteStream同步拋錯或派發error), 之後write不動作
    let failed = false

    //create
    let create = (fp) => {

        //pm
        let pm = genPm()
        pm.catch(() => {}) //先標記已處理: 依範例流程(create→write→end→await pm)於await pm之前失敗(同步失敗即reject)或呼叫端未接時, 無此空catch即成為unhandledRejection(無處理器時行程以離開碼1結束); await pm者仍收到rejection

        //failed
        failed = false

        //createWriteStream, fp無效(非字串等)時同步拋錯, 轉為reject
        try {
            stream = fs.createWriteStream(fp, { flags: 'w', encoding: 'utf8' })
        }
        catch (err) {
            stream = null //無開啟中之串流, end直接resolve
            failed = true
            pm.reject(errToStr(err))
            return pm
        }

        //finish
        stream.on('finish', () => {
            pm.resolve()
        })

        //error
        stream.on('error', (err) => {
            failed = true
            pm.reject(errToStr(err)) //與fs系其他函數一致以字串reject
        })

        return pm
    }

    //write
    let write = (c) => {

        //check, 已呼叫create而失敗者不動作(原於同步失敗後對null拋TypeError, 遮蔽根因且使呼叫端跳過await pm); 未呼叫create即write仍對null同步拋TypeError(須於create後呼叫)
        if (failed) {
            return
        }

        stream.write(c + '\n')
    }

    //end
    let end = () => {
        let pmm = genPm()

        //check, 未create或串流已關閉(如開檔失敗後已自行destroy並派發close)時close不會再派發, 原為永久懸置(未create時同步拋錯)
        if (stream === null || stream.closed) {
            pmm.resolve()
            return pmm
        }

        stream.on('close', () => {
            //close事件才代表檔案可刪除
            pmm.resolve()
        })
        stream.end() //發出flush與close
        return pmm
    }

    //r
    let r = {
        create,
        write,
        end,
    }

    return r
}


export default fsBuildWriteStreamText
