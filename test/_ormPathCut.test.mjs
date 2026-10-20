import assert from 'assert'
import fs from 'fs'
import path from 'path'
import vm from 'vm'
import { fileURLToPath } from 'url'
import ormPathCut from '../src/_ormPathCut.mjs'
import { srcBundle } from './tools/srcBundle.mjs'


//規則見CLAUDE_rulebook.md R-ORMSTR-01規則16(PATHCUT): 錯誤訊息中路徑之尾端截斷, cvOrmFind與chkOrmData共用之單一出處
//ormPathCut(s): 長度<=120原樣; 逾120回'...'加末100碼元; 第(長度-100)碼元為成對代理之低位時切點往後移一碼元(尾端99碼元), 不留孤立低位代理

let dirTest = path.dirname(fileURLToPath(import.meta.url))
let dirSrc = path.join(dirTest, '..', 'src')
let fpSrc = path.join(dirSrc, '_ormPathCut.mjs')

let ch = (n) => String.fromCharCode(n)
let cp = (n) => String.fromCodePoint(n)
let strip = (t) => t.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')

//邊界代理對: 最小(U+10000: D800 DC00, 低位為DC00)、一般(U+1F600: D83D DE00)、最大(U+10FFFF: DBFF DFFF, 高位為DBFF、低位為DFFF)
let PAIRS = [cp(0x10000), cp(0x1F600), cp(0x10FFFF)]


describe('_ormPathCut 截斷長度(規則16)', function() {

    it('should return a path of 120 code units or fewer as the very same string, whatever it holds (every length 0..120)', function() {
        for (let n = 0; n <= 120; n++) {
            let s = 'a'.repeat(n)
            assert.strictEqual(ormPathCut(s), s, `length ${n}`)
        }
        let emoji = cp(0x1F600)
        assert.strictEqual(ormPathCut(emoji.repeat(60)), emoji.repeat(60)) //恰120碼元, 全為成對代理
        assert.strictEqual(ormPathCut(`${'a'.repeat(119)}${ch(0xD800)}`), `${'a'.repeat(119)}${ch(0xD800)}`) //不改動未逾上限者(連孤立半邊亦然)
        assert.strictEqual(ormPathCut(''), '')
    })

    it('should cut exactly at 121: ... plus the last 100 code units (103 long), and not at 120', function() {
        let s120 = `${'p'.repeat(60)}${'q'.repeat(60)}`
        assert.strictEqual(s120.length, 120)
        assert.strictEqual(ormPathCut(s120), s120)
        let s121 = `p${s120}`
        assert.strictEqual(s121.length, 121)
        assert.strictEqual(ormPathCut(s121), `...${'p'.repeat(40)}${'q'.repeat(60)}`)
        assert.strictEqual(ormPathCut(s121).length, 103)
        assert.strictEqual(ormPathCut('x'.repeat(121)), `...${'x'.repeat(100)}`)
    })

    it('should keep the former behavior (... plus slice(-100)) for every all-ASCII path of 121..400 code units', function() {
        for (let n = 121; n <= 400; n++) {
            let s = ''
            for (let i = 0; i < n; i++) {
                s += String.fromCharCode(97 + (i % 26))
            }
            assert.strictEqual(ormPathCut(s), `...${s.slice(-100)}`, `length ${n}`)
        }
    })

})


describe('_ormPathCut 切點避開代理對(規則16)', function() {

    it('should move the cut one code unit later when it falls on the low half of a pair, so no lone half is left (boundary pairs U+10000, U+1F600, U+10FFFF)', function() {
        for (let pair of PAIRS) {
            for (let k = 20; k <= 60; k++) {
                //高位在第k碼元, 低位在第k+1碼元 = 長度-100 → 長度 = k+101, 後接99個b
                let s = `${'a'.repeat(k)}${pair}${'b'.repeat(99)}`
                assert.strictEqual(s.length - 100, k + 1)
                let r = ormPathCut(s)
                assert.strictEqual(r, `...${'b'.repeat(99)}`, `pair ${pair.codePointAt(0).toString(16)} k ${k}`)
                assert.ok(r.isWellFormed())
                assert.strictEqual(r.length, 102)
            }
        }
    })

    it('should keep the whole pair when the cut falls on its high half (tail stays 100 code units and well-formed)', function() {
        for (let pair of PAIRS) {
            for (let k = 21; k <= 60; k++) { //長度 = k+100 須逾120
                //高位在第k碼元 = 長度-100 → 長度 = k+100, 尾端為該對加98個b
                let s = `${'a'.repeat(k)}${pair}${'b'.repeat(98)}`
                assert.strictEqual(s.length - 100, k)
                let r = ormPathCut(s)
                assert.strictEqual(r, `...${pair}${'b'.repeat(98)}`, `pair ${pair.codePointAt(0).toString(16)} k ${k}`)
                assert.ok(r.isWellFormed())
                assert.strictEqual(r.length, 103)
            }
        }
    })

    it('should treat only the low-surrogate range DC00..DFFF as a cut to move (a U+E000 or U+D7FF unit at the cut is kept)', function() {
        for (let unit of [ch(0xE000), ch(0xD7FF), ch(0xFFFD), ch(0x4E2D)]) {
            let s = `${'a'.repeat(30)}${unit}${'b'.repeat(99)}`
            assert.strictEqual(s.length - 100, 30)
            assert.strictEqual(ormPathCut(s), `...${unit}${'b'.repeat(99)}`, `unit ${unit.charCodeAt(0).toString(16)}`)
        }
    })

    it('should never leave a lone half at either end for every cut position over all-pair strings (prefix 0..40, trailing 0..3 ASCII)', function() {
        let emoji = cp(0x1F600)
        for (let p = 0; p <= 40; p++) {
            for (let t = 0; t <= 3; t++) {
                let s = `${'a'.repeat(p)}${emoji.repeat(80)}${'b'.repeat(t)}`
                let r = ormPathCut(s)
                //獨立預言機: 切點相對首個代理對起點之偏移為奇數(60+t為奇)即落在低位
                let lowCut = (60 + t) % 2 === 1
                assert.strictEqual(r, `...${s.slice(s.length - (lowCut ? 99 : 100))}`, `p ${p} t ${t}`)
                assert.ok(r.isWellFormed(), `p ${p} t ${t}`)
                assert.strictEqual(r.length, lowCut ? 102 : 103)
            }
        }
    })

})


