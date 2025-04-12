import fs from 'fs'
import assert from 'assert'
import fsCreateFolder from '../src/fsCreateFolder.mjs'
import fsDeleteFolder from '../src/fsDeleteFolder.mjs'
import fsWriteText from '../src/fsWriteText.mjs'
import getFileXxHash from '../src/getFileXxHash.mjs'


describe(`getFileXxHash`, async function() {

    let test = async () => {

        let ms = []

        let fdt = './_test_getFileXxHash'
        fsCreateFolder(fdt) //創建臨時任務資料夾

        let fn = 't1.txt'
        let fp = `${fdt}/abc/${fn}`

        fsWriteText(fp, 'xyz')

        let ab = fs.readFileSync(fp)
        let bb = new Blob([ab])

        let h1 = await getFileXxHash(bb)
        // console.log('getFileXxHash', h1)
        ms.push({ 'getFileXxHash': h1 })

        let h2 = await getFileXxHash(bb, { chunkSize: 16 * 1024 * 1024 })
        // console.log('getFileXxHash(chunkSize=16mb)', h2)
        ms.push({ 'getFileXxHash(chunkSize=16mb)': h2 })

        let h3 = await getFileXxHash(bb, { chunkSize: 4 * 1024 * 1024 })
        // console.log('getFileXxHash(chunkSize=4mb)', h3)
        ms.push({ 'getFileXxHash(chunkSize=4mb)': h3 })

        fsDeleteFolder(fdt) //刪除臨時任務資料夾

        // console.log('ms', ms)
        return ms
    }
    // await test()
    //     .catch((err) => {
    //         console.log(err)
    //     })
    // getFileXxHash feba48465b833ca1
    // getFileXxHash(chunkSize=16mb) feba48465b833ca1
    // getFileXxHash(chunkSize=4mb) feba48465b833ca1
    let ms = [
        { getFileXxHash: 'feba48465b833ca1' },
        { 'getFileXxHash(chunkSize=16mb)': 'feba48465b833ca1' },
        { 'getFileXxHash(chunkSize=4mb)': 'feba48465b833ca1' }
    ]

    it(`should return '${JSON.stringify(ms)}' when run test'`, async function() {
        let r = await test()
        let rr = ms
        assert.strict.deepStrictEqual(r, rr)
    })

})
