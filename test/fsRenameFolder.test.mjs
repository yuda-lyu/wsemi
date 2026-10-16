import assert from 'assert'
import fsCreateFolder from '../src/fsCreateFolder.mjs'
import fsDeleteFolder from '../src/fsDeleteFolder.mjs'
import fsIsFile from '../src/fsIsFile.mjs'
import fsIsFolder from '../src/fsIsFolder.mjs'
import fsWriteText from '../src/fsWriteText.mjs'
import fsRenameFolder from '../src/fsRenameFolder.mjs'
import { runFsFail, ev, ev0, rErr, itOptUnreadable } from './tools/fsFailRun.mjs'


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


describe(`fsRenameFolderCore 結果物件(R-FS-RESULT-01)`, function() {

    //於獨立子行程執行(test/tools/fsFailRunner.mjs之RO29、RO35), 夾具建於test/_tmp/fsFail-<案名>/並於案例結束刪除; 結果物件經執行器之dv描述
    this.timeout(60000)

    it(`RO29 should return a truthy error ('null' / 'undefined' / the Error object) when the injected fs.renameSync throws null, undefined or an Error`, function() {
        let { r } = runFsFail('RO29')
        //R-FS-RESULT-01 規則5: error恆為truthy, 捕捉之值為Error者原樣, null、undefined等非Error非字串之值經_errToStr轉字串(原{ error: null }、{ error: undefined })
        assert.strict.deepStrictEqual({ null: r.out.null, undefined: r.out.undefined, Error: r.out.Error, ...ev(r) }, {
            null: rErr('null'),
            undefined: rErr('undefined'),
            Error: rErr('Error: boom', true),
            ...ev0,
        })
    })

    it(`RO35 should return { error } instead of throwing synchronously when the injected fs.lstatSync of the pre-check throws`, function() {
        let { r } = runFsFail('RO35')
        //R-FS-RESULT-01 規則7: 前置檢查(注入opt.fs之lstatSync拋錯)在try內, 轉為{ error }不同步拋出(原同步拋出); 規則5: Error原樣、null轉'null'
        assert.strict.deepStrictEqual({ Error: r.out.Error, null: r.out.null, ...ev(r) }, {
            Error: rErr('Error: lstat boom', true),
            null: rErr('null'),
            ...ev0,
        })
    })

    //opt本身或其屬性不可讀(getter拋錯、已撤銷之Proxy)(外審 opus F02; 斷言與規則句見itOptUnreadable: R-FS-RESULT-01 規則7); 對外fsRenameFolder不收opt
    itOptUnreadable('fsRenameFolderCore', 'result')

})
