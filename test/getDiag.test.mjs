import fs from 'fs'
import assert from 'assert'
import getDiag from '../src/getDiag.mjs'
import getDiagSecrets from '../src/getDiagSecrets.mjs'
import corpus from '../src/_diagCases.mjs'
import diagSuite from './tools/diagSuite.mjs'
import { names } from './tools/diagCaseRunner.mjs'


//getDiag為診斷輸出之出口, 規則見sgud/rule/rulebook_diag.md之R-DIAG-01(跨套件規格: 主控dspec〈診斷輸出與遮罩〉)


describe(`getDiag`, function() {

    it(`should export the 9 diag functions from index`, function() {
        //R-DIAG-01 規則1: 單一實作由wsemi對外匯出; index於Node內無法整份載入, 故檢查匯出行
        let c = fs.readFileSync(new URL('../src/index.mjs', import.meta.url), 'utf8')
        for (let n of names) {
            assert.strict.deepStrictEqual(c.includes(`export { default as ${n} } from './${n}.mjs'`), true, n)
        }
        assert.strict.deepStrictEqual(c.includes('_diag'), false)
    })

    it(`should not statically import any Node builtin module in the dependency closure`, function() {
        //R-DIAG-01 規則2(設計§6.1): 依賴閉包不得靜態import任何Node內建模組(瀏覽器亦可載入), util.types以process.getBuiltinModule探測
        let seen = new Set()
        let bad = []
        let walk = (fn) => {
            if (seen.has(fn)) {
                return
            }
            seen.add(fn)
            let c = fs.readFileSync(new URL(`../src/${fn}`, import.meta.url), 'utf8')
            for (let m of c.matchAll(/^import\s[^'"]*['"]([^'"]+)['"]/gm)) {
                let dep = m[1]
                if (dep.startsWith('./')) {
                    walk(dep.slice(2))
                }
                else {
                    bad.push(`${fn}: ${dep}`)
                }
            }
        }
        for (let n of names) {
            walk(`${n}.mjs`)
        }
        assert.strict.deepStrictEqual(bad, [])
        assert.strict.deepStrictEqual(seen.has('_diagKit.mjs') && seen.has('_diagCodes.mjs') && seen.has('_pmMarkHandled.mjs'), true)
    })

    it(`should contain 195 corpus cases with unique ids in 13 groups`, function() {
        //R-DIAG-01 規則6(dspec D5): 共用語料195案(設計§5.2之99案、§6.9之35案, 與diag-run03外審新增之25案、diag-run04自審與外審新增之12案、wsemi小輪run01新增之8案: C14、U22、R23、R24、O25、A11、A12、A13; 診斷通報輪新增H01~H16共16案: 形狀摘要getDiagShape)
        let ids = corpus.cases.map((c) => c.id)
        assert.strict.deepStrictEqual(ids.length, 195)
        assert.strict.deepStrictEqual(new Set(ids).size, 195)
        let g = {}
        for (let c of corpus.cases) {
            g[c.group] = (g[c.group] || 0) + 1
        }
        assert.strict.deepStrictEqual(g, { T: 24, K: 10, V: 10, B: 3, E: 14, P: 9, S: 11, C: 14, U: 22, R: 24, O: 25, A: 13, H: 16 })
    })

    it(`should flag 5-character fragments of case-registered secrets and read cross-realm Maps in the corpus checker (diag-run03 terra #30, #31)`, async function() {
        //dspec D5: 判讀器之秘密殘留檢查涵蓋ctx.extra之可還原片段; collect以品牌檢查走訪跨realm之Map與Set
        let vm = await import('vm')
        let c = corpus.cases.find((x) => x.id === 'R02')
        let ctx = corpus.mkCtx({ util: true })
        c.make(ctx)
        assert.strict.deepStrictEqual(ctx.extra.indexOf('w0rdQ9') >= 0, true)
        //輸出物件滿足R02之check(副本、instanceof、code、帳號不遮、有***), 只殘留登錄秘密w0rdQ9之5字元片段: 須判失敗
        let out = { r: Object.assign(new Error('dbuser *** w0rdQ'), { code: '3D000' }), same: false, inst: true, code: '3D000' }
        assert.strict.deepStrictEqual(c.expect.check(out), true)
        assert.strict.deepStrictEqual(corpus.verify(c, out, ctx), 'secret leaked: "w0rdQ"')
        let m = vm.runInNewContext('new Map([["k", "Pw9xQ!z7"]])')
        let s = vm.runInNewContext('new Set(["Pw9xQ!z7"])')
        assert.strict.deepStrictEqual([corpus.collect(m).ss.indexOf('Pw9xQ!z7') >= 0, corpus.collect(s).ss.indexOf('Pw9xQ!z7') >= 0], [true, true])
    })

    it(`should inspect own properties of functions and fail when the walk limit is exceeded in the corpus checker (diag-run04 terra #16, #18)`, function() {
        //dspec D5: 判讀器之秘密殘留檢查走訪函數之自有屬性; 走訪超過上限時判失敗(不把未走訪之尾端視為乾淨)
        let ctx = corpus.mkCtx({ util: true })
        let fn = function() {}
        fn.note = ctx.sec.password
        let r15 = corpus.cases.find((x) => x.id === 'R15')
        let fake = { r1: { fn: '[Function]' }, rp: { v: fn }, top: '[Function]', keep: [true, true, true, true, true, true] }
        assert.strict.deepStrictEqual(r15.expect.check(fake), true)
        assert.strict.deepStrictEqual(corpus.verify(r15, fake, ctx), `secret leaked: ${JSON.stringify(ctx.sec.password)}`)
        let big = Array(200010).fill('OK').concat(ctx.sec.password)
        assert.strict.deepStrictEqual(corpus.verify({ expect: { noSecret: 'reject' } }, big, corpus.mkCtx({ util: true })), 'checker walk limit exceeded (output not fully inspected)')
        assert.strict.deepStrictEqual(corpus.verify({ expect: { noSecret: 'reject' } }, Array(1000).fill('OK'), corpus.mkCtx({ util: true })), null)
    })

    it(`should normalize safe in time linear in the number of keys (diag-run03 terra #26, process CPU time)`, function() {
        //dspec D4: 摘要正規化之成本與鍵數成線性(白名單以Set查); 同總規模(40次×1000對4次×10000)之CPU時間比: 線性約1倍、平方約10倍(各取3次之最小值)
        let run = (n, times) => {
            let keys = []
            let safe = {}
            for (let i = 0; i < n; i++) {
                keys.push(`k${i}`)
                safe[`k${i}`] = i
            }
            let diag = getDiag({ funLog: () => {} }, { safeKeys: keys })
            let best = Infinity
            for (let r = 0; r < 3; r++) {
                let t = process.cpuUsage()
                for (let j = 0; j < times; j++) {
                    diag('op', safe)
                }
                let d = process.cpuUsage(t)
                best = Math.min(best, d.user + d.system)
            }
            return best
        }
        let a = run(1000, 40)
        let b = run(10000, 4)
        assert.strict.deepStrictEqual(b <= Math.max(a, 32000) * 2.5, true, `${a} ${b}`)
    })

    it(`should give every wire case a make(ctx) that returns an input for downstream call sites`, function() {
        //設計§5.1: 各套件之接線測試以語料之make(ctx)經其真實呼叫點執行(外審terra #1: wire案缺make)
        let ws = corpus.cases.filter((c) => c.wire)
        assert.strict.deepStrictEqual(ws.length >= 20, true)
        for (let c of ws) {
            let v = c.make(corpus.mkCtx({}))
            assert.strict.notDeepStrictEqual(v, undefined, c.id)
        }
    })

    it(`should fail closed when the secrets source cannot be read (terra #19, #27)`, function() {
        //dspec D4: 秘密清單取不到時不把未知細節當成安全值輸出, 且方法永不拋錯
        let { proxy, revoke } = Proxy.revocable([], {})
        let d1 = getDiag({}, {
            secrets: () => {
                throw new Error('fail')
            }
        })
        let d2 = getDiag({}, { secrets: proxy })
        revoke()
        for (let d of [d1, d2]) {
            assert.strict.deepStrictEqual([d.mask('oops secret9'), d.copy({ x: 'secret9' }), d.err('secret9'), d.err(new Error('secret9')).message], ['***', '[Uncopyable]', '***', '***'])
        }
        let got = null
        getDiag({
            funLog: (...args) => {
                got = args
            }
        }, {
            secrets: () => {
                throw new Error('fail')
            }
        })('lb', {}, () => ({ x: 'secret9' }))
        assert.strict.deepStrictEqual(got, ['lb', {}, '(unprintable)'])
    })

    it(`should not run getters in the package declaration and never throw at construction (terra #26)`, function() {
        //設計§3.4.1: 不執行使用端getter; D4: getDiag不拋錯
        let n = 0
        let keys = ['mode']
        Object.defineProperty(keys, '1', {
            enumerable: true,
            get() {
                n++
                throw new Error('a')
            }
        })
        let pats = ['pragmaKey']
        Object.defineProperty(pats, 'slice', {
            get() {
                n++
                throw new Error('a')
            }
        })
        let d = getDiag({}, { safeKeys: keys, patterns: pats })
        assert.strict.deepStrictEqual([n, d.mask('PRAGMA key=\'k1\'')], [0, 'PRAGMA key=\'***\''])
    })

    it(`should not apply detailOnly path patterns to external values and keep storage paths in reject outputs (terra #12, #13, Q3)`, function() {
        //Q3: 對外錯誤值不遮儲存路徑; 路徑類具名樣式(fsPathTail、receivedTail)只用於診斷輸出
        let p = 'C:\\data\\db01'
        let diag = getDiag({}, { secrets: getDiagSecrets({ password: 'secret9', paths: [p] }), patterns: ['fsPathTail'] })
        let e = Object.assign(new Error(`ENOENT, open '${p}'`), { path: p })
        assert.strict.deepStrictEqual(diag.err(e), e)
        assert.strict.deepStrictEqual(diag.mask(`ENOENT, open '${p}'`), `ENOENT, open '${p}'`)
        assert.strict.deepStrictEqual(diag.copy(e).message, 'ENOENT, open \'***\'')
        let child = Object.assign(new Error('x secret9'), { path: 'D:\\data\\db02' })
        let outer = new Error('outer')
        outer.details = { child }
        let r = diag.err(outer)
        assert.strict.deepStrictEqual([r !== outer, r.details.child.message, r.details.child.path], [true, 'x ***', 'D:\\data\\db02'])
    })

    it(`should mark only non-Proxy return values without running traps (terra #29)`, function() {
        //設計§3.4.1: 可偵測之Proxy不觸發陷阱
        let n = 0
        let h = {
            getPrototypeOf(t) {
                n++
                return Reflect.getPrototypeOf(t)
            },
            get(t, k) {
                n++
                return Reflect.get(t, k)
            }
        }
        getDiag({ funLog: () => new Proxy({}, h) }, {})('lb', {})
        assert.strict.deepStrictEqual(n, 0)
    })

    it(`should mask a non-string external value given to diag.mask (capi #12d)`, function() {
        //設計§6.5第7條: webdata回遠端之{ state:'error', msg }經diag.mask(msg常為Error)
        let diag = getDiag({}, { secrets: getDiagSecrets({ password: 'Pw9xQ!z7' }) })
        let r = diag.mask(new Error('auth Pw9xQ!z7'))
        assert.strict.deepStrictEqual([r instanceof Error, r.message], [true, 'auth ***'])
    })

    it(`should only drop the unreadable cell of safe (capi #24)`, function() {
        //設計§3.8: 一格不可序列化只影響該格
        let { proxy, revoke } = Proxy.revocable({}, {})
        revoke()
        let got = null
        getDiag({
            funLog: (l, s) => {
                got = s
            }
        }, { safeKeys: ['a', 'p'] })('lb', { a: 1, p: proxy })
        assert.strict.deepStrictEqual(got.a, 1)
    })

    it(`should merge extra sources with diag.with and keep the base`, function() {
        //設計§6.2第7條: diag.with(src)回傳併入額外來源之新diag(單次呼叫之帳密)
        let diag = getDiag({}, { secrets: getDiagSecrets({ password: 'basePw99' }) })
        let d2 = diag.with({ password: 'extraPw77' })
        assert.strict.deepStrictEqual(d2.mask('a basePw99 extraPw77'), 'a *** ***')
        assert.strict.deepStrictEqual(diag.mask('a basePw99 extraPw77'), 'a *** extraPw77')
    })

    it(`should call a function form of secrets on each output`, function() {
        //設計§3.2.1: secrets可為回傳清單之函數, 每次輸出時呼叫(權杖簿)
        let book = ['tokA123']
        let diag = getDiag({}, { secrets: () => getDiagSecrets({ values: book }) })
        assert.strict.deepStrictEqual(diag.mask('x tokA123 tokB456'), 'x *** tokB456')
        book.push('tokB456')
        assert.strict.deepStrictEqual(diag.mask('x tokA123 tokB456'), 'x *** ***')
    })

    it(`should mask external text and errors with the reject list and detail with the detail list`, function() {
        //dspec D3與Q3: 對外錯誤值(diag.err、diag.mask)只遮憑證, 不遮單獨帳號與儲存路徑; 診斷細節(diag.copy)遮全部來源
        let diag = getDiag({}, { secrets: getDiagSecrets({ username: 'dbuser', password: 'Pw9xQ!z7', paths: ['C:\\db\\x1'] }) })
        let s = 'user dbuser at C:\\db\\x1 pw Pw9xQ!z7'
        assert.strict.deepStrictEqual(diag.mask(s), 'user dbuser at C:\\db\\x1 pw ***')
        assert.strict.deepStrictEqual(diag.copy(s), 'user *** at *** pw ***')
        assert.strict.deepStrictEqual(diag.err(new Error(s)).message, 'user dbuser at C:\\db\\x1 pw ***')
    })

    diagSuite('getDiag')

})
