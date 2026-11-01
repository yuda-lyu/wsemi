import fs from 'fs'
import assert from 'assert'
import execCli from '../src/execCli.mjs'
import execCliFailDetail from '../src/execCliFailDetail.mjs'
import strTruncate from '../src/strTruncate.mjs'


describe(`execCliFailDetail`, function() {

    it(`should be exported by index from its own module`, function() {
        //R-SCOPE-01: 對外匯出; index於Node內無法整份載入(viewerjs之css), 故檢查匯出行
        let c = fs.readFileSync(new URL('../src/index.mjs', import.meta.url), 'utf8')
        assert.strict.deepStrictEqual(c.includes(`export { default as execCliFailDetail } from './execCliFailDetail.mjs'`), true)
        assert.strict.deepStrictEqual(typeof execCliFailDetail, 'function')
    })

    //規格(建議檔§5): 回「，共試 N 次 → stderr壓單行取前n字」, 無資訊回空字串, n預設300
    describe(`格式`, function() {

        it(`should return '，共試 N 次 → stderr' with the stderr collapsed to one line`, function() {
            let r = execCliFailDetail({ attempts: 3, stderr: 'line1\nline2\r\n  line3\t\tend\n' })
            assert.strict.deepStrictEqual(r, '，共試 3 次 → line1 line2 line3 end')
        })

        it(`should be directly concatenable after execCli's error string (error + detail)`, function() {
            let r = { ok: false, error: 'Exit code 1', stderr: 'boom\nmore', attempts: 1 }
            assert.strict.deepStrictEqual(`${r.error}${execCliFailDetail(r)}`, 'Exit code 1，共試 1 次 → boom more')
        })

        it(`should return only '，共試 N 次' when stderr is empty or only whitespace`, function() {
            assert.strict.deepStrictEqual(execCliFailDetail({ attempts: 2, stderr: '' }), '，共試 2 次')
            assert.strict.deepStrictEqual(execCliFailDetail({ attempts: 2, stderr: ' \n\t ' }), '，共試 2 次')
            assert.strict.deepStrictEqual(execCliFailDetail({ attempts: 2 }), '，共試 2 次')
        })

        it(`should return only ' → stderr' when attempts is missing or not a non-negative integer`, function() {
            for (let a of [undefined, null, -1, 1.5, NaN, Infinity, 'x', '', ' ', true, false, {}, [], [0], 10n]) {
                assert.strict.deepStrictEqual(execCliFailDetail({ attempts: a, stderr: 'oops' }), ' → oops', `attempts=${String(a)}`)
            }
            assert.strict.deepStrictEqual(execCliFailDetail({ stderr: 'oops' }), ' → oops')
        })

        //規格(srcRunner原契約 cliFailDetail: attempts != null 即顯示, core/ai/caller.mjs:96 零供應商之結果 attempts 為 0; unit-runner.test.mjs:377): attempts為0(含)亦顯示
        it(`should show '，共試 0 次' when attempts is 0 (a failure that never started, e.g. no provider), alone or with stderr`, function() {
            assert.strict.deepStrictEqual(execCliFailDetail({ attempts: 0 }), '，共試 0 次')
            assert.strict.deepStrictEqual(execCliFailDetail({ attempts: 0, stderr: '' }), '，共試 0 次')
            assert.strict.deepStrictEqual(execCliFailDetail({ attempts: 0, stderr: '  \n ' }), '，共試 0 次')
            assert.strict.deepStrictEqual(execCliFailDetail({ attempts: 0, stderr: 'no provider' }), '，共試 0 次 → no provider')
            assert.strict.deepStrictEqual(execCliFailDetail({ attempts: '0', stderr: 'x' }), '，共試 0 次 → x') //數字字串(K4)
            assert.strict.deepStrictEqual(execCliFailDetail({ attempts: -0 }), '，共試 0 次')
        })

        it(`should return an empty string when there is no information (no attempts and empty stderr)`, function() {
            assert.strict.deepStrictEqual(execCliFailDetail({}), '')
            assert.strict.deepStrictEqual(execCliFailDetail({ stderr: '' }), '')
            assert.strict.deepStrictEqual(execCliFailDetail({ stderr: '  \n ' }), '')
            assert.strict.deepStrictEqual(execCliFailDetail({ attempts: 'x', stderr: '' }), '')
            assert.strict.deepStrictEqual(execCliFailDetail({ attempts: -1 }), '')
        })

        it(`should return an empty string when result is not an object (null, undefined, number, string, array, function)`, function() {
            for (let v of [null, undefined, 0, 5, 'attempts', '', true, [], [1], () => 1, Symbol('x')]) {
                assert.strict.deepStrictEqual(execCliFailDetail(v), '', String(typeof v))
            }
            assert.strict.deepStrictEqual(execCliFailDetail(), '')
        })

        it(`should ignore a stderr that is not a string and read only attempts and stderr (other fields never echoed)`, function() {
            let r = { attempts: 1, stderr: { toString: () => 'leak' }, error: 'SECRET-ERROR', stdout: 'SECRET-OUT', env: { K: 'SECRET-ENV' } }
            assert.strict.deepStrictEqual(execCliFailDetail(r), '，共試 1 次')
            assert.strict.deepStrictEqual(execCliFailDetail({ attempts: 1, stderr: 123 }), '，共試 1 次')
            assert.strict.deepStrictEqual(execCliFailDetail({ attempts: 1, stderr: ['a', 'b'] }), '，共試 1 次')
            let r2 = { attempts: 2, stderr: 'ok', error: 'SECRET-ERROR', stdout: 'SECRET-OUT' }
            assert.ok(!execCliFailDetail(r2).includes('SECRET'))
        })

        it(`should not mutate the result object`, function() {
            let r = Object.freeze({ attempts: 2, stderr: 'a\nb', ok: false })
            assert.strict.deepStrictEqual(execCliFailDetail(r), '，共試 2 次 → a b')
            assert.strict.deepStrictEqual(r, { attempts: 2, stderr: 'a\nb', ok: false })
        })

    })

    //規格(建議檔§5): 取前n字, n預設300; 輸入規格K3(opt類參數非預期輸入改用預設)
    describe(`n(取前幾字,預設300)`, function() {

        //規格(srcRunner原契約: stderr 為 oneline(stderr, n) = 壓空白後由 wsemi strTruncate 截斷, 超長補 '...', 未超長原樣): 前n字之後補刪節號
        it(`should take the first 300 characters of the collapsed stderr by default and append '...' when it is longer`, function() {
            let s = 'abcdefghij'.repeat(40) //400字
            let r = execCliFailDetail({ attempts: 1, stderr: s })
            assert.strict.deepStrictEqual(r, `，共試 1 次 → ${s.slice(0, 300)}...`)
            assert.strict.deepStrictEqual(r.length, '，共試 1 次 → '.length + 300 + 3)
        })

        it(`should keep a stderr of exactly n characters whole (no ellipsis) and cut one with n+1 characters with '...'`, function() {
            assert.strict.deepStrictEqual(execCliFailDetail({ attempts: 1, stderr: 'abcde' }, 5), '，共試 1 次 → abcde')
            assert.strict.deepStrictEqual(execCliFailDetail({ attempts: 1, stderr: 'abcdef' }, 5), '，共試 1 次 → abcde...')
            assert.strict.deepStrictEqual(execCliFailDetail({ attempts: 1, stderr: 'abcdef' }, 1), '，共試 1 次 → a...')
            let s = 'x'.repeat(300) //預設n=300, 恰300字不補刪節號
            assert.strict.deepStrictEqual(execCliFailDetail({ attempts: 1, stderr: s }), `，共試 1 次 → ${s}`)
        })

        it(`should count n after collapsing whitespace (newlines count as one space)`, function() {
            assert.strict.deepStrictEqual(execCliFailDetail({ attempts: 1, stderr: 'ab\n\n\ncd' }, 4), '，共試 1 次 → ab c...')
            assert.strict.deepStrictEqual(execCliFailDetail({ attempts: 1, stderr: 'ab\n\n\ncd' }, 5), '，共試 1 次 → ab cd')
        })

        it(`should count characters as strTruncate does (the same function as the original contract, on the collapsed stderr)`, function() {
            //n以字元(UTF-16碼元)計, 與原契約同一函數strTruncate; 比對對象為strTruncate之結果而非自寫的碼點截斷(落在代理對中間時切成半個字元之限制同strTruncate, 見JSDoc)
            for (let s of ['😀😀😀😀', '中文錯誤訊息', 'ab😀cd', 'ab\n😀\n\ncd']) {
                for (let n of [1, 2, 3, 4, 5, 6, 8, 9, 20]) {
                    let want = `，共試 1 次 → ${strTruncate(s.replace(/\s+/g, ' ').trim(), n)}`
                    assert.strict.deepStrictEqual(execCliFailDetail({ attempts: 1, stderr: s }, n), want, `s=${JSON.stringify(s)} n=${n}`)
                }
            }
            assert.strict.deepStrictEqual(execCliFailDetail({ attempts: 1, stderr: '中文錯誤訊息' }, 4), '，共試 1 次 → 中文錯誤...')
            assert.strict.deepStrictEqual(execCliFailDetail({ attempts: 1, stderr: '😀😀' }, 4), '，共試 1 次 → 😀😀') //恰4個碼元, 不超長
        })

        it(`should accept a numeric-string n and use the converted value (K4)`, function() {
            assert.strict.deepStrictEqual(execCliFailDetail({ attempts: 1, stderr: 'abcdef' }, '3'), '，共試 1 次 → abc...')
            assert.strict.deepStrictEqual(execCliFailDetail({ attempts: 1, stderr: 'abcdef' }, ' 2 '), '，共試 1 次 → ab...')
        })

        it(`should treat an unexpected n (0, negative, non-integer, NaN, non-number) as not given and use 300 (K3)`, function() {
            let s = 'x'.repeat(350)
            let want = `，共試 1 次 → ${'x'.repeat(300)}...`
            for (let n of [0, -1, 1.5, NaN, Infinity, 'x', '', null, undefined, true, {}, [], [3], 10n]) {
                assert.strict.deepStrictEqual(execCliFailDetail({ attempts: 1, stderr: s }, n), want, `n=${String(typeof n)}:${String(n)}`)
            }
        })

    })

    //R-EXEC-FAIL-01之精神: 永不拋錯, 不可讀之輸入視為無資訊
    describe(`永不拋錯`, function() {

        it(`should return an empty string when reading result throws (getter throws, revoked Proxy)`, function() {
            let r1 = {
                get attempts() {
                    throw new Error('boom')
                },
                stderr: 'x'
            }
            let r2 = {
                attempts: 1,
                get stderr() {
                    throw new Error('boom')
                }
            }
            let p = Proxy.revocable({}, {})
            p.revoke()
            assert.strict.deepStrictEqual(execCliFailDetail(r1), '')
            assert.strict.deepStrictEqual(execCliFailDetail(r2), '')
            assert.strict.deepStrictEqual(execCliFailDetail(p.proxy), '')
            assert.doesNotThrow(() => execCliFailDetail(null, null))
        })

    })

    //整合: 取自真實execCli失敗結果(子行程以process.execPath起, 不連網)
    describe(`與execCli整合`, function() {

        this.timeout(60000)

        it(`should summarize a real failed execCli result: attempts and the first part of multi-line stderr in one line`, async function() {
            let r = await execCli(process.execPath, ['-e', 'console.error("line1\\nline2"); process.exit(1)'], { maxRetries: 1, retryDelayMs: 1 })
            assert.strict.deepStrictEqual([r.ok, r.attempts], [false, 2])
            assert.strict.deepStrictEqual(execCliFailDetail(r), '，共試 2 次 → line1 line2')
            assert.strict.deepStrictEqual(`${r.error}${execCliFailDetail(r)}`, 'Exit code 1，共試 2 次 → line1 line2')
        })

        it(`should give only the attempts for a failure without stderr (timeout-free non-zero exit)`, async function() {
            let r = await execCli(process.execPath, ['-e', 'process.exit(3)'])
            assert.strict.deepStrictEqual(execCliFailDetail(r), '，共試 1 次')
        })

        it(`should give '，共試 0 次' for execCli's invalid-command result (attempts 0, no stderr; shown as in the original contract)`, async function() {
            let r = await execCli('')
            assert.strict.deepStrictEqual([r.ok, r.attempts, r.stderr], [false, 0, ''])
            assert.strict.deepStrictEqual(execCliFailDetail(r), '，共試 0 次')
        })

    })

    //原測試逐字移植(輸入與期望值逐字相同, 僅斷言函數改用assert.strict, 函數名cliFailDetail→execCliFailDetail): srcRunner之 cliFailDetail 原測試
    describe(`原契約逐字(srcRunner 原測試)`, function() {

        //srcRunner/test/unit-runner.test.mjs:67-69
        it(`cliFailDetail 帶次數與 stderr (unit-runner.test.mjs:67-69)`, function() {
            assert.strict.equal(execCliFailDetail({ attempts: 3, stderr: 'boom\nat x' }), '，共試 3 次 → boom at x')
            assert.strict.equal(execCliFailDetail({}), '')
            assert.strict.equal(execCliFailDetail({ attempts: 1 }), '，共試 1 次')
        })

        //srcRunner/test/unit-runner.test.mjs:110(logger.cliFail = `${error}${cliFailDetail}`; 本套件以 `${r.error}${execCliFailDetail(r)}` 串接)
        it(`error 字串後串接失敗摘要 (unit-runner.test.mjs:110)`, function() {
            let r = { error: 'Exit code 1', attempts: 2, stderr: 'ENOENT x' }
            assert.strict.equal(`${r.error}${execCliFailDetail(r)}`, 'Exit code 1，共試 2 次 → ENOENT x')
        })

        //srcRunner/test/unit-util.test.mjs:115-117
        it(`cliFailDetail 只有 stderr、null、自訂保留長度 (unit-util.test.mjs:115-117)`, function() {
            assert.strict.equal(execCliFailDetail({ stderr: 'only stderr' }), ' → only stderr')
            assert.strict.equal(execCliFailDetail(null), '')
            assert.strict.equal(execCliFailDetail({ stderr: 'x'.repeat(50) }, 10), ` → ${'x'.repeat(10)}...`, 'stderr 保留長度可調')
        })

    })

})
