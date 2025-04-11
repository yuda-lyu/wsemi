import assert from 'assert'
import fsCreateFolder from '../src/fsCreateFolder.mjs'
import fsDeleteFolder from '../src/fsDeleteFolder.mjs'
import fsCreateFile from '../src/fsCreateFile.mjs'
import fsDeleteFile from '../src/fsDeleteFile.mjs'
import fsIsFile from '../src/fsIsFile.mjs'


describe(`fsIsFile`, function() {

    let test = () => {

        let ms = []

        let fdt = './_test_fsIsFile'
        fsCreateFolder(fdt) //創建臨時任務資料夾

        let fn = 't1.txt'
        let fp = `${fdt}/${fn}`

        let b1 = fsIsFile(fp)
        // console.log('fsIsFile(before)', b1)
        ms.push({ 'fsIsFile(before)': b1 })

        fsCreateFile(fp, 'abc')

        let b2 = fsIsFile(fp)
        // console.log('fsIsFile(after)', b2)
        ms.push({ 'fsIsFile(after)': b2 })

        fsDeleteFile(fdt)

        fsDeleteFolder(fdt) //刪除臨時任務資料夾

        // console.log('ms', ms)
        return ms
    }
    // test()
    // fsIsFile(before) false
    // fsIsFile(after) true
    let ms = [{ 'fsIsFile(before)': false }, { 'fsIsFile(after)': true }]

    it(`should return '${JSON.stringify(ms)}' when run test'`, async function() {
        let r = test()
        let rr = ms
        assert.strict.deepStrictEqual(r, rr)
    })

})
