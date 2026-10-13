import assert from 'assert'
import fs from 'fs'
import path from 'path'
import cp from 'child_process'
import { fileURLToPath } from 'url'
import execCli from '../src/execCli.mjs'


describe(`execCli`, function() {

    //以當前執行mocha的node當測試對象, 跨Windows/Linux/macOS可用
    let nodeBin = process.execPath

    it(`should resolve ok with stdout content when running a basic command`, async function() {
        let r = await execCli(nodeBin, ['-e', 'process.stdout.write("hello")'])
        // console.log('basic r', JSON.stringify(r))
        assert.strict.deepStrictEqual(r.ok, true)
        assert.strict.deepStrictEqual(r.stdout, 'hello')
        assert.strict.deepStrictEqual(r.code, 0)
        assert.strict.deepStrictEqual(r.error, '')
        assert.strict.deepStrictEqual(r.attempts, 1)
    })

    it(`should collect stderr content`, async function() {
        let r = await execCli(nodeBin, ['-e', 'process.stderr.write("warnmsg")'])
        // console.log('stderr r', JSON.stringify(r))
        assert.strict.deepStrictEqual(r.ok, true)
        assert.strict.deepStrictEqual(r.stderr, 'warnmsg')
    })

    it(`should return ok=false with 'Exit code N' when exit code is non-zero`, async function() {
        let r = await execCli(nodeBin, ['-e', 'process.exit(3)'])
        // console.log('exit r', JSON.stringify(r))
        assert.strict.deepStrictEqual(r.ok, false)
        assert.strict.deepStrictEqual(r.code, 3)
        assert.strict.deepStrictEqual(r.error, 'Exit code 3')
    })

    it(`should return ok=false with ENOENT when command does not exist`, async function() {
        let r = await execCli('non_existent_command_xyz_12345', ['arg'])
        // console.log('enoent r', JSON.stringify(r))
        assert.strict.deepStrictEqual(r.ok, false)
        assert.strict.deepStrictEqual(r.error.includes('ENOENT'), true)
    })

    it(`should return error structure without spawning when command is not an effective string`, async function() {
        let r = await execCli('')
        // console.log('nocmd r', JSON.stringify(r))
        assert.strict.deepStrictEqual(r.ok, false)
        assert.strict.deepStrictEqual(r.error, 'command 須為非空字串')
        assert.strict.deepStrictEqual(r.attempts, 0)
    })

    it(`should fallback to empty args when args is not an array`, async function() {
        let r = await execCli(nodeBin, '-e', {})
        // console.log('badargs r', JSON.stringify(r))
        //無args時node會進入REPL, 但stdin已被end故立即結束
        assert.strict.deepStrictEqual(r.code, 0)
    })

    it(`should fallback to default opt when opt is not an object`, async function() {
        let r = await execCli(nodeBin, ['-e', 'process.stdout.write("ok")'], 'invalid')
        assert.strict.deepStrictEqual(r.ok, true)
        assert.strict.deepStrictEqual(r.stdout, 'ok')
    })

    it(`should pass opt.input into stdin (with chinese)`, async function() {
        let sc = 'let b="";process.stdin.on("data",(d)=>{b+=d});process.stdin.on("end",()=>{process.stdout.write(b)})'
        let r = await execCli(nodeBin, ['-e', sc], { input: '中文測試abc' })
        // console.log('stdin r', JSON.stringify(r))
        assert.strict.deepStrictEqual(r.ok, true)
        assert.strict.deepStrictEqual(r.stdout, '中文測試abc')
    })

    it(`should decode multi-byte utf8 correctly across chunk boundaries`, async function() {
        //輸出約200KB中文, 必然跨多個chunk, 若解碼未跨chunk銜接會出現U+FFFD
        let sc = 'process.stdout.write("中文測試字串".repeat(20000))'
        let r = await execCli(nodeBin, ['-e', sc])
        // console.log('utf8 len', r.stdout.length)
        assert.strict.deepStrictEqual(r.ok, true)
        assert.strict.deepStrictEqual(r.stdout.includes('�'), false)
        assert.strict.deepStrictEqual(r.stdout, '中文測試字串'.repeat(20000))
    })

    it(`should pass args verbatim (with chinese and spaces)`, async function() {
        let r = await execCli(nodeBin, ['-e', 'process.stdout.write(process.argv[1])', '中文 參數 test'])
        // console.log('argv r', JSON.stringify(r))
        assert.strict.deepStrictEqual(r.ok, true)
        assert.strict.deepStrictEqual(r.stdout, '中文 參數 test')
    })

    it(`should use opt.cwd as working directory`, async function() {
        let r = await execCli(nodeBin, ['-e', 'process.stdout.write(process.cwd())'], { cwd: './src' })
        // console.log('cwd r', JSON.stringify(r))
        assert.strict.deepStrictEqual(r.ok, true)
        assert.strict.deepStrictEqual(r.stdout.endsWith('src'), true)
    })

    it(`should fire opt.onStdout and opt.onStderr callbacks`, async function() {
        let cout = ''
        let cerr = ''
        let sc = 'process.stdout.write("outmsg");process.stderr.write("errmsg")'
        let r = await execCli(nodeBin, ['-e', sc], {
            onStdout: (d) => {
                cout += d
            },
            onStderr: (d) => {
                cerr += d
            },
        })
        // console.log('cb', JSON.stringify(cout), JSON.stringify(cerr))
        assert.strict.deepStrictEqual(r.ok, true)
        assert.strict.deepStrictEqual(cout.includes('outmsg'), true)
        assert.strict.deepStrictEqual(cerr.includes('errmsg'), true)
    })

    it(`should not change env behavior when opt.env is not provided`, async function() {
        let r = await execCli(nodeBin, ['-e', 'process.stdout.write(String(process.env.ENVTEST_FOO))'])
        assert.strict.deepStrictEqual(r.ok, true)
        assert.strict.deepStrictEqual(r.stdout, 'undefined')
    })

    it(`should inject opt.env into child process`, async function() {
        let r = await execCli(nodeBin, ['-e', 'process.stdout.write(process.env.ENVTEST_FOO)'], { env: { ENVTEST_FOO: 'BAR中文' } })
        assert.strict.deepStrictEqual(r.ok, true)
        assert.strict.deepStrictEqual(r.stdout, 'BAR中文')
    })

    it(`should not pollute parent process.env when opt.env is injected`, async function() {
        await execCli(nodeBin, ['-e', 'process.stdout.write("ok")'], { env: { ENVTEST_FOO: 'BAR' } })
        assert.strict.deepStrictEqual(process.env.ENVTEST_FOO, undefined)
    })

    it(`should keep inherited env vars when opt.env is injected`, async function() {
        //注入不應清空繼承環境, 否則Windows下子進程連PATH都拿不到
        let r = await execCli(nodeBin, ['-e', 'process.stdout.write(JSON.stringify(Object.keys(process.env).length > 3))'], { env: { ENVTEST_FOO: 'BAR' } })
        assert.strict.deepStrictEqual(r.ok, true)
        assert.strict.deepStrictEqual(r.stdout, 'true')
    })

    it(`should fallback to no injection when opt.env is not an object`, async function() {
        let r = await execCli(nodeBin, ['-e', 'process.stdout.write("ok")'], { env: 'not-an-object' })
        assert.strict.deepStrictEqual(r.ok, true)
        assert.strict.deepStrictEqual(r.stdout, 'ok')
    })

    it(`should keep opt.env injection stable across parallel calls with retries`, async function() {
        //3路並行各帶不同值, 以validate強制失敗走重試路徑, 用onStdout側錄每次attempt實得值
        //改process.env之作法於重試階段(await delay之後)必被其他並行路污染, opt.env須全數正確
        let seen = { A: [], B: [], C: [] }
        await Promise.all(['A', 'B', 'C'].map((v) => execCli(
            nodeBin, ['-e', 'process.stdout.write(process.env.ENVTEST_KEY)'],
            {
                env: { ENVTEST_KEY: v },
                validate: () => false, //強制每次attempt失敗以觸發重試
                maxRetries: 1,
                retryDelayMs: 100,
                onStdout: (chunk) => {
                    seen[v].push(String(chunk).trim())
                },
            }
        )))
        // console.log('seen', JSON.stringify(seen))
        //每路含重試共2次attempt, 實得值皆須等於該路自己的注入值
        for (let v of ['A', 'B', 'C']) {
            assert.strict.deepStrictEqual(seen[v].length >= 2, true)
            assert.strict.deepStrictEqual(seen[v].every((s) => s === v), true)
        }
    })

    it(`should treat undefined value in opt.env as removing the variable`, async function() {
        //值為undefined代表移除該變數, 可遮蔽繼承值; 以PYTHONIOENCODING(execCli必注入)驗證
        let sc = 'process.stdout.write(JSON.stringify("PYTHONIOENCODING" in process.env))'
        let r1 = await execCli(nodeBin, ['-e', sc])
        assert.strict.deepStrictEqual(r1.stdout, 'true')
        let r2 = await execCli(nodeBin, ['-e', sc], { env: { PYTHONIOENCODING: undefined } })
        assert.strict.deepStrictEqual(r2.stdout, 'false')
    })

    it(`should let opt.env override PYTHONIOENCODING`, async function() {
        let r = await execCli(nodeBin, ['-e', 'process.stdout.write(process.env.PYTHONIOENCODING)'], { env: { PYTHONIOENCODING: 'ascii' } })
        assert.strict.deepStrictEqual(r.ok, true)
        assert.strict.deepStrictEqual(r.stdout, 'ascii')
    })

    if (process.platform === 'win32') {
        it(`should override same-name env var with different case on Windows`, async function() {
            //Windows環境變數大小寫不敏感: 呼叫端傳Path須能覆蓋繼承之PATH, 不可兩鍵並存致注入靜默失效
            let sc = 'const ks=Object.keys(process.env).filter((k)=>k.toLowerCase()==="path");process.stdout.write(JSON.stringify(ks.map((k)=>process.env[k])))'
            let r = await execCli(nodeBin, ['-e', sc], { env: { Path: 'C:\\envtest-injected' } })
            // console.log('case r', JSON.stringify(r.stdout))
            assert.strict.deepStrictEqual(r.ok, true)
            assert.strict.deepStrictEqual(JSON.parse(r.stdout), ['C:\\envtest-injected'])
        })
    }

    it(`should pass validate 'nonempty' when stdout has content`, async function() {
        let r = await execCli(nodeBin, ['-e', 'process.stdout.write("abc")'], { validate: 'nonempty' })
        assert.strict.deepStrictEqual(r.ok, true)
    })

    it(`should fail validate 'nonempty' when stdout is blank`, async function() {
        let r = await execCli(nodeBin, ['-e', 'process.stdout.write("   ")'], { validate: 'nonempty' })
        // console.log('nonempty r', JSON.stringify(r))
        assert.strict.deepStrictEqual(r.ok, false)
        assert.strict.deepStrictEqual(r.error, 'OUTPUT_VALIDATION_FAILED')
        assert.strict.deepStrictEqual(r.code, 0)
    })

    it(`should pass validate 'json' when stdout is valid json`, async function() {
        let r = await execCli(nodeBin, ['-e', 'process.stdout.write(JSON.stringify({a:1}))'], { validate: 'json' })
        assert.strict.deepStrictEqual(r.ok, true)
    })

    it(`should fail validate 'json' when stdout is not json`, async function() {
        let r = await execCli(nodeBin, ['-e', 'process.stdout.write("abc")'], { validate: 'json' })
        assert.strict.deepStrictEqual(r.ok, false)
        assert.strict.deepStrictEqual(r.error, 'OUTPUT_VALIDATION_FAILED')
    })

    it(`should pass validate 'min:N' when stdout is long enough`, async function() {
        let r = await execCli(nodeBin, ['-e', 'process.stdout.write("abcdefghij")'], { validate: 'min:5' })
        assert.strict.deepStrictEqual(r.ok, true)
    })

    it(`should fail validate 'min:N' when stdout is too short`, async function() {
        let r = await execCli(nodeBin, ['-e', 'process.stdout.write("abc")'], { validate: 'min:5' })
        assert.strict.deepStrictEqual(r.ok, false)
        assert.strict.deepStrictEqual(r.error, 'OUTPUT_VALIDATION_FAILED')
    })

    it(`should fail validate when 'min:N' rule itself is invalid (min:abc)`, async function() {
        let r = await execCli(nodeBin, ['-e', 'process.stdout.write("abcdefghij")'], { validate: 'min:abc' })
        // console.log('minabc r', JSON.stringify(r))
        assert.strict.deepStrictEqual(r.ok, false)
        assert.strict.deepStrictEqual(r.error, 'OUTPUT_VALIDATION_FAILED')
    })

    it(`should support multiple validate rules joined by comma`, async function() {
        let r1 = await execCli(nodeBin, ['-e', 'process.stdout.write(JSON.stringify({a:1}))'], { validate: 'nonempty,json' })
        assert.strict.deepStrictEqual(r1.ok, true)
        let r2 = await execCli(nodeBin, ['-e', 'process.stdout.write("abc")'], { validate: 'nonempty,json' })
        assert.strict.deepStrictEqual(r2.ok, false)
    })

    it(`should support validate as a custom function`, async function() {
        let r1 = await execCli(nodeBin, ['-e', 'process.stdout.write("abc")'], { validate: (s) => s === 'abc' })
        assert.strict.deepStrictEqual(r1.ok, true)
        let r2 = await execCli(nodeBin, ['-e', 'process.stdout.write("abc")'], { validate: (s) => s === 'xyz' })
        assert.strict.deepStrictEqual(r2.ok, false)
        assert.strict.deepStrictEqual(r2.error, 'OUTPUT_VALIDATION_FAILED')
    })

    it(`should ignore validate when rule is invalid type`, async function() {
        let r = await execCli(nodeBin, ['-e', 'process.stdout.write("abc")'], { validate: 123 })
        assert.strict.deepStrictEqual(r.ok, true)
    })

    it(`should return ok=false with TIMEOUT when process exceeds opt.timeoutMs`, async function() {
        let t0 = Date.now()
        let r = await execCli(nodeBin, ['-e', 'setTimeout(() => {}, 30000)'], { timeoutMs: 500 })
        let dt = Date.now() - t0
        // console.log('timeout r', JSON.stringify(r), 'dt', dt)
        assert.strict.deepStrictEqual(r.ok, false)
        assert.strict.deepStrictEqual(r.error.startsWith('TIMEOUT after 0.5s'), true)
        //確保是timeout觸發殺進程後快速結束, 而非等子進程自然30s結束
        assert.strict.deepStrictEqual(dt >= 500 && dt < 15000, true)
    })

    it(`should kill grandchild process tree on timeout (parent spawns child node)`, async function() {
        //父node再spawn一個子node, 兩層都會被execProcessKillPid幹掉, 確認timeout機制有跨層生效不留孤兒
        let sc = [
            'const cp = require("child_process")',
            'cp.spawn(process.execPath, ["-e", "setTimeout(() => {}, 30000)"])',
            'setTimeout(() => {}, 30000)',
        ].join(';')
        let t0 = Date.now()
        let r = await execCli(nodeBin, ['-e', sc], { timeoutMs: 800 })
        let dt = Date.now() - t0
        // console.log('grandchild r', JSON.stringify(r), 'dt', dt)
        assert.strict.deepStrictEqual(r.ok, false)
        assert.strict.deepStrictEqual(r.error.startsWith('TIMEOUT after 0.8s'), true)
        assert.strict.deepStrictEqual(dt >= 800 && dt < 15000, true)
    })

    it(`should fallback to default timeoutMs when value is invalid`, async function() {
        let r = await execCli(nodeBin, ['-e', 'process.stdout.write("ok")'], { timeoutMs: -1 })
        assert.strict.deepStrictEqual(r.ok, true)
        assert.strict.deepStrictEqual(r.stdout, 'ok')
    })

    it(`should retry until maxRetries when result keeps failing`, async function() {
        let r = await execCli(nodeBin, ['-e', 'process.exit(3)'], { maxRetries: 2, retryDelayMs: 1 })
        // console.log('retry r', JSON.stringify(r))
        assert.strict.deepStrictEqual(r.ok, false)
        assert.strict.deepStrictEqual(r.attempts, 3)
    })

    it(`should not retry when error is ENOENT`, async function() {
        let r = await execCli('non_existent_command_xyz_12345', [], { maxRetries: 3, retryDelayMs: 1 })
        // console.log('noretry enoent r', JSON.stringify(r))
        assert.strict.deepStrictEqual(r.ok, false)
        assert.strict.deepStrictEqual(r.attempts, 1)
    })

    it(`should not retry when exit code is 2`, async function() {
        let r = await execCli(nodeBin, ['-e', 'process.exit(2)'], { maxRetries: 3, retryDelayMs: 1 })
        // console.log('noretry code2 r', JSON.stringify(r))
        assert.strict.deepStrictEqual(r.ok, false)
        assert.strict.deepStrictEqual(r.code, 2)
        assert.strict.deepStrictEqual(r.attempts, 1)
    })

    it(`should stop retrying once a retry succeeds`, async function() {
        let r = await execCli(nodeBin, ['-e', 'process.stdout.write("ok")'], { maxRetries: 3, retryDelayMs: 1 })
        assert.strict.deepStrictEqual(r.ok, true)
        assert.strict.deepStrictEqual(r.attempts, 1)
    })

    it(`should fallback to default maxRetries and retryDelayMs when values are invalid`, async function() {
        let r = await execCli(nodeBin, ['-e', 'process.exit(3)'], { maxRetries: -1, retryDelayMs: 0 })
        // console.log('badretry r', JSON.stringify(r))
        assert.strict.deepStrictEqual(r.attempts, 1)
    })

    it(`should return durationMs and pid`, async function() {
        let r = await execCli(nodeBin, ['-e', 'process.stdout.write("ok")'])
        // console.log('meta r', JSON.stringify(r))
        assert.strict.deepStrictEqual(r.durationMs >= 0, true)
        assert.strict.deepStrictEqual(r.pid > 0, true)
    })

    it(`should truncate stdout and stderr in failed result`, async function() {
        //失敗結果的stdout上限500字元, 超過會附加truncated標註
        let sc = 'process.stdout.write("a".repeat(2000));process.exit(3)'
        let r = await execCli(nodeBin, ['-e', sc])
        // console.log('trunc r', r.stdout.length)
        assert.strict.deepStrictEqual(r.ok, false)
        assert.strict.deepStrictEqual(r.stdout.startsWith('a'.repeat(500)), true)
        assert.strict.deepStrictEqual(r.stdout.includes('truncated, total 2000 chars'), true)
    })

    it(`should not truncate stdout in successful result`, async function() {
        let r = await execCli(nodeBin, ['-e', 'process.stdout.write("a".repeat(2000))'])
        assert.strict.deepStrictEqual(r.ok, true)
        assert.strict.deepStrictEqual(r.stdout.length, 2000)
    })

    it(`should fallback to default maxBuffer when value is invalid`, async function() {
        let r = await execCli(nodeBin, ['-e', 'process.stdout.write("abc")'], { maxBuffer: -1 })
        assert.strict.deepStrictEqual(r.ok, true)
        assert.strict.deepStrictEqual(r.stdout, 'abc')
    })

    it(`should stop accumulating stdout after maxBuffer is reached`, async function() {
        //分多次寫出, 累積量超過maxBuffer後便不再累積, 故長度遠小於總輸出量
        let sc = 'let i=0;let t=setInterval(()=>{process.stdout.write("x".repeat(100));i++;if(i>=20){clearInterval(t)}},5)'
        let r = await execCli(nodeBin, ['-e', sc], { maxBuffer: 100 })
        // console.log('maxBuffer len', r.stdout.length)
        assert.strict.deepStrictEqual(r.ok, true)
        assert.strict.deepStrictEqual(r.stdout.length < 2000, true)
    })

    //--- 失敗回報: 無法啟動子進程時不reject, error不含args與env之值 ---

    let SA = 'SECRET_ARG_7d1f' //機密標記, 置於args
    let SE = 'SECRET_ENV_9a2b' //機密標記, 置於env
    let argLong = SA + 'x'.repeat(200000) //win32超過命令列上限, posix超過單一參數上限, 皆為spawn同步拋錯
    let argNul = SA + '\u0000x'
    let fdSrc = fileURLToPath(new URL('../src/', import.meta.url))
    let fpEmfileRunner = path.resolve('./test/tools/spawnEmfileRunner.mjs')
    let fdTmp = path.resolve('./test/_tmp/execCli')
    let fpCmd = path.join(fdTmp, 'zzfallback.cmd')

    //catchErr, 回傳Promise之拒絕值, 未拒絕時回{ resolved }
    let catchErr = async (fn) => {
        try {
            let r = await fn()
            return { resolved: r }
        }
        catch (err) {
            return { rejected: err }
        }
    }

    before(function() {
        fs.mkdirSync(fdTmp, { recursive: true })
        fs.writeFileSync(fpCmd, '@echo off\r\necho fallback %*\r\n') //無%dp0%\node_modules入口之.cmd, buildSpawnArgs走cmd.exe退路
    })

    after(function() {
        fs.rmSync(fdTmp, { recursive: true, force: true })
    })

    it(`should resolve ok=false with pid undefined, without args and without retry when spawn throws synchronously`, async function() {
        let r1 = await catchErr(() => execCli(nodeBin, ['-e', '1', argNul], { maxRetries: 2, retryDelayMs: 1 }))
        let r2 = await catchErr(() => execCli(nodeBin, ['-e', '1', argLong], { maxRetries: 2, retryDelayMs: 1 }))
        //P04a: 不reject, 結果物件之code為null、pid為undefined(同ENOENT), error為「碼: 訊息」且不含args
        assert.strict.deepStrictEqual(['resolved' in r1, 'resolved' in r2], [true, true])
        r1 = r1.resolved
        r2 = r2.resolved
        assert.strict.deepStrictEqual([r1.ok, r1.code, 'pid' in r1, r1.pid], [false, null, true, undefined])
        assert.strict.deepStrictEqual(r1.error.startsWith('ERR_INVALID_ARG_VALUE: '), true)
        assert.strict.deepStrictEqual(r1.error.includes(`'args[2]'`), true)
        assert.strict.deepStrictEqual([r1.error.includes(SA), r1.error.includes('Received')], [false, false])
        assert.strict.deepStrictEqual([r2.ok, r2.code, r2.error.includes(SA)], [false, null, false])
        assert.strict.deepStrictEqual(r2.error.startsWith(process.platform === 'win32' ? 'ENAMETOOLONG: ' : ''), true)
        //P04b: 同步錯誤不重試
        assert.strict.deepStrictEqual([r1.attempts, r2.attempts], [1, 1])
    })

    it(`should not include env values in error when an env value contains a null byte`, async function() {
        let r = await catchErr(() => execCli(nodeBin, ['-e', '1'], { env: { WSEMI_TEST_KEY: SE + '\u0000x' } }))
        //P04c: 不reject, error保留變數名稱而不含其值
        assert.strict.deepStrictEqual('resolved' in r, true)
        assert.strict.deepStrictEqual(r.resolved.ok, false)
        assert.strict.deepStrictEqual(r.resolved.error.includes('WSEMI_TEST_KEY'), true)
        assert.strict.deepStrictEqual(r.resolved.error.includes(SE), false)
    })

    it(`should resolve ok=false with EMFILE without crashing when node cannot create stdio`, function() {
        let p = cp.spawnSync(nodeBin, [fpEmfileRunner, fdSrc, 'execCli'], { encoding: 'utf8', windowsHide: true, timeout: 60000 })
        let o = JSON.parse(p.stdout.trim().split(/\r?\n/).pop())
        //P05: 不reject、不拋出未捕捉例外
        assert.strict.deepStrictEqual(o.settle, 'resolve')
        assert.strict.deepStrictEqual([o.value.ok, o.value.error.startsWith('EMFILE: ')], [false, true])
        assert.strict.deepStrictEqual(o.hasSecret, false)
        assert.strict.deepStrictEqual(o.uncaught, [])
    })

    it(`should treat a number in args like a string when a .cmd falls back to cmd.exe on win32`, async function() {
        if (process.platform !== 'win32') {
            this.skip()
        }
        let r = await catchErr(() => execCli(fpCmd, ['a', 123]))
        let rs = await execCli(fpCmd, ['a', '123'])
        //P04d: 不reject; P09: 非字串元素比照node轉為字串, 結果與給字串相同
        assert.strict.deepStrictEqual('resolved' in r, true)
        assert.strict.deepStrictEqual([r.resolved.ok, r.resolved.stdout], [true, rs.stdout])
        assert.strict.deepStrictEqual(rs.stdout.includes('fallback'), true)
    })

    it(`should resolve ok=false instead of rejecting when building the .cmd fallback command throws on win32`, async function() {
        if (process.platform !== 'win32') {
            this.skip()
        }
        //無法轉為字串之元素使buildSpawnArgs於cmd.exe退路拋錯, 須與spawn同在try內
        let r = await catchErr(() => execCli(fpCmd, ['a', Object.create(null)], { maxRetries: 2, retryDelayMs: 1 }))
        //P04a、P04b
        assert.strict.deepStrictEqual('resolved' in r, true)
        assert.strict.deepStrictEqual([r.resolved.ok, r.resolved.code, r.resolved.pid, r.resolved.attempts], [false, null, undefined, 1])
        assert.strict.deepStrictEqual(r.resolved.error.startsWith('UNKNOWN: '), true)
    })

})
