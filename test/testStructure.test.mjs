import assert from 'assert'
import fs from 'fs'
import path from 'path'


//R-TEST-STRUCT-01: 測試檔(test/*.test.mjs)之間不得互相import, 且test/tools/內之檔不得於載入時(頂層)註冊describe、it、hook
//  why: ESM模組快取使被import之測試檔其頂層describe只於各行程第一次載入時註冊一次; mocha --parallel依分派決定同一行程載入哪些檔案,
//  被6個測試檔import之blob2b64.test.mjs於7個行程之案數為25+3×(行程數-1), 致全套案數隨分派而異(22917、22914、22907…, 第254項)
//  共用者放test/tools/(不帶.test.中綴), 由各測試檔import
describe(`test structure (R-TEST-STRUCT-01)`, function() {

    let fdTest = path.resolve('./test')
    let fdTools = path.join(fdTest, 'tools')
    let readNames = (fd, re) => fs.readdirSync(fd).filter((n) => re.test(n)).sort()
    let tests = readNames(fdTest, /\.test\.mjs$/)
    let tools = readNames(fdTools, /\.mjs$/)

    //reImport, 靜態import、動態import()、require()對*.test.mjs之引用(字串內提及檔名不算)
    let reImport = /(?:\bfrom\s*|\bimport\s*\(\s*|\bimport\s+|\brequire\s*\(\s*)['"]([^'"\r\n]*\.test\.mjs)['"]/g

    //scopes, 掃描範圍: 測試檔與工具檔兩處皆須掃(工具檔被多個測試檔import, 其引用測試檔同樣造成案數隨分派而異)
    let scopes = [[fdTest, tests], [fdTools, tools]]

    it(`should find the test files and the tool files`, function() {
        //防止路徑錯誤使其後之檢查空轉
        assert.strict.deepStrictEqual(tests.length > 100, true)
        assert.strict.deepStrictEqual(tools.length > 20, true)
        assert.strict.deepStrictEqual(tests.includes('blob2b64.test.mjs'), true)
        assert.strict.deepStrictEqual(tools.includes('resKit.mjs'), true)
        assert.strict.deepStrictEqual(scopes.map(([fd, names]) => path.basename(fd) + ':' + (names.length > 0)), ['test:true', 'tools:true'])
    })

    it(`should not import any *.test.mjs from a test file or a tool file`, function() {
        let bad = []
        for (let [fd, names] of scopes) {
            for (let n of names) {
                let txt = fs.readFileSync(path.join(fd, n), 'utf8')
                for (let m of txt.matchAll(reImport)) {
                    bad.push(`${path.relative(fdTest, path.join(fd, n)).split(path.sep).join('/')} -> ${m[1]}`)
                }
            }
        }
        assert.strict.deepStrictEqual(bad, [])
    })

    it(`should not register describe, it or hooks at the top level of a tool file`, function() {
        //頂層(第0欄)之describe(、it(、before(等於import時即註冊, 同樣受模組快取影響; 工具檔內之註冊應包在由測試檔呼叫之函數內
        let reTop = /^(?:describe|it|before|after|beforeEach|afterEach|context)(?:\.\w+)?\(/m
        let bad = tools.filter((n) => reTop.test(fs.readFileSync(path.join(fdTools, n), 'utf8')))
        assert.strict.deepStrictEqual(bad, [])
    })

    it(`should detect the forbidden import forms with the same pattern`, function() {
        //pattern之正反例: 各種引用形式都抓得到, 字串與註解內之提及(含空白、單雙引號)之處置
        //樣本以mk於執行時組成(原始碼內不出現完整之引用字樣, 否則本檔會被上面之掃描當成違規)
        let hit = (s) => [...s.matchAll(reImport)].map((m) => m[1])
        let mk = (pre, name, q = `'`) => pre + q + name + q
        assert.strict.deepStrictEqual(hit(mk('import { getRes } from ', './blob2b64.test.mjs')), ['./blob2b64.test.mjs'])
        assert.strict.deepStrictEqual(hit(mk('import ', './x.test.mjs', `"`)), ['./x.test.mjs'])
        assert.strict.deepStrictEqual(hit(mk('let m = await import(', './y.test.mjs') + ')'), ['./y.test.mjs'])
        assert.strict.deepStrictEqual(hit(mk('let m = require(', './z.test.mjs', `"`) + ')'), ['./z.test.mjs'])
        assert.strict.deepStrictEqual(hit(mk('export * from ', '../a/b.test.mjs')), ['../a/b.test.mjs'])
        assert.strict.deepStrictEqual(hit(`fs.writeFileSync(fx('pass.test.mjs'), 'x')`), []) //檔名字串不算引用
        assert.strict.deepStrictEqual(hit(mk('import { getRes } from ', './tools/resKit.mjs')), [])
    })

})
