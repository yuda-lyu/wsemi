import assert from 'assert'
import fsCreateFolder from '../src/fsCreateFolder.mjs'
import fsDeleteFolder from '../src/fsDeleteFolder.mjs'
import fsIsFile from '../src/fsIsFile.mjs'
import fsWriteText from '../src/fsWriteText.mjs'
import fsRenameFile from '../src/fsRenameFile.mjs'
import { runFsFail, ev, ev0, rErr, itOptUnreadable } from './tools/fsFailRun.mjs'


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


describe(`fsRenameFileCore 結果物件(R-FS-RESULT-01)`, function() {

    //於獨立子行程執行(test/tools/fsFailRunner.mjs之RO28、RO34), 夾具建於test/_tmp/fsFail-<案名>/並於案例結束刪除; 結果物件經執行器之dv描述
    this.timeout(60000)

    it(`RO28 should return a truthy error ('null' / 'undefined' / the Error object) when the injected fs.renameSync throws null, undefined or an Error`, function() {
        let { r } = runFsFail('RO28')
        //R-FS-RESULT-01 規則5: error恆為truthy, 捕捉之值為Error者原樣, null、undefined等非Error非字串之值經_errToStr轉字串(原{ error: null }、{ error: undefined })
        assert.strict.deepStrictEqual({ null: r.out.null, undefined: r.out.undefined, Error: r.out.Error, ...ev(r) }, {
            null: rErr('null'),
            undefined: rErr('undefined'),
            Error: rErr('Error: boom', true),
            ...ev0,
        })
    })

    it(`RO34 should return { error } instead of throwing synchronously when the injected fs.lstatSync of the pre-check throws`, function() {
        let { r } = runFsFail('RO34')
        //R-FS-RESULT-01 規則7: 前置檢查(注入opt.fs之lstatSync拋錯)在try內, 轉為{ error }不同步拋出(原同步拋出); 規則5: Error原樣、null轉'null'
        assert.strict.deepStrictEqual({ Error: r.out.Error, null: r.out.null, ...ev(r) }, {
            Error: rErr('Error: lstat boom', true),
            null: rErr('null'),
            ...ev0,
        })
    })

    //opt本身或其屬性不可讀(getter拋錯、已撤銷之Proxy)(外審 opus F02; 斷言與規則句見itOptUnreadable: R-FS-RESULT-01 規則7); 對外fsRenameFile不收opt
    itOptUnreadable('fsRenameFileCore', 'result')

})
