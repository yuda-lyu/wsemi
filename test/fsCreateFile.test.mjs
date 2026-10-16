import fs from 'fs'
import assert from 'assert'
import fsCreateFolder from '../src/fsCreateFolder.mjs'
import fsDeleteFolder from '../src/fsDeleteFolder.mjs'
import fsIsFile from '../src/fsIsFile.mjs'
import fsCreateFile from '../src/fsCreateFile.mjs'
import { runFsFail, ev, ev0, rErr, itOptUnreadable } from './tools/fsFailRun.mjs'


describe(`fsCreateFile`, function() {

    let test = () => {

        let ms = []

        let fdt = './_test_fsCreateFile'
        fsCreateFolder(fdt) //創建臨時任務資料夾

        let fn = 't1.txt'
        let fp = `${fdt}/abc/${fn}`

        let b1 = fsIsFile(fp)
        // console.log('fsCreateFile(before)', b1)
        ms.push({ 'fsCreateFile(before)': b1 })

        let b2 = fsCreateFile(fp, 'abc', { encoding: 'utf8' })
        // console.log('fsCreateFile', b2)
        ms.push({ 'fsCreateFile': b2 })

        let b3 = fsIsFile(fp)
        // console.log('fsCreateFile(after)', b3)
        ms.push({ 'fsCreateFile(after)': b3 })

        let c = fs.readFileSync(fp, 'utf8')
        // console.log('readFileSync', c)
        ms.push({ 'readFileSync': c })

        fsDeleteFolder(fdt) //刪除臨時任務資料夾

        // console.log('ms', ms)
        return ms
    }
    // test()
    // fsCreateFile(before) false
    // fsCreateFile { success: 'done: ./_test_fsCreateFile/abc/t1.txt' }
    // fsCreateFile(after) true
    // readFileSync abc
    let ms = [
        { 'fsCreateFile(before)': false },
        { fsCreateFile: { success: 'done: ./_test_fsCreateFile/abc/t1.txt' } },
        { 'fsCreateFile(after)': true },
        { readFileSync: 'abc' }
    ]

    it(`should return '${JSON.stringify(ms)}' when run test`, async function() {
        let r = test()
        let rr = ms
        assert.strict.deepStrictEqual(r, rr)
    })

})


describe(`fsCreateFileCore 結果物件(R-FS-RESULT-01)`, function() {

    //於獨立子行程執行(test/tools/fsFailRunner.mjs之RO24), 夾具建於test/_tmp/fsFail-RO24/並於案例結束刪除; 結果物件經執行器之dv描述
    this.timeout(60000)

    it(`RO24 should return { error: 'null' } / { error: 'undefined' } (truthy) when the injected fs.writeFileSync throws null or undefined`, function() {
        let { r } = runFsFail('RO24')
        //R-FS-RESULT-01 規則5: error恆為truthy, null、undefined等非Error非字串之值經_errToStr轉字串(原{ error: undefined })
        assert.strict.deepStrictEqual({ null: r.out.null, undefined: r.out.undefined, ...ev(r) }, {
            null: { s: 'return', k: 'result', keys: ['error'], error: { k: 'string', v: 'null' } },
            undefined: { s: 'return', k: 'result', keys: ['error'], error: { k: 'string', v: 'undefined' } },
            ...ev0,
        })
    })

    it(`RO38 should return { error } instead of throwing synchronously when the injected fs.lstatSync of the folder pre-check throws`, function() {
        let { r } = runFsFail('RO38')
        //R-FS-RESULT-01 規則7: 前置檢查(上層資料夾之fsIsFolderCore, 注入opt.fs之lstatSync拋錯)在try內, 轉為{ error }不同步拋出(原同步拋出); 規則5: Error原樣、null轉'null'
        assert.strict.deepStrictEqual({ Error: r.out.Error, null: r.out.null, ...ev(r) }, {
            Error: rErr('Error: lstat boom', true),
            null: rErr('null'),
            ...ev0,
        })
    })

    //opt本身或其屬性不可讀(getter拋錯、已撤銷之Proxy), 對外與Core各一案(外審 opus F02; 斷言與規則句見itOptUnreadable: R-FS-RESULT-01 規則7)
    itOptUnreadable('fsCreateFile', 'result')
    itOptUnreadable('fsCreateFileCore', 'result')

})
