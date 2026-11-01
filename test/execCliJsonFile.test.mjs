import fs from 'fs'
import assert from 'assert'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import execCliJsonFile from '../src/execCliJsonFile.mjs'
import { runChildCase } from './tools/runChildCase.mjs'


let __dirname = dirname(fileURLToPath(import.meta.url))
let fdFix = join(__dirname, '_tmp', 'execCliJsonFile') //測試夾具(子行程腳本與結果檔), after刪除
let runner = join(__dirname, 'tools', 'execCliJsonFileRunner.mjs')
let node = process.execPath


//子行程腳本: 約定以[...args, outputPath]接收參數, 結果寫入outputPath
let scripts = {

    //回報收到之參數(不含outputPath)與工作目錄
    'echo.mjs': `
import fs from 'fs'
let a = process.argv.slice(2)
fs.writeFileSync(a[a.length - 1], JSON.stringify({ args: a.slice(0, -1), cwd: process.cwd(), last: a[a.length - 1] }))
`,

    //stdout與stderr各有進度行(含雜訊行、跨寫入之半行、無換行結尾之殘行); 半行以30ms間隔分兩次寫入,父行程是否收成兩個chunk取決於系統,斷言對兩種情形皆成立(不閃爍);確定性之跨chunk覆蓋見_makeLineEmitter.test.mjs
    'progress.mjs': `
import fs from 'fs'
let out = process.argv[process.argv.length - 1]
fs.writeSync(1, '[p] step1\\nnoise-out\\n[p] sp')
Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 30)
fs.writeSync(1, 'lit\\n\\n')
fs.writeSync(2, '[p] e1\\nnoise-err\\n[p] tail-no-newline')
fs.writeFileSync(out, JSON.stringify({ ok: 1 }))
`,

    //進度行帶前後空白與Windows式行尾\r\n, 另有空白行與純空白行(切行器逐行trim, 見_makeLineEmitter.test.mjs)
    'progressWs.mjs': `
import fs from 'fs'
let out = process.argv[process.argv.length - 1]
fs.writeSync(1, '  [p] indented \\r\\n   \\n\\t\\n[p] b\\r\\n\\u00a0\\n')
fs.writeSync(2, '  \\n [p] e \\n')
fs.writeSync(1, '   [p] tail  ')
fs.writeFileSync(out, JSON.stringify({ ok: 1 }))
`,

    //srcRunner原測試 unit-runner.test.mjs:301-310 之腳本(逐字): 半行跨兩次寫入、雜訊行、stderr行、mode為fail時失敗
    'verbatim299.mjs': `
import fs from 'node:fs';
const out = process.argv[process.argv.length - 1];
const mode = process.argv[2];
process.stdout.write('[fetchWeb] try curl\\n[noise] ignore\\n[fetchWeb] ha');
process.stdout.write('lf-line\\n');
process.stderr.write('[fetchWeb] blocked\\n');
if (mode === 'fail') { console.error('ENOENT: script missing'); process.exit(1); }
fs.writeFileSync(out, JSON.stringify({ status: 'ok', mode, len: 3 }));
`,

    //失敗: stderr多行, 離開碼1
    'fail.mjs': `
console.error('boom\\nline2')
process.exit(1)
`,

    //第一次嘗試(無標記檔)輸出無換行之半行並失敗, 第二次嘗試成功
    'failOnce.mjs': `
import fs from 'fs'
let a = process.argv.slice(2)
let marker = a[0]
let out = a[a.length - 1]
if (!fs.existsSync(marker)) {
    fs.writeFileSync(marker, '1')
    fs.writeSync(1, '[p] first-half')
    process.exit(1)
}
fs.writeSync(1, '[p] second\\n')
fs.writeFileSync(out, JSON.stringify({ attempt: 2 }))
`,

    //永不結束(逾時用), 先把自己的pid寫入第1個參數所指之檔案
    'hang.mjs': `
import fs from 'fs'
fs.writeFileSync(process.argv[2], String(process.pid))
setInterval(() => {}, 1000)
`,

    'badjson.mjs': `
import fs from 'fs'
fs.writeFileSync(process.argv[process.argv.length - 1], 'not json{')
`,

    'empty.mjs': `
import fs from 'fs'
fs.writeFileSync(process.argv[process.argv.length - 1], '')
`,

    //離開碼0但不寫結果檔
    'nowrite.mjs': `
console.log('nothing written')
`,

    //結果內容由第1個參數決定
    'types.mjs': `
import fs from 'fs'
let a = process.argv.slice(2)
let vals = { array: [1, 'a', null], null: null, num: 5, str: 's', obj: { status: 'error', message: 'from-script' } }
fs.writeFileSync(a[a.length - 1], JSON.stringify(vals[a[0]]))
`,

    //寫入標記檔(證明有被啟動), 再寫結果
    'marker.mjs': `
import fs from 'fs'
let a = process.argv.slice(2)
fs.writeFileSync(a[0], '1')
fs.writeFileSync(a[a.length - 1], JSON.stringify({ ok: 1 }))
`,

}


