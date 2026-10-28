import assert from 'assert'
import fs from 'fs'
import path from 'path'
import cp from 'child_process'
import { fileURLToPath } from 'url'
import execCli from '../src/execCli.mjs'
import { runExecFail } from './tools/execFailRun.mjs'
import { traceRec, useFakeClock } from './tools/timeKit.mjs'
import { fiveOnTrace, watchUnhandled, keysByType, allPrimitive, badProp, recMeta, scHolder, gpidOf, waitGone, killPid } from './tools/execCliTraceKit.mjs'


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
        //原案以子進程setInterval 5ms分20次寫出, 負載下父行程首次讀取晚於子進程全程而2000字元併成單一chunk則誤判; 改為事件閘門(R-TRACE-01 P1):
        //  子進程每寫一塊(100字元)便等標記檔gate-<已寫塊數>出現才寫下一塊, 父行程於onTrace收到第k個data事件後才建立gate-k, 故每塊必為獨立之chunk, 「達上限後停止累積」由因果決定, 與讀取時序無關
        let fdGate = fileURLToPath(new URL('./_tmp/execCli-maxBuffer/', import.meta.url))
        fs.rmSync(fdGate, { recursive: true, force: true })
        fs.mkdirSync(fdGate, { recursive: true })
        let sc = [
            'const fs=require("fs")',
            'const dir=process.argv[1]',
            'let i=0',
            'const wait=()=>{if(i>=20){return};const t=setInterval(()=>{if(fs.existsSync(dir+"/gate-"+i)){clearInterval(t);next()}},2)}',
            'const next=()=>{process.stdout.write("x".repeat(100));i++;wait()}',
            'next()',
        ].join(';')
        try {
            let tr = traceRec()
            let p = execCli(nodeBin, ['-e', sc, fdGate], { maxBuffer: 100, timeoutMs: 60000, onTrace: tr.on }) //timeoutMs只防閘門失效而懸置
            for (let k = 1; k <= 20; k++) {
                await tr.wait((e) => e.type === 'data', 0, k)
                fs.writeFileSync(fdGate + 'gate-' + k, '')
            }
            let r = await p
            // console.log('maxBuffer len', r.stdout.length)
            assert.strict.deepStrictEqual(r.ok, true)
            assert.strict.deepStrictEqual(r.stdout.length < 2000, true)
            //JSDoc opt.onTrace: data之size為處理後已累積之字元數、kept為該段是否被累積; 達上限(maxBuffer 100)之前一段已累積, 其後各段不累積且size不變
            let ev = tr.events.filter((e) => e.type === 'data')
            assert.strict.deepStrictEqual(ev.every((e) => e.stream === 'stdout'), true)
            assert.strict.deepStrictEqual(ev.reduce((a, e) => a + e.len, 0), 2000) //20塊各100字元皆已送達(閘門使每塊獨立)
            assert.strict.deepStrictEqual(ev.every((e, i) => e.kept === (i === 0 ? true : ev[i - 1].size < 100)), true)
            assert.strict.deepStrictEqual(ev[0].size, 100)
            assert.strict.deepStrictEqual(ev.slice(1).every((e) => e.kept === false && e.size === 100), true)
            //JSDoc opt.onTrace: full為該串流累積量首次達到maxBuffer, 只通知一次, 且在觸發它之data事件之後
            let full = tr.events.filter((e) => e.type === 'full')
            assert.strict.deepStrictEqual(full, [{ type: 'full', stream: 'stdout', size: 100 }])
            assert.strict.deepStrictEqual(tr.events.indexOf(full[0]), tr.events.indexOf(ev[0]) + 1)
            //最終結果: 只累積達上限之那一塊
            assert.strict.deepStrictEqual(r.stdout.length, 100)
        }
        finally {
            fs.rmSync(fdGate, { recursive: true, force: true })
        }
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


