import assert from 'assert'
import fsIsFile from '../src/fsIsFile.mjs'
import fsCreateFolder from '../src/fsCreateFolder.mjs'
import fsDeleteFolder from '../src/fsDeleteFolder.mjs'
import fsCreateFile from '../src/fsCreateFile.mjs'
import fsDeleteFile from '../src/fsDeleteFile.mjs'
import { runFsFail, ev, ev0, rErr, itOptUnreadable } from './tools/fsFailRun.mjs'


describe(`fsDeleteFile`, function() {

    let test = () => {

        let ms = []

        let fdt = './_test_fsDeleteFile'

        fsCreateFolder(fdt) //創建臨時任務資料夾

        let fn = 'abc.txt'
        let fp = `${fdt}/${fn}`

        fsCreateFile(fp, 'abc', 'utf8')

        let b1 = fsIsFile(fp)
        // console.log('fsDeleteFile(before)', b1)
        ms.push({ 'fsDeleteFile(before)': b1 })

        fsDeleteFile(fp)

        let b2 = fsIsFile(fp)
        // console.log('fsDeleteFile(after)', b2)
        ms.push({ 'fsDeleteFile(after)': b2 })

        fsDeleteFolder(fdt) //刪除臨時任務資料夾

        // console.log('ms', ms)
        return ms
    }
    // test()
    // fsDeleteFile(before) true
    // fsDeleteFile(after) false
    let ms = [{ 'fsDeleteFile(before)': true }, { 'fsDeleteFile(after)': false }]

    it(`should return '${JSON.stringify(ms)}' when run test`, async function() {
        let r = test()
        let rr = ms
        assert.strict.deepStrictEqual(r, rr)
    })

})


describe(`fsDeleteFileCore 結果物件(R-FS-RESULT-01)`, function() {

    //於獨立子行程執行(test/tools/fsFailRunner.mjs之RO25、RO31), 夾具建於test/_tmp/fsFail-<案名>/並於案例結束刪除; 結果物件經執行器之dv描述
    this.timeout(60000)

    it(`RO25 should return a truthy error ('null' / 'undefined' / the Error object) when the injected fs.unlinkSync throws null, undefined or an Error`, function() {
        let { r } = runFsFail('RO25')
        //R-FS-RESULT-01 規則5: error恆為truthy, 捕捉之值為Error者原樣, null、undefined等非Error非字串之值經_errToStr轉字串(原{ error: null }、{ error: undefined })
        assert.strict.deepStrictEqual({ null: r.out.null, undefined: r.out.undefined, Error: r.out.Error, ...ev(r) }, {
            null: rErr('null'),
            undefined: rErr('undefined'),
            Error: rErr('Error: boom', true),
            ...ev0,
        })
    })

    it(`RO39 should return the thrown real Error as is (cross-realm Error with code, null-prototype Error) when the injected fs.unlinkSync throws it`, function() {
        let { r } = runFsFail('RO39')
        //R-FS-RESULT-01 規則5: 捕捉之值為Error者原樣; Error之判定同R-CODEC-ERR-01規則1之真Error(經_isRealError, 含跨realm與無原型者), 不得轉成字串而失去code
        assert.strict.deepStrictEqual({ ...r.out, ...ev(r) }, {
            crossRealm: { same: true, code: 'ENOENT' },
            nullProto: { same: true },
            ...ev0,
        })
    })

    it(`RO31 should return { error } instead of throwing synchronously when the injected fs.lstatSync of the pre-check throws`, function() {
        let { r } = runFsFail('RO31')
        //R-FS-RESULT-01 規則7: 前置檢查(注入opt.fs之lstatSync拋錯)在try內, 轉為{ error }不同步拋出(原同步拋出); 規則5: Error原樣、null轉'null'
        assert.strict.deepStrictEqual({ Error: r.out.Error, null: r.out.null, ...ev(r) }, {
            Error: rErr('Error: lstat boom', true),
            null: rErr('null'),
            ...ev0,
        })
    })

    //opt本身或其屬性不可讀(getter拋錯、已撤銷之Proxy)(外審 opus F02; 斷言與規則句見itOptUnreadable: R-FS-RESULT-01 規則7); 對外fsDeleteFile不收opt
    itOptUnreadable('fsDeleteFileCore', 'result')

})
