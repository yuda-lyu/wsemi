import assert from 'assert'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { scanReplaceSites } from './tools/replaceSiteScan.mjs'


//R-REPLACE-LITERAL-01(ws427 wsrep, sgud/rule/rulebook_replace.md): src/內String.prototype.replace/replaceAll之取代值(第2引數)
//  取代字串會展開$&、$'、$`、$$、$<name>、$1…, 取代值來自呼叫端或外部輸入而本意為字面文字時, 含$即寫出錯誤結果.
//  判準: 取代值須為(a)不含$之字串字面值, (b)函式(其回傳值不展開), 或(c)刻意之$樣式(正規式取代, 逐站列入下表).
//  其餘(變數、參數、有內插之樣板字串、函式呼叫回傳值)一律為缺陷, 須改為函式回傳.


let dirSrc = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src')

//(c)刻意之$樣式站點全集(檔名\t取代字串之值); 新增或變更須同步更新規則帳本R-REPLACE-LITERAL-01之站點全集
let INTENDED = [
    '_diagKit.mjs\t\\$&', //escRe: 正規式元字元跳脫(取代值\$&, 於字面文字前加反斜線)
    'cfinancial.mjs\t$1,$2', //千分位: /(\d+)(\d{3})/ 之捕獲群$1,$2
    'execCliCore.mjs\t$1$1\\"', //escapeWinArg: /(\\*)"/g 之捕獲群$1(反斜線加倍)
    'execCliCore.mjs\t$1$1', //escapeWinArg: /(\\*)$/ 之捕獲群$1(尾端反斜線加倍)
    'execCliCore.mjs\t^$&', //escapeWinArg: cmd.exe metacharacters前加^
    'execCliCore.mjs\t^$&', //escapeWinCmd: 同上
    'replacePlus.mjs\t\\$&', //not: 字元類別內逸出\ ] [ ^ -
].sort()

let scanSrc = () => {
    let rows = []
    let files = fs.readdirSync(dirSrc).filter((f) => /\.mjs$/.test(f)).sort()
    for (let f of files) {
        for (let s of scanReplaceSites(fs.readFileSync(path.join(dirSrc, f), 'utf8'))) {
            rows.push({ file: f, ...s })
        }
    }
    return { files, rows }
}


describe('R-REPLACE-LITERAL-01 replace/replaceAll之取代值須字面化或為刻意之$樣式', function() {

    describe('scanner(掃描器本身)', function() {

        let kinds = (code) => scanReplaceSites(code).map((s) => s.kind)

        it('should classify the replacement (2nd argument)', function() {
            assert.deepStrictEqual(kinds(`a.replace('x', 'y')`), ['lit'])
            assert.deepStrictEqual(kinds(`a.replaceAll('x', '')`), ['lit'])
            assert.deepStrictEqual(kinds('a.replace(/x/g, `y`)'), ['lit'])
            assert.deepStrictEqual(kinds(`a.replace(/x/g, 'p' + 'q')`), ['lit'])
            assert.deepStrictEqual(kinds(`a.replace(/(x)/g, '$1')`), ['dollar-lit'])
            assert.deepStrictEqual(kinds(`a.replaceAll('x', '$&')`), ['dollar-lit'])
            assert.deepStrictEqual(kinds(`a.replace(/(x)/g, '$1' + ',' + '$2')`), ['dollar-lit'])
            assert.deepStrictEqual(kinds('a.replace(/x/g, `$' + '$`)'), ['dollar-lit'])
            assert.deepStrictEqual(kinds(`a.replace(x, () => r)`), ['fn'])
            assert.deepStrictEqual(kinds(`a.replace(x, function() { return r })`), ['fn'])
            assert.deepStrictEqual(kinds(`a.replace(x, r)`), ['dynamic'])
            assert.deepStrictEqual(kinds(`a.replaceAll(t, r)`), ['dynamic'])
            assert.deepStrictEqual(kinds('a.replace(x, `p$' + '{r}`)'), ['dynamic'])
            assert.deepStrictEqual(kinds(`a.replace(x, 'p' + r)`), ['dynamic'])
            assert.deepStrictEqual(kinds(`a.replace(x, String(r))`), ['dynamic'])
            assert.deepStrictEqual(kinds(`a.replace(x, o.r)`), ['dynamic'])
            assert.deepStrictEqual(kinds(`a.replace(x)`), ['noarg'])
        })

        it('should find optional-call, computed and chained sites, and ignore comments and strings', function() {
            assert.deepStrictEqual(kinds(`a?.replace(x, r)`), ['dynamic'])
            assert.deepStrictEqual(kinds(`a['replace'](x, r)`), ['dynamic'])
            assert.deepStrictEqual(kinds(`a.replace(/x/g, '').replace(/y/g, r)`).sort(), ['dynamic', 'lit'])
            assert.deepStrictEqual(kinds(`// a.replace(x, r)\n/* b.replaceAll(x, r) */\nlet s = 'c.replace(x, r)'\nlet t = \`d.replace(x, r)\``), [])
            assert.deepStrictEqual(kinds(`/**\n * @example\n * p = p.replaceAll('x', y)\n */\nfunction f() {}`), [])
            assert.deepStrictEqual(kinds(`let o = { replace: 1 }\nlet f = replace(x, r)\nlet g = x.replacer(a, r)`), [])
        })

        it('should report line numbers', function() {
            assert.deepStrictEqual(scanReplaceSites(`let a = 1\nlet b = a.replace(x, r)\n\nlet c = a.replace(x, '')`).map((s) => s.line), [2, 4])
        })

    })

    describe('src/ 站點全集', function() {

        let { files, rows } = scanSrc()

        it('should scan the whole src/ (scan range is not empty)', function() {
            assert.ok(files.length > 400, `files: ${files.length}`)
            assert.ok(rows.length >= 55, `sites: ${rows.length}`)
            assert.ok(rows.filter((s) => s.method === 'replaceAll').length >= 5, 'replaceAll sites')
            assert.ok(rows.some((s) => s.file === 'replacePlus.mjs' && s.kind === 'fn'), 'replacePlus.mjs is scanned')
        })

        it('should have no site whose replacement is a variable/parameter/interpolation (must be a function return)', function() {
            let bad = rows.filter((s) => s.kind === 'dynamic' || s.kind === 'noarg').map((s) => `${s.file}:${s.line} ${s.method} ${s.kind}`)
            assert.deepStrictEqual(bad, [], 'replacement value that may contain $ and is expanded; return it from a function: .replace(x, () => String(r))')
        })

        it('should have $ in a literal replacement only at the intended sites (regexp with capture groups / $&)', function() {
            let got = rows.filter((s) => s.kind === 'dollar-lit').map((s) => `${s.file}\t${s.text}`).sort()
            assert.deepStrictEqual(got, INTENDED)
        })

        it('should not pre-escape $ in replaceObj (replace is literal; escaping would double every $)', function() {
            let s = rows.filter((x) => x.file === 'replaceObj.mjs')
            assert.deepStrictEqual(s, [])
        })

    })

})
