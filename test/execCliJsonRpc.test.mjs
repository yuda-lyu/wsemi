import assert from 'assert'
import path from 'path'
import cp from 'child_process'
import { fileURLToPath } from 'url'
import execCliJsonRpc from '../src/execCliJsonRpc.mjs'
import { runExecFail } from './tools/execFailRun.mjs'
import { traceRec, useFakeClock } from './tools/timeKit.mjs'
import { fiveOnTrace, watchUnhandled, badProp, recMeta } from './tools/execCliTraceKit.mjs'


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

    //--- 失敗回報: error不含args之值, 系統資源用盡時不崩潰 ---

    let SA = 'SECRET_ARG_7d1f' //機密標記, 置於args
    let fdSrc = fileURLToPath(new URL('../src/', import.meta.url))
    let fpEmfileRunner = path.resolve('./test/tools/spawnEmfileRunner.mjs')

    it(`should not include args in error when spawn throws synchronously for a null byte`, async function() {
        let r = await execCliJsonRpc(nodeBin, ['-e', '1', SA + '\u0000x'], [{ method: 'x' }])
        //P06e
        assert.strict.deepStrictEqual(r.ok, false)
        assert.strict.deepStrictEqual(r.error.startsWith('x: ERR_INVALID_ARG_VALUE: '), true)
        assert.strict.deepStrictEqual([r.error.includes(SA), r.error.includes('Received')], [false, false])
    })

    it(`should report EMFILE without crashing when node cannot create stdio`, function() {
        let p = cp.spawnSync(nodeBin, [fpEmfileRunner, fdSrc, 'execCliJsonRpc'], { encoding: 'utf8', windowsHide: true, timeout: 60000 })
        let o = JSON.parse(p.stdout.trim().split(/\r?\n/).pop())
        //P06f
        assert.strict.deepStrictEqual(o.settle, 'resolve')
        assert.strict.deepStrictEqual([o.value.ok, o.value.error.startsWith('x: EMFILE: ')], [false, true])
        assert.strict.deepStrictEqual(o.hasSecret, false)
        assert.strict.deepStrictEqual(o.uncaught, [])
    })

    //R-TRACE-01: opt.onTrace原樣轉交execCliSession, 事件即其工作階段之事件(本函數自身無計時器亦不另通知); 事件以traceRec等待, 逾時門檻本身即規格者於假時鐘下推進(P5)
    describe(`觀察回調(R-TRACE-01)`, function() {

        it(`should pass opt.onTrace through to execCliSession: spawn, one write per message, data, stop with exitGraceMs, settle with the exit result`, async function() {
            let rec = recMeta()
            let reqs = [
                { method: 'initialize', params: { clientInfo: { name: 'demo' } } },
                { notify: 'initialized' },
                { method: 'account/read' },
            ]
            let r = await execCliJsonRpc(nodeBin, ['-e', scServer], reqs, { exitGraceMs: 60000, onTrace: rec.on })
            let ev = rec.events
            assert.strict.deepStrictEqual([r.ok, r.exitCode], [true, 0])
            //JSDoc opt.onTrace: 事件即execCliSession之事件; spawn於最先
            assert.strict.deepStrictEqual(ev[0].type, 'spawn')
            assert.strict.deepStrictEqual(typeof ev[0].pid, 'number')
            //JSDoc opt.onTrace: write為每則請求或通知寫入stdin一次(len含補上之換行)
            let len = (o) => JSON.stringify(o).length + 1
            assert.strict.deepStrictEqual(ev.filter((e) => e.type === 'write'), [
                { type: 'write', ok: true, len: len({ id: 0, method: 'initialize', params: { clientInfo: { name: 'demo' } } }) },
                { type: 'write', ok: true, len: len({ method: 'initialized' }) },
                { type: 'write', ok: true, len: len({ id: 1, method: 'account/read' }) },
            ])
            assert.strict.deepStrictEqual(ev.filter((e) => e.type === 'data').length > 0, true)
            //JSDoc opt.onTrace: stop之ms為exitGraceMs; 全部完成後才stop, 此時之退出不視為失敗; settle為最後一個事件
            assert.strict.deepStrictEqual(ev.slice(-2), [{ type: 'stop', ms: 60000 }, { type: 'settle', code: 0, signal: null, exited: true, timeout: false, killed: false, error: '' }])
            assert.strict.deepStrictEqual(ev.filter((e) => ['grace', 'kill', 'timeout'].includes(e.type)), [])
            //事件為凍結物件, 回調不帶接收者
            assert.strict.deepStrictEqual(rec.meta.length === ev.length && rec.meta.every(([self, frozen]) => self === undefined && frozen), true)
        })

        it(`should notify timeout at exactly timeoutMs and then kill when the server never answers, and report errorType timeout`, async function() {
            //整體逾時門檻本身即規格(JSDoc opt.timeoutMs涵蓋全部請求與收尾): 假時鐘下以advance量測; 子進程與樹殺為真實I/O
            let clock = useFakeClock()
            try {
                let tr = traceRec()
                let p = execCliJsonRpc(nodeBin, ['-e', 'setInterval(() => {}, 1000)'], [{ method: 'x' }], { timeoutMs: 4000, onTrace: tr.on })
                let sp = await tr.wait((e) => e.type === 'spawn')
                await tr.wait((e) => e.type === 'write') //請求已送出
                let at = tr.mark()
                await clock.advance(3999)
                assert.strict.deepStrictEqual(tr.types(at), [])
                await clock.advance(1)
                assert.strict.deepStrictEqual(tr.events.slice(at, at + 2), [{ type: 'timeout', ms: 4000 }, { type: 'kill', pid: sp.pid, ms: 3000 }]) //kill之ms為execCliSession預設killWaitMs
                let r = await p
                assert.strict.deepStrictEqual([r.ok, r.errorType, r.error.startsWith('x: TIMEOUT after 4s')], [false, 'timeout', true])
                let st = tr.events.at(-1)
                assert.strict.deepStrictEqual([st.type, st.timeout, st.killed, st.exited], ['settle', true, true, true])
            }
            finally {
                clock.restore()
            }
        })

        it(`should give the same results without onTrace, with a recording onTrace, and with a throwing, rejecting or invalid onTrace`, async function() {
            //R-TRACE-01 P3: 未傳觀察回調時行為不變; P4: 回調之拋錯與回傳之rejection不影響結果、不產生未處理之rejection; 情境涵蓋成功、rpc錯誤、子進程提早結束、命令不存在、參數錯誤、逾時
            let un = watchUnhandled()
            let rec = traceRec()
            let norm = (r) => ({ ok: r.ok, errorType: r.errorType, error: r.error.includes('TIMEOUT') ? 'TIMEOUT' : r.error, results: r.results, n: r.responses.length, exitCode: r.errorType === 'timeout' ? 'timeout' : r.exitCode })
            let got = []
            try {
                for (let onTrace of fiveOnTrace(rec.on)) {
                    let rs = []
                    let o = { exitGraceMs: 60000, onTrace }
                    rs.push(await execCliJsonRpc(nodeBin, ['-e', scServer], [{ method: 'initialize', params: { a: 1 } }, { notify: 'initialized' }], o))
                    rs.push(await execCliJsonRpc(nodeBin, ['-e', scServer], [{ method: 'fail' }, { method: 'never' }], o))
                    rs.push(await execCliJsonRpc(nodeBin, ['-e', scServer], [{ method: 'die' }, { method: 'never' }], o))
                    rs.push(await execCliJsonRpc('non_existent_command_xyz_12345', [], [{ method: 'x' }], o))
                    rs.push(await execCliJsonRpc('', [], [{ method: 'x' }], o))
                    rs.push(await execCliJsonRpc(nodeBin, ['-e', 'setInterval(() => {}, 1000)'], [{ method: 'x' }], { ...o, timeoutMs: 300 }))
                    got.push(rs.map(norm))
                }
                await new Promise((resolve) => setImmediate(resolve))
                await new Promise((resolve) => setImmediate(resolve))
            }
            finally {
                un.stop()
            }
            assert.strict.deepStrictEqual(got.slice(1), [got[0], got[0], got[0], got[0]])
            assert.strict.deepStrictEqual(got[0].map((x) => [x.ok, x.errorType]), [[true, ''], [false, 'rpc'], [false, 'exit'], [false, 'notfound'], [false, 'params'], [false, 'timeout']])
            assert.strict.deepStrictEqual(un.list, [])
            let types = new Set(rec.events.map((e) => e.type))
            assert.strict.deepStrictEqual(['spawn', 'data', 'write', 'stop', 'timeout', 'kill', 'settle'].every((t) => types.has(t)), true)
        })

        it(`should report errorType params without spawning when the onTrace property itself is unreadable (getter throws)`, async function() {
            //JSDoc opt.onTrace: opt.onTrace屬性本身不可讀與onStderr相同, errorType為params; 不reject
            let opt = badProp({}, 'onTrace', 'trace getter boom')
            let r = await execCliJsonRpc(nodeBin, ['-e', scServer], [{ method: 'x' }], opt)
            assert.strict.deepStrictEqual([r.ok, r.errorType, r.error], [false, 'params', 'UNKNOWN: trace getter boom'])
        })

    })

})


