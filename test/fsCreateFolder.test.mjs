import assert from 'assert'
import fsCreateFolder from '../src/fsCreateFolder.mjs'
import fsDeleteFolder from '../src/fsDeleteFolder.mjs'
import fsIsFolder from '../src/fsIsFolder.mjs'


describe(`fsCreateFolder`, function() {

    let test = () => {

        let ms = []

        let fdt = './_test_fsCreateFolder'

        let b1 = fsIsFolder(fdt)
        // console.log('fsCreateFolder(before)', b1)
        ms.push({ 'fsCreateFolder(before)': b1 })

        fsCreateFolder(fdt) //創建臨時任務資料夾

        let b2 = fsIsFolder(fdt)
        // console.log('fsCreateFolder(after)', b2)
        ms.push({ 'fsCreateFolder(after)': b2 })

        fsDeleteFolder(fdt) //刪除臨時任務資料夾

        // console.log('ms', ms)
        return ms
    }
    // test()
    // fsCreateFolder(before) false
    // fsCreateFolder(after) true
    let ms = [
        { 'fsCreateFolder(before)': false },
        { 'fsCreateFolder(after)': true }
    ]

    it(`should return '${JSON.stringify(ms)}' when run test`, async function() {
        let r = test()
        let rr = ms
        assert.strict.deepStrictEqual(r, rr)
    })

})