describe('_ormPathCut 純JS與內建載入時取得(規則16)', function() {

    let src = fs.readFileSync(fpSrc, 'utf8')

    it('should import nothing, mention no Node API or lodash, and export default ormPathCut', function() {
        assert.strictEqual(src.match(/^\s*import\s.*$/gm), null)
        assert.ok(!/\brequire\s*\(/.test(src), 'must not require')
        assert.ok(!/\bBuffer\b/.test(strip(src)), 'must not use Buffer')
        assert.ok(!/\bprocess\b/.test(strip(src)), 'must not use process')
        assert.ok(!/lodash/.test(strip(src)), 'must not use lodash')
        assert.ok(/^export default ormPathCut\s*$/m.test(src), 'must export default ormPathCut')
    })

    it('should contain no BigInt literal in code (jsdoc would fail serializing it)', function() {
        assert.ok(!/(^|[^\w$.])(0[xXoObB][\da-fA-F_]+|\d[\d_]*)n\b/.test(strip(src).replace(/'[^']*'|"[^"]*"|`[^`]*`/g, '')), 'BigInt literal in code')
    })

    it('should load without Node globals and keep working after String.prototype.slice and charCodeAt are replaced (builtins taken at load time)', function() {
        let code = srcBundle('_ormPathCut', '__f')
        let ctx = vm.createContext({})
        vm.runInContext(code, ctx)
        let out = JSON.parse(vm.runInContext(`(function() {
            let f = globalThis.__f
            let noNode = [typeof process, typeof Buffer, typeof require, typeof module]
            let before = [f('x'.repeat(121)), f('y'.repeat(120))]
            String.prototype.slice = function() { throw new Error('slice replaced') }
            String.prototype.charCodeAt = function() { throw new Error('charCodeAt replaced') }
            let pair = String.fromCharCode(0xD83D, 0xDE00)
            let lowCut = 'a'.repeat(30) + pair + 'b'.repeat(99) //切點在低位
            let highCut = 'a'.repeat(30) + pair + 'b'.repeat(98) //切點在高位
            let after = [f('x'.repeat(121)), f('y'.repeat(120)), f(lowCut), f(highCut)]
            return JSON.stringify({ noNode, before, after })
        })()`, ctx))
        let pair = cp(0x1F600)
        assert.deepStrictEqual(out.noNode, ['undefined', 'undefined', 'undefined', 'undefined'])
        assert.deepStrictEqual(out.before, [`...${'x'.repeat(100)}`, 'y'.repeat(120)])
        assert.deepStrictEqual(out.after, [`...${'x'.repeat(100)}`, 'y'.repeat(120), `...${'b'.repeat(99)}`, `...${pair}${'b'.repeat(98)}`])
    })

})


describe('cvOrmFind 與 chkOrmData 路徑截斷單一出處(規則16)', function() {

    for (let name of ['cvOrmFind', 'chkOrmData']) {
        it(`should make ${name}.mjs import _ormPathCut and carry no cut of its own (no slice from the end, no length - 100)`, function() {
            let src = fs.readFileSync(path.join(dirSrc, `${name}.mjs`), 'utf8')
            let code = strip(src)
            assert.ok(/^import ormPathCut from '\.\/_ormPathCut\.mjs'\s*$/m.test(src), `${name} must import _ormPathCut`)
            assert.ok(/\bormPathCut\(/.test(code), `${name} must call ormPathCut`)
            assert.ok(!/\.length\s*-\s*100\b/.test(code), `${name} must not compute its own tail start`)
            assert.ok(!/[sS]lice\(\s*\w+\s*,\s*-\s*\d+\s*\)/.test(code), `${name} must not slice from the end`)
            assert.ok(!/\.slice\(\s*-\s*\d+\s*\)/.test(code), `${name} must not slice from the end`)
            assert.ok(!/\bMAX_PATH\b/.test(code), `${name} must not keep its own path limit`)
        })
    }

})