//R-EXEC-FAIL-01之6~14: 每案於獨立子行程執行(test/tools/execFailRunner.mjs), 夾具建於test/_tmp/execFail-<案名>/並於案例結束刪除
//  標注Windows專屬者(.cmd/.bat、cmd.exe、NoDefaultCurrentDirectoryInExePath、junction之語意)於其他平台跳過
describe(`execCli 失敗回報(R-EXEC-FAIL-01之6~14)`, function() {

    it(`execCli: 自訂validate拋錯視同驗證失敗, error恰為OUTPUT_VALIDATION_FAILED, stderr前綴'validate threw: ', 不成為未捕捉例外 [R-EXEC-FAIL-01之11]`, function() {
        let { r } = runExecFail('validateThrows')
        assert.strict.deepStrictEqual(r.out, { ok: false, error: 'OUTPUT_VALIDATION_FAILED', stderrHead: 'validate threw: v-boom', hasPidKey: true, pidType: 'number' })
        assert.strict.deepStrictEqual([r.unhandled, r.uncaught], [[], []])
    })

    it(`execCli: 自訂validate回傳Promise時以其結果判定(reject視同驗證失敗, 驗證耗時不受timeoutMs約束), 永不落定者依原生語意等待而本函數亦不落定 [R-EXEC-FAIL-01之11]`, function() {
        let { r } = runExecFail('validateAsync')
        assert.strict.deepStrictEqual(r.out, {
            asyncFalse: { ok: false, error: 'OUTPUT_VALIDATION_FAILED', threw: false },
            asyncTrue: { ok: true, error: '', threw: false },
            asyncReject: { ok: false, error: 'OUTPUT_VALIDATION_FAILED', threw: true },
            slowTrue: { ok: true, error: '', threw: false },
            neverSettles: { s: 'pending' },
        })
        assert.strict.deepStrictEqual([r.unhandled, r.uncaught], [[], []])
    })

    it(`execCli: 自訂validate拋出null、undefined、已撤銷之Proxy、超長訊息之Error時, error皆恰為OUTPUT_VALIDATION_FAILED, stderr首行為'validate threw: 訊息'(訊息不可得者為unknown error, 超長者截斷), 不成為未捕捉例外 [R-EXEC-FAIL-01之11]`, function() {
        let { r } = runExecFail('validateThrowValues')
        let { throwHuge, ...others } = r.out
        assert.strict.deepStrictEqual(others, {
            throwNull: { ok: false, error: 'OUTPUT_VALIDATION_FAILED', stderrHead: 'validate threw: null', stderrLen: 20 },
            throwUndefined: { ok: false, error: 'OUTPUT_VALIDATION_FAILED', stderrHead: 'validate threw: undefined', stderrLen: 25 },
            throwRevoked: { ok: false, error: 'OUTPUT_VALIDATION_FAILED', stderrHead: 'validate threw: unknown error', stderrLen: 29 },
        })
        //超長訊息: 前綴後接訊息之截斷片段, 總長不超過600
        assert.strict.deepStrictEqual([throwHuge.ok, throwHuge.error, throwHuge.stderrHead.startsWith('validate threw: xxxx'), throwHuge.stderrLen <= 600], [false, 'OUTPUT_VALIDATION_FAILED', true, true])
        assert.strict.deepStrictEqual([r.unhandled, r.uncaught], [[], []])
    })

    it(`execCli: 不存在之.cmd/.bat(絕對路徑、只給檔名、含目錄之相對路徑)為ENOENT、code null、帶pid鍵且為undefined、不重試 [R-EXEC-FAIL-01之6、9]`, function() {
        if (process.platform !== 'win32') {
            this.skip()
        }
        let { r } = runExecFail('missingBatch')
        assert.strict.deepStrictEqual(r.out, {
            absCmd: { error: `ENOENT: spawn <fx>${path.sep}missing.cmd ENOENT`, code: null, attempts: 1, hasPidKey: true, pidType: 'undefined' },
            absBat: { error: `ENOENT: spawn <fx>${path.sep}missing.bat ENOENT`, code: null, attempts: 1, hasPidKey: true, pidType: 'undefined' },
            bareCmd: { error: 'ENOENT: spawn wsemi-not-exist-zz.cmd ENOENT', code: null, attempts: 1, hasPidKey: true, pidType: 'undefined' },
            bareBat: { error: 'ENOENT: spawn wsemi-not-exist-zz.bat ENOENT', code: null, attempts: 1, hasPidKey: true, pidType: 'undefined' },
            relCmd: { error: 'ENOENT: spawn .\\missing.cmd ENOENT', code: null, attempts: 1, hasPidKey: true, pidType: 'undefined' },
        })
    })

    it(`execCli: 存在之批次檔仍可執行(絕對路徑; 只給檔名而位於子進程cwd者; 只給檔名而位於PATH者; 相對於子進程cwd之路徑) [R-EXEC-FAIL-01之6, 對照]`, function() {
        if (process.platform !== 'win32') {
            this.skip()
        }
        let { r } = runExecFail('batchStillRuns')
        assert.strict.deepStrictEqual(r.out, {
            abs: { ok: true, out: 'hello-from-user-cmd' },
            bareInCwd: { ok: true, out: 'hello-from-user-cmd' },
            npmCmd: { ok: true, isVer: true },
            relInCwd: { ok: true, out: 'hello-from-user-cmd' },
        })
    })

    it(`execCli: 只給檔名之批次檔於子進程env有NoDefaultCurrentDirectoryInExePath時不搜cwd(同cmd.exe), 查無即ENOENT、不重試 [R-EXEC-FAIL-01之6]`, function() {
        if (process.platform !== 'win32') {
            this.skip()
        }
        let { r } = runExecFail('bareBatchNoDefaultCwd')
        assert.strict.deepStrictEqual(r.out, { ok: false, code: null, error: 'ENOENT: spawn user.cmd ENOENT', attempts: 1, hasPidKey: true, pidType: 'undefined' })
    })

    it(`execCli: npm shim以帶.cmd之檔名或不帶副檔名呼叫皆解析入口以node直接執行, 多行參數原樣送達 [R-EXEC-FAIL-01之6, 對稱]`, function() {
        if (process.platform !== 'win32') {
            this.skip()
        }
        let { r } = runExecFail('bareShimNodeDirect')
        assert.strict.deepStrictEqual(r.out, { withExt: { ok: true, argvSame: true }, noExt: { ok: true, argvSame: true } })
    })

    it(`execCli: 只給命令名而其所在PATH目錄含非ASCII字元時可解析執行(不經where.exe之系統字碼頁輸出) [R-EXEC-FAIL-01之6]`, function() {
        if (process.platform !== 'win32') {
            this.skip()
        }
        let { r } = runExecFail('nonAsciiPathCommand')
        assert.strict.deepStrictEqual(r.out, { ok: true, out: 'hello-from-user-cmd' })
    })

    it(`execCli、execCliSession: cwd不存在或非資料夾時error指明cwd, code null、帶pid鍵且為undefined、不重試 [R-EXEC-FAIL-01之7、9]`, function() {
        if (process.platform !== 'win32') {
            this.skip()
        }
        let { r } = runExecFail('cwdNotFolder')
        assert.strict.deepStrictEqual(r.out, {
            missing: { error: `ENOENT: cwd is not an existing folder: <fx>${path.sep}no-such-dir`, code: null, attempts: 1, hasPidKey: true, pidType: 'undefined' },
            isFile: { error: `ENOENT: cwd is not an existing folder: <fx>${path.sep}user.cmd`, code: null, attempts: 1, hasPidKey: true, pidType: 'undefined' },
            session: { error: `ENOENT: cwd is not an existing folder: <fx>${path.sep}no-such-dir`, pid: null },
            bareBatch: { error: `ENOENT: cwd is not an existing folder: <fx>${path.sep}no-such-dir`, code: null, attempts: 1, hasPidKey: true, pidType: 'undefined' },
            sessionBareBatch: { error: `ENOENT: cwd is not an existing folder: <fx>${path.sep}no-such-dir`, pid: null },
        })
    })

    it(`execCli、execCliSession: cwd給相對路徑時, 只給檔名之批次檔仍依子進程cwd(轉絕對路徑)解析並可執行 [R-EXEC-FAIL-01之6]`, function() {
        if (process.platform !== 'win32') {
            this.skip()
        }
        let { r } = runExecFail('relCwdBareBatch')
        assert.strict.deepStrictEqual(r.out, {
            relIsRelative: true,
            execCli: { ok: true, out: 'hello-rel' },
            session: { error: '', got: true },
        })
    })

    it(`execCli、execCliSession: 有效之junction作cwd(或本進程cwd為junction)時, 命令不存在之error仍指向命令而非cwd, 命令存在者可執行 [R-EXEC-FAIL-01之7]`, function() {
        if (process.platform !== 'win32') {
            this.skip()
        }
        let { r } = runExecFail('junctionCwd')
        assert.strict.deepStrictEqual(r.out, {
            cliMissing: 'ENOENT: spawn wsemi-not-exist-zz ENOENT',
            cliOk: true,
            sessionMissing: 'ENOENT: spawn wsemi-not-exist-zz ENOENT',
            cliMissingBatch: 'ENOENT: spawn wsemi-not-exist-zz.cmd ENOENT',
            cliBatchInside: { ok: true, out: 'hello-in-junction' },
            procCwdJunction: 'ENOENT: spawn wsemi-not-exist-zz ENOENT',
        })
    })

    it(`execCli、execCliSession: env之getter拋錯以結果物件回報(execCli不reject、execCliSession不throw, 不含env之值、不重試) [R-EXEC-FAIL-01之8]`, function() {
        let { r } = runExecFail('envGetterThrows')
        assert.strict.deepStrictEqual(r.out, {
            s: 'resolve',
            ok: false,
            code: null,
            error: 'UNKNOWN: env getter boom',
            attempts: 1,
            hasPidKey: true,
            pidType: 'undefined',
            session: { error: 'UNKNOWN: env getter boom', pid: null, exited: true },
        })
        assert.strict.deepStrictEqual([r.unhandled, r.uncaught], [[], []])
    })

    it(`execCli: pid契約——未能啟動者帶pid鍵且為undefined、已啟動者為數值、command無效者不帶pid鍵 [R-EXEC-FAIL-01之9]`, function() {
        let { r } = runExecFail('pidContract')
        assert.strict.deepStrictEqual(r.out, {
            syncNul: { code: null, hasPidKey: true, pidType: 'undefined' },
            asyncEnoent: { code: null, hasPidKey: true, pidType: 'undefined' },
            nonPe: { code: null, hasPidKey: true, pidType: 'undefined' },
            startedExit1: { code: 1, hasPidKey: true, pidType: 'number' },
            emptyCommand: { code: null, attempts: 0, hasPidKey: false, pidType: 'undefined' },
        })
    })

    it(`execCli: onStdout、onStderr拋錯(不攔截, 仍為未捕捉例外)時該段輸出仍累積於結果之stdout、stderr [R-EXEC-FAIL-01之12]`, function() {
        let { r } = runExecFail('onStdoutThrowsKeepsOutput')
        assert.strict.deepStrictEqual(r.out, { ok: true, stdout: 'x', stderr: 'y', uncaught: ['onStderr boom', 'onStdout boom'] })
    })

    it(`execCli: onStdout拋錯時, 無處理器之行程仍以離開碼1結束並印出錯誤(錯誤原樣重拋、不被吞掉) (守門) [R-EXEC-FAIL-01之12]`, function() {
        let { status, signal, stderr } = runExecFail('rethrowExecCliOnStdout', { exitMode: 'nohandler', allowNoResult: true })
        assert.strict.deepStrictEqual([status, stderr.includes('cb boom')], [1, true], `status=${status}, signal=${signal}, stderr=${stderr.slice(0, 300)}`)
    })

    it(`execCli、execCliSession、execCliJsonRpc: npm shim(cmd-shim之執行行)已辨識而入口檔不存在者不交cmd.exe, 為ENOENT且訊息指入口路徑、code null、帶pid鍵且為undefined、不重試(各呼叫形式與入口種類); 自訂批次檔於判斷句內引用同樣式者仍經cmd.exe [R-EXEC-FAIL-01之6a]`, function() {
        if (process.platform !== 'win32') {
            this.skip()
        }
        let { r } = runExecFail('shimEntryMissing')
        let sep = path.sep
        let e = `<fx>${sep}shim${sep}node_modules${sep}zzbrk${sep}entry.mjs`
        //規則6a: 拋與node同形之ENOENT, 訊息指入口路徑('spawn <入口檔路徑> ENOENT'); 規則4、9: execCli以未能啟動之結果物件回報(code null、帶pid鍵且為undefined、attempts 1不重試)
        let x = (p) => ({ ok: false, error: `ENOENT: spawn ${p} ENOENT`, code: null, attempts: 1, hasPidKey: true, pidType: 'undefined' })
        assert.strict.deepStrictEqual(r.out, {
            entry: e,
            abs: x(e), //規則6a: 絕對路徑之shim
            bareExt: x(e), //規則6a: 只給檔名之.cmd(子進程env之PATH)
            noExt: x(e), //規則6a: 未帶副檔名(where之語意補PATHEXT)
            rel: x(e), //規則6a: 含目錄之相對路徑(以子進程cwd為基準)
            exeEntry: x(`<fx>${sep}shim${sep}node_modules${sep}zzbrkexe${sep}bin${sep}zzbrkexe.exe`), //規則6a: 無shebang形狀(原生.exe入口)
            nonAscii: x(`<fx>${sep}中文 dir${sep}node_modules${sep}zzbrk2${sep}cli.js`), //規則6a: 含空白與非ASCII之路徑
            session: { error: `ENOENT: spawn ${e} ENOENT`, pid: null }, //規則9: execCliSession之未啟動pid為null
            rpc: { errorType: 'notfound', error: `initialize: ENOENT: spawn ${e} ENOENT` }, //規則10: 未啟動一律notfound
            userPattern: { ok: true, out: 'fallback-ok' }, //規則6a: 入口樣式位於判斷句(IF EXIST)等非執行行者仍交cmd.exe(自訂批次檔走自己之退路, 可正常執行)
        })
        assert.strict.deepStrictEqual([r.unhandled, r.uncaught], [[], []]) //規則6a: 由呼叫端之同步catch回報, 不成為未處理之rejection或未捕捉例外
    })

    it(`execCli、execCliSession: opt之getter拋錯、opt本身或其選項值、command為已撤銷之Proxy時以結果物件回報(execCli不reject、execCliSession不throw), 回調不可讀者於入口即判定、不於監聽器內拋錯且stop()必落定 [R-EXEC-FAIL-01之13]`, function() {
        let { r } = runExecFail('inputUnreadable')
        //規則13: execCli以規則4之結果物件回報(error '<碼>: <訊息>', 無碼者為UNKNOWN; attempts 1、pid鍵undefined)
        let cli = (m) => ({ ok: false, code: null, error: `UNKNOWN: ${m}`, attempts: 1, hasPidKey: true, pidType: 'undefined' })
        //規則13: execCliSession不spawn, 以onExit與stop()之結果回報(pid null, error同形)
        let ses = (m) => ({ code: null, error: `UNKNOWN: ${m}`, pid: null, exited: true })
        assert.strict.deepStrictEqual(r.out, {
            cliGetter: cli('getter boom cwd'),
            cliOptRevoked: cli('<revoked>'),
            cliEnvRevoked: cli('<revoked>'), //規則13: attempts 1(maxRetries 2亦不重試)
            cliOnStdoutRevoked: cli('<revoked>'),
            cliCommandRevoked: cli('<revoked>'),
            sesGetter: ses('getter boom onExit'),
            sesOptRevoked: ses('<revoked>'),
            sesEnvRevoked: ses('<revoked>'),
            sesOnLineRevoked: ses('<revoked>'),
            sesOnExitRevoked: ses('<revoked>'),
            uncaught: [], //規則13: 呼叫端之回調於入口判型一次, 監聽器與計時器內不再觸及呼叫端之值
        })
        assert.strict.deepStrictEqual([r.unhandled, r.uncaught], [[], []]) //規則13: 讀取與判型一律在try內, 不reject、不成為未捕捉例外
    })

    it(`execCli: onStdout、onStderr、validate為以函數為目標之Proxy且於入口判型後才撤銷時, 監聽器與重試內不再判型呼叫端之值(結果照常落定、輸出照常累積、不reject), 未捕捉例外僅有呼叫已撤銷回調本身者 [R-EXEC-FAIL-01之12、13]`, function() {
        let { r } = runExecFail('cliCbRevokedLater')
        assert.strict.deepStrictEqual(r.out, {
            //規則13: 回調於入口判型一次, 監聽器內不再觸及呼叫端之值(該段輸出仍累積); 規則12: 呼叫已撤銷之回調所拋之TypeError經_callUser原樣重拋(revoked:apply), 不得有判型所生者(revoked:has)
            onStdoutData: { ok: true, code: 0, stdout: 'x', stderr: 'y', attempts: 1, uncaught: ['revoked:apply'] },
            onStderrData: { ok: true, code: 0, stdout: 'x', stderr: 'y', attempts: 1, uncaught: ['revoked:apply'] }, //規則12、13: 同上(stderr)
            //規則13: 重試(計時器後之續行)內不再判型validate, 以結果物件回報而不reject(規則4之「本函數不throw亦不reject」); 離開碼非0故validate不被呼叫
            validateRetry: { ok: false, code: 1, stdout: '', stderr: '', attempts: 2, uncaught: [] },
        })
        assert.strict.deepStrictEqual(r.unhandled, []) //規則13: 不reject、不產生未處理之rejection
    })

    it(`execCli: 選項getter拋出非Error之值(null、undefined、字串)時以結果物件回報, error保留拋出值之文字 [R-EXEC-FAIL-01之13]`, function() {
        let { r } = runExecFail('cliThrownValues')
        //規則13: execCli以規則4之結果物件回報(error '<碼>: <訊息>', 無碼者為UNKNOWN; attempts 1、pid鍵undefined); 訊息取getErrorMessage, 為空退_errToStr(拋出值之文字不遺失)
        let x = (m) => ({ ok: false, code: null, error: `UNKNOWN: ${m}`, attempts: 1, hasPidKey: true, pidType: 'undefined' })
        assert.strict.deepStrictEqual(r.out, {
            null: x('null'), //規則13: 拋出null
            undefined: x('undefined'), //規則13: 拋出undefined
            string: x('thrown-x'), //規則13: 拋出字串
        })
        assert.strict.deepStrictEqual([r.unhandled, r.uncaught], [[], []]) //規則13: 不reject、不成為未捕捉例外
    })

    it(`execCli: opt.input為包裝字串(new String)時子進程收到其內容且結果ok(不reject、子進程不殘留), 偽String標籤物件轉字串拋錯時以結果物件回報 [R-EXEC-FAIL-01之13]`, function() {
        let { r } = runExecFail('cliInputWrapper')
        assert.strict.deepStrictEqual(r.out, {
            stringWrapper: { ok: true, stdout: 'got:abc', error: '', childAliveAfter: false }, //規則13: 輸入之讀取與判型(含轉為原始字串)一律在try內, spawn後不得於try外拋錯而reject並使子進程殘留
            fakeStringThrows: { ok: false, code: null, error: 'UNKNOWN: toString boom', attempts: 1, hasPidKey: true, pidType: 'undefined' }, //規則13: 讀取或轉換拋錯以規則4之結果物件回報(attempts 1、pid鍵undefined、不重試)
        })
        assert.strict.deepStrictEqual([r.unhandled, r.uncaught], [[], []]) //規則13: 不reject、不成為未捕捉例外
    })

})


