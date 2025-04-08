import fs from 'fs'
import assert from 'assert'
import fsIsFile from '../src/fsIsFile.mjs'
import fsCreateFolder from '../src/fsCreateFolder.mjs'
import fsDeleteFolder from '../src/fsDeleteFolder.mjs'
import fsCopyFile from '../src/fsCopyFile.mjs'


describe(`fsCopyFile`, function() {

    let testSync = async () => {
        let ms = []

        let fpSrc = './_test_fsCopyFile_src'
        let fpTar = './_test_fsCopyFile_tar'
        fsCreateFolder(fpSrc)
        fsCreateFolder(fpTar)

        fs.writeFileSync(`${fpSrc}/t1.txt`, 'abc', 'utf8')

        let rc = fsCopyFile(`${fpSrc}/t1.txt`, `${fpTar}/_t1.txt`)
        ms.push({ 'sync-copy-file': rc })

        let b1 = fsIsFile(`${fpTar}/_t1.txt`)
        ms.push({ 'sync-is-file': b1 })

        fsDeleteFolder(fpSrc)
        fsDeleteFolder(fpTar)

        // console.log('ms', ms)
        return ms
    }

    let testAsync = async () => {
        let ms = []

        let fpSrc = './_test_fsCopyFile_src'
        let fpTar = './_test_fsCopyFile_tar'
        fsCreateFolder(fpSrc)
        fsCreateFolder(fpTar)

        fs.writeFileSync(`${fpSrc}/t1.txt`, 'abc', 'utf8')

        await fsCopyFile(`${fpSrc}/t1.txt`, `${fpTar}/_t1.txt`, { useSync: false })
            .then((res) => {
                // console.log('res', res)
                ms.push({ 'async-copy-folder': res })
            })
            .catch((err) => {
                console.log('err', err)
            })

        let b1 = fsIsFile(`${fpTar}/_t1.txt`)
        ms.push({ 'async-is-file': b1 })

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
        {
            'sync-copy-file': { success: 'done: ./_test_fsCopyFile_tar/_t1.txt' }
        },
        { 'sync-is-file': true },
        {
            'async-copy-folder': { success: 'done: ./_test_fsCopyFile_tar/_t1.txt' }
        },
        { 'async-is-file': true }
    ]

    it(`should return '${JSON.stringify(ms)}' when run test'`, async function() {
        let r = await test()
        let rr = ms
        assert.strict.deepStrictEqual(r, rr)
    })

})