//R-EXEC-FAIL-01之6~14: 每案於獨立子行程執行(test/tools/execFailRunner.mjs), 夾具建於test/_tmp/execFail-<案名>/並於案例結束刪除
describe(`execCliJsonRpc 失敗回報(R-EXEC-FAIL-01之6~14)`, function() {

    it(`execCliJsonRpc: 子進程未能啟動者errorType一律notfound, 已啟動後結束為exit [R-EXEC-FAIL-01之10]`, function() {
        let { r } = runExecFail('rpcErrorType')
        assert.strict.deepStrictEqual(r.out, { notFound: 'notfound', nonPe: 'notfound', nulArg: 'notfound', cwdMissing: 'notfound', exitEarly: 'exit' })
    })

    it(`execCliJsonRpc: onNotify、onServerRequest拋錯(不攔截, 仍為未捕捉例外)時, 同一chunk內之回應仍送達而不卡至逾時 [R-EXEC-FAIL-01之12; R-PM-SETTLE-01之1]`, function() {
        let { r } = runExecFail('rpcSameChunk')
        assert.strict.deepStrictEqual(r.out, {
            rpcSameChunk: { ok: true },
            rpcSameChunkServerRequest: { ok: true },
            uncaught: ['onNotify boom', 'onServerRequest boom'],
        })
    })

    it(`execCliJsonRpc: 自身讀取之opt(含回調)或requests不可讀時errorType為params且不啟動, 交execCliSession之env不可讀為notfound, 不reject、不成為未捕捉例外 [R-EXEC-FAIL-01之13]`, function() {
        let { r } = runExecFail('inputUnreadableRpc')
        assert.strict.deepStrictEqual(r.out, {
            rpcGetter: { ok: false, errorType: 'params', error: 'UNKNOWN: getter boom timeoutMs' }, //規則13: 自身讀取失敗為errorType params
            rpcOptRevoked: { ok: false, errorType: 'params', error: 'UNKNOWN: <revoked>' }, //規則13: 同上(opt本身不可讀)
            rpcEnvRevoked: { ok: false, errorType: 'notfound', error: 'initialize: UNKNOWN: <revoked>' }, //規則13: env原樣交Session判定, 不可讀為notfound(規則10: 未啟動一律notfound)
            rpcOnNotifyRevoked: { ok: false, errorType: 'params', error: 'UNKNOWN: <revoked>' }, //規則13: 回調於入口判型, 不可讀為params
            rpcRequestRevoked: { ok: false, errorType: 'params', error: 'UNKNOWN: <revoked>' }, //規則13: requests之元素不可讀為params
            uncaught: [], //規則13: 監聽器內不再觸及呼叫端之值
        })
        assert.strict.deepStrictEqual([r.unhandled, r.uncaught], [[], []]) //規則13: 不reject、不成為未捕捉例外
    })

    it(`execCliJsonRpc: params無法序列化為JSON(BigInt、循環參照、toJSON拋錯、通知之params)時errorType為params、error為'<method>: 無法序列化為JSON: …', 不reject, 已啟動之子進程經stop()結束而不殘留至逾時 [R-EXEC-FAIL-01之14]`, function() {
        let { r } = runExecFail('rpcParamsUnserializable')
        //規則14: errorType params, error '<method>: 無法序列化為JSON: <訊息>'; 經stop()結束已啟動之子進程(childAliveAfter為false, 不得殘留至timeoutMs)
        let x = (m) => ({ ok: false, errorType: 'params', errorHead: `${m}: 無法序列化為JSON`, childAliveAfter: false })
        assert.strict.deepStrictEqual(r.out, {
            bigint: x('initialize'), //規則14: BigInt
            circularSecond: x('next'), //規則14: 循環參照(第2則, 子進程已回應第1則), error用讀取當下之method
            toJSONThrows: x('initialize'), //規則14: toJSON拋錯
            notifyBigint: x('initialized'), //規則14: 通知之params亦同
        })
        assert.strict.deepStrictEqual([r.unhandled, r.uncaught], [[], []]) //規則14: 不reject
    })

    it(`execCliJsonRpc: onNotify、onServerRequest為以函數為目標之Proxy且於入口判型後才撤銷時, onLine內不再判型呼叫端之值(結果照常落定), 未捕捉例外僅有呼叫已撤銷回調本身者 [R-EXEC-FAIL-01之12、13]`, function() {
        let { r } = runExecFail('rpcCbRevokedLater')
        //規則13: 回調於入口判型一次, 監聽器內不再觸及呼叫端之值; 規則12: 呼叫已撤銷之回調所拋之TypeError經Session之_callUser原樣重拋(revoked:apply), 不得有判型所生者(revoked:has), 同chunk之回應照常送達
        let ok = { ok: true, errorType: '', results: { initialize: { ok: 1 } }, uncaught: ['revoked:apply'] }
        assert.strict.deepStrictEqual(r.out, { onNotify: ok, onServerRequest: ok })
        assert.strict.deepStrictEqual(r.unhandled, []) //規則13: 不reject
    })

    it(`execCliJsonRpc: requests為陷阱非決定性之Proxy陣列(入口讀取後才拋錯)時, 入口後不再迭代呼叫端之陣列: resolve結果物件、子進程經stop()結束而不殘留至逾時 [R-EXEC-FAIL-01之13、14]`, function() {
        let { r } = runExecFail('rpcRequestsTrapLater')
        assert.strict.deepStrictEqual(r.out, {
            ok: true, //規則14: 其後一律用讀取當下之快照(requests於入口讀取為快照, 兩則請求照常送出)
            errorType: '',
            error: '',
            results: { initialize: { ok: 1 }, next: { ok: 1 } },
            childAliveAfter: false, //規則14: 經stop()結束已啟動之子進程(不得殘留至timeoutMs)
        })
        assert.strict.deepStrictEqual([r.unhandled, r.uncaught], [[], []]) //規則13: 讀取一律在try內(或用入口之快照), 不reject、不成為未捕捉例外
    })

    it(`execCliJsonRpc: 選項getter拋出非Error之值(null、undefined、字串)時為params且error保留拋出值之文字, params之toJSON拋出字串時error保留該字串 [R-EXEC-FAIL-01之13、14]`, function() {
        let { r } = runExecFail('rpcThrownValues')
        //規則13: 自身讀取失敗為errorType params(error '<碼>: <訊息>', 無碼者為UNKNOWN; 訊息取getErrorMessage, 為空退_errToStr)
        let x = (m) => ({ ok: false, errorType: 'params', error: `UNKNOWN: ${m}` })
        assert.strict.deepStrictEqual(r.out, {
            null: x('null'), //規則13: 拋出null
            undefined: x('undefined'), //規則13: 拋出undefined
            string: x('thrown-x'), //規則13: 拋出字串
            toJSONThrowsString: { ok: false, errorType: 'params', error: 'initialize: 無法序列化為JSON: thrown-x' }, //規則14: error '<method>: 無法序列化為JSON: <訊息>'(toJSON拋出字串時訊息為該字串)
        })
        assert.strict.deepStrictEqual([r.unhandled, r.uncaught], [[], []]) //規則13、14: 不reject、不成為未捕捉例外
    })

    it(`execCliJsonRpc: requests為空陣列而子進程未啟動(命令不存在、cwd不存在、env不可讀)時errorType為notfound, 不偽回成功 [R-EXEC-FAIL-01之10、13]`, function() {
        let { r } = runExecFail('rpcEmptyRequests')
        assert.strict.deepStrictEqual(r.out, {
            noCmd: { ok: false, errorType: 'notfound', error: 'ENOENT: spawn wsemi-not-exist-zz ENOENT' }, //規則10: 未啟動(session pid為null)一律notfound, 不以錯誤字樣判定
            cwdMissing: { ok: false, errorType: 'notfound', error: `ENOENT: cwd is not an existing folder: <fx>${path.sep}no-such-dir` }, //規則10、7: 同上(cwd不存在, error指明cwd)
            envRevoked: { ok: false, errorType: 'notfound', error: 'UNKNOWN: <revoked>' }, //規則13: env原樣交Session判定, 不可讀為notfound
            started: { ok: true, errorType: '', error: '' }, //規則10(對照): 已啟動且無請求者照常成功
        })
        assert.strict.deepStrictEqual([r.unhandled, r.uncaught], [[], []]) //規則13: 不reject、不成為未捕捉例外
    })

})
