import assert from 'assert'
import fs from 'fs'
import path from 'path'
import cp from 'child_process'
import { fileURLToPath } from 'url'
import execCliSession from '../src/execCliSession.mjs'
import { runExecFail } from './tools/execFailRun.mjs'
import { traceRec, useFakeClock } from './tools/timeKit.mjs'
import { fiveOnTrace, watchUnhandled, keysByType, allPrimitive, badProp, recMeta, scHolder, gpidOf, waitGone, killPid } from './tools/execCliTraceKit.mjs'


describe(`execCliSession`, function() {

    //以當前執行mocha的node當測試對象, 跨Windows/Linux/macOS可用
    let nodeBin = process.execPath

    //逐行回顯程式, 收到EOF即結束
    let scEcho = `
        let rl = require('readline').createInterface({ input: process.stdin })
        rl.on('line', (l) => process.stdout.write('echo:' + l + '\\n'))
        rl.on('close', () => process.exit(0))
    `

    //不理會EOF之程式
    let scHang = `setInterval(() => {}, 1000)`

    let delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

    it(`should echo lines and exit with code 0 after stop() closes stdin (EOF)`, async function() {
        let lines = []
        let s = execCliSession(nodeBin, ['-e', scEcho], {
            onLine: (line) => {
                lines.push(line)
            },
        })
        assert.strict.deepStrictEqual(typeof s.pid, 'number')
        assert.strict.deepStrictEqual(s.exited, false)
        let w1 = await s.writeLine('abc')
        let w2 = await s.writeLine('中文')
        let r = await s.stop()
        // console.log('echo r', JSON.stringify(r), lines)
        assert.strict.deepStrictEqual(w1, true)
        assert.strict.deepStrictEqual(w2, true)
        assert.strict.deepStrictEqual(lines, ['echo:abc', 'echo:中文'])
        assert.strict.deepStrictEqual(r.code, 0)
        assert.strict.deepStrictEqual(r.exited, true)
        assert.strict.deepStrictEqual(r.killed, false)
        assert.strict.deepStrictEqual(r.timeout, false)
        assert.strict.deepStrictEqual(r.error, '')
        assert.strict.deepStrictEqual(r.pid, s.pid)
        assert.strict.deepStrictEqual(s.exited, true)
    })

    it(`should tree-kill after exitGraceMs when child ignores EOF, and not report own kill as error`, async function() {
        let t0 = Date.now()
        let s = execCliSession(nodeBin, ['-e', scHang], { exitGraceMs: 300 })
        let r = await s.stop()
        // console.log('hang r', JSON.stringify(r), Date.now() - t0)
        assert.strict.deepStrictEqual(r.exited, true)
        assert.strict.deepStrictEqual(r.killed, true)
        assert.strict.deepStrictEqual(r.timeout, false)
        assert.strict.deepStrictEqual(r.error, '')
        assert.strict.deepStrictEqual(Date.now() - t0 >= 300, true)
    })

    it(`should tree-kill on timeoutMs and pass the same result to onExit and stop()`, async function() {
        let exitR = null
        let s = execCliSession(nodeBin, ['-e', scHang], {
            timeoutMs: 400,
            onExit: (r) => {
                exitR = r
            },
        })
        let r = await s.stop()
        // console.log('timeout r', JSON.stringify(r))
        assert.strict.deepStrictEqual(r.timeout, true)
        assert.strict.deepStrictEqual(r.killed, true)
        assert.strict.deepStrictEqual(r.exited, true)
        assert.strict.deepStrictEqual(r.error.startsWith('TIMEOUT after 0.4s'), true)
        assert.strict.deepStrictEqual(exitR, r)
    })

    it(`should report ENOENT via onExit/stop() without rejecting, pid null, write resolves false`, async function() {
        let exitR = null
        let s = execCliSession('non_existent_command_xyz_12345', ['arg'], {
            onExit: (r) => {
                exitR = r
            },
        })
        let w = await s.writeLine('x')
        let r = await s.stop()
        // console.log('enoent r', JSON.stringify(r))
        assert.strict.deepStrictEqual(w, false)
        assert.strict.deepStrictEqual(r.pid, null)
        assert.strict.deepStrictEqual(r.exited, true)
        assert.strict.deepStrictEqual(r.error.includes('ENOENT'), true)
        assert.strict.deepStrictEqual(exitR, r)
    })

    it(`should settle with error when command is not an effective string, without spawning`, async function() {
        let s = execCliSession('')
        let w = await s.write('x')
        let r = await s.stop()
        assert.strict.deepStrictEqual(w, false)
        assert.strict.deepStrictEqual(r.error, 'command 須為非空字串')
        assert.strict.deepStrictEqual(r.pid, null)
        assert.strict.deepStrictEqual(s.exited, true)
    })

    it(`should decode multi-byte utf8 across chunks and flush the trailing partial line on exit`, async function() {
        //輸出約200KB中文必然跨多個chunk, 且末段不帶換行, 須於結束時flush為一行
        let sc = `process.stdout.write('中文測試字串'.repeat(20000) + '\\n' + 'tail-no-newline')`
        let lines = []
        let raw = ''
        let s = execCliSession(nodeBin, ['-e', sc], {
            onLine: (line) => {
                lines.push(line)
            },
            onStdout: (chunk) => {
                raw += chunk
            },
        })
        let r = await s.stop()
        assert.strict.deepStrictEqual(r.code, 0)
        assert.strict.deepStrictEqual(lines.length, 2)
        assert.strict.deepStrictEqual(lines[0], '中文測試字串'.repeat(20000))
        assert.strict.deepStrictEqual(lines[1], 'tail-no-newline')
        assert.strict.deepStrictEqual(raw.includes('�'), false)
        assert.strict.deepStrictEqual(raw, '中文測試字串'.repeat(20000) + '\n' + 'tail-no-newline')
    })

    it(`should strip \\r from \\r\\n line endings`, async function() {
        let sc = `process.stdout.write('a\\r\\nb\\r\\n')`
        let lines = []
        let s = execCliSession(nodeBin, ['-e', sc], {
            onLine: (line) => {
                lines.push(line)
            },
        })
        await s.stop()
        assert.strict.deepStrictEqual(lines, ['a', 'b'])
    })

    it(`should keep only the tail of stderr per stderrKeep while onStderr receives everything`, async function() {
        let sc = `process.stderr.write('x'.repeat(9900) + 'END-OF-ERR')`
        let full = ''
        let s = execCliSession(nodeBin, ['-e', sc], {
            stderrKeep: 100,
            onStderr: (chunk) => {
                full += chunk
            },
        })
        let r = await s.stop()
        assert.strict.deepStrictEqual(full.length, 9910)
        assert.strict.deepStrictEqual(r.stderr.length, 100)
        assert.strict.deepStrictEqual(r.stderr.endsWith('END-OF-ERR'), true)
    })

    it(`should accept stderrKeep given as numeric string or Number wrapper ('0', new Number(0), '3') [數值輸入通則]`, async function() {
        let sc = `process.stderr.write('abcdef')`
        let f = async (stderrKeep) => {
            let s = execCliSession(nodeBin, ['-e', sc], { stderrKeep })
            let r = await s.stop()
            return r.stderr
        }
        let rs = [await f('0'), await f(new Number(0)), await f('3'), await f(new Number(3))] // eslint-disable-line no-new-wrappers
        assert.strict.deepStrictEqual(rs, ['', '', 'def', 'def']) //使用者通則: 數值輸入一律支援字串型數字(stderrKeep 0為不保留, 3為保留尾端3字元)
    })

    it(`should resolve write() false after exit and return the same promise from repeated stop()`, async function() {
        let s = execCliSession(nodeBin, ['-e', 'process.stdout.write("x")'])
        let p1 = s.stop()
        let p2 = s.stop()
        assert.strict.deepStrictEqual(p1, p2)
        let r = await p1
        assert.strict.deepStrictEqual(r.code, 0)
        let w = await s.writeLine('late')
        assert.strict.deepStrictEqual(w, false)
        let r2 = await s.stop()
        assert.strict.deepStrictEqual(r2, r)
    })

    it(`should pass cwd and env to the child without affecting process.env`, async function() {
        let sc = `process.stdout.write(process.env.WSEMI_SESSION_KEY + '|' + process.cwd())`
        let lines = []
        let s = execCliSession(nodeBin, ['-e', sc], {
            cwd: process.cwd(),
            env: { WSEMI_SESSION_KEY: 'KEY_S' },
            onLine: (line) => {
                lines.push(line)
            },
        })
        await s.stop()
        assert.strict.deepStrictEqual(lines.length, 1)
        assert.strict.deepStrictEqual(lines[0].startsWith('KEY_S|'), true)
        assert.strict.deepStrictEqual(process.env.WSEMI_SESSION_KEY, undefined)
    })

    it(`should report non-zero exit code as error when child exits on its own`, async function() {
        let s = execCliSession(nodeBin, ['-e', 'process.exit(3)'])
        await delay(50)
        let r = await s.stop()
        assert.strict.deepStrictEqual(r.code, 3)
        assert.strict.deepStrictEqual(r.killed, false)
        assert.strict.deepStrictEqual(r.error, 'Exit code 3')
    })

    it(`should fallback to default opt/args when they are not object/array`, async function() {
        let s = execCliSession(nodeBin, 'not-array', 'not-object')
        //無args時node進入REPL, stop()關閉stdin後立即結束
        let r = await s.stop()
        assert.strict.deepStrictEqual(r.code, 0)
    })

    //--- 失敗回報: 不throw, error不含args與env之值 ---

    let SA = 'SECRET_ARG_7d1f' //機密標記, 置於args
    let SE = 'SECRET_ENV_9a2b' //機密標記, 置於env
    let fdSrc = fileURLToPath(new URL('../src/', import.meta.url))
    let fpEmfileRunner = path.resolve('./test/tools/spawnEmfileRunner.mjs')
    let fdTmp = path.resolve('./test/_tmp/execCliSession')
    let fpCmd = path.join(fdTmp, 'zzfallback.cmd')

    before(function() {
        fs.mkdirSync(fdTmp, { recursive: true })
        fs.writeFileSync(fpCmd, '@echo off\r\necho fallback %*\r\n') //無%dp0%\node_modules入口之.cmd, buildSpawnArgs走cmd.exe退路
    })

    after(function() {
        fs.rmSync(fdTmp, { recursive: true, force: true })
    })

    it(`should not throw and should report errors without args or env values when spawn throws synchronously`, async function() {
        let s1 = null
        let s2 = null
        assert.doesNotThrow(() => {
            s1 = execCliSession(nodeBin, ['-e', '1', SA + '\u0000x'])
            s2 = execCliSession(nodeBin, ['-e', '1'], { env: { WSEMI_TEST_KEY: SE + '\u0000x' } })
        })
        let r1 = await s1.stop()
        let r2 = await s2.stop()
        //P06a: 以stop()之結果物件回報, error保留參數名稱而不含其值
        assert.strict.deepStrictEqual(r1.error.startsWith('ERR_INVALID_ARG_VALUE: '), true)
        assert.strict.deepStrictEqual(r1.error.includes(`'args[2]'`), true)
        assert.strict.deepStrictEqual([r1.error.includes(SA), r1.error.includes('Received')], [false, false])
        assert.strict.deepStrictEqual([r2.error.includes('WSEMI_TEST_KEY'), r2.error.includes(SE)], [true, false])
    })

    it(`should report EMFILE via stop() without throwing or crashing when node cannot create stdio`, function() {
        let p = cp.spawnSync(nodeBin, [fpEmfileRunner, fdSrc, 'execCliSession'], { encoding: 'utf8', windowsHide: true, timeout: 60000 })
        let o = JSON.parse(p.stdout.trim().split(/\r?\n/).pop())
        //P06b
        assert.strict.deepStrictEqual(o.settle, 'resolve')
        assert.strict.deepStrictEqual(o.value.error.startsWith('EMFILE: '), true)
        assert.strict.deepStrictEqual([o.value.exited, o.value.pid], [true, null])
        assert.strict.deepStrictEqual(o.hasSecret, false)
        assert.strict.deepStrictEqual(o.uncaught, [])
    })

    it(`should not throw when a .cmd falls back to cmd.exe and args contain a number on win32`, async function() {
        if (process.platform !== 'win32') {
            this.skip()
        }
        let lines = []
        let s = null
        assert.doesNotThrow(() => {
            s = execCliSession(fpCmd, ['a', 123], {
                onLine: (line) => {
                    lines.push(line)
                },
            })
        })
        let r = await s.stop()
        //P06c: 不throw; P09: 數字比照字串傳遞
        assert.strict.deepStrictEqual([r.exited, r.code], [true, 0])
        assert.strict.deepStrictEqual(lines.some((l) => l.includes('fallback') && l.includes('123')), true)
    })

    it(`should not throw when building the .cmd fallback command throws on win32`, async function() {
        if (process.platform !== 'win32') {
            this.skip()
        }
        //無法轉為字串之元素使buildSpawnArgs於cmd.exe退路拋錯, 須與spawn同在try內
        let s = null
        assert.doesNotThrow(() => {
            s = execCliSession(fpCmd, ['a', Object.create(null)])
        })
        let r = await s.stop()
        //P06c
        assert.strict.deepStrictEqual([r.exited, r.pid, r.error.startsWith('UNKNOWN: ')], [true, null, true])
    })

})


