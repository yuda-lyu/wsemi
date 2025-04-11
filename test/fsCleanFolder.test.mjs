import assert from 'assert'
import fsCreateFolder from '../src/fsCreateFolder.mjs'
import fsCreateFile from '../src/fsCreateFile.mjs'
import fsIsFile from '../src/fsIsFile.mjs'
import fsIsFolder from '../src/fsIsFolder.mjs'
import fsCleanFolder from '../src/fsCleanFolder.mjs'
import fsDeleteFolder from '../src/fsDeleteFolder.mjs'


describe(`fsCleanFolder`, function() {

    let test = () => {

        let ms = []

        let fdt = './_test_fsCleanFolder'
        fsCreateFolder(fdt) //創建臨時任務資料夾

        fsCreateFolder(`${fdt}/abc1`)
        fsCreateFolder(`${fdt}/def1/def2/def3`)
        fsCreateFile(`${fdt}/zzz.txt`, 'zzz', { encoding: 'utf8' })
        fsCreateFile(`${fdt}/def1/def2/def3/def3.txt`, 'def', { encoding: 'utf8' })

        let b1 = fsIsFile(`${fdt}/zzz.txt`)
        // console.log('fsIsFile1(before)', b1)
        ms.push({ 'fsIsFile1(before)': b1 })

        let b2 = fsIsFile(`${fdt}/def1/def2/def3/def3.txt`)
        // console.log('fsIsFile2(before)', b2)
        ms.push({ 'fsIsFile2(before)': b2 })

        let b3 = fsIsFolder(`${fdt}/abc1`)
        // console.log('fsIsFolder1(before)', b3)
        ms.push({ 'fsIsFolder1(before)': b3 })

        let b4 = fsIsFolder(`${fdt}/def1/def2/def3`)
        // console.log('fsIsFolder2(before)', b4)
        ms.push({ 'fsIsFolder2(before)': b4 })

        let r = fsCleanFolder(fdt)
        ms.push({ 'fsCleanFolder': r })

        let b5 = fsIsFile(`${fdt}/zzz.txt`)
        // console.log('fsIsFile1(after)', b5)
        ms.push({ 'fsIsFile1(after)': b5 })

        let b6 = fsIsFile(`${fdt}/def1/def2/def3/def3.txt`)
        // console.log('fsIsFile2(after)', b6)
        ms.push({ 'fsIsFile2(after)': b6 })

        let b7 = fsIsFolder(`${fdt}/abc1`)
        // console.log('fsIsFolder1(after)', b7)
        ms.push({ 'fsIsFolder1(after)': b7 })

        let b8 = fsIsFolder(`${fdt}/def1/def2/def3`)
        // console.log('fsIsFolder2(after)', b8)
        ms.push({ 'fsIsFolder2(after)': b8 })

        fsDeleteFolder(fdt) //刪除臨時任務資料夾

        // console.log('ms', ms)
        return ms
    }
    // test()
    // fsIsFile1(before) true
    // fsIsFile2(before) true
    // fsIsFolder1(before) true
    // fsIsFolder2(before) true
    // fsIsFile1(after) false
    // fsIsFile2(after) false
    // fsIsFolder1(after) false
    // fsIsFolder2(after) false
    let ms = [
        { 'fsIsFile1(before)': true },
        { 'fsIsFile2(before)': true },
        { 'fsIsFolder1(before)': true },
        { 'fsIsFolder2(before)': true },
        { fsCleanFolder: { success: 'done: ./_test_fsCleanFolder' } },
        { 'fsIsFile1(after)': false },
        { 'fsIsFile2(after)': false },
        { 'fsIsFolder1(after)': false },
        { 'fsIsFolder2(after)': false }
    ]

    it(`should return '${JSON.stringify(ms)}' when run test'`, async function() {
        let r = test()
        let rr = ms
        assert.strict.deepStrictEqual(r, rr)
    })

})
