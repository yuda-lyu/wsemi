import assert from 'assert'
import fsCreateFolder from '../src/fsCreateFolder.mjs'
import fsDeleteFolder from '../src/fsDeleteFolder.mjs'
import fsIsFile from '../src/fsIsFile.mjs'
import fsIsFolder from '../src/fsIsFolder.mjs'
import fsCreateFile from '../src/fsCreateFile.mjs'
import { runFsFail, ev, ev0, rErr, itOptUnreadable } from './tools/fsFailRun.mjs'


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

    it(`should return '${JSON.stringify(ms)}' when run test`, async function() {
        let r = test()
        let rr = ms
        assert.strict.deepStrictEqual(r, rr)
    })

})


describe(`fsDeleteFolderCore 結果物件(R-FS-RESULT-01)`, function() {

    //於獨立子行程執行(test/tools/fsFailRunner.mjs之RO26、RO32), 夾具建於test/_tmp/fsFail-<案名>/並於案例結束刪除; 結果物件經執行器之dv描述
    this.timeout(60000)

    it(`RO26 should return a truthy error ('null' / 'undefined' / the Error object) when the injected fs.rmSync throws null, undefined or an Error`, function() {
        let { r } = runFsFail('RO26')
        //R-FS-RESULT-01 規則5: error恆為truthy, 捕捉之值為Error者原樣, null、undefined等非Error非字串之值經_errToStr轉字串(原{ error: null }、{ error: undefined })
        assert.strict.deepStrictEqual({ null: r.out.null, undefined: r.out.undefined, Error: r.out.Error, ...ev(r) }, {
            null: rErr('null'),
            undefined: rErr('undefined'),
            Error: rErr('Error: boom', true),
            ...ev0,
        })
    })

    it(`RO32 should return { error } instead of throwing synchronously when the injected fs.lstatSync of the pre-check throws`, function() {
        let { r } = runFsFail('RO32')
        //R-FS-RESULT-01 規則7: 前置檢查(注入opt.fs之lstatSync拋錯)在try內, 轉為{ error }不同步拋出(原同步拋出); 規則5: Error原樣、null轉'null'
        assert.strict.deepStrictEqual({ Error: r.out.Error, null: r.out.null, ...ev(r) }, {
            Error: rErr('Error: lstat boom', true),
            null: rErr('null'),
            ...ev0,
        })
    })

    //opt本身或其屬性不可讀(getter拋錯、已撤銷之Proxy)(外審 opus F02; 斷言與規則句見itOptUnreadable: R-FS-RESULT-01 規則7); 對外fsDeleteFolder不收opt
    itOptUnreadable('fsDeleteFolderCore', 'result')

})
