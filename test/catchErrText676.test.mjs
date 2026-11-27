import assert from 'assert'
import fs from 'fs'
import path from 'path'
import { scanCatchErrText } from './tools/catchErrTextScan.mjs'
import { pathToFileURL } from 'url'
import { MARK, SITES, MIRRORS, loadAll, callWithFault } from './tools/catchSiteKit.mjs'


//排程第676項①(R-CATCH-TEXT-01): 轉換函數之catch不得把捕捉到之原生錯誤文字(err.toString()等)轉出為回傳值(V19固定詞彙、V20不回顯); 細節只經opt之診斷出口(diagIfAsked: opt.logDetail、opt.funLog)
//  規格來源: dspec〈輸入參數之檢測機制〉V19(狀態模式之轉換失敗用固定詞彙`can not convert <種類>`)、V20(訊息不含輸入值與原生錯誤文字), dspec〈診斷輸出與遮罩〉(細節只經診斷出口)與主控派工第676項
//  驗法: ①以AST掃描全部src, catch內轉出錯誤文字之站點只允許下列已判定者(各檔數釘住); ②逐站故障注入(test/tools/catchSiteKit.mjs): 於try內之內建函數第一次呼叫拋出(含路徑樣式之文字), 驗msg為固定詞彙且不含所拋文字
//  修前紅: 環境變數WSEMI_ERR676_SRC指向修前之src資料夾時, 掃描與注入皆改用該處


let SRC = process.env.WSEMI_ERR676_SRC ? path.resolve(process.env.WSEMI_ERR676_SRC) : path.resolve(import.meta.dirname, '..', 'src')

//ALLOWED, catch內轉出錯誤文字之已判定站點(檔名 → 站點數與理由); 新增或消失皆使測試失敗
let ALLOWED = {
    '_diagCases.mjs': 1, //診斷案例表之內部檢查訊息(`check threw: ...`), 非對外回傳值
    'cacheSt.mjs': 1, //事件訊息帶使用端fn所拋出之文字(fn之錯誤隨後原樣外拋, 非本套件原生錯誤; 讀取err包try)
    'fsMergeFiles.mjs': 1, //Node原生錯誤(帶code)先改固定詞彙加錯誤碼(fsErrMsg, R-FS-ERRMSG-01), 其餘為本套件自建之固定訊息Error或注入物自拋之message字串(契約)
    'stru8arr2obj.mjs': 1, //僅於own.has(err)(本函數自己拋出, 訊息已為固定詞彙)時取message; 其餘分支為固定詞彙
}


