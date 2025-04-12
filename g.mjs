import fs from 'fs'
import _ from 'lodash-es'
import fsCreateFolder from './src/fsCreateFolder.mjs'
import fsWriteText from './src/fsWriteText.mjs'
import fsDeleteFolder from './src/fsDeleteFolder.mjs'
import fsGetFileXxHash from './src/fsGetFileXxHash.mjs'


let test = async () => {

    let ms = []

    let fdt = './_test_fsGetFileXxHash'
    fsCreateFolder(fdt) //創建臨時任務資料夾

    let fn = 't1.txt'
    let fp = `${fdt}/abc/${fn}`

    fsWriteText(fp, 'xyz')

    let h1 = await fsGetFileXxHash(fp)
    console.log('fsGetFileXxHash(64mb)', h1)
    ms.push({ 'fsGetFileXxHash(64mb)': h1 })

    let h2 = await fsGetFileXxHash(fp, { chunkSize: 16 * 1024 * 1024 })
    console.log('fsGetFileXxHash(16mb)', h2)
    ms.push({ 'fsGetFileXxHash(16mb)': h2 })

    let h3 = await fsGetFileXxHash(fp, { chunkSize: 4 * 1024 * 1024 })
    console.log('fsGetFileXxHash(4mb)', h3)
    ms.push({ 'fsGetFileXxHash(4mb)': h3 })

    fsDeleteFolder(fdt) //刪除臨時任務資料夾

    console.log('ms', ms)
    return ms
}
await test()
    .catch((err) => {
        console.log(err)
    })
// fsGetFileXxHash(64mb) feba48465b833ca1
// fsGetFileXxHash(16mb) feba48465b833ca1
// fsGetFileXxHash(4mb) feba48465b833ca1
// ms [
//   { 'fsGetFileXxHash(64mb)': 'feba48465b833ca1' },
//   { 'fsGetFileXxHash(16mb)': 'feba48465b833ca1' },
//   { 'fsGetFileXxHash(4mb)': 'feba48465b833ca1' }
// ]


//node --experimental-modules g.mjs
