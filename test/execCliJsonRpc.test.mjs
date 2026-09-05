import assert from 'assert'
import execCliJsonRpc from '../src/execCliJsonRpc.mjs'


describe(`execCliJsonRpc`, function() {

    //以當前執行mocha的node當測試對象, 跨Windows/Linux/macOS可用
    let nodeBin = process.execPath

    //模擬一行一則JSON之伺服器:
    //  啟動即送出一則伺服器通知(無id)與一則伺服器→客戶端請求(帶id含method), 後者不得被誤當回應
    //  收到請求回{ id, result: { method, params, jsonrpc } }; 方法fail回error; 方法die直接exit(7); 另夾雜非JSON日誌行
    //  收到EOF即結束
    let scServer = `
        let rl = require('readline').createInterface({ input: process.stdin })
        process.stdout.write('server log line (not json)\\n')
        process.stdout.write(JSON.stringify({ method: 'log', params: { msg: 'hello' } }) + '\\n')
        process.stdout.write(JSON.stringify({ id: 0, method: 'roots/list' }) + '\\n')
        rl.on('line', (l) => {
            let m = JSON.parse(l)
            if (m.id === undefined) return
            if (m.method === 'fail') {
                process.stdout.write(JSON.stringify({ id: m.id, error: { code: -1, message: 'bad' } }) + '\\n')
            }
            else if (m.method === 'die') {
                process.exit(7)
            }
            else {
                process.stdout.write(JSON.stringify({ id: m.id, result: { method: m.method, params: m.params, jsonrpc: m.jsonrpc } }) + '\\n')
            }
        })
        rl.on('close', () => process.exit(0))
    `

    it(`should run requests in order, skip waiting for notify, and collect results by method`, async function() {
        let notes = []
        let sreqs = []
        let r = await execCliJsonRpc(nodeBin, ['-e', scServer], [
            { method: 'initialize', params: { clientInfo: { name: 'demo' } } },
            { notify: 'initialized' },
            { method: 'account/read' },
        ], {
            onNotify: (m) => {
                notes.push(m.method)
            },
            onServerRequest: (m) => {
                sreqs.push({ id: m.id, method: m.method })
            },
        })
        // console.log('ok r', JSON.stringify(r))
        assert.strict.deepStrictEqual(r.ok, true)
        assert.strict.deepStrictEqual(r.errorType, '')
        assert.strict.deepStrictEqual(r.error, '')
        assert.strict.deepStrictEqual(r.results, {
            'initialize': { method: 'initialize', params: { clientInfo: { name: 'demo' } } },
            'account/read': { method: 'account/read' },
        })
        assert.strict.deepStrictEqual(r.responses.map((x) => [x.id, x.method, x.error]), [[0, 'initialize', null], [1, 'account/read', null]])
        assert.strict.deepStrictEqual(r.exitCode, 0)
        assert.strict.deepStrictEqual(notes, ['log'])
        //伺服器→客戶端請求之id(0)與客戶端首個請求id(0)相同, 仍不得被誤當回應
        assert.strict.deepStrictEqual(sreqs, [{ id: 0, method: 'roots/list' }])
    })

    it(`should attach jsonrpc field when opt.jsonrpc is true ('2.0') or a string, and omit by default`, async function() {
        let r1 = await execCliJsonRpc(nodeBin, ['-e', scServer], [{ method: 'a' }], { jsonrpc: true })
        assert.strict.deepStrictEqual(r1.results.a.jsonrpc, '2.0')
        let r2 = await execCliJsonRpc(nodeBin, ['-e', scServer], [{ method: 'a' }], { jsonrpc: '1.0' })
        assert.strict.deepStrictEqual(r2.results.a.jsonrpc, '1.0')
        let r3 = await execCliJsonRpc(nodeBin, ['-e', scServer], [{ method: 'a' }])
        assert.strict.deepStrictEqual('jsonrpc' in r3.results.a, false)
    })

    it(`should abort on first rpc error with errorType 'rpc' and results[method]=null`, async function() {
        let r = await execCliJsonRpc(nodeBin, ['-e', scServer], [{ method: 'fail' }, { method: 'never' }])
        // console.log('rpc r', JSON.stringify(r))
        assert.strict.deepStrictEqual(r.ok, false)
        assert.strict.deepStrictEqual(r.errorType, 'rpc')
        assert.strict.deepStrictEqual(r.error, 'fail: bad')
        assert.strict.deepStrictEqual(r.results, { fail: null })
        assert.strict.deepStrictEqual(r.responses.length, 1)
        assert.strict.deepStrictEqual(r.responses[0].error, { code: -1, message: 'bad' })
        assert.strict.deepStrictEqual(r.exitCode, 0)
    })

    it(`should continue after rpc error when continueOnError=true but still report ok=false`, async function() {
        let r = await execCliJsonRpc(nodeBin, ['-e', scServer], [{ method: 'fail' }, { method: 'after' }], { continueOnError: true })
        // console.log('continue r', JSON.stringify(r))
        assert.strict.deepStrictEqual(r.ok, false)
        assert.strict.deepStrictEqual(r.errorType, 'rpc')
        assert.strict.deepStrictEqual(r.results, { fail: null, after: { method: 'after' } })
        assert.strict.deepStrictEqual(r.responses.length, 2)
    })

    it(`should report errorType 'exit' with exitCode when child exits before responding`, async function() {
        let r = await execCliJsonRpc(nodeBin, ['-e', scServer], [{ method: 'die' }, { method: 'never' }])
        // console.log('exit r', JSON.stringify(r))
        assert.strict.deepStrictEqual(r.ok, false)
        assert.strict.deepStrictEqual(r.errorType, 'exit')
        assert.strict.deepStrictEqual(r.error, 'die: Exit code 7')
        assert.strict.deepStrictEqual(r.exitCode, 7)
        assert.strict.deepStrictEqual(r.results, {})
    })

    it(`should report errorType 'timeout' when no response within timeoutMs`, async function() {
        let r = await execCliJsonRpc(nodeBin, ['-e', 'setInterval(() => {}, 1000)'], [{ method: 'x' }], { timeoutMs: 400 })
        // console.log('timeout r', JSON.stringify(r))
        assert.strict.deepStrictEqual(r.ok, false)
        assert.strict.deepStrictEqual(r.errorType, 'timeout')
        assert.strict.deepStrictEqual(r.error.startsWith('x: TIMEOUT after 0.4s'), true)
    })

    it(`should report errorType 'notfound' when command does not exist`, async function() {
        let r = await execCliJsonRpc('non_existent_command_xyz_12345', [], [{ method: 'x' }])
        // console.log('notfound r', JSON.stringify(r))
        assert.strict.deepStrictEqual(r.ok, false)
        assert.strict.deepStrictEqual(r.errorType, 'notfound')
        assert.strict.deepStrictEqual(r.error.includes('ENOENT'), true)
    })

    it(`should report errorType 'params' for invalid command/requests without spawning`, async function() {
        let r1 = await execCliJsonRpc('', [], [{ method: 'x' }])
        assert.strict.deepStrictEqual([r1.ok, r1.errorType, r1.error], [false, 'params', 'command 須為非空字串'])
        let r2 = await execCliJsonRpc(nodeBin, ['-e', scServer], 'not-array')
        assert.strict.deepStrictEqual([r2.ok, r2.errorType, r2.error], [false, 'params', 'requests 須為陣列'])
        let r3 = await execCliJsonRpc(nodeBin, ['-e', scServer], [{ method: 'ok' }, { bad: 1 }])
        assert.strict.deepStrictEqual([r3.ok, r3.errorType, r3.error], [false, 'params', 'requests[1] 須為含method或notify之物件'])
    })

    it(`should succeed with empty results when requests is empty (just start and stop)`, async function() {
        let r = await execCliJsonRpc(nodeBin, ['-e', scServer], [])
        assert.strict.deepStrictEqual(r.ok, true)
        assert.strict.deepStrictEqual(r.results, {})
        assert.strict.deepStrictEqual(r.responses, [])
        assert.strict.deepStrictEqual(r.exitCode, 0)
    })

    it(`should omit params in the wire message when not provided`, async function() {
        let r = await execCliJsonRpc(nodeBin, ['-e', scServer], [{ method: 'p' }])
        assert.strict.deepStrictEqual('params' in r.results.p, false)
    })

})
