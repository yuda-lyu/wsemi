import fs from 'fs'
import genPm from './genPm.mjs'


/**
 * 使用stream寫入utf8文字至檔案
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsBuildWriteStreamText.test.mjs Github}
 * @memberOf wsemi
 * @returns {Object} 回傳函數物件，提供creat、write、end函數，create代表創建stream，可輸入fp為檔案路徑字串，write代表寫入字串，輸入c為字串(預設為行)，end代表結束stream，無輸入
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

    //create
    let create = (fp) => {

        //pm
        let pm = genPm()

        //createWriteStream
        stream = fs.createWriteStream(fp, { flags: 'w', encoding: 'utf8' })

        //finish
        stream.on('finish', () => {
            pm.resolve()
        })

        //error
        stream.on('error', (err) => {
            pm.reject(err)
        })

        return pm
    }

    //write
    let write = (c) => {
        stream.write(c + '\n')
    }

    //end
    let end = () => {
        let pmm = genPm()
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