//R-EXEC-FAIL-01之6~14: 每案於獨立子行程執行(test/tools/execFailRunner.mjs), 夾具建於test/_tmp/execFail-<案名>/並於案例結束刪除
describe(`execCliSession 失敗回報(R-EXEC-FAIL-01之6~14)`, function() {

    it(`execCliSession: onExit拋錯(不攔截, 仍為未捕捉例外)時stop()仍settle(已啟動與未能啟動) [R-EXEC-FAIL-01之12; R-PM-SETTLE-01之1]`, function() {
        let { r } = runExecFail('sessionOnExitThrows')
        assert.strict.deepStrictEqual(r.out, { started: 'resolve', spawnFail: 'resolve', uncaught: ['onExit spawnFail boom', 'onExit started boom'] })
    })

    it(`execCliSession: 只給檔名之批次檔依子進程env解析(env移除NoDefaultCurrentDirectoryInExePath時可找到cwd內者, 同cmd.exe) [R-EXEC-FAIL-01之6]`, function() {
        if (process.platform !== 'win32') {
            this.skip()
        }
        let { r } = runExecFail('sessionBareBatchEnv')
        assert.strict.deepStrictEqual(r.out, { error: '', got: true })
    })

    it(`execCliSession: onLine(收尾flush、同chunk之第一行)、onStdout(同chunk之行與收尾flush)、onStderr(stderr尾段與收尾flush)拋錯(不攔截, 仍為未捕捉例外)時, 其餘行即時送達、stop()落定、結果完整 [R-EXEC-FAIL-01之12; R-PM-SETTLE-01之1]`, function() {
        let { r } = runExecFail('sessionCallbacks')
        assert.strict.deepStrictEqual(r.out, {
            sessionOnLineFlush: { code: 0, exited: true, error: '', exitSeen: true },
            sessionOnStdoutLines: { s: 'resolve', lines: ['l1', 'l2'] },
            sessionOnLineSameChunk: { got: 'resolve', seen: ['l1', 'l2'], stopped: 'resolve' },
            sessionOnStdoutFlush: { code: 0, exited: true, error: '' },
            sessionOnStderrData: { code: 3, error: 'Exit code 3', stderr: 'e1' },
            sessionOnStderrFlush: { code: 0, exited: true, error: '', stderr: '�' },
            uncaught: ['onLine chunk boom', 'onLine flush boom', 'onStderr data boom', 'onStderr flush boom', 'onStdout data boom', 'onStdout flush boom'],
        })
    })

    it(`execCliSession: onExit拋錯時, 無處理器之行程仍以離開碼1結束並印出錯誤(重拋早於呼叫端續行, 不因隨即process.exit而遺失) (守門) [R-EXEC-FAIL-01之12]`, function() {
        let { status, signal, stderr } = runExecFail('rethrowSessionOnExit', { exitMode: 'nohandler', allowNoResult: true })
        assert.strict.deepStrictEqual([status, stderr.includes('cb boom')], [1, true], `status=${status}, signal=${signal}, stderr=${stderr.slice(0, 300)}`)
    })

    it(`execCliSession: writeLine之參數無法轉為字串(Object.create(null)、已撤銷之Proxy)時resolve(false), 與write對稱、不同步拋錯 [R-EXEC-FAIL-01之13]`, function() {
        let { r } = runExecFail('sessionWriteLineUnconvertible')
        assert.strict.deepStrictEqual(r.out, {
            nullProto: { s: 'resolve', v: false }, //規則13: writeLine之參數無法轉字串時resolve(false)(同write)
            revoked: { s: 'resolve', v: false }, //規則13: 同上(已撤銷之Proxy)
            stop: { code: 0, error: '' }, //規則13: 失敗之writeLine不影響工作階段, stop()照常結束
        })
        assert.strict.deepStrictEqual([r.unhandled, r.uncaught], [[], []]) //規則13: 不同步拋錯、不成為未捕捉例外
    })

    it(`execCliSession: onExit、onLine、onStdout、onStderr為以函數為目標之Proxy且於入口判型後才撤銷時, data、收尾flush與settle內不再判型呼叫端之值: stop()照常落定且不誤報STOP_TIMEOUT、行與stderr尾段不遺失, 未捕捉例外僅有呼叫已撤銷回調本身者 [R-EXEC-FAIL-01之12、13]`, function() {
        let { r } = runExecFail('sesCbRevokedLater')
        //規則13: 監聽器與計時器內不再觸及呼叫端之值(否則onExit者stop()永不落定、onLine者誤報STOP_TIMEOUT、onStderr者stderr尾段遺失); 規則12: 收尾settle與喚醒stop()照常完成
        let ok = (lines, stderr = '') => ({ code: 0, exited: true, error: '', stderr, lines, uncaught: ['revoked:apply'] }) //規則12: 呼叫已撤銷之回調所拋之TypeError經_callUser原樣重拋(revoked:apply), 不得有判型所生者(revoked:has)
        assert.strict.deepStrictEqual(r.out, {
            onExit: ok(['o1']), //規則13: settle內不再判型onExit, stop()落定
            onLineData: ok([]), //規則13: data之切行內不再判型onLine, 收尾照常settle(不誤報STOP_TIMEOUT)
            onLineFlush: ok([]), //規則13: 收尾flush不完整行時不再判型onLine
            onStdoutData: ok(['o1']), //規則13: data內不再判型onStdout, 該chunk仍進onLine
            onStdoutFlush: ok(['�']), //規則13: 收尾flush時不再判型onStdout
            onStderrData: ok([], 'e1'), //規則13: data內不再判型onStderr, 該段仍計入stderr尾段
            onStderrFlush: ok([], '�'), //規則13: 收尾flush時不再判型onStderr
        })
        assert.strict.deepStrictEqual(r.unhandled, []) //規則13: 不產生未處理之rejection
    })

    it(`execCliSession: onExit可讀而cwd、stderrKeep、onLine之getter拋錯或env為已撤銷之Proxy時, 不spawn且onExit被呼叫一次、其結果同stop() [R-EXEC-FAIL-01之13]`, function() {
        let { r } = runExecFail('sesOnExitInputUnreadable')
        //規則13: execCliSession不spawn(建立當下pid null、子進程之輸出未出現), 以onExit與stop()之結果回報(pid null, error '<碼>: <訊息>', 無碼者為UNKNOWN); onExit收到之結果即stop()之結果
        let x = (m) => ({ error: `UNKNOWN: ${m}`, pid: null, pidAtCreate: null, onExitCalls: 1, onExitSameAsStop: true, lines: [] })
        assert.strict.deepStrictEqual(r.out, {
            cwdGetter: x('getter boom cwd'), //規則13: cwd不可讀
            stderrKeepGetter: x('getter boom stderrKeep'), //規則13: stderrKeep不可讀
            onLineGetter: x('getter boom onLine'), //規則13: 他項回調不可讀時, 可讀之onExit仍回報
            envRevoked: x('<revoked>'), //規則13: env為已撤銷之Proxy
        })
        assert.strict.deepStrictEqual([r.unhandled, r.uncaught], [[], []]) //規則13: 讀取與判型一律在try內, 不throw、不成為未捕捉例外
    })

    it(`execCliSession: 選項getter拋出非Error之值(null、undefined、字串)時不spawn, 以onExit與stop()回報且error保留拋出值之文字 [R-EXEC-FAIL-01之13]`, function() {
        let { r } = runExecFail('sesThrownValues')
        //規則13: 輸入不可讀(getter拋錯)時不spawn(拋出之值可為null、undefined, 不得因而照常spawn), 以onExit與stop()之結果回報(pid null, error '<碼>: <訊息>', 無碼者為UNKNOWN; 訊息取getErrorMessage, 為空退_errToStr)
        let x = (m) => ({ error: `UNKNOWN: ${m}`, pid: null, pidAtCreate: null, onExitCalls: 1, lines: [] })
        assert.strict.deepStrictEqual(r.out, {
            null: x('null'), //規則13: 拋出null
            undefined: x('undefined'), //規則13: 拋出undefined
            string: x('thrown-x'), //規則13: 拋出字串, 訊息保留該字串
        })
        assert.strict.deepStrictEqual([r.unhandled, r.uncaught], [[], []]) //規則13: 不throw、不成為未捕捉例外
    })

})


