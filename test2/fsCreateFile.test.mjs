import fs from 'fs'
import assert from 'assert'
import fsCreateFolder from '../src/fsCreateFolder.mjs'
import fsDeleteFolder from '../src/fsDeleteFolder.mjs'
import fsIsFile from '../src/fsIsFile.mjs'
import fsCreateFile from '../src/fsCreateFile.mjs'


describe(`fsCreateFile`, function() {

    let test = () => {

        let ms = []

        let fdt = './_test_fsCreateFile'
        fsCreateFolder(fdt) //創建臨時任務資料夾

        let fn = 't1.txt'
        let fp = `${fdt}/abc/${fn}`

        let b1 = fsIsFile(fp)
        // console.log('fsCreateFile(before)', b1)
        ms.push({ 'fsCreateFile(before)': b1 })

        let b2 = fsCreateFile(fp, 'abc', { encoding: 'utf8' })
        // console.log('fsCreateFile', b2)
        ms.push({ 'fsCreateFile': b2 })

        let b3 = fsIsFile(fp)
        // console.log('fsCreateFile(after)', b3)
        ms.push({ 'fsCreateFile(after)': b3 })

        let c = fs.readFileSync(fp, 'utf8')
        // console.log('readFileSync', c)
        ms.push({ 'readFileSync': c })

        fsDeleteFolder(fdt) //刪除臨時任務資料夾

        // console.log('ms', ms)
        return ms
    }
    // test()
    // fsCreateFile(before) false
    // fsCreateFile { success: 'done: ./_test_fsCreateFile/abc/t1.txt' }
    // fsCreateFile(after) true
    // readFileSync abc
    let ms = [
        { 'fsCreateFile(before)': false },
        { fsCreateFile: { success: 'done: ./_test_fsCreateFile/abc/t1.txt' } },
        { 'fsCreateFile(after)': true },
        { readFileSync: 'abc' }
    ]

    it(`should return '${JSON.stringify(ms)}' when run test`, async function() {
        let r = test()
        let rr = ms
        assert.strict.deepStrictEqual(r, rr)
    })

})
