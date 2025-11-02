import fs from 'fs'
import _ from 'lodash-es'
import ot from 'dayjs'
import fsIsFile from './src/fsIsFile.mjs'
import fsDeleteFile from './src/fsDeleteFile.mjs'
import fsIsFolder from './src/fsIsFolder.mjs'
import fsCleanFolder from './src/fsCleanFolder.mjs'
import fsCreateFolder from './src/fsCreateFolder.mjs'
import fsDeleteFolder from './src/fsDeleteFolder.mjs'
import fsWriteText from './src/fsWriteText.mjs'
import fsWriteJson from './src/fsWriteJson.mjs'


let test = () => {

    let ms = []

    let fdt = './_test_fsWriteJson'
    fsCreateFolder(fdt) //創建臨時任務資料夾

    let inp = { str: '測試中文', val: 123.45, int: 5 }

    let fn1 = 't1.json'
    let fp1 = `${fdt}/${fn1}`

    let r1 = fsWriteJson(fp1, inp)
    console.log('fsWriteJson', r1)
    ms.push({ 'fsWriteJson': r1 })

    let c1 = fs.readFileSync(fp1, 'utf8')
    console.log('readFileSync', c1)
    ms.push({ 'readFileSync': c1 })

    let fn2 = 't2.json'
    let fp2 = `${fdt}/${fn2}`

    let r2 = fsWriteJson(fp2, inp, { useFormat: true })
    console.log('fsWriteJson', r2)
    ms.push({ 'fsWriteJson': r2 })

    let c2 = fs.readFileSync(fp2, 'utf8')
    console.log('readFileSync', c2)
    ms.push({ 'readFileSync': c2 })

    fsDeleteFolder(fdt) //刪除臨時任務資料夾

    console.log('ms', ms)
    return ms
}
test()
// fsWriteJson { success: './_test_fsWriteJson/t1.json' }
// readFileSync {"str":"測試中文","val":123.45,"int":5}
// fsWriteJson { success: './_test_fsWriteJson/t2.json' }
// readFileSync {
//   "str": "測試中文",
//   "val": 123.45,
//   "int": 5
// }
// ms [
//   { fsWriteJson: { success: './_test_fsWriteJson/t1.json' } },
//   { readFileSync: '{"str":"測試中文","val":123.45,"int":5}' },
//   { fsWriteJson: { success: './_test_fsWriteJson/t2.json' } },
//   {
//     readFileSync: '{\n  "str": "測試中文",\n  "val": 123.45,\n  "int": 5\n}'
//   }
// ]

//node g.mjs