//R-TRACE-01: opt.onTrace之事件語意與P3/P4; 事件以traceRec等待(不以固定等待後檢查), 重試間隔與逾時門檻本身即規格者於假時鐘下推進(P5), 子進程與樹殺為真實I/O
describe(`execCli 觀察回調(R-TRACE-01)`, function() {

    let nodeBin = process.execPath

    //假時鐘下推進後事件已同步送達; 子進程為真實I/O, 以事件(spawn、data、settle等)為同步點

    it(`should notify attempt, spawn, data, settle and done in order for a successful call`, async function() {
        let tr = traceRec()
        let sc = 'process.stdout.write("hello");process.stderr.write("warn")'
        let r = await execCli(nodeBin, ['-e', sc], { onTrace: tr.on })
        let ev = tr.events
        //JSDoc opt.onTrace: attempt為即將啟動第n次嘗試; spawn之pid為子進程pid; 結果物件之pid同
        assert.strict.deepStrictEqual(ev[0], { type: 'attempt', n: 1 })
        assert.strict.deepStrictEqual(ev[1], { type: 'spawn', pid: r.pid })
        //JSDoc opt.onTrace: data為收到一段已解碼之輸出(len為字元數、size為處理後已累積之字元數、kept為是否累積); 內文不在事件中, 只有長度
        let sum = (stream) => ev.filter((e) => e.type === 'data' && e.stream === stream).reduce((a, e) => a + e.len, 0)
        assert.strict.deepStrictEqual([sum('stdout'), sum('stderr')], [5, 4])
        assert.strict.deepStrictEqual(ev.filter((e) => e.type === 'data').every((e) => e.kept === true && e.size >= e.len), true)
        //JSDoc opt.onTrace: settle為本次嘗試即將定案(reason ok、code為離開碼、signal為null); done為整個呼叫即將回傳(n為實際嘗試次數); 所有data皆早於settle, 其後即done
        assert.strict.deepStrictEqual(ev.slice(-2), [{ type: 'settle', reason: 'ok', code: 0, signal: null }, { type: 'done', n: 1, ok: true, reason: 'ok' }])
        assert.strict.deepStrictEqual(ev.slice(2, -2).every((e) => e.type === 'data'), true)
        assert.strict.deepStrictEqual([r.ok, r.stdout, r.stderr, r.attempts], [true, 'hello', 'warn', 1])
    })

    it(`should notify retry with the exact interval (retryDelayMs times the attempt number, capped at 15000ms) and start the next attempt only when it has elapsed`, async function() {
        //重試間隔本身即規格(JSDoc opt.retryDelayMs: 實際間隔為retryDelayMs乘以重試次數且上限15000ms): 假時鐘下以advance量測, 子進程之結束為真實I/O, 以事件為同步點
        let clock = useFakeClock()
        try {
            let tr = traceRec()
            let p = execCli(nodeBin, ['-e', 'process.exit(3)'], { maxRetries: 2, retryDelayMs: 8000, onTrace: tr.on })
            let waits = [8000, 15000] //8000x1; 8000x2=16000, 夾至15000
            for (let k = 0; k < 2; k++) {
                let e = await tr.wait((x) => x.type === 'retry', 0, k + 1)
                assert.strict.deepStrictEqual(e, { type: 'retry', n: k + 2, ms: waits[k] })
                let at = tr.mark()
                await clock.advance(waits[k] - 1)
                assert.strict.deepStrictEqual(tr.types(at), []) //間隔未滿: 不得啟動下一次嘗試
                await clock.advance(1)
                assert.strict.deepStrictEqual(tr.events[at], { type: 'attempt', n: k + 2 }) //間隔恰滿: 啟動第k+2次嘗試
            }
            let r = await p
            assert.strict.deepStrictEqual(tr.types(), ['attempt', 'spawn', 'settle', 'retry', 'attempt', 'spawn', 'settle', 'retry', 'attempt', 'spawn', 'settle', 'done'])
            assert.strict.deepStrictEqual(tr.events.filter((e) => e.type === 'settle').map((e) => [e.reason, e.code]), [['exit', 3], ['exit', 3], ['exit', 3]])
            assert.strict.deepStrictEqual(tr.events.at(-1), { type: 'done', n: 3, ok: false, reason: 'exhausted' })
            assert.strict.deepStrictEqual([r.ok, r.code, r.attempts], [false, 3, 3])
        }
        finally {
            clock.restore()
        }
    })

    it(`should notify the reason in done: spawn (synchronous spawn error), enoent, code2 and exhausted (also for maxRetries 0, validation failure), without any retry for the non-retryable ones`, async function() {
        //JSDoc opt.maxRetries: ENOENT、exit code 2、無法啟動子進程之同步錯誤視為不可重試而立即中止; JSDoc opt.onTrace: done之reason
        let cases = [
            { name: 'enoent', cmd: 'non_existent_command_xyz_12345', args: ['arg'], opt: {}, settle: ['error', null], done: { n: 1, ok: false, reason: 'enoent' } },
            { name: 'code2', cmd: nodeBin, args: ['-e', 'process.exit(2)'], opt: {}, settle: ['exit', 2], done: { n: 1, ok: false, reason: 'code2' } },
            { name: 'spawn', cmd: nodeBin, args: ['-e', '1', 'a\u0000x'], opt: {}, settle: ['error', null], done: { n: 1, ok: false, reason: 'spawn' } },
            { name: 'exhausted0', cmd: nodeBin, args: ['-e', 'process.exit(3)'], opt: { maxRetries: 0 }, settle: ['exit', 3], done: { n: 1, ok: false, reason: 'exhausted' } },
            { name: 'validate', cmd: nodeBin, args: ['-e', 'process.stdout.write("   ")'], opt: { validate: 'nonempty', maxRetries: 0 }, settle: ['validate', 0], done: { n: 1, ok: false, reason: 'exhausted' } },
        ]
        for (let c of cases) {
            let tr = traceRec()
            let r = await execCli(c.cmd, c.args, { maxRetries: 3, retryDelayMs: 1, ...c.opt, onTrace: tr.on })
            let ev = tr.events
            assert.strict.deepStrictEqual({ name: c.name, retries: ev.filter((e) => e.type === 'retry').length, attempts: ev.filter((e) => e.type === 'attempt').length }, { name: c.name, retries: 0, attempts: 1 })
            let st = ev.find((e) => e.type === 'settle')
            assert.strict.deepStrictEqual({ name: c.name, settle: [st.reason, st.code] }, { name: c.name, settle: c.settle })
            assert.strict.deepStrictEqual({ name: c.name, done: ev.at(-1) }, { name: c.name, done: { type: 'done', ...c.done } })
            assert.strict.deepStrictEqual({ name: c.name, attempts: r.attempts }, { name: c.name, attempts: 1 })
        }
    })

    it(`should notify timeout at exactly timeoutMs, then kill, then settle with reason timeout (and no stuck settle) when the child outlives timeoutMs`, async function() {
        //逾時門檻本身即規格(JSDoc opt.timeoutMs): 假時鐘下以advance量測; 子進程之存活與樹殺為真實I/O
        let clock = useFakeClock()
        try {
            let tr = traceRec()
            let p = execCli(nodeBin, ['-e', 'setTimeout(() => {}, 30000)'], { timeoutMs: 5000, onTrace: tr.on })
            let sp = await tr.wait((e) => e.type === 'spawn')
            let at = tr.mark()
            await clock.advance(4999)
            assert.strict.deepStrictEqual(tr.types(at), []) //未達門檻: 無timeout亦無kill
            await clock.advance(1)
            assert.strict.deepStrictEqual(tr.events.slice(at, at + 2), [{ type: 'timeout', ms: 5000 }, { type: 'kill', pid: sp.pid }]) //恰達門檻: 先通知逾時, 再通知樹殺
            let st = await tr.wait((e) => e.type === 'settle')
            let r = await p
            //JSDoc opt.onTrace: settle之reason為timeout代表逾時樹殺後close; done於其後
            assert.strict.deepStrictEqual([st.reason, st.code], ['timeout', r.code])
            assert.strict.deepStrictEqual(tr.events.at(-1), { type: 'done', n: 1, ok: false, reason: 'exhausted' })
            assert.strict.deepStrictEqual([r.ok, r.error], [false, 'TIMEOUT after 5s'])
        }
        finally {
            clock.restore()
        }
    })

    it(`should settle with reason stuck 3000ms after the kill when the pipe is held by an orphan and close never comes`, async function() {
        //樹殺後close遲遲不來(子進程已結束而孫行程握住stdout/stderr管線): 3秒後強制定案(JSDoc opt.onTrace: settle之reason為stuck); 3秒本身即規格, 假時鐘下量測
        let clock = useFakeClock()
        let gpid = null
        try {
            let tr = traceRec()
            let p = execCli(nodeBin, ['-e', scHolder], {
                timeoutMs: 5000,
                onStdout: (chunk) => {
                    gpid = gpidOf(chunk) || gpid
                },
                onTrace: tr.on,
            })
            let sp = await tr.wait((e) => e.type === 'spawn')
            await tr.wait((e) => e.type === 'data') //孫行程pid已輸出
            assert.strict.deepStrictEqual(gpid > 0, true)
            assert.strict.deepStrictEqual(await waitGone(sp.pid), true) //子進程已結束(此後kill不會殺到孫行程)
            let at = tr.mark()
            await clock.advance(4999)
            assert.strict.deepStrictEqual(tr.types(at), [])
            await clock.advance(1)
            assert.strict.deepStrictEqual(tr.types(at), ['timeout', 'kill'])
            await clock.advance(2999)
            assert.strict.deepStrictEqual(tr.types(at), ['timeout', 'kill']) //樹殺後未滿3000ms: 尚未定案
            await clock.advance(1)
            let r = await p
            assert.strict.deepStrictEqual(tr.events.slice(at + 2), [{ type: 'settle', reason: 'stuck', code: null, signal: null }, { type: 'done', n: 1, ok: false, reason: 'exhausted' }]) //恰滿3000ms: 強制定案, 其後即done
            assert.strict.deepStrictEqual([r.ok, r.code, r.error], [false, null, 'TIMEOUT after 5s(子進程未能結束)'])
            //定案後釋放: 孫行程結束使close遲到, 不再通知
            clock.restore()
            let n = tr.events.length
            assert.strict.deepStrictEqual(await killPid(gpid), true)
            await new Promise((resolve) => setImmediate(resolve))
            await new Promise((resolve) => setImmediate(resolve))
            assert.strict.deepStrictEqual(tr.events.length, n)
        }
        finally {
            clock.restore()
            await killPid(gpid)
        }
    })

    it(`should notify full once for stderr when the accumulation first reaches maxBuffer, with data events of stream stderr only`, async function() {
        //JSDoc opt.onTrace: full為該串流累積量首次達到maxBuffer(含stream、size); stderr與stdout各自累積
        let tr = traceRec()
        let r = await execCli(nodeBin, ['-e', 'process.stderr.write("e".repeat(250))'], { maxBuffer: 100, onTrace: tr.on })
        let ev = tr.events.filter((e) => e.type === 'data')
        assert.strict.deepStrictEqual(ev.length > 0 && ev.every((e) => e.stream === 'stderr'), true)
        let full = tr.events.filter((e) => e.type === 'full')
        let cross = ev.find((e) => e.kept && e.size >= 100)
        assert.strict.deepStrictEqual(full, [{ type: 'full', stream: 'stderr', size: cross.size }])
        assert.strict.deepStrictEqual([r.ok, r.stderr.length, r.stdout], [true, ev.at(-1).size, ''])
    })

    it(`should return the result object without events when command is not an effective string, or an option of opt is unreadable (including the onTrace getter)`, async function() {
        //JSDoc opt.onTrace: command無效或opt不可讀而在啟動前即回報者無事件; 既有行為: 不reject, 以結果物件回報
        let tr = traceRec()
        let r1 = await execCli('', [], { onTrace: tr.on })
        let optGetter = badProp({ onTrace: tr.on }, 'cwd', 'cwd getter boom')
        let r2 = await execCli(nodeBin, ['-e', '1'], optGetter)
        let optTraceGetter = badProp({}, 'onTrace', 'trace getter boom')
        let r3 = await execCli(nodeBin, ['-e', '1'], optTraceGetter)
        assert.strict.deepStrictEqual([r1.ok, r1.error, r1.attempts], [false, 'command 須為非空字串', 0])
        assert.strict.deepStrictEqual([r2.ok, r2.error, r2.attempts], [false, 'UNKNOWN: cwd getter boom', 1])
        assert.strict.deepStrictEqual([r3.ok, r3.error, r3.attempts], [false, 'UNKNOWN: trace getter boom', 1]) //onTrace屬性本身不可讀亦以結果物件回報, 不reject
        assert.strict.deepStrictEqual(tr.events, [])
    })

    it(`should give the same results without onTrace, with a recording onTrace, and with a throwing, rejecting or invalid onTrace`, async function() {
        //R-TRACE-01 P3: 未傳觀察回調時行為不變; P4: 回調之拋錯與回傳之rejection不影響結果、不產生未處理之rejection; 情境涵蓋成功、重試後失敗、ENOENT、同步spawn錯誤、驗證失敗、逾時、達maxBuffer
        let un = watchUnhandled()
        let rec = traceRec()
        let norm = (r) => ({ ok: r.ok, stdout: r.stdout, stderr: r.stderr, code: r.error.startsWith('TIMEOUT') ? 'TIMEOUT' : r.code, error: r.error, attempts: r.attempts })
        let got = []
        try {
            for (let onTrace of fiveOnTrace(rec.on)) {
                let rs = []
                rs.push(await execCli(nodeBin, ['-e', 'process.stdout.write("hello");process.stderr.write("warn")'], { onTrace }))
                rs.push(await execCli(nodeBin, ['-e', 'process.exit(3)'], { maxRetries: 1, retryDelayMs: 1, onTrace }))
                rs.push(await execCli('non_existent_command_xyz_12345', ['arg'], { maxRetries: 2, retryDelayMs: 1, onTrace }))
                rs.push(await execCli(nodeBin, ['-e', '1', 'a\u0000x'], { maxRetries: 2, retryDelayMs: 1, onTrace }))
                rs.push(await execCli(nodeBin, ['-e', 'process.stdout.write("   ")'], { validate: 'nonempty', onTrace }))
                rs.push(await execCli(nodeBin, ['-e', 'setTimeout(() => {}, 30000)'], { timeoutMs: 300, onTrace }))
                rs.push(await execCli(nodeBin, ['-e', 'process.stdout.write("x".repeat(250))'], { maxBuffer: 100, onTrace }))
                got.push(rs.map(norm))
            }
            await new Promise((resolve) => setImmediate(resolve))
            await new Promise((resolve) => setImmediate(resolve))
        }
        finally {
            un.stop()
        }
        assert.strict.deepStrictEqual(got.slice(1), [got[0], got[0], got[0], got[0]])
        assert.strict.deepStrictEqual(got[0].map((x) => [x.ok, x.attempts]), [[true, 1], [false, 2], [false, 1], [false, 1], [false, 1], [false, 1], [true, 1]])
        assert.strict.deepStrictEqual(un.list, [])
        //紀錄器確有收到各情境之事件
        let types = new Set(rec.events.map((e) => e.type))
        assert.strict.deepStrictEqual(['attempt', 'retry', 'spawn', 'data', 'full', 'timeout', 'kill', 'settle', 'done'].every((t) => types.has(t)), true)
    })

    it(`should notify frozen events with primitive fields fixed per type and without a receiver`, async function() {
        //JSDoc opt.onTrace: 事件為凍結物件{ type, ... }, 欄位依type列舉且皆為原始值(R-TRACE-01 P4: 唯讀快照、最少欄位); 回調不帶接收者呼叫
        let rec = recMeta()
        await execCli(nodeBin, ['-e', 'process.stdout.write("hello")'], { onTrace: rec.on })
        await execCli(nodeBin, ['-e', 'process.exit(3)'], { maxRetries: 1, retryDelayMs: 1, onTrace: rec.on })
        await execCli(nodeBin, ['-e', 'process.stdout.write("x".repeat(250))'], { maxBuffer: 100, onTrace: rec.on })
        await execCli(nodeBin, ['-e', 'setTimeout(() => {}, 30000)'], { timeoutMs: 300, onTrace: rec.on })
        assert.strict.deepStrictEqual(keysByType(rec.events), {
            attempt: 'n,type',
            spawn: 'pid,type',
            data: 'kept,len,size,stream,type',
            full: 'size,stream,type',
            retry: 'ms,n,type',
            timeout: 'ms,type',
            kill: 'pid,type',
            settle: 'code,reason,signal,type',
            done: 'n,ok,reason,type',
        })
        assert.strict.deepStrictEqual(allPrimitive(rec.events), true)
        assert.strict.deepStrictEqual(rec.meta.length > 0 && rec.meta.length === rec.events.length && rec.meta.every(([self, frozen]) => self === undefined && frozen), true)
    })

})
