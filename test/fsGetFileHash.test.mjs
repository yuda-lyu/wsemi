import assert from 'assert'
import fsCreateFolder from '../src/fsCreateFolder.mjs'
import fsDeleteFolder from '../src/fsDeleteFolder.mjs'
import fsWriteText from '../src/fsWriteText.mjs'
import fsGetFileHash from '../src/fsGetFileHash.mjs'


describe(`fsGetFileHash`, async function() {

    let test = async () => {

        let ms = []

        let fdt = './_test_fsGetFileHash'
        fsCreateFolder(fdt) //創建臨時任務資料夾

        let fn = 't1.txt'
        let fp = `${fdt}/abc/${fn}`

        fsWriteText(fp, 'xyz')

        let h1 = await fsGetFileHash(fp)
        // console.log('fsGetFileHash(sha512)', h1)
        ms.push({ 'fsGetFileHash(sha512)': h1 })

        let h2 = await fsGetFileHash(fp, { type: 'sha256' })
        // console.log('fsGetFileHash(sha256)', h2)
        ms.push({ 'fsGetFileHash(sha256)': h2 })

        let h3 = await fsGetFileHash(fp, { type: 'xxhash64' })
        // console.log('fsGetFileHash(xxhash64)', h3)
        ms.push({ 'fsGetFileHash(xxhash64)': h3 })

        let h4 = await fsGetFileHash(fp, { type: 'xxhash64', chunkSize: 16 * 1024 * 1024 })
        // console.log('fsGetFileHash(xxhash64,chunkSize=16mb)', h4)
        ms.push({ 'fsGetFileHash(xxhash64,chunkSize=16mb)': h4 })

        let h5 = await fsGetFileHash(fp, { type: 'xxhash64', chunkSize: 4 * 1024 * 1024 })
        // console.log('fsGetFileHash(xxhash64,chunkSize=4mb)', h5)
        ms.push({ 'fsGetFileHash(xxhash64,chunkSize=4mb)': h5 })

        fsDeleteFolder(fdt) //刪除臨時任務資料夾

        // console.log('ms', ms)
        return ms
    }
    // await test()
    //     .catch((err) => {
    //         console.log(err)
    //     })
    // fsGetFileHash(sha512) 4a3ed8147e37876adc8f76328e5abcc1b470e6acfc18efea0135f983604953a58e183c1a6086e91ba3e821d926f5fdeb37761c7ca0328a963f5e92870675b728
    // fsGetFileHash(sha256) 3608bca1e44ea6c4d268eb6db02260269892c0b42b86bbf1e77a6fa16c3c9282
    // fsGetFileHash(xxhash64) feba48465b833ca1
    // fsGetFileHash(xxhash64,chunkSize=16mb) feba48465b833ca1
    // fsGetFileHash(xxhash64,chunkSize=4mb) feba48465b833ca1
    let ms = [
        {
            'fsGetFileHash(sha512)': '4a3ed8147e37876adc8f76328e5abcc1b470e6acfc18efea0135f983604953a58e183c1a6086e91ba3e821d926f5fdeb37761c7ca0328a963f5e92870675b728'
        },
        {
            'fsGetFileHash(sha256)': '3608bca1e44ea6c4d268eb6db02260269892c0b42b86bbf1e77a6fa16c3c9282'
        },
        { 'fsGetFileHash(xxhash64)': 'feba48465b833ca1' },
        { 'fsGetFileHash(xxhash64,chunkSize=16mb)': 'feba48465b833ca1' },
        { 'fsGetFileHash(xxhash64,chunkSize=4mb)': 'feba48465b833ca1' }
    ]

    it(`should return '${JSON.stringify(ms)}' when run test`, async function() {
        let r = await test()
        let rr = ms
        assert.strict.deepStrictEqual(r, rr)
    })

})
