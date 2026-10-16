import fs from 'fs'
import assert from 'assert'
import fsCreateFolder from '../src/fsCreateFolder.mjs'
import fsDeleteFolder from '../src/fsDeleteFolder.mjs'
import fsIsFile from '../src/fsIsFile.mjs'
import fsWriteText from '../src/fsWriteText.mjs'
import { runFsFail, ev, ev0, rErr, itOptUnreadable } from './tools/fsFailRun.mjs'


describe(`fsWriteText`, function() {

    let test = () => {

        let ms = []

        let fdt = './_test_fsWriteText'
        fsCreateFolder(fdt) //創建臨時任務資料夾

        let fn = 't1.txt'
        let fp = `${fdt}/abc/${fn}`

        let b1 = fsIsFile(fp)
        // console.log('fsWriteText(before)', b1)
        ms.push({ 'fsWriteText(before)': b1 })

        let b2 = fsWriteText(fp, 'abc')
        // console.log('fsWriteText', b2)
        ms.push({ 'fsWriteText': b2 })

        let b3 = fsIsFile(fp)
        // console.log('fsWriteText(after)', b3)
        ms.push({ 'fsWriteText(after)': b3 })

        let c = fs.readFileSync(fp, 'utf8')
        // console.log('readFileSync', c)
        ms.push({ 'readFileSync': c })

        fsDeleteFolder(fdt) //刪除臨時任務資料夾

        // console.log('ms', ms)
        return ms
    }
    test()
    // fsWriteText(before) false
    // fsWriteText { success: './_test_fsWriteText/abc/t1.txt' }
    // fsWriteText(after) true
    // readFileSync abc
    let ms = [
        { 'fsWriteText(before)': false },
        { fsWriteText: { success: './_test_fsWriteText/abc/t1.txt' } },
        { 'fsWriteText(after)': true },
        { readFileSync: 'abc' }
    ]

    it(`should return '${JSON.stringify(ms)}' when run test`, async function() {
        let r = test()
        let rr = ms
        assert.strict.deepStrictEqual(r, rr)
    })

})


describe(`fsWriteTextCore 結果物件(R-FS-RESULT-01)`, function() {

    //於獨立子行程執行(test/tools/fsFailRunner.mjs之RO23), 夾具建於test/_tmp/fsFail-RO23/並於案例結束刪除; 結果物件經執行器之dv描述
    this.timeout(60000)

    it(`RO23 should return { error: 'null' } / { error: 'undefined' } (not { success }, not a falsy error) when the injected fs.writeFileSync throws null or undefined`, function() {
        let { r } = runFsFail('RO23')
        //R-FS-RESULT-01 規則5: 是否出錯以布林旗標判定, 不以錯誤值!==null為哨兵(拋null原回success); error恆為truthy, null、undefined經_errToStr轉字串
        assert.strict.deepStrictEqual({ null: r.out.null, undefined: r.out.undefined, ...ev(r) }, {
            null: { s: 'return', k: 'result', keys: ['error'], error: { k: 'string', v: 'null' } },
            undefined: { s: 'return', k: 'result', keys: ['error'], error: { k: 'string', v: 'undefined' } },
            ...ev0,
        })
    })

    it(`RO37 should return { error } instead of throwing synchronously when the injected fs.lstatSync of the folder pre-check throws`, function() {
        let { r } = runFsFail('RO37')
        //R-FS-RESULT-01 規則7: 前置檢查(寫入資料夾之fsIsFolderCore, 注入opt.fs之lstatSync拋錯)在try內, 轉為{ error }不同步拋出(原同步拋出); 規則5: Error原樣、null轉'null'
        assert.strict.deepStrictEqual({ Error: r.out.Error, null: r.out.null, ...ev(r) }, {
            Error: rErr('Error: lstat boom', true),
            null: rErr('null'),
            ...ev0,
        })
    })

    //opt本身或其屬性不可讀(getter拋錯、已撤銷之Proxy)(外審 opus F02; 斷言與規則句見itOptUnreadable: R-FS-RESULT-01 規則7); 對外fsWriteText不收opt
    itOptUnreadable('fsWriteTextCore', 'result')

})
