import assert from 'assert'
import fs from 'fs'
import path from 'path'
import cp from 'child_process'
import { fileURLToPath } from 'url'
import execCliSession from '../src/execCliSession.mjs'


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
