import fs from 'fs'
import assert from 'assert'
import fsIsFile from '../src/fsIsFile.mjs'
import fsIsFolder from '../src/fsIsFolder.mjs'
import fsCreateFolder from '../src/fsCreateFolder.mjs'
import fsDeleteFolder from '../src/fsDeleteFolder.mjs'
import fsCopyFolder from '../src/fsCopyFolder.mjs'


describe(`fsCopyFolder`, function() {

    let testSync = async () => {
        let ms = []

        let fpSrc = './_test_fsCopyFolder_src'
        let fpTar = './_test_fsCopyFolder_tar'
        fsCreateFolder(fpSrc)

        fsCreateFolder(`${fpSrc}/lay1/lay2`)
        fsCreateFolder(`${fpSrc}/lay1/lay2/lay3/lay4`)

        fs.writeFileSync(`${fpSrc}/lay1/t1.txt`, 'abc', 'utf8')
        fs.writeFileSync(`${fpSrc}/lay1/lay2/t2.txt`, 'def', 'utf8')
        fs.writeFileSync(`${fpSrc}/lay1/lay2/lay3/t3.txt`, '中文', 'utf8')
        fs.writeFileSync(`${fpSrc}/lay1/lay2/lay3/lay4/t4.txt`, '測 試', 'utf8')

        let rc = fsCopyFolder(fpSrc, fpTar)
        ms.push({ 'sync-copy-folder': rc })

        let b1 = fsIsFolder(`${fpSrc}/lay1/lay2/lay3`)
        ms.push({ 'sync-is-folder': b1 })
        let b2 = fsIsFile(`${fpSrc}/lay1/lay2/lay3/lay4/t4.txt`)
        ms.push({ 'sync-is-file': b2 })

        fsDeleteFolder(fpSrc)
        fsDeleteFolder(fpTar)

        // console.log('ms', ms)
        return ms
    }

    let testAsync = async () => {
        let ms = []

        let fpSrc = './_test_fsCopyFolder_src'
        let fpTar = './_test_fsCopyFolder_tar'
        fsCreateFolder(fpSrc)

        fsCreateFolder(`${fpSrc}/lay1/lay2`)
        fsCreateFolder(`${fpSrc}/lay1/lay2/lay3/lay4`)

        fs.writeFileSync(`${fpSrc}/lay1/t1.txt`, 'abc', 'utf8')
        fs.writeFileSync(`${fpSrc}/lay1/lay2/t2.txt`, 'def', 'utf8')
        fs.writeFileSync(`${fpSrc}/lay1/lay2/lay3/t3.txt`, '中文', 'utf8')
        fs.writeFileSync(`${fpSrc}/lay1/lay2/lay3/lay4/t4.txt`, '測 試', 'utf8')

        await fsCopyFolder(fpSrc, fpTar, { useSync: false })
            .then((res) => {
                // console.log('res', res)
                ms.push({ 'async-copy-folder': res })
            })
            .catch((err) => {
                console.log('err', err)
            })

        let b1 = fsIsFolder(`${fpSrc}/lay1/lay2/lay3`)
        ms.push({ 'async-is-folder': b1 })
        let b2 = fsIsFile(`${fpSrc}/lay1/lay2/lay3/lay4/t4.txt`)
        ms.push({ 'async-is-file': b2 })

        fsDeleteFolder(fpSrc)
        fsDeleteFolder(fpTar)

        // console.log('ms', ms)
        return ms
    }

    let test = async () => {
        let ms = []
        let msSync = await testSync()
        ms = [...ms, ...msSync]
        let msAsync = await testAsync()
        ms = [...ms, ...msAsync]
        // console.log('ms', ms)
        return ms
    }
    // test()
    //     .catch(() => {})
    let ms = [
        { 'sync-copy-folder': { success: 'done: ./_test_fsCopyFolder_tar' } },
        { 'sync-is-folder': true },
        { 'sync-is-file': true },
        {
            'async-copy-folder': { success: 'done: ./_test_fsCopyFolder_tar' }
        },
        { 'async-is-folder': true },
        { 'async-is-file': true }
    ]

    it(`should return '${JSON.stringify(ms)}' when run test'`, async function() {
        let r = await test()
        let rr = ms
        assert.strict.deepStrictEqual(r, rr)
    })

})