describe(`execCliJsonFile`, function() {

    this.timeout(120000)

    before(function() {
        fs.rmSync(fdFix, { recursive: true, force: true })
        fs.mkdirSync(join(fdFix, '空 格 dir'), { recursive: true })
        for (let [fn, c] of Object.entries(scripts)) {
            fs.writeFileSync(join(fdFix, fn), c, 'utf8')
        }
        fs.writeFileSync(join(fdFix, '空 格 dir', '中文 echo.mjs'), scripts['echo.mjs'], 'utf8')
    })

    after(function() {
        fs.rmSync(fdFix, { recursive: true, force: true })
    })

    let sc = (fn) => join(fdFix, fn)
    let outp = (name) => join(fdFix, name)

    it(`should be exported by index from its own module, while the line splitter stays internal (not exported)`, function() {
        //R-SCOPE-01: 公開面只收execCliJsonFile; makeLineEmitter為內部模組(底線檔不進index); index於Node內無法整份載入, 故檢查匯出行
        let c = fs.readFileSync(new URL('../src/index.mjs', import.meta.url), 'utf8')
        assert.strict.deepStrictEqual(c.includes(`export { default as execCliJsonFile } from './execCliJsonFile.mjs'`), true)
        assert.strict.deepStrictEqual(c.includes('makeLineEmitter'), false)
    })

    //規格(建議檔§2): 參數排列固定為[script, ...args, outputPath]; 成功回JSON.parse之結果
    describe(`成功`, function() {

        it(`should run the script with [script, ...args, outputPath] and return the parsed JSON of the output file`, async function() {
            let o = outp('o-echo.json')
            let r = await execCliJsonFile({ script: sc('echo.mjs'), outputPath: o, exe: node, args: ['a', '中文', 'c d'] })
            assert.strict.deepStrictEqual({ args: r.args, last: r.last }, { args: ['a', '中文', 'c d'], last: o })
        })

        it(`should pass only outputPath when args is not given`, async function() {
            let o = outp('o-echo0.json')
            let r = await execCliJsonFile({ script: sc('echo.mjs'), outputPath: o, exe: node })
            assert.strict.deepStrictEqual({ args: r.args, last: r.last }, { args: [], last: o })
        })

        it(`should work with a script path and output path containing spaces and Chinese characters`, async function() {
            let o = join(fdFix, '空 格 dir', '結果 輸出.json')
            let r = await execCliJsonFile({ script: join(fdFix, '空 格 dir', '中文 echo.mjs'), outputPath: o, exe: node, args: ['參 數'] })
            assert.strict.deepStrictEqual({ args: r.args, last: r.last }, { args: ['參 數'], last: o })
        })

        it(`should run in opt.cwd`, async function() {
            let dir = join(fdFix, '空 格 dir')
            let r = await execCliJsonFile({ script: sc('echo.mjs'), outputPath: outp('o-cwd.json'), exe: node, cwd: dir })
            assert.strict.deepStrictEqual(fs.realpathSync(r.cwd), fs.realpathSync(dir))
        })

        it(`should use 'node' as exe when exe is not given`, async function() {
            let r = await execCliJsonFile({ script: sc('echo.mjs'), outputPath: outp('o-exe.json'), args: ['x'] })
            assert.strict.deepStrictEqual(r.args, ['x'])
        })

        it(`should return the JSON value as is, whatever its type (array, null, number, string); a status key written by the script is returned untouched`, async function() {
            let rs = {}
            for (let k of ['array', 'null', 'num', 'str', 'obj']) {
                rs[k] = await execCliJsonFile({ script: sc('types.mjs'), outputPath: outp(`o-${k}.json`), exe: node, args: [k] })
            }
            assert.strict.deepStrictEqual(rs, { array: [1, 'a', null], null: null, num: 5, str: 's', obj: { status: 'error', message: 'from-script' } })
        })

    })

    //規格(建議檔§2): 失敗也回結構化物件而非拋錯; message=error字串+共試次數+stderr前段(壓單行)
    describe(`失敗以結構化物件回報(不reject)`, function() {

        it(`should return { status: 'error', message } with attempts and the one-line stderr when the script exits non-zero`, async function() {
            let r = await execCliJsonFile({ script: sc('fail.mjs'), outputPath: outp('o-fail.json'), exe: node })
            assert.strict.deepStrictEqual(r, { status: 'error', message: 'Exit code 1，共試 1 次 → boom line2' })
        })

        it(`should count the attempts when maxRetries is given`, async function() {
            let r = await execCliJsonFile({ script: sc('fail.mjs'), outputPath: outp('o-fail2.json'), exe: node, maxRetries: 2, retryDelayMs: 1 })
            assert.strict.deepStrictEqual(r, { status: 'error', message: 'Exit code 1，共試 3 次 → boom line2' })
        })

        it(`should return a structured error when the script does not exist (node cannot find the module)`, async function() {
            let r = await execCliJsonFile({ script: outp('no-such-script.mjs'), outputPath: outp('o-nos.json'), exe: node })
            assert.strict.deepStrictEqual(Object.keys(r), ['status', 'message'])
            assert.strict.deepStrictEqual(r.status, 'error')
            assert.ok(r.message.startsWith('Exit code 1，共試 1 次 → '), r.message)
            assert.ok(r.message.includes('Cannot find module'), r.message)
        })

        it(`should return a structured error when the executable does not exist`, async function() {
            let r = await execCliJsonFile({ script: sc('echo.mjs'), outputPath: outp('o-noexe.json'), exe: 'no-such-exe-wsemi41' })
            assert.strict.deepStrictEqual(r.status, 'error')
            assert.ok(r.message.includes('ENOENT'), r.message)
        })

        it(`should return a structured error with TIMEOUT when the script runs longer than timeoutMs, and not leave the process behind`, async function() {
            let pidFile = outp('hang.pid')
            fs.rmSync(pidFile, { force: true })
            let r = await execCliJsonFile({ script: sc('hang.mjs'), outputPath: outp('o-hang.json'), exe: node, args: [pidFile], timeoutMs: 1000 })
            assert.strict.deepStrictEqual(r.status, 'error')
            assert.ok(r.message.startsWith('TIMEOUT after '), r.message)
            let pid = Number(fs.readFileSync(pidFile, 'utf8'))
            assert.ok(pid > 0, 'the script must have started')
            let code = ''
            try {
                process.kill(pid, 0)
            }
            catch (err) {
                code = err.code
            }
            assert.strict.deepStrictEqual(code, 'ESRCH') //逾時後子進程已被終止(不殘留)
        })

        it(`should return 'JSON parse failed: ...' when the output file is not valid JSON`, async function() {
            let r = await execCliJsonFile({ script: sc('badjson.mjs'), outputPath: outp('o-bad.json'), exe: node })
            assert.strict.deepStrictEqual(r.status, 'error')
            assert.ok(r.message.startsWith('JSON parse failed: '), r.message)
            assert.ok(r.message.length > 'JSON parse failed: '.length)
        })

        it(`should return 'JSON parse failed: ...' when the output file is empty`, async function() {
            let r = await execCliJsonFile({ script: sc('empty.mjs'), outputPath: outp('o-empty.json'), exe: node })
            assert.strict.deepStrictEqual(r.status, 'error')
            assert.ok(r.message.startsWith('JSON parse failed: '), r.message)
        })

        it(`should return 'JSON parse failed: ...' when the script exits 0 without writing the output file`, async function() {
            let o = outp('o-nowrite.json')
            fs.rmSync(o, { force: true })
            let r = await execCliJsonFile({ script: sc('nowrite.mjs'), outputPath: o, exe: node })
            assert.strict.deepStrictEqual(r.status, 'error')
            assert.ok(r.message.startsWith('JSON parse failed: '), r.message)
            assert.ok(r.message.includes('ENOENT'), r.message)
        })

        it(`should never reject for any of the failures above (the promise resolves)`, async function() {
            let ps = [
                execCliJsonFile({ script: sc('fail.mjs'), outputPath: outp('o-n1.json'), exe: node }),
                execCliJsonFile({ script: sc('badjson.mjs'), outputPath: outp('o-n2.json'), exe: node }),
                execCliJsonFile({ script: sc('echo.mjs'), outputPath: outp('o-n3.json'), exe: 'no-such-exe-wsemi41' }),
            ]
            let rs = await Promise.allSettled(ps)
            assert.strict.deepStrictEqual(rs.map((v) => v.status), ['fulfilled', 'fulfilled', 'fulfilled'])
        })

    })

    //規格(建議檔§2): onProgress(line,isErr)經兩個行切分器分流; progressPrefix只回以其開頭之行; 半行跨chunk仍拼成整行
    describe(`進度回調 onProgress`, function() {

        let run = async (opt) => {
            let lines = []
            let r = await execCliJsonFile({
                script: sc('progress.mjs'),
                outputPath: outp('o-progress.json'),
                exe: node,
                onProgress: (line, isErr) => {
                    lines.push([line, isErr])
                },
                ...opt,
            })
            return { r, out: lines.filter((v) => v[1] === false).map((v) => v[0]), err: lines.filter((v) => v[1] === true).map((v) => v[0]) }
        }

        it(`should call onProgress(line, isErr) per complete line, separating stdout (false) and stderr (true), and a line split across writes stays one line`, async function() {
            let { r, out, err } = await run({})
            assert.strict.deepStrictEqual(r, { ok: 1 })
            assert.strict.deepStrictEqual(out, ['[p] step1', 'noise-out', '[p] split']) //空行不回報
            assert.strict.deepStrictEqual(err, ['[p] e1', 'noise-err', '[p] tail-no-newline']) //無換行之殘行於結束後補回報
        })

        it(`should pass only the lines starting with progressPrefix (both streams)`, async function() {
            let { out, err } = await run({ progressPrefix: '[p]' })
            assert.strict.deepStrictEqual(out, ['[p] step1', '[p] split'])
            assert.strict.deepStrictEqual(err, ['[p] e1', '[p] tail-no-newline'])
        })

        it(`should treat a non-string progressPrefix as '' (every line)`, async function() {
            for (let p of [5, null, {}, [], true]) {
                let { out } = await run({ progressPrefix: p })
                assert.strict.deepStrictEqual(out, ['[p] step1', 'noise-out', '[p] split'], String(typeof p))
            }
        })

        //規格(srcRunner原契約, 逐行trim): onProgress收到之行已去前後空白(含\r), 純空白行不回報, 前綴比對用trim後之字串, 殘行亦同
        it(`should call onProgress with trimmed lines (leading and trailing whitespace including \\r removed), skip whitespace-only lines, and trim the left-over half line too`, async function() {
            let { r, out, err } = await run({ script: sc('progressWs.mjs') })
            assert.strict.deepStrictEqual(r, { ok: 1 })
            assert.strict.deepStrictEqual(out, ['[p] indented', '[p] b', '[p] tail'])
            assert.strict.deepStrictEqual(err, ['[p] e'])
        })

        it(`should match progressPrefix against the trimmed line (an indented prefixed line is passed, without its indent)`, async function() {
            let { out, err } = await run({ script: sc('progressWs.mjs'), progressPrefix: '[p]' })
            assert.strict.deepStrictEqual(out, ['[p] indented', '[p] b', '[p] tail'])
            assert.strict.deepStrictEqual(err, ['[p] e'])
        })

        it(`should ignore a non-function onProgress (no progress, result still returned)`, async function() {
            for (let f of ['x', 5, {}, [], true, null]) {
                let r = await execCliJsonFile({ script: sc('progress.mjs'), outputPath: outp('o-progress2.json'), exe: node, onProgress: f })
                assert.strict.deepStrictEqual(r, { ok: 1 }, String(typeof f))
            }
        })

        it(`should report progress lines of a failed run too (stderr before the failure)`, async function() {
            let lines = []
            let r = await execCliJsonFile({ script: sc('fail.mjs'), outputPath: outp('o-failp.json'), exe: node, onProgress: (l, e) => lines.push([l, e]) })
            assert.strict.deepStrictEqual(r.status, 'error')
            assert.strict.deepStrictEqual(lines, [['boom', true], ['line2', true]])
        })

        it(`should flush the half line left by a failed attempt before the next attempt starts (not glued to the next attempt's first output)`, async function() {
            let marker = outp('marker-failonce')
            fs.rmSync(marker, { force: true })
            let lines = []
            let r = await execCliJsonFile({
                script: sc('failOnce.mjs'),
                outputPath: outp('o-failonce.json'),
                exe: node,
                args: [marker],
                maxRetries: 1,
                retryDelayMs: 1,
                progressPrefix: '[p]',
                onProgress: (l, e) => lines.push([l, e]),
            })
            assert.strict.deepStrictEqual(r, { attempt: 2 })
            assert.strict.deepStrictEqual(lines.filter((v) => v[1] === false).map((v) => v[0]), ['[p] first-half', '[p] second'])
        })

        it(`should report the half line of an attempt when that attempt settles (before the retry wait), not only when the next attempt starts`, async function() {
            let marker = outp('marker-failonce2')
            fs.rmSync(marker, { force: true })
            let timeline = []
            let r = await execCliJsonFile({
                script: sc('failOnce.mjs'),
                outputPath: outp('o-failonce2.json'),
                exe: node,
                args: [marker],
                maxRetries: 1,
                retryDelayMs: 1,
                progressPrefix: '[p]',
                onProgress: (l) => timeline.push(`line:${l}`),
                onTrace: (e) => timeline.push(`trace:${e.type}`),
            })
            assert.strict.deepStrictEqual(r, { attempt: 2 })
            //事件順序(不依時間): 第1次嘗試之殘行須在其settle之後、第2次嘗試之retry事件之前即回報
            let iFirst = timeline.indexOf('line:[p] first-half')
            let iSettle = timeline.indexOf('trace:settle')
            let iRetry = timeline.indexOf('trace:retry')
            assert.ok(iFirst >= 0 && iSettle >= 0 && iRetry >= 0, JSON.stringify(timeline))
            assert.ok(iFirst < iRetry, JSON.stringify(timeline))
            assert.ok(iFirst < iSettle, JSON.stringify(timeline)) //補回報先於使用者看到settle事件
        })

    })

    //原測試移植: srcRunner之 runJsonCli 原測試(unit-runner.test.mjs:299-323)的斷言逐字相同(onProgress行集、失敗訊息、缺漏拋錯); 僅函數名runJsonCli→execCliJsonFile, 路徑改本測試夾具, 加exe: node(process.execPath)
    describe(`原契約逐字(srcRunner unit-runner.test.mjs:299-323)`, function() {

        it(`runJsonCli：子進程寫 JSON 檔讀回；進度行依前綴過濾、stdout/stderr 分流、半行緩衝；失敗回 {status:error} 含共試次數與 stderr 前段 (unit-runner.test.mjs:299-319)`, async function() {
            const script = sc('verbatim299.mjs')
            const lines = []
            const r = await execCliJsonFile({ script, args: ['okmode'], outputPath: outp('out1.json'), exe: node, timeoutMs: 30000, progressPrefix: '[fetchWeb]', onProgress: (l, isErr) => lines.push(`${isErr ? 'E' : 'O'}:${l}`) })
            assert.strict.deepEqual(r, { status: 'ok', mode: 'okmode', len: 3 })
            assert.strict.deepEqual(lines.sort(), ['E:[fetchWeb] blocked', 'O:[fetchWeb] half-line', 'O:[fetchWeb] try curl'])
            const bad = await execCliJsonFile({ script, args: ['fail'], outputPath: outp('out2.json'), exe: node, timeoutMs: 30000, maxRetries: 1 })
            assert.strict.equal(bad.status, 'error')
            assert.match(bad.message, /共試 \d+ 次 → .*ENOENT: script missing/)
            await assert.rejects(() => execCliJsonFile({ outputPath: 'x' }), /需要 script/)
            await assert.rejects(() => execCliJsonFile({ script }), /需要 outputPath/)
        })

    })

    //規格(建議檔§2/§0 順手補): retryDelayMs透傳(execCli本就支援); 觀察回調onTrace轉交execCli(R-TRACE-01: 以事件同步, 不以延時)
    describe(`重試與觀察回調 onTrace`, function() {

        it(`should pass retryDelayMs to execCli (retry intervals are retryDelayMs * n)`, async function() {
            let evs = []
            let r = await execCliJsonFile({
                script: sc('fail.mjs'),
                outputPath: outp('o-retry.json'),
                exe: node,
                maxRetries: 2,
                retryDelayMs: 3,
                onTrace: (e) => evs.push(e),
            })
            assert.strict.deepStrictEqual(r.status, 'error')
            let retries = evs.filter((e) => e.type === 'retry').map((e) => ({ n: e.n, ms: e.ms }))
            assert.strict.deepStrictEqual(retries, [{ n: 2, ms: 3 }, { n: 3, ms: 6 }])
            assert.strict.deepStrictEqual(evs.filter((e) => e.type === 'attempt').map((e) => e.n), [1, 2, 3])
            let done = evs.filter((e) => e.type === 'done')
            assert.strict.deepStrictEqual(done.map((e) => ({ n: e.n, ok: e.ok, reason: e.reason })), [{ n: 3, ok: false, reason: 'exhausted' }])
        })

        it(`should pass maxRetries to execCli (default 0: a single attempt, no retry event)`, async function() {
            let evs = []
            await execCliJsonFile({ script: sc('fail.mjs'), outputPath: outp('o-retry0.json'), exe: node, onTrace: (e) => evs.push(e) })
            assert.strict.deepStrictEqual(evs.filter((e) => e.type === 'attempt').map((e) => e.n), [1])
            assert.strict.deepStrictEqual(evs.filter((e) => e.type === 'retry').length, 0)
        })

        it(`should ignore an unexpected maxRetries/retryDelayMs/timeoutMs (use defaults, no crash)`, async function() {
            for (let v of [-1, 1.5, 'x', null, NaN, {}]) {
                let r = await execCliJsonFile({ script: sc('fail.mjs'), outputPath: outp('o-bad-opt.json'), exe: node, maxRetries: v, retryDelayMs: v, timeoutMs: v })
                assert.strict.deepStrictEqual(r, { status: 'error', message: 'Exit code 1，共試 1 次 → boom line2' }, String(v))
            }
        })

        it(`should keep working when the onTrace callback throws or returns a rejected promise`, async function() {
            let r1 = await execCliJsonFile({
                script: sc('echo.mjs'),
                outputPath: outp('o-tr1.json'),
                exe: node,
                onTrace: () => {
                    throw new Error('trace-boom')
                }
            })
            let r2 = await execCliJsonFile({ script: sc('echo.mjs'), outputPath: outp('o-tr2.json'), exe: node, onTrace: () => Promise.reject(new Error('trace-rej')) })
            assert.strict.deepStrictEqual([r1.last, r2.last], [outp('o-tr1.json'), outp('o-tr2.json')])
        })

        it(`should behave the same with a non-function onTrace (5 kinds: undefined, null, number, string, object)`, async function() {
            for (let t of [undefined, null, 5, 'x', {}]) {
                let r = await execCliJsonFile({ script: sc('fail.mjs'), outputPath: outp('o-tr-nf.json'), exe: node, onTrace: t })
                assert.strict.deepStrictEqual(r, { status: 'error', message: 'Exit code 1，共試 1 次 → boom line2' }, String(typeof t))
            }
        })

    })

    //規格: 輸入參數之檢測機制 K2(必須參數不合即拋: 此為回傳Promise者, 故reject, 不同步throw) / K3(opt非預期輸入改用預設)
    describe(`輸入檢測(K2/K3)`, function() {

        it(`should reject with 'execCliJsonFile 需要 script' when opt is not an object or script is missing or not a non-empty string`, async function() {
            let marker = outp('marker-nospawn')
            fs.rmSync(marker, { force: true })
            let opts = [undefined, null, 'x', 5, true, [], () => 1, {}, { outputPath: 'o.json' }]
            for (let s of [undefined, null, '', 5, true, {}, [], ['a.mjs'], Object(sc('marker.mjs'))]) {
                //String包裝物件亦拒收(傳給spawn者只收原始字串)
                opts.push({ script: s, outputPath: outp('o-k2.json'), exe: node, args: [marker] })
            }
            for (let o of opts) {
                await assert.rejects(execCliJsonFile(o), { name: 'Error', message: 'execCliJsonFile 需要 script' }, JSON.stringify(o))
            }
            assert.strict.deepStrictEqual(fs.existsSync(marker), false)
        })

        it(`should reject with 'execCliJsonFile 需要 outputPath' when outputPath is missing or not a non-empty string, without starting the process`, async function() {
            let marker = outp('marker-nospawn2')
            fs.rmSync(marker, { force: true })
            for (let p of [undefined, null, '', 5, true, {}, [], ['o.json'], Object(outp('o.json'))]) {
                await assert.rejects(execCliJsonFile({ script: sc('marker.mjs'), outputPath: p, exe: node, args: [marker] }), { name: 'Error', message: 'execCliJsonFile 需要 outputPath' })
            }
            assert.strict.deepStrictEqual(fs.existsSync(marker), false)
        })

        it(`should not throw synchronously (an async function: invalid input becomes a rejection)`, function() {
            let p
            assert.doesNotThrow(() => {
                p = execCliJsonFile()
            })
            assert.ok(p instanceof Promise)
            return assert.rejects(p, /需要 script/)
        })

        it(`should treat a non-array args as not given (no crash, only outputPath is passed)`, async function() {
            for (let a of [null, 'abc', {}, 5, true, { length: 1, 0: 'x' }]) {
                let r = await execCliJsonFile({ script: sc('echo.mjs'), outputPath: outp('o-args.json'), exe: node, args: a })
                assert.strict.deepStrictEqual(r.args, [], String(typeof a))
            }
        })

        it(`should use 'node' when exe is not a non-empty string`, async function() {
            for (let e of ['', 5, null, true, {}, [], Object(node)]) {
                let r = await execCliJsonFile({ script: sc('echo.mjs'), outputPath: outp('o-exe2.json'), exe: e, args: ['x'] })
                assert.strict.deepStrictEqual(r.args, ['x'], String(typeof e))
            }
        })

        //審查發現: 相對outputPath搭配opt.cwd時, 子進程寫入cwd下, 本函數須讀同一位置(原讀本進程工作目錄)
        it(`should read a relative outputPath relative to opt.cwd (the folder the script writes it in), and relative to the current folder when cwd is not given`, async function() {
            let dir = join(fdFix, '空 格 dir')
            let rel = 'rel-out.json'
            fs.rmSync(join(dir, rel), { force: true })
            let r = await execCliJsonFile({ script: sc('echo.mjs'), outputPath: rel, exe: node, cwd: dir, args: ['a'] })
            assert.strict.deepStrictEqual({ args: r.args, last: r.last }, { args: ['a'], last: rel }) //腳本收到之outputPath原樣
            assert.strict.deepStrictEqual(fs.existsSync(join(dir, rel)), true)
            assert.strict.deepStrictEqual(fs.existsSync(join(process.cwd(), rel)), false) //沒有寫到本進程工作目錄
            //未給cwd: 相對於本進程工作目錄(以相對於repo根之路徑)
            let rel2 = join('test', '_tmp', 'execCliJsonFile', 'rel-out2.json')
            let r2 = await execCliJsonFile({ script: sc('echo.mjs'), outputPath: rel2, exe: node })
            assert.strict.deepStrictEqual(r2.last, rel2)
        })

        //審查發現: 輸入不可讀時原為reject(與execCli之入口不可讀以結果物件回報不一致)
        it(`should return a structured error (not reject) when opt or an option value is unreadable (revoked Proxy, throwing getter)`, async function() {
            let p = Proxy.revocable({}, {})
            p.revoke()
            let g = (k) => {
                let o = { script: sc('echo.mjs'), outputPath: outp('o-unread.json'), exe: node }
                Object.defineProperty(o, k, {
                    get() {
                        throw new Error(`getter-${k}`)
                    },
                    enumerable: true
                })
                return o
            }
            let revArgs = Proxy.revocable([], {})
            revArgs.revoke()
            let cases = [p.proxy, g('script'), g('outputPath'), g('timeoutMs'), g('cwd'), g('onProgress'), g('onTrace'), g('args'), g('exe'), { script: sc('echo.mjs'), outputPath: outp('o-unread.json'), exe: node, args: revArgs.proxy }]
            for (let o of cases) {
                let r = await execCliJsonFile(o)
                assert.strict.deepStrictEqual(Object.keys(r), ['status', 'message'])
                assert.strict.deepStrictEqual(r.status, 'error')
                assert.ok(/^UNKNOWN: /.test(r.message), r.message)
            }
        })

        it(`should use opt.cwd only when it is an existing folder (the execCli rule), else report a structured error`, async function() {
            let r = await execCliJsonFile({ script: sc('echo.mjs'), outputPath: outp('o-cwd2.json'), exe: node, cwd: outp('no-such-folder') })
            assert.strict.deepStrictEqual(r.status, 'error')
            assert.ok(r.message.includes('cwd is not an existing folder'), r.message)
        })

    })

    //onProgress拋錯: 同execCli之onStdout(不影響輸出累積與結果, 錯誤原樣重拋為未捕捉例外); 於子行程執行以免污染mocha
    describe(`onProgress拋錯(子行程)`, function() {

        //stdout側與stderr側各自驗(只在一側拋錯), 以免一側被吞而另一側仍拋致整體斷言通過
        for (let which of ['progressThrowsOut', 'progressThrowsErr']) {
            it(`should keep the result and the other progress lines, and rethrow the callback error as an uncaught exception (same as execCli onStdout), case ${which}`, function() {
                let { r } = runChildCase(runner, which, { env: { ...process.env, WSEMI41_FIXTURE_DIR: fdFix } })
                assert.strict.deepStrictEqual(r.result, { ok: 1 })
                assert.strict.deepStrictEqual(r.out, ['[p] step1', 'noise-out', '[p] split'])
                assert.strict.deepStrictEqual(r.err, ['[p] e1', 'noise-err', '[p] tail-no-newline'])
                assert.ok(r.uncaught.length >= 1, 'the callback error must surface as an uncaught exception')
                assert.strict.deepStrictEqual([...new Set(r.uncaught)], ['cb-boom'])
            })
        }

    })

})
