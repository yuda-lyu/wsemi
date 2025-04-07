import fs from 'fs'
import _ from 'lodash-es'
import fsCreateFolder from './src/fsCreateFolder.mjs'
import fsDeleteFolder from './src/fsDeleteFolder.mjs'
import fsMergeFiles from './src/fsMergeFiles.mjs'


let test = async () => {
    let ms = []

    let fdt = './_test_fsMergeFiles'
    fsCreateFolder(fdt) //創建任務資料夾

    fs.writeFileSync(`${fdt}/t1.txt`, 'abc', 'utf8')
    fs.writeFileSync(`${fdt}/t2.txt`, 'def', 'utf8')
    fs.writeFileSync(`${fdt}/t3.txt`, '中文', 'utf8')
    fs.writeFileSync(`${fdt}/t4.txt`, '測 試', 'utf8')
    fs.writeFileSync(`${fdt}/t5.txt`, '&*#$%', 'utf8')

    let fn = '合併檔案.txt'
    let fpsIn = [
        `${fdt}/t1.txt`,
        `${fdt}/t2.txt`,
        `${fdt}/t3.txt`,
        `${fdt}/t4.txt`,
        `${fdt}/t5.txt`,
    ]
    let fpOut = `${fdt}/m.txt`
    await fsMergeFiles(fn, fpsIn, fpOut)
        .then((res) => {
            console.log('res', res)
            ms.push(res)
        })
        .catch((err) => {
            console.log('err', err)
        })

    let c = fs.readFileSync(fpOut, 'utf8')
    console.log('c', c)
    ms.push({ content: c })

    fsDeleteFolder(fdt) //最終階段清除任務資料夾

    console.log('ms', ms)
    return ms
}
test()
    .catch(() => {})
// res { filename: '合併檔案.txt', path: './_test_fsMergeFiles/m.txt' }
// c abcdef中文測 試&*#$%
// ms [
//   { filename: '合併檔案.txt', path: './_test_fsMergeFiles/m.txt' },
//   { content: 'abcdef中文測 試&*#$%' }
// ]

//node --experimental-modules g.mjs
