import assert from 'assert'
import fsCreateFolder from '../src/fsCreateFolder.mjs'
import fsDeleteFolder from '../src/fsDeleteFolder.mjs'
import fsIsFile from '../src/fsIsFile.mjs'
import fsIsFolder from '../src/fsIsFolder.mjs'
import fsCreateFile from '../src/fsCreateFile.mjs'


describe(`fsDeleteFolder`, function() {

    let test = () => {

        let ms = []

        let fdt = './_test_fsDeleteFolder'

        fsCreateFolder(fdt) //創建臨時任務資料夾

        let rfl = fsCreateFile(`${fdt}/abc/abc.txt`, 'abc', { encoding: 'utf8' })
        // console.log('rfl', rfl)
        ms.push({ 'fsCreateFile(before)': rfl })

        let rfd = fsCreateFolder(`${fdt}/def/mno`)
        // console.log('rfd', rfd)
        ms.push({ 'fsCreateFolder(before)': rfd })

        let b1 = fsIsFile(`${fdt}/abc/abc.txt`)
        // console.log('fsIsFile(before)', b1)
        ms.push({ 'fsIsFile(before)': b1 })

        let b2 = fsIsFolder(`${fdt}/def/mno`)
        // console.log('fsIsFolder(before)', b2)
        ms.push({ 'fsIsFolder(before)': b2 })

        fsDeleteFolder(fdt)

        let b3 = fsIsFile(`${fdt}/abc/abc.txt`)
        // console.log('fsIsFile(after)', b3)
        ms.push({ 'fsIsFile(after)': b3 })

        let b4 = fsIsFolder(`${fdt}/def/mno`)
        // console.log('fsIsFolder(after)', b4)
        ms.push({ 'fsIsFolder(after)': b4 })

        // console.log('ms', ms)
        return ms
    }
    // test()
    // rfl { success: 'done: ./_test_fsDeleteFolder/abc/abc.txt' }
    // rfd { success: 'done: ./_test_fsDeleteFolder/def/mno' }
    // fsIsFile(before) true
    // fsIsFolder(before) true
    // fsIsFile(after) false
    // fsIsFolder(after) false
    let ms = [
        {
            'fsCreateFile(before)': { success: 'done: ./_test_fsDeleteFolder/abc/abc.txt' }
        },
        {
            'fsCreateFolder(before)': { success: 'done: ./_test_fsDeleteFolder/def/mno' }
        },
        { 'fsIsFile(before)': true },
        { 'fsIsFolder(before)': true },
        { 'fsIsFile(after)': false },
        { 'fsIsFolder(after)': false }
    ]

    it(`should return '${JSON.stringify(ms)}' when run test'`, async function() {
        let r = test()
        let rr = ms
        assert.strict.deepStrictEqual(r, rr)
    })

})