describe(`排程第676項①: catch不轉出原生錯誤文字(R-CATCH-TEXT-01)`, function() {

    describe(`原始碼掃描(catchErrTextScan, AST)`, function() {

        it(`scanner self-test: should detect each known shape and ignore the safe ones`, function() {
            let hit = (code) => scanCatchErrText(`function f() { ${code} }`).map((h) => h.kind)
            assert.strict.deepStrictEqual(hit(`try { f() } catch (err) { return err.toString() }`), ['.toString'])
            assert.strict.deepStrictEqual(hit(`try { f() } catch (e) { return String(e) }`), ['String()'])
            assert.strict.deepStrictEqual(hit('try { f() } catch (e) { return `x $' + '{e}` }'), ['template']) //樣板字串嵌入(以串接組出, 免觸no-template-curly-in-string)
            assert.strict.deepStrictEqual(hit(`try { f() } catch (e) { return 'x' + e }`), ['concat'])
            assert.strict.deepStrictEqual(hit(`try { f() } catch (e) { return e.message }`), ['.message'])
            assert.strict.deepStrictEqual(hit(`try { f() } catch (e) { return e['message'] }`), ['.message'])
            assert.strict.deepStrictEqual(hit(`try { f() } catch (e) { g(e); return h(e) }`), []) //當引數傳出(如diagIfAsked、errToStr)不計
            assert.strict.deepStrictEqual(hit(`try { f() } catch (e) { return e instanceof SyntaxError }`), [])
            assert.strict.deepStrictEqual(hit(`try { f() } catch (e) { return e.code }`), [])
            assert.strict.deepStrictEqual(hit(`try { f() } catch { return 'x' }`), []) //無參數
            assert.strict.deepStrictEqual(hit(`let err = new Error('x'); err.toString()`), []) //非catch內
            assert.strict.deepStrictEqual(hit(`try { f() } catch (e) { try { g() } catch (e2) { return e2.toString() } }`), ['.toString']) //巢狀以各自之參數為準
        })

        it(`should scan every src file (the count proves the scan range) and find exactly the allowed sites`, function() {
            let files = fs.readdirSync(SRC).filter((f) => f.endsWith('.mjs'))
            assert.ok(files.length > 400, `scanned file count too small: ${files.length}`)
            let found = {}
            for (let f of files) {
                let hits = scanCatchErrText(fs.readFileSync(path.join(SRC, f), 'utf8'))
                if (hits.length > 0) {
                    found[f] = hits.length
                }
            }
            assert.strict.deepStrictEqual(found, ALLOWED)
        })

    })

    describe(`逐站故障注入(34站, 於try內之內建函數第一次呼叫拋出)`, function() {

        let fns = null
        before(async function() {
            fns = await loadAll(SRC)
        })

        for (let site of SITES) {
            let label = site.label || `[wsemi ${site.name}] ${site.msg}`

            it(`[${site.name}] should return the fixed message (no thrown text, no path) in state mode when the conversion throws`, function() {
                //前提: 同一呼叫於未觸發時成功(觸發方式不得混入其他失敗原因)
                let ok = fns[site.name](...(site.okMk || site.mk)(fns, { returnWithStateAndMsg: true }))
                assert.strict.deepStrictEqual(ok.state, 'success', `${site.name} baseline`)

                let { r, thrown } = callWithFault(site, fns, { returnWithStateAndMsg: true })
                assert.ok(thrown === null, `${site.name} should not throw`)
                assert.ok(r && r.state === 'error', `${site.name} should be an error result`)
                assert.strict.deepStrictEqual(r.msg, site.msg)
                assert.ok(!JSON.stringify(r).includes('SECRET_MARK_Q7'), `${site.name} leaked the thrown text`)
                assert.ok(!JSON.stringify(r).includes('someone'), `${site.name} leaked a path`)
            })

            it(`[${site.name}] should hand the details to opt.funLog only (label '${label}'), and stay silent without a diagnostic exit`, function() {
                let calls = []
                let funLog = (lb, safe, detail) => {
                    calls.push({ lb, safe, detail })
                }
                let { r, thrown } = callWithFault(site, fns, { returnWithStateAndMsg: true, funLog })
                assert.ok(thrown === null)
                assert.strict.deepStrictEqual(r.msg, site.msg)
                assert.strict.deepStrictEqual(calls.length, 1, `${site.name} funLog calls`)
                assert.strict.deepStrictEqual(calls[0].lb, label)

                //未給診斷出口: 靜默(不拋、不經console)
                let logs = []
                let origLog = console.log
                let origWarn = console.warn
                let origErr = console.error
                console.log = (...a) => logs.push(a)
                console.warn = (...a) => logs.push(a)
                console.error = (...a) => logs.push(a)
                let rr
                try {
                    rr = callWithFault(site, fns, { returnWithStateAndMsg: true })
                }
                finally {
                    console.log = origLog
                    console.warn = origWarn
                    console.error = origErr
                }
                assert.strict.deepStrictEqual(logs, [], `${site.name} should be silent`)
                assert.strict.deepStrictEqual(rr.r.msg, site.msg)
            })

            it(`[${site.name}] should write one console line headed by the label (details only there) when opt.logDetail is true, with the same fixed message in the result`, function() {
                let logs = []
                let saved = [console.log, console.warn, console.error]
                console.log = (...a) => logs.push(a)
                console.warn = (...a) => logs.push(a)
                console.error = (...a) => logs.push(a)
                let rr
                try {
                    rr = callWithFault(site, fns, { returnWithStateAndMsg: true, logDetail: true })
                }
                finally {
                    console.log = saved[0]
                    console.warn = saved[1]
                    console.error = saved[2]
                }
                assert.ok(rr.thrown === null)
                assert.strict.deepStrictEqual(rr.r.msg, site.msg)
                assert.strict.deepStrictEqual(logs.length, 1, `${site.name} console lines`)
                assert.strict.deepStrictEqual(logs[0][0], label)
                assert.ok(!JSON.stringify(logs).includes('someone'), `${site.name} console leaked a path`)
            })

            it(`[${site.name}] should not throw in the default mode when the conversion throws, and its result carries no thrown text`, function() {
                let { r, thrown } = callWithFault(site, fns, {})
                assert.ok(thrown === null, `${site.name} should not throw`)
                let s = ''
                try {
                    s = r instanceof Uint8Array || r instanceof Uint16Array ? `len${r.length}` : JSON.stringify(r)
                }
                catch (e) {
                    s = ''
                }
                assert.ok(!String(s).includes('SECRET_MARK_Q7'))
            })
        }

        it(`the thrown marker should be a real path-like text (keeps the leak assertions meaningful)`, function() {
            assert.ok(MARK.includes('SECRET_MARK_Q7') && MARK.includes('someone'))
        })

    })

    describe(`逐站故障注入(其餘5站: src之鏡像複本, 相依模組換為呼叫即拋之替身)`, function() {

        let dirRoot = path.resolve(import.meta.dirname, '_tmp', 'catch676')
        let fn = {}
        before(async function() {
            this.timeout(120000)
            fs.rmSync(dirRoot, { recursive: true, force: true })
            for (let m of MIRRORS) {
                let d = path.join(dirRoot, m.name, 'src')
                fs.cpSync(SRC, d, { recursive: true })
                fs.writeFileSync(path.join(d, m.repl[0]), m.repl[1])
                fn[m.name] = (await import(pathToFileURL(path.join(d, `${m.name}.mjs`)).href)).default
            }
        })
        after(function() {
            fs.rmSync(dirRoot, { recursive: true, force: true })
        })

        for (let m of MIRRORS) {
            let label = `[wsemi ${m.name}] ${m.msg}`
            let spyConsole = (f) => {
                let logs = []
                let saved = [console.log, console.warn, console.error]
                console.log = (...a) => logs.push(a)
                console.warn = (...a) => logs.push(a)
                console.error = (...a) => logs.push(a)
                let r
                try {
                    r = f()
                }
                finally {
                    console.log = saved[0]
                    console.warn = saved[1]
                    console.error = saved[2]
                }
                return { r, logs }
            }

            it(`[${m.name}] should return the fixed message in state mode and hand the details only to opt.funLog or (opt.logDetail) the console, silent otherwise`, function() {
                let r = fn[m.name](...m.mk(null, { returnWithStateAndMsg: true }))
                assert.strict.deepStrictEqual(r, { state: 'error', msg: m.msg })
                assert.ok(!JSON.stringify(r).includes('SECRET_MARK_Q7'))
                let calls = []
                let r2 = fn[m.name](...m.mk(null, { returnWithStateAndMsg: true, funLog: (lb, safe, detail) => calls.push({ lb, safe, detail }) }))
                assert.strict.deepStrictEqual(r2.msg, m.msg)
                assert.strict.deepStrictEqual(calls.length, 1)
                assert.strict.deepStrictEqual(calls[0].lb, label)
                let s1 = spyConsole(() => fn[m.name](...m.mk(null, { returnWithStateAndMsg: true })))
                assert.strict.deepStrictEqual(s1.logs, [], 'silent without a diagnostic exit')
                let s2 = spyConsole(() => fn[m.name](...m.mk(null, { returnWithStateAndMsg: true, logDetail: true })))
                assert.strict.deepStrictEqual(s2.logs.length, 1)
                assert.strict.deepStrictEqual(s2.logs[0][0], label)
                assert.ok(!JSON.stringify(s2.logs).includes('someone'))
            })

            it(`[${m.name}] should keep the default-mode form (${m.dflt === 'throws' ? 'throws an Error with the fixed message' : 'returns a value, no throw'}) without the thrown text`, function() {
                if (m.dflt === 'throws') {
                    assert.throws(() => fn[m.name](...m.mk(null, {})), (err) => err instanceof Error && err.message === m.msg)
                }
                else {
                    let r = fn[m.name](...m.mk(null, {}))
                    assert.ok(!String(JSON.stringify(r)).includes('SECRET_MARK_Q7'))
                }
            })
        }

    })

})
