import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import assert from 'assert'
import execJsCode from '../src/execJsCode.mjs'
import { revoked } from './tools/codecThrown.mjs'


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

    //test4: 目標檔無 default 匯出 → reject固定訊息(ws492f: 不含檔名, V20; 原含檔名與 'is not a function')
    it(`should reject the fixed message without the file name when target has no default export`, async function() {
        let err = null
        try {
            await execJsCode(`${fdt}/nodefault.mjs`)
        }
        catch (e) {
            err = e
        }
        assert.strict.deepStrictEqual(err instanceof Error, true)
        assert.strict.deepStrictEqual(err.message, 'invalid fpJsCode: must be a module whose default export is a function')
        assert.strict.deepStrictEqual(err.message.includes('nodefault'), false)
    })

    //test5: 目標檔 default 非函數 → reject固定訊息(同上)
    it(`should reject the fixed message without the file name when default export is not a function`, async function() {
        let err = null
        try {
            await execJsCode(`${fdt}/notfun.mjs`)
        }
        catch (e) {
            err = e
        }
        assert.strict.deepStrictEqual(err instanceof Error, true)
        assert.strict.deepStrictEqual(err.message, 'invalid fpJsCode: must be a module whose default export is a function')
        assert.strict.deepStrictEqual(err.message.includes('notfun'), false)
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

    //test7: 目標檔不存在 → reject固定訊息(ws492f: 與參數無效分開, 不含路徑)
    it(`should reject the fixed message when target file does not exist`, async function() {
        let err = null
        try {
            await execJsCode(`${fdt}/not_exist_xyz.mjs`)
        }
        catch (e) {
            err = e
        }
        assert.strict.deepStrictEqual(err instanceof Error, true)
        assert.strict.deepStrictEqual(err.message, 'invalid fpJsCode: must be an existing file')
        assert.strict.deepStrictEqual(err.message.includes('not_exist_xyz'), false)
    })

})


