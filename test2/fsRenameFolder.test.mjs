import assert from 'assert'
import fsCreateFolder from '../src/fsCreateFolder.mjs'
import fsDeleteFolder from '../src/fsDeleteFolder.mjs'
import fsIsFile from '../src/fsIsFile.mjs'
import fsIsFolder from '../src/fsIsFolder.mjs'
import fsWriteText from '../src/fsWriteText.mjs'
import fsRenameFolder from '../src/fsRenameFolder.mjs'


describe(`fsRenameFolder`, function() {

    let test = () => {

        let ms = []

        let fdt = './_test_fsRenameFolder'
        fsCreateFolder(fdt) //創建臨時任務資料夾

        let fn = 't1.txt'
        let fdSrc = `${fdt}/abc`
        let fpSrc = `${fdt}/abc/${fn}`
        let fdTar = `${fdt}/def/abc`
        let fpTar = `${fdt}/def/abc/${fn}`

        fsWriteText(fpSrc, 'xyz')

        let b1 = fsIsFile(fpSrc)
        // console.log('fsIsFile(before)', b1)
        ms.push({ 'fsIsFile(before)': b1 })

        let b2 = fsIsFolder(fdSrc)
        // console.log('fsIsFolder(before)', b2)
        ms.push({ 'fsIsFolder(before)': b2 })

        let b3 = fsIsFile(fpTar)
        // console.log('fsIsFile(before)', b3)
        ms.push({ 'fsIsFile(before)': b3 })

        let b4 = fsIsFolder(fdTar)
        // console.log('fsIsFolder(before)', b4)
        ms.push({ 'fsIsFolder(before)': b4 })

        let r = fsRenameFolder(fdSrc, fdTar)
        // console.log('fsRenameFolder', r)
        ms.push({ 'fsRenameFolder': r })

        let b5 = fsIsFile(fpSrc)
        // console.log('fsIsFile(after)', b5)
        ms.push({ 'fsIsFile(after)': b5 })

        let b6 = fsIsFolder(fdSrc)
        // console.log('fsIsFolder(after)', b6)
        ms.push({ 'fsIsFolder(after)': b6 })

        let b7 = fsIsFile(fpTar)
        // console.log('fsIsFile(after)', b7)
        ms.push({ 'fsIsFile(after)': b7 })

        let b8 = fsIsFolder(fdTar)
        // console.log('fsIsFolder(after)', b8)
        ms.push({ 'fsIsFolder(after)': b8 })

        fsDeleteFolder(fdt) //刪除臨時任務資料夾

        // console.log('ms', ms)
        return ms
    }
    // test()
    // fsIsFile(before) true
    // fsIsFolder(before) true
    // fsIsFile(before) false
    // fsIsFolder(before) false
    // fsRenameFolder { success: 'done: ./_test_fsRenameFolder/def/abc' }
    // fsIsFile(after) false
    // fsIsFolder(after) false
    // fsIsFile(after) true
    // fsIsFolder(after) true
    let ms = [
        { 'fsIsFile(before)': true },
        { 'fsIsFolder(before)': true },
        { 'fsIsFile(before)': false },
        { 'fsIsFolder(before)': false },
        { fsRenameFolder: { success: 'done: ./_test_fsRenameFolder/def/abc' } },
        { 'fsIsFile(after)': false },
        { 'fsIsFolder(after)': false },
        { 'fsIsFile(after)': true },
        { 'fsIsFolder(after)': true }
    ]

    it(`should return '${JSON.stringify(ms)}' when run test`, async function() {
        let r = test()
        let rr = ms
        assert.strict.deepStrictEqual(r, rr)
    })

})
