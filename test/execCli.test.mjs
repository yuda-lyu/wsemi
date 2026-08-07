import assert from 'assert'
import execCli, { truncate } from '../src/execCli.mjs'


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

})


describe(`execCli.truncate`, function() {

    it(`should return '' when input is not an effective string`, function() {
        assert.strict.deepStrictEqual(truncate(null, 10), '')
        assert.strict.deepStrictEqual(truncate('', 10), '')
        assert.strict.deepStrictEqual(truncate(123, 10), '')
    })

    it(`should return original string when it is not longer than maxLen`, function() {
        assert.strict.deepStrictEqual(truncate('abc', 10), 'abc')
        assert.strict.deepStrictEqual(truncate('abcde', 5), 'abcde')
    })

    it(`should cut and mark total length when string is longer than maxLen`, function() {
        assert.strict.deepStrictEqual(truncate('abcdefghij', 3), 'abc...(truncated, total 10 chars)')
    })

    it(`should return original string when maxLen is invalid`, function() {
        assert.strict.deepStrictEqual(truncate('abcdefghij', -1), 'abcdefghij')
        assert.strict.deepStrictEqual(truncate('abcdefghij', null), 'abcdefghij')
    })

})
