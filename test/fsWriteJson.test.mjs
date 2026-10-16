import fs from 'fs'
import assert from 'assert'
import fsCreateFolder from '../src/fsCreateFolder.mjs'
import fsDeleteFolder from '../src/fsDeleteFolder.mjs'
import fsWriteJson from '../src/fsWriteJson.mjs'
import { runFsFail, ev, ev0, itOptUnreadable } from './tools/fsFailRun.mjs'


describe(`fsWriteJson`, function() {
    let test = () => {

        let ms = []

        let fdt = './_test_fsWriteJson'
        fsCreateFolder(fdt) //創建臨時任務資料夾

        let inp = { str: '測試中文', val: 123.45, int: 5 }

        let fn1 = 't1.json'
        let fp1 = `${fdt}/${fn1}`

        let r1 = fsWriteJson(fp1, inp)
        // console.log('fsWriteJson', r1)
        ms.push({ 'fsWriteJson': r1 })

        let c1 = fs.readFileSync(fp1, 'utf8')
        // console.log('readFileSync', c1)
        ms.push({ 'readFileSync': c1 })

        let fn2 = 't2.json'
        let fp2 = `${fdt}/${fn2}`

        let r2 = fsWriteJson(fp2, inp, { useFormat: true })
        // console.log('fsWriteJson', r2)
        ms.push({ 'fsWriteJson': r2 })

        let c2 = fs.readFileSync(fp2, 'utf8')
        // console.log('readFileSync', c2)
        ms.push({ 'readFileSync': c2 })

        fsDeleteFolder(fdt) //刪除臨時任務資料夾

        // console.log('ms', ms)
        return ms
    }
    test()
    // fsWriteJson { success: './_test_fsWriteJson/t1.json' }
    // readFileSync {"str":"測試中文","val":123.45,"int":5}
    // fsWriteJson { success: './_test_fsWriteJson/t2.json' }
    // readFileSync {
    //   "str": "測試中文",
    //   "val": 123.45,
    //   "int": 5
    // }
    let ms = [
        { fsWriteJson: { success: './_test_fsWriteJson/t1.json' } },
        { readFileSync: '{"str":"測試中文","val":123.45,"int":5}' },
        { fsWriteJson: { success: './_test_fsWriteJson/t2.json' } },
        {
            readFileSync: '{\n  "str": "測試中文",\n  "val": 123.45,\n  "int": 5\n}'
        }
    ]

    it(`should return '${JSON.stringify(ms)}' when run test`, async function() {
        let r = test()
        let rr = ms
        assert.strict.deepStrictEqual(r, rr)
    })

})


describe(`fsWriteJson 結果物件(R-FS-RESULT-01)`, function() {

    //每案於獨立子行程執行(test/tools/fsFailRunner.mjs之RO17~RO19b), 夾具建於test/_tmp/fsFail-<案名>/並於案例結束刪除
    //結果值經執行器之dv描述: 結果物件為{ s: 'return', k: 'result', keys, error: { k, v } | success: { k, v } }, 故可分辨error為null/undefined(falsy)與字串
    //ev(r)、ev0: 子行程之未處理rejection與未捕捉例外及其期望(皆空)
    this.timeout(60000)

    it(`RO17 (守門) should keep a thrown Error object and a thrown non-empty string as the error when inp.toJSON throws them`, function() {
        let { r } = runFsFail('RO17')
        //R-FS-RESULT-01 規則5: 捕捉之值為Error或非空字串者原樣(Error為同一物件)
        assert.strict.deepStrictEqual({ error: r.out.error, errorSame: r.out.errorSame, str: r.out.str, ...ev(r) }, {
            error: { s: 'return', k: 'result', keys: ['error'], error: { k: 'Error', v: 'Error: boom' } },
            errorSame: true,
            str: { s: 'return', k: 'result', keys: ['error'], error: { k: 'string', v: 'str' } },
            ...ev0,
        })
    })

    it(`RO18 should return { error: 'null' } and write no file (not { success }) when inp.toJSON throws null`, function() {
        let { r } = runFsFail('RO18')
        //R-FS-RESULT-01 規則5: 是否出錯以布林旗標判定, 不以錯誤值!==null為哨兵(原回success並寫出空內容); null經_errToStr得'null'
        assert.strict.deepStrictEqual({ res: r.out.res, written: r.out.written, ...ev(r) }, { res: { s: 'return', k: 'result', keys: ['error'], error: { k: 'string', v: 'null' } }, written: false, ...ev0 })
    })

    it(`RO19 should return { error: 'undefined' } (truthy) when inp.toJSON throws undefined`, function() {
        let { r } = runFsFail('RO19')
        //R-FS-RESULT-01 規則5: error恆為truthy, undefined經_errToStr得'undefined'(原{ error: undefined })
        assert.strict.deepStrictEqual({ res: r.out.res, written: r.out.written, ...ev(r) }, { res: { s: 'return', k: 'result', keys: ['error'], error: { k: 'string', v: 'undefined' } }, written: false, ...ev0 })
    })

    it(`RO19b should return a truthy string error when inp.toJSON throws an empty string`, function() {
        let { r } = runFsFail('RO19b')
        let res = r.out.res
        //R-FS-RESULT-01 規則5: error恆為truthy(空字串非「非空字串」, 不得原樣)
        assert.strict.deepStrictEqual({ s: res.s, keys: res.keys, ek: res.error && res.error.k, truthy: !!(res.error && res.error.v), written: r.out.written, ...ev(r) }, { s: 'return', keys: ['error'], ek: 'string', truthy: true, written: false, ...ev0 })
    })

    //opt本身或其屬性不可讀(getter拋錯(opt.useFormat, fsWriteJson只讀此鍵)、已撤銷之Proxy)(外審 opus F02; 斷言與規則句見itOptUnreadable: R-FS-RESULT-01 規則7)
    itOptUnreadable('fsWriteJson', 'result')

})
