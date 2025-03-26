import fs from 'fs'
import assert from 'assert'
import getFileName from '../src/getFileName.mjs'
import fsDeleteFile from '../src/fsDeleteFile.mjs'
import fsRenameFile from '../src/fsRenameFile.mjs'
import fsWatchFile from '../src/fsWatchFile.mjs'


describe(`fsWatchFile`, function() {

    let test = async () => {
        return new Promise((resolve, reject) => {
            let ms = []

            let fp = './_test_fsWatchFile.txt'

            fsDeleteFile(fp)

            let ev = fsWatchFile(fp)
            ev.on('change', (msg) => {
                // console.log(msg.type, getFileName(msg.fp))
                ms.push({ type: msg.type, fp: getFileName(msg.fp) })
            })

            setTimeout(() => {
                fs.writeFileSync(fp, 'abc', 'utf8')
            }, 1)

            setTimeout(() => {
                fsRenameFile(fp, fp + '.tmp')
            }, 3000)

            setTimeout(() => {
                fsRenameFile(fp + '.tmp', fp)
            }, 6000)

            setTimeout(() => {
                fs.writeFileSync(fp, 'def', 'utf8')
            }, 9000)

            setTimeout(() => {
                fsDeleteFile(fp)
            }, 12000)

            setTimeout(() => {
                ev.clear()
                // console.log('ms', ms)
                resolve(ms)
            }, 15000)

        })
    }
    // test()
    //     .catch(() => {})
    // add _test_fsWatchFile.txt
    // unlink _test_fsWatchFile.txt
    // add _test_fsWatchFile.txt
    // change _test_fsWatchFile.txt
    // unlink _test_fsWatchFile.txt
    let ms = [
        { type: 'add', fp: '_test_fsWatchFile.txt' },
        { type: 'unlink', fp: '_test_fsWatchFile.txt' },
        { type: 'add', fp: '_test_fsWatchFile.txt' },
        { type: 'change', fp: '_test_fsWatchFile.txt' },
        { type: 'unlink', fp: '_test_fsWatchFile.txt' }
    ]

    it(`should return '${JSON.stringify(ms)}' when run test'`, async function() {
        let r = await test()
        let rr = ms
        assert.strict.deepStrictEqual(r, rr)
    })

})
