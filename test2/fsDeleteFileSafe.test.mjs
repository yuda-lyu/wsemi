import assert from 'assert'
import fsIsFile from '../src/fsIsFile.mjs'
import fsCreateFolder from '../src/fsCreateFolder.mjs'
import fsDeleteFolder from '../src/fsDeleteFolder.mjs'
import fsCreateFile from '../src/fsCreateFile.mjs'
import fsDeleteFileSafe from '../src/fsDeleteFileSafe.mjs'


describe(`fsDeleteFileSafe`, function() {

    let test = async() => {

        let ms = []

        let fdt = './_test_fsDeleteFileSafe'

        fsCreateFolder(fdt) //創建臨時任務資料夾

        let fn = 'abc.txt'
        let fp = `${fdt}/${fn}`

        fsCreateFile(fp, 'abc', 'utf8')

        let b1 = fsIsFile(fp)
        // console.log('fsDeleteFileSafe(before)', b1)
        ms.push({ 'fsDeleteFileSafe(before)': b1 })

        await fsDeleteFileSafe(fp)

        let b2 = fsIsFile(fp)
        // console.log('fsDeleteFileSafe(after)', b2)
        ms.push({ 'fsDeleteFileSafe(after)': b2 })

        fsDeleteFolder(fdt) //刪除臨時任務資料夾

        // console.log('ms', ms)
        return ms
    }
    // test()
    // fsDeleteFileSafe(before) true
    // fsDeleteFileSafe(after) false
    let ms = [{ 'fsDeleteFileSafe(before)': true }, { 'fsDeleteFileSafe(after)': false }]

    it(`should return '${JSON.stringify(ms)}' when run test`, async function() {
        let r = await test()
        let rr = ms
        assert.strict.deepStrictEqual(r, rr)
    })

})
