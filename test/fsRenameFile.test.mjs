import assert from 'assert'
import fsCreateFolder from '../src/fsCreateFolder.mjs'
import fsDeleteFolder from '../src/fsDeleteFolder.mjs'
import fsIsFile from '../src/fsIsFile.mjs'
import fsWriteText from '../src/fsWriteText.mjs'
import fsRenameFile from '../src/fsRenameFile.mjs'


describe(`fsRenameFile`, function() {

    let test = () => {

        let ms = []

        let fdt = './_test_fsRenameFile'
        fsCreateFolder(fdt) //創建臨時任務資料夾

        let fn = 't1.txt'
        let fpSrc = `${fdt}/abc/${fn}`
        let fpTar = `${fdt}/def/ijk/${fn}`

        fsWriteText(fpSrc, 'xyz')

        let b1 = fsIsFile(fpSrc)
        // console.log('fsRenameFile(src)(before)', b1)
        ms.push({ 'fsRenameFile(src)(before)': b1 })

        let b2 = fsIsFile(fpTar)
        // console.log('fsRenameFile(tar)(before)', b2)
        ms.push({ 'fsRenameFile(tar)(before)': b2 })

        let r = fsRenameFile(fpSrc, fpTar)
        // console.log('fsRenameFile', r)
        ms.push({ 'fsRenameFile': r })

        let b3 = fsIsFile(fpSrc)
        // console.log('fsRenameFile(src)(after)', b3)
        ms.push({ 'fsRenameFile(src)(after)': b3 })

        let b4 = fsIsFile(fpTar)
        // console.log('fsRenameFile(tar)(after)', b4)
        ms.push({ 'fsRenameFile(tar)(after)': b4 })

        fsDeleteFolder(fdt) //刪除臨時任務資料夾

        // console.log('ms', ms)
        return ms
    }
    // test()
    // fsRenameFile(src)(before) true
    // fsRenameFile(tar)(before) false
    // fsRenameFile { success: 'done: ./_test_fsRenameFile/def/ijk/t1.txt' }
    // fsRenameFile(src)(after) false
    // fsRenameFile(tar)(after) true
    let ms = [
        { 'fsRenameFile(src)(before)': true },
        { 'fsRenameFile(tar)(before)': false },
        {
            fsRenameFile: { success: 'done: ./_test_fsRenameFile/def/ijk/t1.txt' }
        },
        { 'fsRenameFile(src)(after)': false },
        { 'fsRenameFile(tar)(after)': true }
    ]

    it(`should return '${JSON.stringify(ms)}' when run test`, async function() {
        let r = test()
        let rr = ms
        assert.strict.deepStrictEqual(r, rr)
    })

})
