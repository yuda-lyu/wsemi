import fs from 'fs'
import assert from 'assert'
import fsCreateFolder from '../src/fsCreateFolder.mjs'
import fsDeleteFolder from '../src/fsDeleteFolder.mjs'
import fsIsFile from '../src/fsIsFile.mjs'
import fsWriteText from '../src/fsWriteText.mjs'


describe(`fsWriteText`, function() {

    let test = () => {

        let ms = []

        let fdt = './_test_fsWriteText'
        fsCreateFolder(fdt) //創建臨時任務資料夾

        let fn = 't1.txt'
        let fp = `${fdt}/abc/${fn}`

        let b1 = fsIsFile(fp)
        // console.log('fsWriteText(before)', b1)
        ms.push({ 'fsWriteText(before)': b1 })

        let b2 = fsWriteText(fp, 'abc', { encoding: 'utf8' })
        // console.log('fsWriteText', b2)
        ms.push({ 'fsWriteText': b2 })

        let b3 = fsIsFile(fp)
        // console.log('fsWriteText(after)', b3)
        ms.push({ 'fsWriteText(after)': b3 })

        let c = fs.readFileSync(fp, 'utf8')
        // console.log('readFileSync', c)
        ms.push({ 'readFileSync': c })

        fsDeleteFolder(fdt) //刪除臨時任務資料夾

        // console.log('ms', ms)
        return ms
    }
    test()
    // fsWriteText(before) false
    // fsWriteText { success: './_test_fsWriteText/abc/t1.txt' }
    // fsWriteText(after) true
    // readFileSync abc
    let ms = [
        { 'fsWriteText(before)': false },
        { fsWriteText: { success: './_test_fsWriteText/abc/t1.txt' } },
        { 'fsWriteText(after)': true },
        { readFileSync: 'abc' }
    ]

    it(`should return '${JSON.stringify(ms)}' when run test`, async function() {
        let r = test()
        let rr = ms
        assert.strict.deepStrictEqual(r, rr)
    })

})
