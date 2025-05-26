import assert from 'assert'
import fsCreateFolder from '../src/fsCreateFolder.mjs'
import fsDeleteFolder from '../src/fsDeleteFolder.mjs'
import fsWriteText from '../src/fsWriteText.mjs'
import fsGetFileBasicHash from '../src/fsGetFileBasicHash.mjs'


describe(`fsGetFileBasicHash`, async function() {

    let test = async () => {

        let ms = []

        let fdt = './_test_fsGetFileBasicHash'
        fsCreateFolder(fdt) //創建臨時任務資料夾

        let fn = 't1.txt'
        let fp = `${fdt}/abc/${fn}`

        fsWriteText(fp, 'xyz')

        let h1 = await fsGetFileBasicHash(fp)
        // console.log('fsGetFileBasicHash(sha512)', h1)
        ms.push({ 'fsGetFileBasicHash(sha512)': h1 })

        let h2 = await fsGetFileBasicHash(fp, { type: 'sha256' })
        // console.log('fsGetFileBasicHash(sha256)', h2)
        ms.push({ 'fsGetFileBasicHash(sha256)': h2 })

        fsDeleteFolder(fdt) //刪除臨時任務資料夾

        // console.log('ms', ms)
        return ms
    }
    // await test()
    //     .catch((err) => {
    //         console.log(err)
    //     })
    // fsGetFileBasicHash(sha512) 4a3ed8147e37876adc8f76328e5abcc1b470e6acfc18efea0135f983604953a58e183c1a6086e91ba3e821d926f5fdeb37761c7ca0328a963f5e92870675b728
    // fsGetFileBasicHash(sha256) 3608bca1e44ea6c4d268eb6db02260269892c0b42b86bbf1e77a6fa16c3c9282
    let ms = [
        {
            'fsGetFileBasicHash(sha512)': '4a3ed8147e37876adc8f76328e5abcc1b470e6acfc18efea0135f983604953a58e183c1a6086e91ba3e821d926f5fdeb37761c7ca0328a963f5e92870675b728'
        },
        {
            'fsGetFileBasicHash(sha256)': '3608bca1e44ea6c4d268eb6db02260269892c0b42b86bbf1e77a6fa16c3c9282'
        }
    ]

    it(`should return '${JSON.stringify(ms)}' when run test`, async function() {
        let r = await test()
        let rr = ms
        assert.strict.deepStrictEqual(r, rr)
    })

})
