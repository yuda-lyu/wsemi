import fs from 'fs'
import assert from 'assert'
import fsCreateFolder from '../src/fsCreateFolder.mjs'
import fsIsFile from '../src/fsIsFile.mjs'
import fsIsFolder from '../src/fsIsFolder.mjs'
import fsCopyFolder from '../src/fsCopyFolder.mjs'
import fsDeleteFolder from '../src/fsDeleteFolder.mjs'


describe(`fsCopyFolder`, function() {

    let testSyncEmpty = async () => {
        let ms = []

        let fpSrc = './_test_fsCopyFolder_src'
        let fpTar = './_test_fsCopyFolder_tar'
        fsCreateFolder(fpSrc)
        fsDeleteFolder(fpTar)

        fsCreateFolder(`${fpSrc}/lay1/lay2`)
        fsCreateFolder(`${fpSrc}/lay1/lay2/lay3/lay4`)

        // fs.writeFileSync(`${fpSrc}/lay1/t1.txt`, 'abc', 'utf8')
        // fs.writeFileSync(`${fpSrc}/lay1/lay2/t2.txt`, 'def', 'utf8')
        // fs.writeFileSync(`${fpSrc}/lay1/lay2/lay3/t3.txt`, '中文', 'utf8')
        // fs.writeFileSync(`${fpSrc}/lay1/lay2/lay3/lay4/t4.txt`, '測 試', 'utf8')

        let rc = fsCopyFolder(fpSrc, fpTar)
        ms.push({ 'sync-empty-copy-folder': rc })

        let b1 = fsIsFolder(`${fpTar}/lay1/lay2/lay3`)
        ms.push({ 'sync-empty-is-folder-1': b1 })
        let b2 = fsIsFolder(`${fpTar}/lay1/lay2/lay3/lay4`)
        ms.push({ 'sync-empty-is-folder-2': b2 })
        let b3 = fsIsFile(`${fpTar}/lay1/lay2/lay3/t3.txt`)
        ms.push({ 'sync-empty-is-file-1': b3 })
        let b4 = fsIsFile(`${fpTar}/lay1/lay2/lay3/lay4/t4.txt`)
        ms.push({ 'sync-empty-is-file-2': b4 })

        fsDeleteFolder(fpSrc)
        fsDeleteFolder(fpTar)

        // console.log('ms', ms)
        return ms
    }

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

        let b1 = fsIsFolder(`${fpTar}/lay1/lay2/lay3`)
        ms.push({ 'sync-is-folder-1': b1 })
        let b2 = fsIsFolder(`${fpTar}/lay1/lay2/lay3/lay4`)
        ms.push({ 'sync-is-folder-2': b2 })
        let b3 = fsIsFile(`${fpTar}/lay1/lay2/lay3/t3.txt`)
        ms.push({ 'sync-is-file-1': b3 })
        let b4 = fsIsFile(`${fpTar}/lay1/lay2/lay3/lay4/t4.txt`)
        ms.push({ 'sync-is-file-2': b4 })

        fsDeleteFolder(fpSrc)
        fsDeleteFolder(fpTar)

        // console.log('ms', ms)
        return ms
    }

    let testAsyncEmpty = async () => {
        let ms = []

        let fpSrc = './_test_fsCopyFolder_src'
        let fpTar = './_test_fsCopyFolder_tar'
        fsCreateFolder(fpSrc)

        fsCreateFolder(`${fpSrc}/lay1/lay2`)
        fsCreateFolder(`${fpSrc}/lay1/lay2/lay3/lay4`)

        // fs.writeFileSync(`${fpSrc}/lay1/t1.txt`, 'abc', 'utf8')
        // fs.writeFileSync(`${fpSrc}/lay1/lay2/t2.txt`, 'def', 'utf8')
        // fs.writeFileSync(`${fpSrc}/lay1/lay2/lay3/t3.txt`, '中文', 'utf8')
        // fs.writeFileSync(`${fpSrc}/lay1/lay2/lay3/lay4/t4.txt`, '測 試', 'utf8')

        await fsCopyFolder(fpSrc, fpTar, { useSync: false })
            .then((res) => {
                // console.log('res', res)
                ms.push({ 'async-empty-copy-folder': res })
            })
            .catch(() => {
                // console.log('err', err)
            })

        let b1 = fsIsFolder(`${fpTar}/lay1/lay2/lay3`)
        ms.push({ 'async-empty-is-folder-1': b1 })
        let b2 = fsIsFolder(`${fpTar}/lay1/lay2/lay3/lay4`)
        ms.push({ 'async-empty-is-folder-2': b2 })
        let b3 = fsIsFile(`${fpTar}/lay1/lay2/lay3/t3.txt`)
        ms.push({ 'async-empty-is-file-1': b3 })
        let b4 = fsIsFile(`${fpTar}/lay1/lay2/lay3/lay4/t4.txt`)
        ms.push({ 'async-empty-is-file-2': b4 })

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
            .catch(() => {
                // console.log('err', err)
            })

        let b1 = fsIsFolder(`${fpTar}/lay1/lay2/lay3`)
        ms.push({ 'async-is-folder-1': b1 })
        let b2 = fsIsFolder(`${fpTar}/lay1/lay2/lay3/lay4`)
        ms.push({ 'async-is-folder-2': b2 })
        let b3 = fsIsFile(`${fpTar}/lay1/lay2/lay3/t3.txt`)
        ms.push({ 'async-is-file-1': b3 })
        let b4 = fsIsFile(`${fpTar}/lay1/lay2/lay3/lay4/t4.txt`)
        ms.push({ 'async-is-file-2': b4 })

        fsDeleteFolder(fpSrc)
        fsDeleteFolder(fpTar)

        // console.log('ms', ms)
        return ms
    }

    let test = async () => {
        let ms = []
        ms = [...ms, ...await testSyncEmpty()]
        ms = [...ms, ...await testSync()]
        ms = [...ms, ...await testAsyncEmpty()]
        ms = [...ms, ...await testAsync()]
        // console.log('ms', ms)
        return ms
    }
    // await test()
    //     .catch((err) => {
    //         console.log(err)
    //     })
    let ms = [
        {
            'sync-empty-copy-folder': { success: 'done: ./_test_fsCopyFolder_tar' }
        },
        { 'sync-empty-is-folder-1': true },
        { 'sync-empty-is-folder-2': true },
        { 'sync-empty-is-file-1': false },
        { 'sync-empty-is-file-2': false },
        { 'sync-copy-folder': { success: 'done: ./_test_fsCopyFolder_tar' } },
        { 'sync-is-folder-1': true },
        { 'sync-is-folder-2': true },
        { 'sync-is-file-1': true },
        { 'sync-is-file-2': true },
        {
            'async-empty-copy-folder': { success: 'done: ./_test_fsCopyFolder_tar' }
        },
        { 'async-empty-is-folder-1': true },
        { 'async-empty-is-folder-2': true },
        { 'async-empty-is-file-1': false },
        { 'async-empty-is-file-2': false },
        {
            'async-copy-folder': { success: 'done: ./_test_fsCopyFolder_tar' }
        },
        { 'async-is-folder-1': true },
        { 'async-is-folder-2': true },
        { 'async-is-file-1': true },
        { 'async-is-file-2': true }
    ]

    it(`should return '${JSON.stringify(ms)}' when run test`, async function() {
        let r = await test()
        let rr = ms
        assert.strict.deepStrictEqual(r, rr)
    })

})
