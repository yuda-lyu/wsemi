import fs from 'fs'
import assert from 'assert'
import fsCreateFolder from '../src/fsCreateFolder.mjs'
import fsDeleteFolder from '../src/fsDeleteFolder.mjs'
import fsWriteText from '../src/fsWriteText.mjs'
import getFileHash from '../src/getFileHash.mjs'


describe(`getFileHash`, async function() {

    let test = async () => {

        let ms = []

        let fdt = './_test_getFileHash'
        fsCreateFolder(fdt) //創建臨時任務資料夾

        let fn = 't1.txt'
        let fp = `${fdt}/abc/${fn}`

        fsWriteText(fp, 'xyz')

        let ab = fs.readFileSync(fp)
        let bb = new Blob([ab])

        let h1 = await getFileHash(bb)
        // console.log('getFileHash(sha512)', h1)
        ms.push({ 'getFileHash(sha512)': h1 })

        let h2 = await getFileHash(bb, { type: 'sha256' })
        // console.log('getFileHash(sha256)', h2)
        ms.push({ 'getFileHash(sha256)': h2 })

        let h3 = await getFileHash(bb, { type: 'xxhash64' })
        // console.log('getFileHash(xxhash64)', h3)
        ms.push({ 'getFileHash(xxhash64)': h3 })

        let h4 = await getFileHash(bb, { type: 'xxhash64', chunkSize: 16 * 1024 * 1024 })
        // console.log('getFileHash(xxhash64,chunkSize=16mb)', h4)
        ms.push({ 'getFileHash(xxhash64,chunkSize=16mb)': h4 })

        let h5 = await getFileHash(bb, { type: 'xxhash64', chunkSize: 4 * 1024 * 1024 })
        // console.log('getFileHash(xxhash64,chunkSize=4mb)', h5)
        ms.push({ 'getFileHash(xxhash64,chunkSize=4mb)': h5 })

        fsDeleteFolder(fdt) //刪除臨時任務資料夾

        // console.log('ms', ms)
        return ms
    }
    // await test()
    //     .catch((err) => {
    //         console.log(err)
    //     })
    // getFileHash(sha512) 4a3ed8147e37876adc8f76328e5abcc1b470e6acfc18efea0135f983604953a58e183c1a6086e91ba3e821d926f5fdeb37761c7ca0328a963f5e92870675b728
    // getFileHash(sha256) 3608bca1e44ea6c4d268eb6db02260269892c0b42b86bbf1e77a6fa16c3c9282
    // getFileHash(xxhash64) feba48465b833ca1
    // getFileHash(xxhash64,chunkSize=16mb) feba48465b833ca1
    // getFileHash(xxhash64,chunkSize=4mb) feba48465b833ca1
    let ms = [
        {
            'getFileHash(sha512)': '4a3ed8147e37876adc8f76328e5abcc1b470e6acfc18efea0135f983604953a58e183c1a6086e91ba3e821d926f5fdeb37761c7ca0328a963f5e92870675b728'
        },
        {
            'getFileHash(sha256)': '3608bca1e44ea6c4d268eb6db02260269892c0b42b86bbf1e77a6fa16c3c9282'
        },
        { 'getFileHash(xxhash64)': 'feba48465b833ca1' },
        { 'getFileHash(xxhash64,chunkSize=16mb)': 'feba48465b833ca1' },
        { 'getFileHash(xxhash64,chunkSize=4mb)': 'feba48465b833ca1' }
    ]

    it(`should return '${JSON.stringify(ms)}' when run test`, async function() {
        let r = await test()
        let rr = ms
        assert.strict.deepStrictEqual(r, rr)
    })

})
