import assert from 'assert'
import fsCreateFolder from '../src/fsCreateFolder.mjs'
import fsDeleteFolder from '../src/fsDeleteFolder.mjs'
import fsCreateFile from '../src/fsCreateFile.mjs'
import fsDeleteFile from '../src/fsDeleteFile.mjs'
import fsIsFolder from '../src/fsIsFolder.mjs'
import fsExists from '../src/fsExists.mjs'


describe(`fsExists`, function() {

    let test = () => {

        let ms = []

        let fdt = './_test_fsExists'
        fsCreateFolder(fdt) //創建臨時任務資料夾

        let fn
        let fp

        fn = 't1.txt'
        fp = `${fdt}/${fn}`

        let b1 = fsExists(fp)
        // console.log('fsExists file(before)', b1)
        ms.push({ 'fsExists file(before)': b1 })

        fsCreateFile(fp, 'abc')

        let b2 = fsExists(fp)
        // console.log('fsExists file(after)', b2)
        ms.push({ 'fsExists file(after)': b2 })

        fn = 't2'
        fp = `${fdt}/${fn}`

        let b3 = fsExists(fp)
        // console.log('fsExists folder(before)', b3)
        ms.push({ 'fsExists folder(before)': b3 })

        fsCreateFolder(fp)

        let b4 = fsExists(fp)
        // console.log('fsExists folder(after)', b4)
        ms.push({ 'fsExists folder(after)': b4 })

        fsDeleteFolder(fdt) //刪除臨時任務資料夾

        // console.log('ms', ms)
        return ms
    }
    // test()
    // fsExists file(before) false
    // fsExists file(after) true
    // fsExists folder(before) false
    // fsExists folder(after) true
    let ms = [
        { 'fsExists file(before)': false },
        { 'fsExists file(after)': true },
        { 'fsExists folder(before)': false },
        { 'fsExists folder(after)': true },
    ]

    it(`should return '${JSON.stringify(ms)}' when run test`, async function() {
        let r = test()
        let rr = ms
        assert.strict.deepStrictEqual(r, rr)
    })

})