//fpJsCode之輸入檢測與opt直通(R-EXEC-ARG-01; 排程第492項第5批ws492f; 規格dspec〈輸入參數之檢測機制〉K2、K4、V8、V17、V19、V20、W-05建議B)
//夾具建於test/_tmp/execJsCode-arg/, after刪除
describe(`execJsCode fpJsCode之輸入檢測與opt直通(R-EXEC-ARG-01)`, function() {

    let fd = fileURLToPath(new URL('./_tmp/execJsCode-arg/', import.meta.url))
    let fpOk = path.join(fd, 'ok.mjs')
    let fpNever = path.join(fd, 'never.mjs')
    let SECRET = 'SECRET_7d1f'
    let MSG_STR = 'invalid fpJsCode: must be a non-empty string'
    let MSG_NUL = 'invalid fpJsCode: must not contain a NUL character'
    let MSG_FILE = 'invalid fpJsCode: must be an existing file'

    before(function() {
        fs.rmSync(fd, { recursive: true, force: true })
        fs.mkdirSync(path.join(fd, 'adir'), { recursive: true })
        //ok: default回傳收到之opt本身(驗證整份原樣直通)
        fs.writeFileSync(fpOk, `export default (opt) => opt\n`, 'utf8')
        //dep: 目標檔所依賴之套件不存在, 載入時為Node原生錯誤ERR_MODULE_NOT_FOUND(訊息帶出目標檔路徑)
        fs.writeFileSync(path.join(fd, 'dep.mjs'), `import 'zz-no-such-package-xyz'\nexport default () => 1\n`, 'utf8')
        //syntax: 目標檔語法錯誤(SyntaxError無錯誤碼)
        fs.writeFileSync(path.join(fd, 'syntax.mjs'), `export default (\n`, 'utf8')
        //coded: 目標函數內部拋出帶錯誤碼且含機密標記之錯誤, 須原樣向外傳遞
        fs.writeFileSync(path.join(fd, 'coded.mjs'), `export default () => { throw Object.assign(new Error('target says ${SECRET}'), { code: 'EZZ' }) }\n`, 'utf8')
        //never: 只被「無效輸入」指向(其路徑字串置於包裝字串、陣列、物件等), 載入時計數; 無效輸入須使其從未被載入(與測試執行順序無關, 不受ESM快取影響), 最後以有效呼叫對照計數器確實有效
        fs.writeFileSync(fpNever, `globalThis.__execJsCodeArgNever = (globalThis.__execJsCodeArgNever || 0) + 1\nexport default () => 1\n`, 'utf8')
        //topcoded: 目標檔頂層求值時自拋之自訂錯誤碼之錯誤(非Node原生錯誤), 原樣向外
        fs.writeFileSync(path.join(fd, 'topcoded.mjs'), `throw Object.assign(new Error('top says ${SECRET}'), { code: 'ECONFIG' })\nexport default () => 1\n`, 'utf8')
        //topfs: 目標檔頂層求值時之Node原生系統錯誤(ENOENT, 帶syscall, message含路徑)
        fs.writeFileSync(path.join(fd, 'topfs.mjs'), `import fs from 'fs'\nfs.readFileSync(${JSON.stringify(path.join(fd, `${SECRET}_nofile.txt`))})\nexport default () => 1\n`, 'utf8')
    })

    after(function() {
        fs.rmSync(fd, { recursive: true, force: true })
        delete globalThis.__execJsCodeArgNever
    })

    let catchErr = async (p) => {
        try {
            await p
            return null
        }
        catch (e) {
            return e
        }
    }

    it(`should reject the fixed Error without the value for every invalid fpJsCode, before loading any file (no synchronous throw)`, async function() {
        //K2必須參數、不轉型(含包裝字串: 其內容為既存檔之路徑亦無效)、V17先於載入、V19、V20
        assert.strict.deepStrictEqual(globalThis.__execJsCodeArgNever, undefined)
        let cases = [
            ['undefined', undefined, MSG_STR], ['null', null, MSG_STR], ['empty', '', MSG_STR], ['zero', 0, MSG_STR], ['number', 5, MSG_STR], ['NaN', NaN, MSG_STR], ['true', true, MSG_STR],
            ['object', {}, MSG_STR], ['array', [fpNever], MSG_STR], ['function', () => fpNever, MSG_STR], ['symbol', Symbol('s'), MSG_STR], ['bigint', 5n, MSG_STR],
            ['wrapStr', new String(fpNever), MSG_STR], // eslint-disable-line no-new-wrappers
            ['objToString', { toString: () => fpNever }, MSG_STR], ['revoked', revoked(), MSG_STR],
            ['nul', `${fpNever}\0`, MSG_NUL], ['nulMid', `${SECRET}\0${fpNever}`, MSG_NUL],
        ]
        for (let [k, v, want] of cases) {
            let p = null
            assert.doesNotThrow(() => {
                p = execJsCode(v)
            }, k)
            let err = await catchErr(p)
            assert.strict.deepStrictEqual(err instanceof Error, true, k)
            assert.strict.deepStrictEqual(err.message, want, k)
            assert.strict.deepStrictEqual(JSON.stringify([err.message, err.stack.split('\n')[0]]).includes(SECRET), false, k)
        }
        //無效輸入不載入任何檔: 其中以既存檔路徑為內容之包裝字串、陣列、物件、函數皆未使never.mjs被載入(計數器未建立)
        assert.strict.deepStrictEqual(globalThis.__execJsCodeArgNever, undefined)
        //陽性對照: 有效呼叫會載入並使計數器為1(證明上列「未載入」不是計數器壞掉)
        assert.strict.deepStrictEqual(await execJsCode(fpNever), 1)
        assert.strict.deepStrictEqual(globalThis.__execJsCodeArgNever, 1)
    })

    it(`should tell a missing or non-file path apart from an invalid parameter`, async function() {
        //「檔案不存在」與「參數無效」分開(文字不同, 皆不含路徑)
        let e1 = await catchErr(execJsCode(path.join(fd, `${SECRET}_missing.mjs`)))
        let e2 = await catchErr(execJsCode(path.join(fd, 'adir')))
        let e3 = await catchErr(execJsCode(' '))
        assert.strict.deepStrictEqual([e1.message, e2.message, e3.message], [MSG_FILE, MSG_FILE, MSG_FILE])
        assert.strict.deepStrictEqual(MSG_FILE !== MSG_STR && MSG_FILE !== MSG_NUL, true)
        assert.strict.deepStrictEqual(e1.message.includes(SECRET), false)
        //無效參數(''、含NUL)與不存在不同
        let e4 = await catchErr(execJsCode(''))
        assert.strict.deepStrictEqual(e4.message, MSG_STR)
    })

    it(`should replace the message of a native load error that carries a code with the fixed wording and the code, and leave an error without a code as is`, async function() {
        //V20(同fs家族W-23): 目標檔所依賴之套件不存在(ERR_MODULE_NOT_FOUND, 原訊息帶出目標檔路徑與套件名)改固定詞彙加錯誤碼, 保留code
        let e1 = await catchErr(execJsCode(path.join(fd, 'dep.mjs')))
        assert.strict.deepStrictEqual([e1 instanceof Error, e1.code, e1.message], [true, 'ERR_MODULE_NOT_FOUND', 'operation failed (code ERR_MODULE_NOT_FOUND)'])
        assert.strict.deepStrictEqual(JSON.stringify([e1.message, e1.stack.split('\n')[0]]).includes('zz-no-such-package-xyz'), false)
        //無錯誤碼者(語法錯誤)原樣
        let e2 = await catchErr(execJsCode(path.join(fd, 'syntax.mjs')))
        assert.strict.deepStrictEqual([e2 instanceof SyntaxError, e2.code], [true, undefined])
        //目標檔頂層求值時自拋之自訂錯誤碼(非Node內部碼、無syscall)之錯誤原樣向外, 不被固定詞彙取代
        let e3 = await catchErr(execJsCode(path.join(fd, 'topcoded.mjs')))
        assert.strict.deepStrictEqual([e3.code, e3.message], ['ECONFIG', `top says ${SECRET}`])
        //目標檔頂層求值時之Node系統錯誤(ENOENT, 帶syscall, 原message含路徑)為Node原生錯誤, 改固定詞彙加錯誤碼
        let e4 = await catchErr(execJsCode(path.join(fd, 'topfs.mjs')))
        assert.strict.deepStrictEqual([e4.code, e4.message], ['ENOENT', 'operation failed (code ENOENT)'])
        assert.strict.deepStrictEqual(JSON.stringify([e4.message, e4.stack.split('\n')[0]]).includes(SECRET), false)
    })

    it(`should pass the whole opt to the target function as given (same object, no copy, no check), and use {} only for undefined`, async function() {
        //W-05建議B/V8: opt整份交給目標函數, 逐鍵由其處置
        let o = { a: 1, b: { c: 2 }, debug: 'x', timeout: 'abc' }
        let r = await execJsCode(fpOk, o)
        assert.strict.deepStrictEqual(r === o, true)
        let arr = [1, 2]
        assert.strict.deepStrictEqual((await execJsCode(fpOk, arr)) === arr, true)
        assert.strict.deepStrictEqual(await execJsCode(fpOk, null), null)
        assert.strict.deepStrictEqual(await execJsCode(fpOk, 'abc'), 'abc')
        assert.strict.deepStrictEqual(await execJsCode(fpOk, 0), 0)
        assert.strict.deepStrictEqual(await execJsCode(fpOk, undefined), {})
        assert.strict.deepStrictEqual(await execJsCode(fpOk), {})
    })

    it(`should propagate an error thrown inside the target function unchanged (not subject to the fixed wording)`, async function() {
        let err = await catchErr(execJsCode(path.join(fd, 'coded.mjs')))
        assert.strict.deepStrictEqual([err.code, err.message], ['EZZ', `target says ${SECRET}`])
    })

    it(`should resolve a relative fpJsCode against the current working directory`, async function() {
        let rel = path.relative(process.cwd(), fpOk)
        let r = await execJsCode(rel, { v: 1 })
        assert.strict.deepStrictEqual(r, { v: 1 })
    })

})
