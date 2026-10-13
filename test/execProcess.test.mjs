import assert from 'assert'
import cp from 'child_process'
import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'
import execProcess from '../src/execProcess.mjs'
import { runExecFail } from './tools/execFailRun.mjs'


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
    let sCbSwitch = 'process.stdout.write("ok");setTimeout(()=>{process.stdout.write(Buffer.from([181,76]))},300)'
    let sErrExit3 = 'process.stderr.write(Buffer.from([181,76]));setTimeout(()=>{process.exit(3)},100)'
    let sForever = 'setInterval(()=>{process.stdout.write(Buffer.from([231,132,161]))},50)'
    let sOrder = 'process.stdout.write("a");setTimeout(()=>{process.stderr.write("b")},150);setTimeout(()=>{process.stdout.write("c")},300)'
    let sBom = 'process.stdout.write(Buffer.from([239,187,191,65]))'

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
        let r = await execProcess(nodeBin, ['-e', sOrder])
        assert.strict.deepStrictEqual(r, 'abc')
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
        let err = null
        try {
            await execProcess(nodeBin, ['-e', sForever], { codeCmd: 'auto', timeout: 400 })
        }
        catch (e) {
            err = e
        }
        assert.strict.deepStrictEqual(typeof err === 'string' && err.startsWith('timeout[400ms]:\n'), true)
        let body = err.slice('timeout[400ms]:\n'.length)
        assert.strict.deepStrictEqual(body.includes('無'), true)
        //被殺於字元中間時至多結尾一個U+FFFD, 不得整段改判為系統字碼頁
        assert.strict.deepStrictEqual((body.match(/�/g) || []).length <= 1, true)
        assert.strict.deepStrictEqual(body.replace(/無|�/g, ''), '')
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
        let calls = []
        let r = await execProcess(nodeBin, ['-e', sCbSwitch], {
            codeCmd: 'auto',
            cbStdout: (data) => {
                calls.push(data)
            },
        })
        assert.strict.deepStrictEqual(calls, ['ok', '無'])
        assert.strict.deepStrictEqual(r, 'ok無')
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

})


//R-EXEC-FAIL-01之6~12: 每案於獨立子行程執行(test/tools/execFailRunner.mjs), 夾具建於test/_tmp/execFail-<案名>/並於案例結束刪除
describe(`execProcess 失敗回報(R-EXEC-FAIL-01之6~12)`, function() {

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

})
