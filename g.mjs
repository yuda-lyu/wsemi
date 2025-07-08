import fs from 'fs'
import _ from 'lodash-es'
import ot from 'dayjs'
import fsDeleteFile from './src/fsDeleteFile.mjs'
import fsCreateFolder from './src/fsCreateFolder.mjs'
import fsDeleteFolder from './src/fsDeleteFolder.mjs'
import fsSrlog from './src/fsSrlog.mjs'
import dig from './src/dig.mjs'
import genPm from './src/genPm.mjs'
import fsBuildReadStreamText from './src/fsBuildReadStreamText.mjs'


let test = async () => {

    let ms = []

    let fdt = './_test_fsBuildReadStreamText'
    fsCreateFolder(fdt) //創建臨時任務資料夾

    let fn = 't1.txt'
    let fp = `${fdt}/${fn}`

    fs.writeFileSync(fp, `abc
測試中文
def123xyz
`, 'utf8')

    let ev = fsBuildReadStreamText(fp)
    ms.push({ 'create': '' })

    ev.on('line', (line) => {
        console.log('line', line)
        ms.push({ line })
    })

    let pm = genPm()
    ev.on('close', () => {
        console.log('close')
        pm.resolve()
        ms.push({ 'close': '' })
    })
    await pm

    fsDeleteFolder(fdt) //刪除臨時任務資料夾

    console.log('ms', ms)
    return ms
}
await test()
// ms [
//   { create: '' },
//   { line: 'abc' },
//   { line: '測試中文' },
//   { line: 'def123xyz' },
//   { close: '' }
// ]


//node g.mjs