//R-TRACE-01: opt.onTrace之事件語意與P3/P4; 事件以traceRec等待(不以固定等待後檢查), 寬限期、逾時門檻、樹殺等待本身即規格者於假時鐘下推進(P5), 子進程與樹殺為真實I/O
describe(`execCliSession 觀察回調(R-TRACE-01)`, function() {

    let nodeBin = process.execPath

    //逐行回顯程式, 收到EOF即結束
    let scEcho = `
        let rl = require('readline').createInterface({ input: process.stdin })
        rl.on('line', (l) => process.stdout.write('echo:' + l + '\\n'))
        rl.on('close', () => process.exit(0))
    `

    //不理會EOF之程式
    let scHang = `setInterval(() => {}, 1000)`

    //一般結果事件: settle之欄位同結果物件(code、signal、exited、timeout、killed、error)
    let settleOf = (r) => ({ type: 'settle', code: r.code, signal: r.signal, exited: r.exited, timeout: r.timeout, killed: r.killed, error: r.error })

    it(`should notify spawn, write, data, stop and settle in order for an echo session that exits on EOF (no grace, kill or timeout)`, async function() {
        let tr = traceRec()
        let s = execCliSession(nodeBin, ['-e', scEcho], { exitGraceMs: 60000, onTrace: tr.on })
        //JSDoc opt.onTrace: spawn為子進程已建立(含pid), 於本函數回傳前同步通知
        assert.strict.deepStrictEqual(tr.events, [{ type: 'spawn', pid: s.pid }])
        let w1 = await s.writeLine('abc')
        //JSDoc opt.onTrace: write為一次寫入stdin定案, 於write()之Promise resolve前通知
        assert.strict.deepStrictEqual([w1, tr.events.filter((e) => e.type === 'write')], [true, [{ type: 'write', ok: true, len: 4 }]])
        let w2 = await s.writeLine('中文')
        assert.strict.deepStrictEqual(w2, true)
        let sum = () => tr.events.filter((e) => e.type === 'data').reduce((a, e) => a + e.len, 0)
        for (let k = 1; sum() < 17; k++) { //'echo:abc\n'(9)+'echo:中文\n'(8)字元皆已送達
            await tr.wait((e) => e.type === 'data', 0, k)
        }
        let r = await s.stop()
        let ev = tr.events
        assert.strict.deepStrictEqual(ev.filter((e) => e.type === 'write'), [{ type: 'write', ok: true, len: 4 }, { type: 'write', ok: true, len: 3 }])
        assert.strict.deepStrictEqual(ev.filter((e) => e.type === 'data').every((e) => e.stream === 'stdout'), true)
        //JSDoc opt.onTrace: stop為首次呼叫stop()(含ms為exitGraceMs), settle為即將定案(欄位同結果物件); 子進程於EOF自行結束故無grace、kill、timeout
        assert.strict.deepStrictEqual(ev.slice(-2), [{ type: 'stop', ms: 60000 }, { type: 'settle', code: 0, signal: null, exited: true, timeout: false, killed: false, error: '' }])
        assert.strict.deepStrictEqual(ev.slice(-1)[0], settleOf(r))
        assert.strict.deepStrictEqual(ev.filter((e) => ['grace', 'kill', 'timeout'].includes(e.type)), [])
    })

    it(`should notify data of both streams with their character counts and no content`, async function() {
        let tr = traceRec()
        let s = execCliSession(nodeBin, ['-e', `process.stdout.write('abc');process.stderr.write('de')`], { exitGraceMs: 60000, onTrace: tr.on })
        let r = await s.stop()
        let sum = (stream) => tr.events.filter((e) => e.type === 'data' && e.stream === stream).reduce((a, e) => a + e.len, 0)
        assert.strict.deepStrictEqual([sum('stdout'), sum('stderr'), r.code], [3, 2, 0])
        //JSDoc opt.onTrace: settle之後不再通知data
        let iSettle = tr.events.findIndex((e) => e.type === 'settle')
        assert.strict.deepStrictEqual(tr.events.slice(iSettle + 1), [])
        assert.strict.deepStrictEqual(tr.events.every((e) => e.type !== 'data' || ('content' in e) === false), true)
    })

    it(`should notify stop, then grace at exactly exitGraceMs, then kill, then settle killed when the child ignores EOF (write while stopping is refused, write after settle is silent)`, async function() {
        //寬限期本身即規格(JSDoc opt.exitGraceMs): 假時鐘下以advance量測; 樹殺與子進程之結束為真實I/O
        let clock = useFakeClock()
        try {
            let tr = traceRec()
            let s = execCliSession(nodeBin, ['-e', scHang], { exitGraceMs: 5000, killWaitMs: 7000, onTrace: tr.on })
            let pStop = s.stop()
            assert.strict.deepStrictEqual(tr.events, [{ type: 'spawn', pid: s.pid }, { type: 'stop', ms: 5000 }])
            s.stop() //重複呼叫: 回傳同一Promise且不重複通知
            assert.strict.deepStrictEqual(tr.events.length, 2)
            //JSDoc opt.onTrace: write之len為null代表因已stop()而拒絕
            let w = await s.write('x')
            assert.strict.deepStrictEqual([w, tr.events[2]], [false, { type: 'write', ok: false, len: null }])
            let at = tr.mark()
            await clock.advance(4999)
            assert.strict.deepStrictEqual(tr.types(at), []) //寬限期未滿: 不得grace
            await clock.advance(1)
            assert.strict.deepStrictEqual(tr.events.slice(at, at + 2), [{ type: 'grace', ms: 5000 }, { type: 'kill', pid: s.pid, ms: 7000 }]) //恰滿: 先通知寬限期已到, 再通知樹殺
            let r = await pStop
            assert.strict.deepStrictEqual(tr.events.at(-1), settleOf(r))
            assert.strict.deepStrictEqual([r.exited, r.killed, r.timeout, r.error], [true, true, false, ''])
            //settle後釋放: 寫入被拒絕而不再通知
            let n = tr.events.length
            assert.strict.deepStrictEqual(await s.writeLine('late'), false)
            assert.strict.deepStrictEqual(tr.events.length, n)
        }
        finally {
            clock.restore()
        }
    })

    it(`should notify timeout at exactly timeoutMs, then kill, then settle with timeout true (stop() afterwards is silent)`, async function() {
        //整體逾時門檻本身即規格(JSDoc opt.timeoutMs): 假時鐘下以advance量測
        let clock = useFakeClock()
        try {
            let tr = traceRec()
            let s = execCliSession(nodeBin, ['-e', scHang], { timeoutMs: 4000, killWaitMs: 7000, onTrace: tr.on })
            let at = tr.mark()
            await clock.advance(3999)
            assert.strict.deepStrictEqual(tr.types(at), [])
            await clock.advance(1)
            assert.strict.deepStrictEqual(tr.events.slice(at, at + 2), [{ type: 'timeout', ms: 4000 }, { type: 'kill', pid: s.pid, ms: 7000 }])
            let st = await tr.wait((e) => e.type === 'settle')
            let r = await s.stop() //已定案: 回傳同一結果, 不通知stop
            assert.strict.deepStrictEqual(st, settleOf(r))
            assert.strict.deepStrictEqual([r.timeout, r.killed, r.exited, r.error.startsWith('TIMEOUT after 4s')], [true, true, true, true])
            assert.strict.deepStrictEqual(tr.events.some((e) => e.type === 'stop'), false)
        }
        finally {
            clock.restore()
        }
    })

    // runStuck, 樹殺後exit事件遲遲不來(子進程已結束而孫行程握住管線): killWaitMs後以exited:false強制定案; killWaitMs本身即規格, 假時鐘下量測
    //  trigger為'stop'(寬限期到)或'timeout'(整體逾時)
    let runStuck = async (trigger) => {
        let clock = useFakeClock()
        let gpid = null
        try {
            let tr = traceRec()
            let opt = {
                killWaitMs: 3000,
                onStdout: (chunk) => {
                    gpid = gpidOf(chunk) || gpid
                },
                onTrace: tr.on,
            }
            if (trigger === 'stop') {
                opt.exitGraceMs = 2000
            }
            else {
                opt.timeoutMs = 4000
            }
            let s = execCliSession(nodeBin, ['-e', scHolder], opt)
            await tr.wait((e) => e.type === 'data') //孫行程pid已輸出
            assert.strict.deepStrictEqual(gpid > 0, true)
            assert.strict.deepStrictEqual(await waitGone(s.pid), true) //子進程已結束(此後kill不會殺到孫行程)
            let pStop = null
            if (trigger === 'stop') {
                pStop = s.stop()
            }
            let at = tr.mark()
            let ms = trigger === 'stop' ? 2000 : 4000
            await clock.advance(ms - 1)
            assert.strict.deepStrictEqual(tr.types(at), [])
            await clock.advance(1)
            assert.strict.deepStrictEqual(tr.events.slice(at), [{ type: trigger === 'stop' ? 'grace' : 'timeout', ms }, { type: 'kill', pid: s.pid, ms: 3000 }])
            await clock.advance(2999)
            assert.strict.deepStrictEqual(tr.types(at), [trigger === 'stop' ? 'grace' : 'timeout', 'kill']) //樹殺後未滿killWaitMs: 尚未定案
            await clock.advance(1)
            let r = await (pStop || s.stop())
            return { r, ev: tr.events.slice(at + 2), clock, gpid, tr }
        }
        finally {
            clock.restore()
            await killPid(gpid)
        }
    }

    it(`should settle with exited false exactly killWaitMs after the kill when the grace period ended and the pipe is held by an orphan`, async function() {
        let { r, ev, tr } = await runStuck('stop')
        //JSDoc opt.killWaitMs: 逾期仍未退出則於結果標exited:false並結束等待; JSDoc opt.onTrace: settle之exited為false代表樹殺後逾killWaitMs仍未退出
        assert.strict.deepStrictEqual(ev, [{ type: 'settle', code: null, signal: null, exited: false, timeout: false, killed: true, error: 'STOP_TIMEOUT(子進程未能結束)' }])
        assert.strict.deepStrictEqual([r.exited, r.killed, r.error], [false, true, 'STOP_TIMEOUT(子進程未能結束)'])
        //定案後孫行程被殺使close遲到: 不再通知
        await new Promise((resolve) => setImmediate(resolve))
        assert.strict.deepStrictEqual(tr.events.at(-1).type, 'settle')
    })

    it(`should settle with exited false and timeout true exactly killWaitMs after the kill when the overall timeout fired and the pipe is held by an orphan`, async function() {
        let { r, ev } = await runStuck('timeout')
        assert.strict.deepStrictEqual(ev, [{ type: 'settle', code: null, signal: null, exited: false, timeout: true, killed: true, error: 'TIMEOUT after 4s(子進程未能結束)' }])
        assert.strict.deepStrictEqual([r.exited, r.timeout, r.killed], [false, true, true])
    })

    it(`should notify only settle when the session is not spawned (invalid command, synchronous spawn error, unreadable input, unreadable onTrace), and spawn then settle for ENOENT`, async function() {
        //JSDoc opt.onTrace: 輸入不可讀、command無效、spawn失敗者只有settle事件; opt.onTrace屬性本身不可讀與其他回調相同視為輸入不可讀
        //go, mk(tr, onExit)建立opt(不可讀者以defineProperty直接定義於同一物件, 不展開)
        let go = async (command, args, mk) => {
            let tr = traceRec()
            let exitR = null
            let onExit = (r) => {
                exitR = r
            }
            let s = execCliSession(command, args, mk(tr, onExit))
            let w = await s.writeLine('x')
            let r = await s.stop()
            return { tr, w, r, sameExit: exitR === r }
        }
        let plain = (tr, onExit) => ({ onExit, onTrace: tr.on })
        let a = await go('', [], plain)
        assert.strict.deepStrictEqual([a.tr.events, a.w, a.sameExit], [[{ type: 'settle', code: null, signal: null, exited: true, timeout: false, killed: false, error: 'command 須為非空字串' }], false, true])
        let b = await go(nodeBin, ['-e', '1', 'a\u0000x'], plain)
        assert.strict.deepStrictEqual([b.tr.types(), b.tr.events[0].error.startsWith('ERR_INVALID_ARG_VALUE: ')], [['settle'], true])
        let c = await go(nodeBin, ['-e', '1'], (tr, onExit) => badProp({ onExit, onTrace: tr.on }, 'cwd', 'getter boom cwd'))
        assert.strict.deepStrictEqual([c.tr.events.map((e) => [e.type, e.error, e.exited]), c.sameExit], [[['settle', 'UNKNOWN: getter boom cwd', true]], true])
        let d = await go(nodeBin, ['-e', '1'], (tr, onExit) => badProp({ onExit }, 'onTrace', 'trace getter boom'))
        assert.strict.deepStrictEqual([d.r.error, d.r.pid, d.sameExit], ['UNKNOWN: trace getter boom', null, true]) //不throw, onExit照常被呼叫
        let e = await go('non_existent_command_xyz_12345', ['arg'], plain)
        assert.strict.deepStrictEqual([e.tr.types().at(-1), e.tr.events.at(-1).error.includes('ENOENT'), e.tr.events.at(-1).exited, e.w, e.sameExit], ['settle', true, true, false, true])
        assert.strict.deepStrictEqual(e.tr.events.filter((x) => x.type === 'spawn').every((x) => x.pid === null), true) //未能啟動: pid為null
        assert.strict.deepStrictEqual(e.tr.events.some((x) => ['write', 'stop', 'grace', 'kill'].includes(x.type)), false)
    })

    it(`should give the same results without onTrace, with a recording onTrace, and with a throwing, rejecting or invalid onTrace`, async function() {
        //R-TRACE-01 P3: 未傳觀察回調時行為不變; P4: 回調之拋錯與回傳之rejection不影響結果、不產生未處理之rejection; 情境涵蓋EOF結束、寬限期樹殺、整體逾時、ENOENT、command無效、spawn同步錯誤
        let un = watchUnhandled()
        let rec = traceRec()
        let norm = (r) => ({ code: r.killed ? 'killed' : r.code, signal: r.killed ? 'killed' : r.signal, exited: r.exited, timeout: r.timeout, killed: r.killed, error: r.error.startsWith('TIMEOUT') ? 'TIMEOUT' : r.error, stderr: r.stderr })
        let got = []
        try {
            for (let onTrace of fiveOnTrace(rec.on)) {
                let rs = []
                let lines = []
                let s1 = execCliSession(nodeBin, ['-e', scEcho], { exitGraceMs: 60000, onLine: (l) => lines.push(l), onTrace })
                await s1.writeLine('abc')
                rs.push(norm(await s1.stop()))
                let s2 = execCliSession(nodeBin, ['-e', scHang], { exitGraceMs: 200, onTrace })
                rs.push(norm(await s2.stop()))
                let s3 = execCliSession(nodeBin, ['-e', scHang], { timeoutMs: 300, onTrace })
                rs.push(norm(await s3.stop()))
                rs.push(norm(await execCliSession('non_existent_command_xyz_12345', [], { onTrace }).stop()))
                rs.push(norm(await execCliSession('', [], { onTrace }).stop()))
                rs.push(norm(await execCliSession(nodeBin, ['-e', '1', 'a\u0000x'], { onTrace }).stop()))
                got.push({ rs, lines })
            }
            await new Promise((resolve) => setImmediate(resolve))
            await new Promise((resolve) => setImmediate(resolve))
        }
        finally {
            un.stop()
        }
        assert.strict.deepStrictEqual(got.slice(1), [got[0], got[0], got[0], got[0]])
        assert.strict.deepStrictEqual([got[0].lines, got[0].rs.map((x) => [x.exited, x.timeout, x.killed])], [['echo:abc'], [[true, false, false], [true, false, true], [true, true, true], [true, false, false], [true, false, false], [true, false, false]]])
        assert.strict.deepStrictEqual(un.list, [])
        //紀錄器確有收到各情境之事件
        let types = new Set(rec.events.map((e) => e.type))
        assert.strict.deepStrictEqual(['spawn', 'data', 'write', 'stop', 'grace', 'timeout', 'kill', 'settle'].every((t) => types.has(t)), true)
    })

    it(`should notify frozen events with primitive fields fixed per type and without a receiver`, async function() {
        //JSDoc opt.onTrace: 事件為凍結物件{ type, ... }, 欄位依type列舉且皆為原始值(R-TRACE-01 P4); 回調不帶接收者呼叫
        let rec = recMeta()
        let s1 = execCliSession(nodeBin, ['-e', scEcho], { exitGraceMs: 60000, onTrace: rec.on })
        await s1.writeLine('abc')
        await s1.stop()
        let s2 = execCliSession(nodeBin, ['-e', scHang], { exitGraceMs: 200, onTrace: rec.on })
        await s2.stop()
        let s3 = execCliSession(nodeBin, ['-e', scHang], { timeoutMs: 300, onTrace: rec.on })
        await s3.stop()
        assert.strict.deepStrictEqual(keysByType(rec.events), {
            spawn: 'pid,type',
            write: 'len,ok,type',
            data: 'len,stream,type',
            stop: 'ms,type',
            grace: 'ms,type',
            kill: 'ms,pid,type',
            timeout: 'ms,type',
            settle: 'code,error,exited,killed,signal,timeout,type',
        })
        assert.strict.deepStrictEqual(allPrimitive(rec.events), true)
        assert.strict.deepStrictEqual(rec.meta.length > 0 && rec.meta.length === rec.events.length && rec.meta.every(([self, frozen]) => self === undefined && frozen), true)
    })

})
