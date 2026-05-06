import assert from 'assert'
import execProcess from '../src/execProcess.mjs'


describe(`execProcess`, function() {

    //以當前執行mocha的node當測試對象, 跨Windows/Linux/macOS可用
    let nodeBin = process.execPath

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

    it(`should reject on 'error' event when spawning a non-existent program`, async function() {
        let err = null
        try {
            await execProcess('non_existent_command_xyz_12345', ['arg'])
        }
        catch (e) {
            err = e
        }
        // console.log('nonexistent err', err)
        assert.strict.deepStrictEqual(err !== null, true)
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

})
