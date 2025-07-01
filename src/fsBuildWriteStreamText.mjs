import fs from 'fs'
import genPm from './genPm.mjs'


/**
 * 使用stream寫入utf-8文字至檔案
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/fsBuildWriteStreamText.test.mjs Github}
 * @memberOf wsemi
 * @param {String} fp 輸入檔案名稱
 * @param {String} c 輸入utf-8文字數據
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
        stream.end() //發出flush與close
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
