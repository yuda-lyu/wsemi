import fs from 'fs'
import assert from 'assert'
import getFileName from '../src/getFileName.mjs'
import fsDeleteFile from '../src/fsDeleteFile.mjs'
import fsRenameFile from '../src/fsRenameFile.mjs'
import fsCreateFolder from '../src/fsCreateFolder.mjs'
import fsDeleteFolder from '../src/fsDeleteFolder.mjs'
import fsRenameFolder from '../src/fsRenameFolder.mjs'
import fsWatchFolder from '../src/fsWatchFolder.mjs'


describe(`fsWatchFolder`, function() {

    let test = async () => {
        return new Promise((resolve, reject) => {
            let ms = []

            let fp = './_test_fsWatchFolder'

            fsDeleteFolder(fp)

            let ev = fsWatchFolder(fp)
            ev.on('change', (msg) => {
                // console.log(msg.type, getFileName(msg.fp))
                ms.push({ type: msg.type, fp: getFileName(msg.fp) })
            })

            setTimeout(() => {
                fsCreateFolder(fp)
            }, 1)

            setTimeout(() => {
                fs.writeFileSync(`${fp}/abc.txt`, 'abc', 'utf8')
            }, 3000)

            setTimeout(() => {
                fsRenameFile(`${fp}/abc.txt`, `${fp}/abc.txt` + '.tmp')
            }, 6000)

            setTimeout(() => {
                fsRenameFile(`${fp}/abc.txt` + '.tmp', `${fp}/abc.txt`)
            }, 9000)

            setTimeout(() => {
                fs.writeFileSync(`${fp}/abc.txt`, 'def', 'utf8')
            }, 12000)

            setTimeout(() => {
                fsCreateFolder(`${fp}/test-fd`)
            }, 15000)

            setTimeout(() => {
                fsRenameFolder(`${fp}/test-fd`, `${fp}/test-fd` + '-tmp')
            }, 18000)

            setTimeout(() => {
                fsRenameFolder(`${fp}/test-fd` + '-tmp', `${fp}/test-fd`)
            }, 21000)

            setTimeout(() => {
                fsDeleteFile(`${fp}/abc.txt`)
            }, 24000)

            setTimeout(() => {
                fsDeleteFolder(`${fp}/test-fd`)
            }, 27000)

            setTimeout(() => {
                fsDeleteFolder(fp)
            }, 30000)

            setTimeout(() => {
                ev.clear()
                // console.log('ms', ms)
                resolve(ms)
            }, 33000)

        })
    }
    // test()
    //     .catch(() => {})
    // addDir _test_fsWatchFolder
    // add abc.txt
    // unlink abc.txt
    // add abc.txt.tmp
    // unlink abc.txt.tmp
    // add abc.txt
    // change abc.txt
    // addDir test-fd
    // unlinkDir test-fd
    // addDir test-fd-tmp
    // unlinkDir test-fd-tmp
    // addDir test-fd
    // unlink abc.txt
    // unlinkDir test-fd
    // unlinkDir _test_fsWatchFolder
    let ms = [
        { type: 'addDir', fp: '_test_fsWatchFolder' },
        { type: 'add', fp: 'abc.txt' },
        { type: 'unlink', fp: 'abc.txt' },
        { type: 'add', fp: 'abc.txt.tmp' },
        { type: 'unlink', fp: 'abc.txt.tmp' },
        { type: 'add', fp: 'abc.txt' },
        { type: 'change', fp: 'abc.txt' },
        { type: 'addDir', fp: 'test-fd' },
        { type: 'unlinkDir', fp: 'test-fd' },
        { type: 'addDir', fp: 'test-fd-tmp' },
        { type: 'unlinkDir', fp: 'test-fd-tmp' },
        { type: 'addDir', fp: 'test-fd' },
        { type: 'unlink', fp: 'abc.txt' },
        { type: 'unlinkDir', fp: 'test-fd' },
        { type: 'unlinkDir', fp: '_test_fsWatchFolder' }
    ]

    it(`should return '${JSON.stringify(ms)}' when run test'`, async function() {
        let r = await test()
        let rr = ms
        assert.strict.deepStrictEqual(r, rr)
    })

})
