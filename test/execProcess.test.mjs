import assert from 'assert'
import fs from 'fs'
import cp from 'child_process'
import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'
import execProcess from '../src/execProcess.mjs'
import { runExecFail } from './tools/execFailRun.mjs'
import { useFakeClock } from './tools/timeKit.mjs'
import { revoked, thrower } from './tools/codecThrown.mjs'
import { withGuard, realSleep, reapTree, recTrace, fiveOnTrace, collectUnhandled, gateScript, mkGate, finishCase } from './tools/execTraceKit.mjs'


//consoleCodePage, 取本機主控台字碼頁編號, 僅win32, 供依環境決定是否跳過依賴系統字碼頁之案例
function consoleCodePage() {
    if (process.platform !== 'win32') {
        return null
    }
    try {
        let s = cp.execSync('chcp', { encoding: 'latin1', windowsHide: true })
        let m = /(\d+)\s*$/.exec(s)
        return (m !== null) ? Number(m[1]) : null
    }
    catch (err) {
        return null
    }
}


describe(`execProcess`, function() {

    //以當前執行mocha的node當測試對象, 跨Windows/Linux/macOS可用
    let nodeBin = process.execPath

    //exec模式經shell且不自動加引號, node路徑含空白時須自行加引號
    let nodeBinQuoted = `"${nodeBin}"`

    //cpSys, 本機主控台字碼頁, 950(big5)時才跑auto/system之系統字碼頁案例
    let cpSys = consoleCodePage()

    //子程序腳本, 皆以node -e執行, 不依賴系統語系
    let sBig5 = 'process.stdout.write(Buffer.from([181,76]))' //big5「無」
    let sUtf8 = 'process.stdout.write(Buffer.from([231,132,161]))' //utf-8「無」
    let sUtf8Split = 'process.stdout.write(Buffer.from([231,132]));setTimeout(()=>{process.stdout.write(Buffer.from([161]))},300)'
    let sBig5Split = 'process.stdout.write(Buffer.from([181]));setTimeout(()=>{process.stdout.write(Buffer.from([76]))},300)'
    let sLineSplit = 'process.stdout.write("abc");setTimeout(()=>{process.stdout.write("def\\n")},300)'
    let sUtf8Trunc = 'process.stdout.write(Buffer.from([231,132,161,231,132]))' //「無」後接被截斷之半個字
    let sMixed = 'process.stdout.write(Buffer.from([231,132,161]));setTimeout(()=>{process.stderr.write(Buffer.from([181,76]))},150)' //stdout utf-8, stderr big5
    let sErrExit3 = 'process.stderr.write(Buffer.from([181,76]));setTimeout(()=>{process.exit(3)},100)'
    let sForever = 'setInterval(()=>{process.stdout.write(Buffer.from([231,132,161]))},50)'
    let sBom = 'process.stdout.write(Buffer.from([239,187,191,65]))'

    //--- 觀察回調(opt.onTrace)輔助: 事件閘門子行程與事件同步點, 規則見sgud/rule/rulebook_timer.md之R-TRACE-01 ---

    //fdGate, 閘門檔夾(test/_tmp/execProcess-trace/<案名>/), 案例結束即刪
    let fdGate = fileURLToPath(new URL('./_tmp/execProcess-trace/', import.meta.url))

    //各案自刪其子夾後會留下空的根, 測試結束時一併移除
    after(function() {
        fs.rmSync(fdGate, { recursive: true, force: true })
    })

    //isData, 判斷data事件: 來源which與解碼後字串text
    let isData = (which, text) => (e) => e.type === 'data' && e.which === which && e.text === text

    //runGated, 以事件閘門子行程(gateScript)執行execProcess: steps如'o:61,e:62'(o為stdout、e為stderr, 後接位元組十六進位); plan[k]為判斷事件之函數, 見到(自上一個之後)第一個符合者即開第k+1道閘門放行下一步輸出
    //  回傳{ r: { s: 'resolve'|'reject', v }, tr }; 防懸置上限用真實計時器; 收尾放行全部閘門並殺樹回驗(見execTraceKit之finishCase)
    let runGated = async (name, steps, opt, plan) => {
        let gate = mkGate(fdGate + name)
        let tr = recTrace({ guard: 12000 })
        let p = execProcess(nodeBin, ['-e', gateScript, gate.base, steps], { ...opt, onTrace: tr.on })
        try {
            let from = 0
            for (let k = 0; k < plan.length; k++) {
                let e = await tr.wait(plan[k], from)
                from = tr.events.indexOf(e) + 1
                gate.open(k + 1)
            }
            let r = await withGuard(p.then((v) => ({ s: 'resolve', v }), (v) => ({ s: 'reject', v })), 15000, `execProcess ${name}`)
            return { r, tr }
        }
        finally {
            assert.strict.deepStrictEqual(await finishCase(p, tr, gate, steps.split(',').length), true, `leftover child process (${name})`)
        }
    }

    it(`should resolve with stdout content when running a basic command`, async function() {
        let r = await execProcess(nodeBin, ['-e', 'process.stdout.write("hello")'])
        // console.log('basic r', JSON.stringify(r))
        assert.strict.deepStrictEqual(r.includes('hello'), true)
    })

    it(`should fire cbStdout callback with chunk data`, async function() {
        let collected = ''
        await execProcess(nodeBin, ['-e', 'process.stdout.write("cbtest")'], {
            cbStdout: (data) => {
                collected += data
            },
        })
        // console.log('cb collected', JSON.stringify(collected))
        assert.strict.deepStrictEqual(collected.includes('cbtest'), true)
    })

    it(`should reject with code[N] message when exit code is non-zero`, async function() {
        let err = null
        try {
            await execProcess(nodeBin, ['-e', 'process.exit(2)'])
        }
        catch (e) {
            err = e
        }
        // console.log('exit err', err)
        assert.strict.deepStrictEqual(typeof err === 'string' && err.startsWith('code[2]'), true)
    })

    it(`should reject a string spawn[ENOENT] without args when spawning a non-existent program`, async function() {
        let err = null
        try {
            await execProcess('non_existent_command_xyz_12345', ['arg', 'SECRET_ARG_7d1f'])
        }
        catch (e) {
            err = e
        }
        // console.log('nonexistent err', err)
        //P02a: 無法啟動子程序時reject字串`spawn[錯誤碼]:\n訊息`, 訊息含程式名, 不含args
        assert.strict.deepStrictEqual(typeof err === 'string' && err.startsWith('spawn[ENOENT]:\n'), true)
        assert.strict.deepStrictEqual(err.includes('non_existent_command_xyz_12345'), true)
        assert.strict.deepStrictEqual(err.includes('SECRET_ARG_7d1f'), false)
    })

    it(`should ignore opt.timeout when value is invalid (e.g., -1)`, async function() {
        let r = await execProcess(nodeBin, ['-e', 'process.stdout.write("ok")'], { timeout: -1 })
        assert.strict.deepStrictEqual(r.includes('ok'), true)
    })

    it(`should ignore opt.timeout when value is null`, async function() {
        let r = await execProcess(nodeBin, ['-e', 'process.stdout.write("ok")'], { timeout: null })
        assert.strict.deepStrictEqual(r.includes('ok'), true)
    })

    it(`should resolve normally when process finishes before opt.timeout fires`, async function() {
        let r = await execProcess(nodeBin, ['-e', 'process.stdout.write("fast")'], { timeout: 10000 })
        assert.strict.deepStrictEqual(r.includes('fast'), true)
    })

    it(`should reject with timeout[Nms] message when process exceeds opt.timeout`, async function() {
        let err = null
        let t0 = Date.now()
        try {
            await execProcess(nodeBin, ['-e', 'setTimeout(() => {}, 30000)'], { timeout: 500 })
        }
        catch (e) {
            err = e
        }
        let dt = Date.now() - t0
        // console.log('timeout err', err, 'dt', dt)
        assert.strict.deepStrictEqual(typeof err === 'string' && err.startsWith('timeout[500ms]'), true)
        //確保是timeout觸發殺進程後快速結束, 而非等子進程自然30s結束
        assert.strict.deepStrictEqual(dt >= 500 && dt < 10000, true)
    })

    it(`should reject with timeout[Nms] in execFile mode`, async function() {
        let err = null
        try {
            await execProcess(nodeBin, ['-e', 'setTimeout(() => {}, 30000)'], { mode: 'execFile', timeout: 500 })
        }
        catch (e) {
            err = e
        }
        // console.log('execFile timeout err', err)
        assert.strict.deepStrictEqual(typeof err === 'string' && err.startsWith('timeout[500ms]'), true)
    })

    it(`should kill grandchild process tree on timeout (parent spawns child node)`, async function() {
        //父node再spawn一個子node, 兩層都會被tree-kill幹掉; 確認timeout機制有跨層生效, 不會留孤兒
        let script = [
            'const cp = require("child_process")',
            'cp.spawn(process.execPath, ["-e", "setTimeout(() => {}, 30000)"])',
            'setTimeout(() => {}, 30000)',
        ].join(';')
        let err = null
        let t0 = Date.now()
        try {
            await execProcess(nodeBin, ['-e', script], { timeout: 800 })
        }
        catch (e) {
            err = e
        }
        let dt = Date.now() - t0
        // console.log('grandchild err', err, 'dt', dt)
        assert.strict.deepStrictEqual(typeof err === 'string' && err.startsWith('timeout[800ms]'), true)
        assert.strict.deepStrictEqual(dt >= 800 && dt < 10000, true)
    })

    //--- 解碼: codeCmd 固定標籤 ---

    it(`should decode big5 output with codeCmd big5 in spawn mode`, async function() {
        let r = await execProcess(nodeBin, ['-e', sBig5], { codeCmd: 'big5' })
        assert.strict.deepStrictEqual(r, '無')
    })

    it(`should decode big5 output with codeCmd big5 in exec mode`, async function() {
        let r = await execProcess(nodeBinQuoted, `-e "${sBig5}"`, { mode: 'exec', codeCmd: 'big5' })
        assert.strict.deepStrictEqual(r, '無')
    })

    it(`should decode big5 output with codeCmd big5 in execFile mode`, async function() {
        let r = await execProcess(nodeBin, ['-e', sBig5], { mode: 'execFile', codeCmd: 'big5' })
        assert.strict.deepStrictEqual(r, '無')
    })

    it(`should treat cp950 and 950 as big5`, async function() {
        let r1 = await execProcess(nodeBin, ['-e', sBig5], { codeCmd: 'cp950' })
        let r2 = await execProcess(nodeBin, ['-e', sBig5], { codeCmd: '950' })
        assert.strict.deepStrictEqual([r1, r2], ['無', '無'])
    })

    it(`should decode a utf-8 character split across chunks in spawn mode`, async function() {
        let r = await execProcess(nodeBin, ['-e', sUtf8Split])
        assert.strict.deepStrictEqual(r, '無')
    })

    it(`should decode a utf-8 character split across chunks in execFile mode`, async function() {
        let r = await execProcess(nodeBin, ['-e', sUtf8Split], { mode: 'execFile' })
        assert.strict.deepStrictEqual(r, '無')
    })

    it(`should decode a big5 character split across chunks`, async function() {
        let r = await execProcess(nodeBin, ['-e', sBig5Split], { codeCmd: 'big5' })
        assert.strict.deepStrictEqual(r, '無')
    })

    it(`should not insert newlines between chunks`, async function() {
        let r = await execProcess(nodeBin, ['-e', sLineSplit])
        assert.strict.deepStrictEqual(r, 'abcdef\n')
    })

    it(`should reject before spawning when codeCmd is unsupported, in all modes`, async function() {
        for (let mode of ['spawn', 'exec', 'execFile']) {
            let err = null
            try {
                await execProcess(mode === 'exec' ? nodeBinQuoted : nodeBin, ['-e', '1'], { mode, codeCmd: 'no-such-encoding' })
            }
            catch (e) {
                err = e
            }
            assert.strict.deepStrictEqual(typeof err === 'string' && err.includes('no-such-encoding'), true, mode)
        }
    })

    it(`should fall back to utf-8 when codeCmd is not a string`, async function() {
        let r = await execProcess(nodeBin, ['-e', sUtf8], { codeCmd: 123 })
        assert.strict.deepStrictEqual(r, '無')
    })

    it(`should pass stream-decoded text to cbStdout without empty calls, summing to the result`, async function() {
        let calls = []
        let r = await execProcess(nodeBin, ['-e', sUtf8Split], {
            cbStdout: (data) => {
                calls.push(data)
            },
        })
        assert.strict.deepStrictEqual(calls, ['無'])
        assert.strict.deepStrictEqual(calls.join(''), r)
    })

    it(`should carry decoded stderr into the code[N] reject message`, async function() {
        let err = null
        try {
            await execProcess(nodeBin, ['-e', sErrExit3], { codeCmd: 'big5' })
        }
        catch (e) {
            err = e
        }
        assert.strict.deepStrictEqual(err, 'code[3]:\n無')
    })

    it(`should merge stdout and stderr in arrival order`, async function() {
        //JSDoc returns: resolve回傳stdout與stderr依到達順序合併之字串; 子程序依事件閘門輸出a(stdout)、b(stderr)、c(stdout), 父行程見到上一筆之data事件才放行下一筆, 故到達順序由因果決定而非子程序內計時器之間隔
        let { r, tr } = await runGated(`order`, `o:61,e:62,o:63`, {}, [isData('out', 'a'), isData('err', 'b')])
        assert.strict.deepStrictEqual(r, { s: 'resolve', v: 'abc' })
        assert.strict.deepStrictEqual(tr.events.filter((e) => e.type === 'data').map((e) => `${e.which}:${e.text}`), ['out:a', 'err:b', 'out:c'])
    })

    it(`should resolve an empty string when the child prints nothing`, async function() {
        let r = await execProcess(nodeBin, ['-e', '1'])
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should strip a leading utf-8 BOM`, async function() {
        let r = await execProcess(nodeBin, ['-e', sBom])
        assert.strict.deepStrictEqual(r, 'A')
    })

    //--- 解碼: codeCmd auto 與 system ---

    it(`should decode utf-8 output with codeCmd auto`, async function() {
        let r = await execProcess(nodeBin, ['-e', sUtf8Split], { codeCmd: 'auto' })
        assert.strict.deepStrictEqual(r, '無')
    })

    it(`should keep a truncated utf-8 tail as U+FFFD under auto instead of switching`, async function() {
        let r = await execProcess(nodeBin, ['-e', sUtf8Trunc], { codeCmd: 'auto' })
        assert.strict.deepStrictEqual(r, '無�')
    })

    it(`should carry decoded output into the timeout reject message under auto`, async function() {
        //JSDoc timeout: 逾時為`timeout[Nms]:\n訊息`, 訊息為子程序之輸出; 逾時門檻(400ms)本身是規格, 以假時鐘推進; 「子程序已啟動並至少輸出一次」不是規格, 以data事件為同步點(見到含「無」之data事件才推進到門檻)
        await execProcess(nodeBin, ['-e', '1'], { codeCmd: 'auto' }) //先取得並快取系統字碼頁(真實chcp), 啟用假時鐘後auto不再有此真實I/O
        let tr = recTrace({ guard: 12000 })
        let clock = useFakeClock()
        let p = null
        try {
            p = execProcess(nodeBin, ['-e', sForever], { codeCmd: 'auto', timeout: 400, onTrace: tr.on })
            let st = p.then((v) => ({ s: 'resolve', v }), (v) => ({ s: 'reject', v }))
            await tr.wait((e) => e.type === 'spawn') //子程序已建立, 逾時計時器(虛擬400ms)已設定
            await tr.wait((e) => e.type === 'data' && e.text.includes('無')) //子程序已啟動並已輸出
            let i0 = tr.mark()
            await clock.advance(399)
            assert.strict.deepStrictEqual(tr.types(i0).filter((t) => t === 'timeout' || t === 'kill'), []) //未達門檻不得逾時
            await clock.advance(1)
            let ev = await tr.wait((e) => e.type === 'settle')
            assert.strict.deepStrictEqual([ev.ok, ev.reason], [false, 'timeout'])
            let r = await withGuard(st, 15000, 'execProcess timeout settle')
            let err = r.s === 'reject' ? r.v : null
            assert.strict.deepStrictEqual(typeof err === 'string' && err.startsWith('timeout[400ms]:\n'), true)
            let body = err.slice('timeout[400ms]:\n'.length)
            assert.strict.deepStrictEqual(body.includes('無'), true)
            //被殺於字元中間時至多結尾一個U+FFFD, 不得整段改判為系統字碼頁
            assert.strict.deepStrictEqual((body.match(/�/g) || []).length <= 1, true)
            assert.strict.deepStrictEqual(body.replace(/無|�/g, ''), '')
        }
        finally {
            clock.restore()
            let ev = tr.events.find((x) => x.type === 'spawn')
            let settled = tr.events.some((x) => x.type === 'settle')
            if (!settled && ev && typeof ev.pid === 'number') {
                assert.strict.deepStrictEqual(await reapTree(ev.pid), true, 'leftover child process')
            }
        }
    })

    it(`should decode system code page output with codeCmd auto on a big5 console`, async function() {
        if (cpSys !== 950) {
            this.skip()
        }
        let r = await execProcess(nodeBin, ['-e', sBig5], { codeCmd: 'auto' })
        assert.strict.deepStrictEqual(r, '無')
    })

    it(`should decode stdout and stderr independently under auto on a big5 console`, async function() {
        if (cpSys !== 950) {
            this.skip()
        }
        let r = await execProcess(nodeBin, ['-e', sMixed], { codeCmd: 'auto' })
        assert.strict.deepStrictEqual(r, '無無')
    })

    it(`should switch cbStdout to the system code page after the first non-utf-8 chunk under auto on a big5 console`, async function() {
        if (cpSys !== 950) {
            this.skip()
        }
        //JSDoc cbStdout: codeCmd為'auto'時該串流首次遇到非utf-8位元組後才改用系統字碼頁, 之前已回調之字串不追溯; 子程序依事件閘門輸出ok與big5位元組(b54c), 第二次輸出於第一次data事件之後才發生, 故必為兩次獨立之回調(不因父行程卡頓而合併成單一chunk)
        let calls = []
        let { r } = await runGated(`cbswitch`, `o:6f6b,o:b54c`, {
            codeCmd: 'auto',
            cbStdout: (data) => {
                calls.push(data)
            },
        }, [isData('out', 'ok')])
        assert.strict.deepStrictEqual(calls, ['ok', '無'])
        assert.strict.deepStrictEqual(r, { s: 'resolve', v: 'ok無' })
    })

    it(`should decode with codeCmd system on a big5 console`, async function() {
        if (cpSys !== 950) {
            this.skip()
        }
        let r = await execProcess(nodeBin, ['-e', sBig5], { codeCmd: 'system' })
        assert.strict.deepStrictEqual(r, '無')
    })

    it(`should decode with codeCmd system as utf-8 on non-win32 platforms`, async function() {
        if (process.platform === 'win32') {
            this.skip()
        }
        let r = await execProcess(nodeBin, ['-e', sUtf8], { codeCmd: 'system' })
        assert.strict.deepStrictEqual(r, '無')
    })

    //--- exec模式引號 ---

    it(`should quote prog and array args containing spaces in exec mode`, async function() {
        //prog為node完整路徑(Windows下含空白)與元素'a b'皆由execProcess自動加引號, 腳本元素已自帶引號則原樣串接
        let r = await execProcess(nodeBin, ['-e', '"process.stdout.write(process.argv[1])"', 'a b'], { mode: 'exec' })
        assert.strict.deepStrictEqual(r, 'a b')
    })

    it(`should keep string args as a raw command line in exec mode`, async function() {
        let r = await execProcess(nodeBin, '-e "process.stdout.write(process.argv[1]+process.argv[2])" a b', { mode: 'exec' })
        assert.strict.deepStrictEqual(r, 'ab')
    })

    it(`should give the same result in exec and spawn mode for an argument with spaces on win32`, async function() {
        if (process.platform !== 'win32') {
            this.skip()
        }
        let args = ['/FI', 'IMAGENAME eq zz_no_such_process_1234.exe']
        let r1 = await execProcess('tasklist', args, { mode: 'spawn', codeCmd: 'big5' })
        let r2 = await execProcess('tasklist', args, { mode: 'exec', codeCmd: 'big5' })
        assert.strict.deepStrictEqual(r1.length > 0, true)
        assert.strict.deepStrictEqual(r1, r2)
    })

    //--- 失敗回報: 無法啟動子程序之拒絕值為字串且不含參數(規格句見JSDoc之returns) ---

    let SA = 'SECRET_ARG_7d1f' //機密標記, 置於args
    let progMissing = path.resolve('./test/_tmp/execProcess/zz_no_such_prog_123.exe') //不存在之絕對路徑, 不建立
    let argLong = SA + 'x'.repeat(200000) //win32超過命令列上限(ENAMETOOLONG), posix超過單一參數上限, 皆為spawn同步拋錯
    let argNul = SA + '\u0000x'
    let fdSrc = fileURLToPath(new URL('../src/', import.meta.url))
    let fpEmfileRunner = path.resolve('./test/tools/spawnEmfileRunner.mjs')

    //catchErr, 回傳Promise之拒絕值, 未拒絕時回{ resolved }
    let catchErr = async (fn) => {
        try {
            let r = await fn()
            return { resolved: r }
        }
        catch (err) {
            return err
        }
    }

    //runEmfile, 子行程內重現EMFILE後呼叫execProcess
    let runEmfile = (opt) => {
        let r = cp.spawnSync(nodeBin, [fpEmfileRunner, fdSrc, 'execProcess', JSON.stringify(opt)], { encoding: 'utf8', windowsHide: true, timeout: 60000 })
        return JSON.parse(r.stdout.trim().split(/\r?\n/).pop())
    }

    for (let [name, opt] of [['spawn', {}], ['execFile', { mode: 'execFile' }], ['spawn with codeCmd auto', { codeCmd: 'auto' }]]) {
        it(`should reject a string spawn[ENOENT] with the program path but without args for a missing program (${name})`, async function() {
            let err = await catchErr(() => execProcess(progMissing, ['a', SA], opt))
            //P02a、P02f
            assert.strict.deepStrictEqual(typeof err, 'string')
            assert.strict.deepStrictEqual(err.startsWith('spawn[ENOENT]:\n'), true)
            assert.strict.deepStrictEqual(err.includes('zz_no_such_prog_123'), true)
            assert.strict.deepStrictEqual(err.includes(SA), false)
        })
    }

    for (let mode of ['spawn', 'execFile', 'exec']) {
        it(`should reject a string spawn[...] without args when spawn throws synchronously for a too long argument (${mode})`, async function() {
            let err = await catchErr(() => execProcess(nodeBin, ['-e', '1', argLong], { mode }))
            //P02b、P02d
            assert.strict.deepStrictEqual(typeof err, 'string')
            assert.strict.deepStrictEqual(err.startsWith(process.platform === 'win32' ? 'spawn[ENAMETOOLONG]:\n' : 'spawn['), true)
            assert.strict.deepStrictEqual(err.includes(SA), false)
        })

        it(`should reject spawn[ERR_INVALID_ARG_VALUE] naming the argument but not its value for a null byte (${mode})`, async function() {
            let err = await catchErr(() => execProcess(nodeBin, ['-e', '1', argNul], { mode }))
            //P02c、P02d: node訊息之「Received 值」須去除, exec模式之參數名為command
            assert.strict.deepStrictEqual(typeof err, 'string')
            assert.strict.deepStrictEqual(err.startsWith('spawn[ERR_INVALID_ARG_VALUE]:\n'), true)
            assert.strict.deepStrictEqual(err.includes(mode === 'exec' ? `'command'` : `'args[2]'`), true)
            assert.strict.deepStrictEqual(err.includes(SA), false)
            assert.strict.deepStrictEqual(err.includes('Received'), false)
        })
    }

    it(`should reject spawn[ENOENT] without the command line when the shell is missing in exec mode`, function() {
        if (process.platform !== 'win32') {
            this.skip()
        }
        //子行程內改ComSpec, 不影響本行程; exec模式之node附帶參數為整條指令列
        let url = pathToFileURL(path.join(fdSrc, 'execProcess.mjs')).href
        let sc = `process.env.ComSpec='C:\\\\zz-no-such-dir\\\\cmd.exe';let m=await import(${JSON.stringify(url)});m.default(process.execPath,['-e','1',${JSON.stringify(SA)}],{mode:'exec'}).then((r)=>console.log(JSON.stringify({r})),(e)=>console.log(JSON.stringify({e:String(e),t:typeof e})))`
        let r = cp.spawnSync(nodeBin, ['--input-type=module', '-e', sc], { encoding: 'utf8', windowsHide: true, timeout: 60000 })
        let o = JSON.parse(r.stdout.trim())
        //P02d
        assert.strict.deepStrictEqual(o.t, 'string')
        assert.strict.deepStrictEqual(o.e.startsWith('spawn[ENOENT]:\n'), true)
        assert.strict.deepStrictEqual(o.e.includes(SA), false)
    })

    it(`should reject a string when prog is an empty string or not a string`, async function() {
        let err1 = await catchErr(() => execProcess('', ['-e', '1']))
        let err2 = await catchErr(() => execProcess(undefined, ['-e', '1']))
        //P02e
        assert.strict.deepStrictEqual([typeof err1, typeof err2], ['string', 'string'])
        assert.strict.deepStrictEqual(err1.startsWith('spawn[ERR_INVALID_ARG_VALUE]:\n'), true)
        assert.strict.deepStrictEqual(err2.startsWith('spawn[ERR_INVALID_ARG_TYPE]:\n'), true)
    })

    it(`should reject a string when prog is quoted in spawn mode`, async function() {
        let err = await catchErr(() => execProcess(`"${nodeBin}"`, ['-e', '1']))
        //P07: spawn模式prog含引號時reject說明字串, 字誤已修
        assert.strict.deepStrictEqual(typeof err, 'string')
        assert.strict.deepStrictEqual(err.includes('does not need to add quotes'), true)
    })

    for (let [name, opt] of [['spawn', {}], ['execFile', { mode: 'execFile' }], ['exec', { mode: 'exec' }], ['spawn with codeCmd auto', { codeCmd: 'auto' }]]) {
        it(`should reject spawn[EMFILE] without throwing or crashing when node cannot create stdio (${name})`, function() {
            let o = runEmfile(opt)
            //P03: 系統資源用盡時同無法啟動, 不拋出未捕捉例外
            assert.strict.deepStrictEqual(o.settle, 'reject')
            assert.strict.deepStrictEqual(typeof o.value === 'string' && o.value.startsWith('spawn[EMFILE]:\n'), true)
            assert.strict.deepStrictEqual(o.hasSecret, false)
            assert.strict.deepStrictEqual(o.uncaught, [])
        })
    }

    //--- args: 空陣列與空字串代表無參數, 型別不符以reject回報 ---

    //progNoArgs, 不帶參數即可執行並結束之系統程式
    let progNoArgs = process.platform === 'win32' ? 'whoami' : 'pwd'

    for (let mode of ['spawn', 'execFile', 'exec']) {
        it(`should run the program without arguments when args is an empty array or an empty string (${mode})`, async function() {
            let r1 = await catchErr(() => execProcess(progNoArgs, [], { mode, codeCmd: 'auto' }))
            let r2 = await catchErr(() => execProcess(progNoArgs, '', { mode, codeCmd: 'auto' }))
            //P11a、P11b: 照常執行並resolve輸出
            assert.strict.deepStrictEqual('resolved' in r1 && r1.resolved.trim().length > 0, true)
            assert.strict.deepStrictEqual('resolved' in r2 && r2.resolved.trim() === r1.resolved.trim(), true)
        })
    }

    it(`should reject a string instead of throwing when args is neither an array nor a string`, async function() {
        let rs = []
        for (let v of [undefined, null, 123, {}, true]) {
            let p = null
            assert.doesNotThrow(() => {
                p = execProcess(nodeBin, v)
            })
            rs.push(await catchErr(() => p))
        }
        //P11c
        assert.strict.deepStrictEqual(rs, new Array(5).fill('args is not an array or string'))
    })

    //--- 觀察回調(opt.onTrace): 事件語意與P3/P4(規則見sgud/rule/rulebook_timer.md之R-TRACE-01) ---

    describe(`觀察回調(opt.onTrace)`, function() {

        //settleOf, 取事件中之settle(至多一個)
        let settles = (tr) => tr.events.filter((e) => e.type === 'settle')

        //pidOf, 取spawn事件之pid
        let pidOf = (tr) => {
            let e = tr.events.find((x) => x.type === 'spawn')
            return e ? e.pid : null
        }

        //run, 執行execProcess並回傳{ s, v }與紀錄器; 收尾若被測函數仍未落定(缺陷)則殺樹回驗
        let run = async (prog, args, opt) => {
            let tr = recTrace({ guard: 12000 })
            let p = execProcess(prog, args, { ...opt, onTrace: tr.on })
            let r = null
            try {
                r = await withGuard(p.then((v) => ({ s: 'resolve', v }), (v) => ({ s: 'reject', v })), 15000, 'execProcess settle')
            }
            finally {
                assert.strict.deepStrictEqual(await finishCase(p, tr, null, 0), true, 'leftover child process')
            }
            return { r, tr }
        }

        it(`should notify spawn, data and settle in order with decoded text and settle before the promise resolves`, async function() {
            //JSDoc onTrace: spawn為子程序已建立(mode、pid), data為收到chunk並已解碼(which、bytes、text; 先於cbStdout、cbStderr), settle為即將resolve(ok、reason為'ok'、code為離開碼0)
            let order = []
            let gate = mkGate(fdGate + `order-events`)
            let tr = recTrace({ guard: 12000 })
            let onTrace = (e) => {
                order.push(e.type === 'data' ? `trace:data:${e.which}` : `trace:${e.type}`)
                tr.on(e)
            }
            let p = execProcess(nodeBin, ['-e', gateScript, gate.base, 'o:61,e:6262'], {
                onTrace,
                cbStdout: (d) => order.push(`cb:out:${d}`),
                cbStderr: (d) => order.push(`cb:err:${d}`),
            })
            let st = p.then((v) => {
                order.push('resolved')
                return { s: 'resolve', v }
            }, (v) => ({ s: 'reject', v }))
            try {
                await tr.wait(isData('out', 'a'))
                gate.open(1)
                let r = await withGuard(st, 15000, 'execProcess settle')
                assert.strict.deepStrictEqual(r, { s: 'resolve', v: 'abb' })
                let e0 = tr.events[0]
                assert.strict.deepStrictEqual([e0.type, e0.mode, typeof e0.pid === 'number' && e0.pid > 0], ['spawn', 'spawn', true])
                assert.strict.deepStrictEqual(tr.events.slice(1), [
                    { type: 'data', which: 'out', bytes: 1, text: 'a' },
                    { type: 'data', which: 'err', bytes: 2, text: 'bb' },
                    { type: 'settle', ok: true, reason: 'ok', code: 0 },
                ])
                //事件早於使用端回調(data先於cbStdout、cbStderr), settle早於落定
                assert.strict.deepStrictEqual(order, ['trace:spawn', 'trace:data:out', 'cb:out:a', 'trace:data:err', 'cb:err:bb', 'trace:settle', 'resolved'])
            }
            finally {
                assert.strict.deepStrictEqual(await finishCase(p, tr, gate, 2), true, 'leftover child process')
            }
        })

        it(`should report in spawn the mode and the pid of the child (the child itself for spawn and execFile, the shell for exec)`, async function() {
            //JSDoc onTrace: spawn含mode為執行模式字串、pid為子程序pid; exec模式之pid為shell之pid
            let script = 'process.stdout.write(String(process.pid))'
            let a = await run(nodeBin, ['-e', script], { mode: 'spawn' })
            let b = await run(nodeBin, ['-e', script], { mode: 'execFile' })
            let c = await run(`"${nodeBin}"`, `-e "${script}"`, { mode: 'exec' })
            assert.strict.deepStrictEqual([a.r.s, String(pidOf(a.tr)) === a.r.v, a.tr.events[0].mode], ['resolve', true, 'spawn'])
            assert.strict.deepStrictEqual([b.r.s, String(pidOf(b.tr)) === b.r.v, b.tr.events[0].mode], ['resolve', true, 'execFile'])
            assert.strict.deepStrictEqual([c.r.s, Number.isInteger(pidOf(c.tr)) && pidOf(c.tr) > 0, c.tr.events[0].mode], ['resolve', true, 'exec'])
        })

        it(`should notify settle with reason code and the exit code when the exit code is non-zero, and settle with reason ok for exit code 0 without any data`, async function() {
            //JSDoc onTrace: settle之reason為'code'代表離開碼非0(code為該離開碼)、'ok'代表離開碼0; 無輸出者無data事件
            let a = await run(nodeBin, ['-e', 'process.exitCode=2'], {})
            let b = await run(nodeBin, ['-e', '1'], {})
            assert.strict.deepStrictEqual(a.r, { s: 'reject', v: 'code[2]:\n' })
            assert.strict.deepStrictEqual(a.tr.events.slice(1), [{ type: 'settle', ok: false, reason: 'code', code: 2 }])
            assert.strict.deepStrictEqual(b.r, { s: 'resolve', v: '' })
            assert.strict.deepStrictEqual(b.tr.events.slice(1), [{ type: 'settle', ok: true, reason: 'ok', code: 0 }])
        })

        it(`should notify timeout, kill and settle only after the opt.timeout threshold and not forward the events of execProcessKillPid (fake clock)`, async function() {
            //JSDoc onTrace: timeout為已達opt.timeout而即將殺子進程(ms)、kill為即將調用execProcessKillPid(pid; 不轉傳onTrace); 門檻本身是規格, 假時鐘推進, 子程序輸出由data事件同步
            let tr = recTrace({ guard: 12000 })
            let clock = useFakeClock()
            let p = null
            try {
                p = execProcess(nodeBin, ['-e', 'process.stdout.write("up");setTimeout(()=>{},30000)'], { timeout: 5000, onTrace: tr.on })
                let st = p.then((v) => ({ s: 'resolve', v }), (v) => ({ s: 'reject', v }))
                await tr.wait(isData('out', 'up')) //子程序已啟動並輸出; 逾時計時器(虛擬5000ms)已於spawn時設定
                let i0 = tr.mark()
                await clock.advance(4999)
                assert.strict.deepStrictEqual(tr.types(i0), []) //未達門檻無任何事件
                await clock.advance(1)
                let ev = await tr.wait((e) => e.type === 'settle')
                let r = await withGuard(st, 15000, 'execProcess timeout settle')
                assert.strict.deepStrictEqual(r, { s: 'reject', v: 'timeout[5000ms]:\nup' })
                let tail = tr.events.slice(i0)
                assert.strict.deepStrictEqual(tail.map((e) => e.type), ['timeout', 'kill', 'settle']) //不含execProcessKillPid之start、done
                assert.strict.deepStrictEqual(tail[0], { type: 'timeout', ms: 5000 })
                assert.strict.deepStrictEqual([tail[1].pid === pidOf(tr), tail[2].ok, tail[2].reason, ev === tail[2]], [true, false, 'timeout', true])
                assert.strict.deepStrictEqual(tail[2].code === null || typeof tail[2].code === 'number', true) //離開碼: 訊號結束為null, 否則為數字
            }
            finally {
                clock.restore()
                if (!tr.events.some((e) => e.type === 'settle') && typeof pidOf(tr) === 'number') {
                    assert.strict.deepStrictEqual(await reapTree(pidOf(tr)), true, 'leftover child process')
                }
            }
        })

        it(`should not notify timeout or kill when the process ends before opt.timeout`, async function() {
            //JSDoc onTrace: timeout、kill僅於達到opt.timeout時通知; 先結束者計時器已清除(事件僅spawn、data、settle)
            let a = await run(nodeBin, ['-e', 'process.stdout.write("fast")'], { timeout: 60000 })
            assert.strict.deepStrictEqual(a.r, { s: 'resolve', v: 'fast' })
            assert.strict.deepStrictEqual(a.tr.types(), ['spawn', 'data', 'settle'])
        })

        it(`should notify only settle when the call ends before spawning (args, codeCmd, quoted prog, synchronous spawn failure)`, async function() {
            //JSDoc onTrace: settle之reason為'args'(args型別不符)、'codeCmd'(編碼不支援)、'prog'(spawn模式prog含引號)、'spawn'(無法啟動), 此類結束早於子程序建立, 無spawn事件
            let a = await run(nodeBin, 123, {})
            let b = await run(nodeBin, ['-e', '1'], { codeCmd: 'no-such-encoding' })
            let c = await run(`"${nodeBin}"`, ['-e', '1'], {})
            let d = await run(nodeBin, ['-e', '1', 'x\u0000y'], {})
            let one = (reason) => [{ type: 'settle', ok: false, reason, code: null }]
            assert.strict.deepStrictEqual([a.r.s, a.tr.events], ['reject', one('args')])
            assert.strict.deepStrictEqual([b.r.s, b.tr.events], ['reject', one('codeCmd')])
            assert.strict.deepStrictEqual([c.r.s, c.tr.events], ['reject', one('prog')])
            assert.strict.deepStrictEqual([d.r.s, d.tr.events], ['reject', one('spawn')])
        })

        it(`should notify spawn with a null pid and settle once with reason spawn when the program cannot be started, without a second settle from the following close`, async function() {
            //JSDoc onTrace: 無法啟動子程序者spawn之pid為null; settle之reason為'spawn', error事件者其後node仍會發出之close不再通知(每次呼叫至多一個settle)
            let progMissing2 = path.resolve('./test/_tmp/execProcess/zz_no_such_prog_456.exe')
            for (let opt of [{}, { codeCmd: 'auto' }, { mode: 'execFile' }]) {
                let { r, tr } = await run(progMissing2, ['a'], opt)
                assert.strict.deepStrictEqual(r.s, 'reject')
                assert.strict.deepStrictEqual(r.v.startsWith('spawn[ENOENT]:\n'), true)
                assert.strict.deepStrictEqual(tr.events, [
                    { type: 'spawn', mode: opt.mode || 'spawn', pid: null },
                    { type: 'settle', ok: false, reason: 'spawn', code: null },
                ])
                //否定斷言之觀察窗: error之後close仍會到達(node必發), 其不得再通知settle; 窗內事件變少只會漏抓, 停止本身由上方事件序列斷言
                await realSleep(150)
                assert.strict.deepStrictEqual(settles(tr).length, 1)
            }
        })

        it(`should notify the switch event once per stream before the data event that triggered it, and keep decoding with the switched label under auto`, async function() {
            //JSDoc onTrace: switch為codeCmd為'auto'之該串流首次遇到非utf-8位元組而改用系統字碼頁(which、label); 每串流至多一次, 早於觸發改判之data事件; stdout與stderr各有解碼器故各至多一次; 本案不依賴本機字碼頁(僅斷言事件與回調結構, 不斷言解碼後之字)
            let calls = []
            let { r, tr } = await runGated(`switch-events`, `o:6f6b,o:b54c,o:b54c,e:b54c`, {
                codeCmd: 'auto',
                cbStdout: (d) => calls.push(d),
            }, [isData('out', 'ok'), (e) => e.type === 'data' && e.which === 'out' && e.bytes === 2, (e) => e.type === 'data' && e.which === 'out' && e.bytes === 2 && e.text !== ''])
            let sw = tr.events.map((e, i) => [e, i]).filter(([e]) => e.type === 'switch')
            assert.strict.deepStrictEqual(sw.map(([e]) => e.which), ['out', 'err'])
            assert.strict.deepStrictEqual(sw.every(([e]) => typeof e.label === 'string' && e.label !== ''), true)
            //switch緊接於觸發它之data事件之前: 第一個switch(out)後為第二個stdout chunk(bytes 2), 第二個switch(err)後為stderr之data
            assert.strict.deepStrictEqual(sw.map(([e, i]) => `${tr.events[i + 1].type}:${tr.events[i + 1].which}:${tr.events[i + 1].bytes}`), ['data:out:2', 'data:err:2'])
            //'ok'之chunk與第三個stdout chunk(已改判後)不再通知switch
            assert.strict.deepStrictEqual(tr.events.filter((e) => e.type === 'data').map((e) => `${e.which}:${e.bytes}`), ['out:2', 'out:2', 'out:2', 'err:2'])
            assert.strict.deepStrictEqual([r.s, calls.length, calls[0]], ['resolve', 3, 'ok'])
        })

        it(`should notify an empty text for a chunk holding only an incomplete multibyte sequence and not call cbStdout for it`, async function() {
            //JSDoc onTrace: data之text於該chunk僅含尚未完整之多位元組序列時為空字串; JSDoc cbStdout: 多位元組字元跨chunk時等到完整才給, 不會收到空字串
            let calls = []
            let { r, tr } = await runGated(`partial`, `o:e784,o:a1`, { cbStdout: (d) => calls.push(d) }, [(e) => e.type === 'data' && e.bytes === 2])
            assert.strict.deepStrictEqual(tr.events.filter((e) => e.type === 'data').map((e) => [e.bytes, e.text]), [[2, ''], [1, '無']])
            assert.strict.deepStrictEqual([r, calls], [{ s: 'resolve', v: '無' }, ['無']])
        })

        it(`should reject the string without notifying when opt is unreadable before the callback is taken, including when the onTrace getter throws`, async function() {
            //JSDoc onTrace: opt不可讀者(含onTrace屬性之getter拋錯)屬取得回調前之失敗, reject說明字串且不通知; 與其餘選項不可讀之既有失敗路徑結果相同
            let tr = recTrace()
            let opt1 = Object.defineProperty({ onTrace: tr.on }, 'timeout', { enumerable: true, get: thrower(new Error('getter boom')) })
            let a = await execProcess(nodeBin, ['-e', '1'], opt1).then((v) => ({ s: 'resolve', v }), (v) => ({ s: 'reject', v }))
            let b = await execProcess(nodeBin, ['-e', '1'], revoked()).then((v) => ({ s: 'resolve', v }), (v) => ({ s: 'reject', v }))
            let opt3 = Object.defineProperty({}, 'onTrace', { enumerable: true, get: thrower(new Error('trace getter boom')) })
            let c = await execProcess(nodeBin, ['-e', '1'], opt3).then((v) => ({ s: 'resolve', v }), (v) => ({ s: 'reject', v }))
            assert.strict.deepStrictEqual(a, { s: 'reject', v: 'opt is not readable: getter boom' })
            assert.strict.deepStrictEqual([b.s, b.v.startsWith('opt is not readable: ')], ['reject', true])
            assert.strict.deepStrictEqual(c, { s: 'reject', v: 'opt is not readable: trace getter boom' })
            assert.strict.deepStrictEqual(tr.events.length, 0)
        })

        it(`should give the same results without onTrace, with a recording onTrace, and with a throwing, rejecting or invalid onTrace`, async function() {
            //R-TRACE-01 P3: 未傳觀察回調時行為不變; P4: 回調之拋錯與回傳之rejection不影響本函數、不產生未處理之rejection; 涵蓋resolve、離開碼非0、無法啟動、args與編碼與引號之說明字串、逾時(真實逾時, 子程序不會自行結束, 僅比對結果不斷言時間)、opt不可讀
            let un = collectUnhandled()
            let rec = recTrace({ guard: 12000 })
            let got = []
            let toRes = (pm) => pm.then((v) => ({ s: 'resolve', v }), (v) => ({ s: 'reject', v }))
            try {
                for (let onTrace of fiveOnTrace(rec.on)) {
                    let o = { onTrace }
                    let a = await toRes(execProcess(nodeBin, ['-e', 'process.stdout.write("hello")'], o))
                    let b = await toRes(execProcess(nodeBin, ['-e', 'process.stderr.write("boom");process.exitCode=2'], o))
                    let c = await toRes(execProcess(path.resolve('./test/_tmp/execProcess/zz_no_such_prog_789.exe'), ['a'], o))
                    let d = await toRes(execProcess(nodeBin, 123, o))
                    let e = await toRes(execProcess(nodeBin, ['-e', '1'], { onTrace, codeCmd: 'no-such-encoding' }))
                    let f = await toRes(execProcess(`"${nodeBin}"`, ['-e', '1'], o))
                    let g = await toRes(execProcess(nodeBin, ['-e', 'setTimeout(()=>{},30000)'], { onTrace, timeout: 300 }))
                    let optBad = Object.defineProperty({ onTrace }, 'mode', { enumerable: true, get: thrower(new Error('getter boom')) })
                    let h = await toRes(execProcess(nodeBin, ['-e', '1'], optBad))
                    let i = await toRes(execProcess(nodeBin, ['-e', 'process.stdout.write("u")'], { onTrace, codeCmd: 'auto' }))
                    got.push([a, b, c, d, e, f, g, h, i])
                }
                await new Promise((resolve) => setImmediate(resolve))
                await new Promise((resolve) => setImmediate(resolve))
            }
            finally {
                un = un.stop()
            }
            assert.strict.deepStrictEqual(got.length, 5)
            for (let k = 1; k < 5; k++) {
                assert.strict.deepStrictEqual(got[k], got[0], `variant ${k}`)
            }
            assert.strict.deepStrictEqual(got[0].map((x) => x.s), ['resolve', 'reject', 'reject', 'reject', 'reject', 'reject', 'reject', 'reject', 'resolve'])
            assert.strict.deepStrictEqual([got[0][0].v, got[0][1].v, got[0][6].v, got[0][8].v], ['hello', 'code[2]:\nboom', 'timeout[300ms]:\n', 'u'])
            assert.strict.deepStrictEqual(un, [])
            //紀錄器確有收到事件(spawn、data、settle、timeout、kill)
            let ts = new Set(rec.types())
            assert.strict.deepStrictEqual(['spawn', 'data', 'settle', 'timeout', 'kill'].every((t) => ts.has(t)), true)
        })

        it(`should notify frozen events of primitive fields fixed per type, with no receiver`, async function() {
            //JSDoc onTrace: 事件為凍結物件{ type, ... }, 欄位依type列舉且皆為原始值; 回調不帶接收者呼叫(R-TRACE-01 P4: 唯讀快照、最少欄位、不暴露內部可變狀態)
            let rs = []
            rs.push(await run(nodeBin, ['-e', 'process.stdout.write("a");process.stderr.write("b")'], {})) //spawn、data、settle
            rs.push(await run(nodeBin, ['-e', 'setTimeout(()=>{},30000)'], { timeout: 300 })) //timeout、kill
            rs.push(await run(nodeBin, ['-e', '1', 'x\u0000y'], {})) //settle(spawn)
            rs.push(await runGated(`fields-switch`, `o:b54c`, { codeCmd: 'auto' }, [])) //switch
            let trs = rs.map((x) => x.tr)
            let all = trs.flatMap((t) => t.events)
            let keys = {}
            for (let e of all) {
                keys[e.type] = Object.keys(e).sort().join(',')
            }
            assert.strict.deepStrictEqual(keys, { spawn: 'mode,pid,type', data: 'bytes,text,type,which', settle: 'code,ok,reason,type', timeout: 'ms,type', kill: 'pid,type', switch: 'label,type,which' })
            assert.strict.deepStrictEqual(all.every((e) => Object.values(e).every((v) => v === null || ['number', 'string', 'boolean'].includes(typeof v))), true)
            let meta = trs.flatMap((t) => t.meta)
            assert.strict.deepStrictEqual(meta.length === all.length && meta.every(([self, frozen]) => self === undefined && frozen), true)
        })

    })

})


//R-EXEC-FAIL-01之6~14: 每案於獨立子行程執行(test/tools/execFailRunner.mjs), 夾具建於test/_tmp/execFail-<案名>/並於案例結束刪除
describe(`execProcess 失敗回報(R-EXEC-FAIL-01之6~14)`, function() {

    it(`execProcess: 末端不完整多位元組使cbStdout、cbStderr於收尾flush時首次被呼叫而拋錯(不攔截, 仍為未捕捉例外)時, execProcess仍落定 [R-EXEC-FAIL-01之12; R-PM-SETTLE-01之1]`, function() {
        let { r } = runExecFail('execProcessCbFlush')
        assert.strict.deepStrictEqual(r.out, { execProcessCbFlush: 'resolve', execProcessCbStderrFlush: 'resolve', uncaught: ['cbStderr flush boom', 'cbStdout flush boom'] })
    })

    it(`execProcess: cbStdout、cbStderr於data時拋錯(不攔截, 仍為未捕捉例外)時, 該段輸出仍計入resolve之合併字串 [R-EXEC-FAIL-01之12; R-PM-SETTLE-01之1]`, function() {
        let { r } = runExecFail('execProcessCbData')
        assert.strict.deepStrictEqual(r.out, { cbStdoutData: { s: 'resolve', v: 'x' }, cbStderrData: { s: 'resolve', v: 'y' }, uncaught: ['cbStderr data boom', 'cbStdout data boom'] })
    })

    it(`execProcess: cbStdout於收尾flush時拋錯, 無處理器之行程仍以離開碼1結束並印出錯誤(重拋早於呼叫端續行, 不因隨即process.exit而遺失) (守門) [R-EXEC-FAIL-01之12]`, function() {
        let { status, signal, stderr } = runExecFail('rethrowExecProcessFlush', { exitMode: 'nohandler', allowNoResult: true })
        assert.strict.deepStrictEqual([status, stderr.includes('cb boom')], [1, true], `status=${status}, signal=${signal}, stderr=${stderr.slice(0, 300)}`)
    })

    it(`execProcess: opt之getter拋錯、opt本身或其選項值、args、prog為已撤銷之Proxy時以reject說明字串回報, 不同步拋錯、不成為未捕捉例外 [R-EXEC-FAIL-01之5、13]`, function() {
        let { r } = runExecFail('inputUnreadableProc')
        assert.strict.deepStrictEqual(r.out, {
            procGetter: { s: 'reject', v: 'opt is not readable: getter boom codeCmd' }, //規則13: reject 'opt is not readable: <訊息>'
            procOptRevoked: { s: 'reject', v: 'opt is not readable: <revoked>' }, //規則13: 同上(opt本身不可讀)
            procArgsRevoked: { s: 'reject', v: 'args is not an array or string' }, //規則13、5: args判型拋錯視同型別不符, reject且不帶值
            procProgRevoked: { s: 'reject', v: 'spawn[UNKNOWN]:' }, //規則13: prog不可讀為'spawn[UNKNOWN]:\n<訊息>'(取首行)
            procProgRevokedAuto: { s: 'reject', v: 'spawn[UNKNOWN]:' }, //規則13: 同上, codeCmd為auto(於取得系統字碼頁後啟動)亦同
            procCbStdoutRevoked: { s: 'reject', v: 'opt is not readable: <revoked>' }, //規則13: 回調於入口判型一次, 不可讀者為opt不可讀
            uncaught: [], //規則13: 監聽器內不再觸及呼叫端之值
        })
        assert.strict.deepStrictEqual([r.unhandled, r.uncaught], [[], []]) //規則13: 不同步拋錯、不成為未捕捉例外
    })

    it(`execProcess: cbStdout、cbStderr為以函數為目標之Proxy且於入口判型後才撤銷時, data與收尾flush內不再判型呼叫端之值(execProcess照常落定、輸出照常計入), 未捕捉例外僅有呼叫已撤銷回調本身者 [R-EXEC-FAIL-01之12、13]`, function() {
        let { r } = runExecFail('procCbRevokedLater')
        //規則12: 呼叫已撤銷之回調所拋之TypeError經_callUser原樣重拋(revoked:apply), 不得有判型所生者(revoked:has)
        let u = ['revoked:apply']
        assert.strict.deepStrictEqual(r.out, {
            cbStdoutData: { s: 'resolve', v: 'x', uncaught: u }, //規則13: data內不再判型cbStdout, 該段仍計入resolve之合併字串
            cbStdoutFlush: { s: 'resolve', v: '�', uncaught: u }, //規則13: 收尾flush時不再判型cbStdout(否則close之收尾中斷而永不落定)
            cbStderrData: { s: 'resolve', v: 'y', uncaught: u }, //規則13: 同上(cbStderr, data)
            cbStderrFlush: { s: 'resolve', v: '�', uncaught: u }, //規則13: 同上(cbStderr, 收尾flush)
        })
        assert.strict.deepStrictEqual(r.unhandled, []) //規則13: 不產生未處理之rejection
    })

    it(`execProcess: opt之getter拋出非Error之值(null、undefined、字串)或prog不可讀而拋出字串時, reject字串保留拋出值之文字、不同步拋錯 [R-EXEC-FAIL-01之13]`, function() {
        let { r } = runExecFail('procThrownValues')
        //規則13: execProcess reject 'opt is not readable: <訊息>'(訊息取getErrorMessage, 為空退_errToStr)
        let x = (m) => ({ s: 'reject', v: `opt is not readable: ${m}` })
        assert.strict.deepStrictEqual(r.out, {
            null: x('null'), //規則13: 拋出null
            undefined: x('undefined'), //規則13: 拋出undefined
            string: x('thrown-x'), //規則13: 拋出字串
            progThrowsString: { s: 'reject', v: 'spawn[UNKNOWN]:\nthrown-x' }, //規則13: prog不可讀為'spawn[UNKNOWN]:\n<訊息>'
        })
        assert.strict.deepStrictEqual([r.unhandled, r.uncaught], [[], []]) //規則13: 不同步拋錯、不成為未捕捉例外
    })

})


//opt.cwd(JSDoc execProcess之opt.cwd; 同execCli, R-EXEC-FAIL-01規則7): 子進程之工作目錄, 三種模式皆生效; 非非空字串為本進程之工作目錄; 不存在或非資料夾時reject'spawn[ENOENT]:\ncwd is not an existing folder: <cwd>'
//夾具建於test/_tmp/execProcess-cwd/(含空白與中文之資料夾、檔案、指向資料夾之junction), after刪除
describe(`execProcess opt.cwd`, function() {

    let fd = path.resolve('./test/_tmp/execProcess-cwd')
    let fdSub = path.join(fd, 'd 中文 x')
    let fpFile = path.join(fd, 'f.txt')
    let fdLink = path.join(fd, 'lnk')
    let fdMissing = path.join(fd, 'no-such-dir')
    let modes = ['spawn', 'exec', 'execFile']
    let js = 'process.stdout.write(process.cwd())'

    before(function() {
        fs.rmSync(fd, { recursive: true, force: true })
        fs.mkdirSync(fdSub, { recursive: true })
        fs.writeFileSync(fpFile, 'x')
        fs.symlinkSync(fdSub, fdLink, 'junction')
    })

    after(function() {
        //先拆連結(只移除連結本身, 不跟進目標)再刪夾具
        try {
            fs.unlinkSync(fdLink)
        }
        catch (err) {}
        fs.rmSync(fd, { recursive: true, force: true })
    })

    //run, 以node印出子進程之工作目錄; exec模式經shell, node路徑與腳本須自行加引號
    let run = (mode, opt) => {
        let prog = mode === 'exec' ? `"${process.execPath}"` : process.execPath
        let args = mode === 'exec' ? ['-e', `"${js}"`] : ['-e', js]
        let ev = []
        return execProcess(prog, args, { mode, ...opt, onTrace: (e) => ev.push(e) }).then((v) => ({ s: 'resolve', v, ev }), (v) => ({ s: 'reject', v, ev }))
    }

    it(`should run the child in the given folder for all three modes (folder name with spaces and non-ASCII, relative path, junction)`, async function() {
        let rs = {}
        for (let mode of modes) {
            rs[mode] = [(await run(mode, { cwd: fdSub })).v, (await run(mode, { cwd: path.relative(process.cwd(), fdSub) })).v, (await run(mode, { cwd: fdLink })).s]
        }
        //「子進程工作目錄」: 子進程之process.cwd()即所給之資料夾(相對路徑以本進程之工作目錄為基準); junction指向既存資料夾者為有效之cwd
        let want = [fdSub, fdSub, 'resolve']
        assert.strict.deepStrictEqual(rs, { spawn: want, exec: want, execFile: want })
    })

    it(`should use the current working directory when cwd is not a non-empty string`, async function() {
        let rs = {}
        for (let mode of modes) {
            rs[mode] = []
            for (let cwd of [undefined, null, '', 123, {}]) {
                rs[mode].push((await run(mode, { cwd })).v)
            }
        }
        //「預設process.cwd()，非非空字串時亦用預設」
        let want = Array(5).fill(process.cwd())
        assert.strict.deepStrictEqual(rs, { spawn: want, exec: want, execFile: want })
    })

    it(`should reject 'spawn[ENOENT]:\\ncwd is not an existing folder: <cwd>' when cwd is missing or is a file, with settle reason 'spawn'`, async function() {
        let rs = {}
        for (let mode of modes) {
            rs[mode] = []
            for (let cwd of [fdMissing, fpFile]) {
                let r = await run(mode, { cwd })
                let settle = r.ev.filter((e) => e.type === 'settle')
                rs[mode].push([r.s, r.v, settle.map((e) => `${e.ok}:${e.reason}`)])
            }
        }
        //R-EXEC-FAIL-01規則7: 訊息改指cwd(碼仍為ENOENT); JSDoc: 未能啟動子程序, settle之reason為'spawn'(每次呼叫至多一個settle)
        let want = [
            ['reject', `spawn[ENOENT]:\ncwd is not an existing folder: ${fdMissing}`, ['false:spawn']],
            ['reject', `spawn[ENOENT]:\ncwd is not an existing folder: ${fpFile}`, ['false:spawn']],
        ]
        assert.strict.deepStrictEqual(rs, { spawn: want, exec: want, execFile: want })
    })

    it(`should reject 'opt is not readable' when the cwd getter throws, without throwing synchronously`, async function() {
        let opt = {}
        Object.defineProperty(opt, 'cwd', {
            get() {
                throw new Error('cwd getter boom')
            },
        })
        let r = await execProcess(process.execPath, ['-e', js], opt).then((v) => ({ s: 'resolve', v }), (v) => ({ s: 'reject', v }))
        //R-EXEC-FAIL-01規則13: opt之選項值不可讀時reject 'opt is not readable: <訊息>'
        assert.strict.deepStrictEqual(r, { s: 'reject', v: 'opt is not readable: cwd getter boom' })
    })

})
