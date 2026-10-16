import assert from 'assert'
import fsCreateFolder from '../src/fsCreateFolder.mjs'
import fsDeleteFolder from '../src/fsDeleteFolder.mjs'
import fsIsFile from '../src/fsIsFile.mjs'
import fsWriteText from '../src/fsWriteText.mjs'
import fsReadText from '../src/fsReadText.mjs'
import { runFsFail, ev, ev0, itOptUnreadable } from './tools/fsFailRun.mjs'


describe(`fsReadText`, function() {

    let test = () => {

        let ms = []

        let fdt = './_test_fsReadText'
        fsCreateFolder(fdt) //創建臨時任務資料夾

        let fn = 't1.txt'
        let fp = `${fdt}/abc/${fn}`

        let b1 = fsIsFile(fp)
        // console.log('fsIsFile(before)', b1)
        ms.push({ 'fsIsFile(before)': b1 })

        let rw = fsWriteText(fp, 'abc')
        // console.log('fsWriteText', rw)
        ms.push({ 'fsWriteText': rw })

        let b2 = fsIsFile(fp)
        // console.log('fsIsFile(after)', b2)
        ms.push({ 'fsIsFile(after)': b2 })

        let rr = fsReadText(fp, 'abc')
        // console.log('fsReadText', rr)
        ms.push({ 'fsReadText': rr })

        fsDeleteFolder(fdt) //刪除臨時任務資料夾

        // console.log('ms', ms)
        return ms
    }
    // test()
    // fsIsFile(before) false
    // fsWriteText { success: './_test_fsReadText/abc/t1.txt' }
    // fsIsFile(after) true
    // fsReadText { success: 'abc' }
    let ms = [
        { 'fsIsFile(before)': false },
        { fsWriteText: { success: './_test_fsReadText/abc/t1.txt' } },
        { 'fsIsFile(after)': true },
        { fsReadText: { success: 'abc' } }
    ]

    it(`should return '${JSON.stringify(ms)}' when run test`, async function() {
        let r = test()
        let rr = ms
        assert.strict.deepStrictEqual(r, rr)
    })

})


describe(`fsReadTextCore 結果物件(R-FS-RESULT-01)`, function() {

    //於獨立子行程執行(test/tools/fsFailRunner.mjs之RO22); 結果物件經執行器之dv描述為{ s: 'return', k: 'result', keys, error: { k, v } | success: { k, v } }
    this.timeout(60000)

    it(`RO22 should return { error: 'null' } / { error: 'undefined' } (not { success: '' }, not a falsy error) when the injected fs.readFileSync throws null or undefined`, function() {
        let { r } = runFsFail('RO22')
        //R-FS-RESULT-01 規則5: 是否出錯以布林旗標判定, 不以錯誤值!==null為哨兵(拋null原回success); error恆為truthy, null、undefined經_errToStr轉字串
        assert.strict.deepStrictEqual({ null: r.out.null, undefined: r.out.undefined, ...ev(r) }, {
            null: { s: 'return', k: 'result', keys: ['error'], error: { k: 'string', v: 'null' } },
            undefined: { s: 'return', k: 'result', keys: ['error'], error: { k: 'string', v: 'undefined' } },
            ...ev0,
        })
    })

    //opt本身或其屬性不可讀(getter拋錯、已撤銷之Proxy)(外審 opus F02; 斷言與規則句見itOptUnreadable: R-FS-RESULT-01 規則7); 對外fsReadText不收opt
    itOptUnreadable('fsReadTextCore', 'result')

})
