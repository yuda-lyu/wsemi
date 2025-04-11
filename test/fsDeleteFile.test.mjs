import assert from 'assert'
import fsIsFile from '../src/fsIsFile.mjs'
import fsCreateFolder from '../src/fsCreateFolder.mjs'
import fsDeleteFolder from '../src/fsDeleteFolder.mjs'
import fsCreateFile from '../src/fsCreateFile.mjs'
import fsDeleteFile from '../src/fsDeleteFile.mjs'


describe(`fsDeleteFile`, function() {

    let test = () => {

        let ms = []

        let fdt = './_test_fsDeleteFile'

        fsCreateFolder(fdt) //創建臨時任務資料夾

        let fn = 'abc.txt'
        let fp = `${fdt}/${fn}`

        fsCreateFile(fp, 'abc', 'utf8')

        let b1 = fsIsFile(fp)
        // console.log('fsDeleteFile(before)', b1)
        ms.push({ 'fsDeleteFile(before)': b1 })

        fsDeleteFile(fp)

        let b2 = fsIsFile(fp)
        // console.log('fsDeleteFile(after)', b2)
        ms.push({ 'fsDeleteFile(after)': b2 })

        fsDeleteFolder(fdt) //刪除臨時任務資料夾

        // console.log('ms', ms)
        return ms
    }
    // test()
    // fsDeleteFile(before) true
    // fsDeleteFile(after) false
    let ms = [{ 'fsDeleteFile(before)': true }, { 'fsDeleteFile(after)': false }]

    it(`should return '${JSON.stringify(ms)}' when run test'`, async function() {
        let r = test()
        let rr = ms
        assert.strict.deepStrictEqual(r, rr)
    })

})
