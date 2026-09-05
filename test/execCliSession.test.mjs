import assert from 'assert'
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

})
