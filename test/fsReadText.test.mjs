import assert from 'assert'
import fsCreateFolder from '../src/fsCreateFolder.mjs'
import fsDeleteFolder from '../src/fsDeleteFolder.mjs'
import fsIsFile from '../src/fsIsFile.mjs'
import fsWriteText from '../src/fsWriteText.mjs'
import fsReadText from '../src/fsReadText.mjs'


describe(`fsReadText`, function() {

    let test = () => {

        let ms = []

        let fdt = './_test_fsReadText'
        fsCreateFolder(fdt) //創建臨時任務資料夾

        let fn = 't1.txt'
        let fp = `${fdt}/abc/${fn}`

        let b1 = fsIsFile(fp)
        // console.log('fsIsFile(before)', b1)
        ms.push({ 'fsIsFile(before)': b1 })

        let rw = fsWriteText(fp, 'abc', { encoding: 'utf8' })
        // console.log('fsWriteText', rw)
        ms.push({ 'fsWriteText': rw })

        let b2 = fsIsFile(fp)
        // console.log('fsIsFile(after)', b2)
        ms.push({ 'fsIsFile(after)': b2 })

        let rr = fsReadText(fp, 'abc', { encoding: 'utf8' })
        // console.log('fsReadText', rr)
        ms.push({ 'fsReadText': rr })

        fsDeleteFolder(fdt) //刪除臨時任務資料夾

        // console.log('ms', ms)
        return ms
    }
    // test()
    // fsIsFile(before) false
    // fsWriteText { success: './_test_fsReadText/abc/t1.txt' }
    // fsIsFile(after) true
    // fsReadText { success: 'abc' }
    let ms = [
        { 'fsIsFile(before)': false },
        { fsWriteText: { success: './_test_fsReadText/abc/t1.txt' } },
        { 'fsIsFile(after)': true },
        { fsReadText: { success: 'abc' } }
    ]

    it(`should return '${JSON.stringify(ms)}' when run test'`, async function() {
        let r = test()
        let rr = ms
        assert.strict.deepStrictEqual(r, rr)
    })

})
