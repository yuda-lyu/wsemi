import fs from 'fs'
import assert from 'assert'
import execJsCode from '../src/execJsCode.mjs'


describe(`execJsCode`, function() {

    //fixtures: 於 cwd 下建立暫存資料夾與待載入 mjs 檔, execJsCode 以 cwd 為基準解析相對路徑
    let fdt = './_test_execJsCode'

    before(function() {
        fs.mkdirSync(fdt, { recursive: true })

        //ok: async default 函數, 依 opt 計算回傳
        fs.writeFileSync(`${fdt}/ok.mjs`, `export default async (opt) => ({ sum: (opt.a || 0) + (opt.b || 0) })\n`, 'utf8')

        //sync: sync default 函數 (無 async), 驗證 await 對 sync fn 也適用
        fs.writeFileSync(`${fdt}/sync.mjs`, `export default (opt) => 'sync:' + opt.v\n`, 'utf8')

        //noopt: 讀取 opt 但呼叫端不給 opt, 驗證預設 {} 不會炸
        fs.writeFileSync(`${fdt}/noopt.mjs`, `export default async (opt) => ({ keys: Object.keys(opt).length })\n`, 'utf8')

        //nodefault: 只有 named export 無 default
        fs.writeFileSync(`${fdt}/nodefault.mjs`, `export const run = () => 'x'\n`, 'utf8')

        //notfun: default 非函數
        fs.writeFileSync(`${fdt}/notfun.mjs`, `export default { hello: 'world' }\n`, 'utf8')

        //throws: default 函數內部拋錯
        fs.writeFileSync(`${fdt}/throws.mjs`, `export default async () => { throw new Error('boom') }\n`, 'utf8')
    })

    after(function() {
        fs.rmSync(fdt, { recursive: true, force: true })
    })

    //test1: 載入 async default 函數並傳入 opt, 回傳其執行結果
    it(`should execute async default export and return its result`, async function() {
        let r = await execJsCode(`${fdt}/ok.mjs`, { a: 3, b: 4 })
        assert.strict.deepStrictEqual(r, { sum: 7 })
    })

    //test2: sync default 函數也能正常執行 (await 對 sync fn 適用)
    it(`should execute sync default export`, async function() {
        let r = await execJsCode(`${fdt}/sync.mjs`, { v: 'abc' })
        assert.strict.deepStrictEqual(r, 'sync:abc')
    })

    //test3: opt 省略時預設為 {}, 目標函數讀 opt 不會出錯
    it(`should default opt to {} when omitted`, async function() {
        let r = await execJsCode(`${fdt}/noopt.mjs`)
        assert.strict.deepStrictEqual(r, { keys: 0 })
    })

    //test4: 目標檔無 default 匯出 → reject, 訊息含檔名與 'is not a function'
    it(`should reject when target has no default export`, async function() {
        let err = null
        try {
            await execJsCode(`${fdt}/nodefault.mjs`)
        }
        catch (e) {
            err = e
        }
        assert.strict.deepStrictEqual(err !== null, true)
        assert.strict.deepStrictEqual(err.message.includes('nodefault.mjs'), true)
        assert.strict.deepStrictEqual(err.message.includes('is not a function'), true)
    })

    //test5: 目標檔 default 非函數 → reject, 訊息含檔名與 'is not a function'
    it(`should reject when default export is not a function`, async function() {
        let err = null
        try {
            await execJsCode(`${fdt}/notfun.mjs`)
        }
        catch (e) {
            err = e
        }
        assert.strict.deepStrictEqual(err !== null, true)
        assert.strict.deepStrictEqual(err.message.includes('notfun.mjs'), true)
        assert.strict.deepStrictEqual(err.message.includes('is not a function'), true)
    })

    //test6: 目標函數內部拋錯 → 原錯誤向外傳遞 (reject 'boom')
    it(`should propagate error thrown inside target function`, async function() {
        let err = null
        try {
            await execJsCode(`${fdt}/throws.mjs`)
        }
        catch (e) {
            err = e
        }
        assert.strict.deepStrictEqual(err !== null, true)
        assert.strict.deepStrictEqual(err.message, 'boom')
    })

    //test7: 目標檔不存在 → import 失敗 reject
    it(`should reject when target file does not exist`, async function() {
        let err = null
        try {
            await execJsCode(`${fdt}/not_exist_xyz.mjs`)
        }
        catch (e) {
            err = e
        }
        assert.strict.deepStrictEqual(err !== null, true)
    })

})
