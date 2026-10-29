/* eslint-disable no-extend-native, no-control-regex, no-new-wrappers -- 測試刻意以控制字元、包裝物件與暫時汙染/覆寫原型(finally還原)驗證檢核器 */
import assert from 'assert'
import fs from 'fs'
import path from 'path'
import vm from 'vm'
import { fileURLToPath } from 'url'
import chkOrmStr from '../src/chkOrmStr.mjs'
import cvOrmFind from '../src/cvOrmFind.mjs'
import ormStrCases from '../src/_cvOrmStrCases.mjs'
import { srcBundle } from './tools/srcBundle.mjs'


//規則見CLAUDE_rulebook.md R-ORMSTR-01; 案例表見src/_cvOrmStrCases.mjs
//chkOrmStr回傳null(合格)或固定原因字串, 對字串輸入不拋錯; 此處皆為純函數測試

let dirTest = path.dirname(fileURLToPath(import.meta.url))
let fpSrc = path.join(dirTest, '..', 'src', 'chkOrmStr.mjs')

let LONE = 'string contains lone surrogate'
let NUL = 'string contains NUL'
let NOTSTR = 'not a string'

let ch = (n) => String.fromCharCode(n)

//獨立預言機: 逐碼點走訪(for...of遇孤立代理碼元產生單一碼元之項目), 不用isWellFormed與正規式
let hasLone = (s) => {
    for (let c of s) {
        let n = c.charCodeAt(0)
        if (c.length === 1 && n >= 0xD800 && n <= 0xDFFF) {
            return true
        }
    }
    return false
}
let hasNul = (s) => {
    for (let i = 0; i < s.length; i++) {
        if (s.charCodeAt(i) === 0) {
            return true
        }
    }
    return false
}
let oracle = (s, nul = true) => {
    if (nul && hasNul(s)) {
        return NUL
    }
    if (hasLone(s)) {
        return LONE
    }
    return null
}


describe('chkOrmStr 良構字串(規則1)', function() {

    it('should return null for well-formed strings (ASCII, CJK, emoji, CJK extension B, U+FFFD, empty, specials)', function() {
        let good = ['abc', 'A_b-1.2', '中文字串', '\u{1F600}', 'a\u{1F600}b', '\u{20BB7}', '𠮷野家', '�', 'a�b', '���', '', ' ', '\t\n', '﻿', '​', '\u{10FFFF}', '\u{10000}', `${ch(0xD800)}${ch(0xDC00)}`, `${ch(0xDBFF)}${ch(0xDFFF)}`, 'é', '\u{1F468}‍\u{1F469}‍\u{1F467}']
        for (let s of good) {
            assert.strictEqual(chkOrmStr(s), null, JSON.stringify(s))
        }
    })

    it('should return the lone-surrogate reason for every lone surrogate code unit alone, leading, middle and trailing', function() {
        for (let n = 0xD800; n <= 0xDFFF; n++) {
            let c = ch(n)
            for (let s of [c, `a${c}`, `${c}a`, `a${c}b`, `${c}${c}`, `\u{1F600}${c}`, `${c}\u{1F600}`]) {
                assert.strictEqual(chkOrmStr(s), LONE, `U+${n.toString(16)} in ${JSON.stringify(s)}`)
            }
        }
    })

    it('should accept every valid surrogate pair and reject a pair with an extra lone half (exhaustive 1024 x 1024)', function() {
        let bad = 0
        let good = 0
        for (let h = 0xD800; h <= 0xDBFF; h++) {
            for (let l = 0xDC00; l <= 0xDFFF; l++) {
                let pair = ch(h) + ch(l)
                if (chkOrmStr(pair) !== null) {
                    good++
                }
                if (chkOrmStr(pair + ch(l)) !== LONE) {
                    bad++
                }
                if (chkOrmStr(ch(h) + pair) !== LONE) {
                    bad++
                }
            }
        }
        assert.strictEqual(good, 0, 'valid pair rejected')
        assert.strictEqual(bad, 0, 'pair with extra lone half accepted')
    })

    it('should reject reversed pairs, two high halves, two low halves and a low half after a pair', function() {
        let hi = ch(0xD83D)
        let lo = ch(0xDE00)
        let forms = [`${lo}${hi}`, `a${lo}${hi}`, `${lo}${hi}b`, `${hi}${hi}`, `${hi}${hi}${lo}`, `${lo}${lo}`, `${hi}${lo}${lo}`, `${hi}${hi}${lo}${lo}`]
        for (let s of forms) {
            assert.strictEqual(chkOrmStr(s), LONE, JSON.stringify(s))
            assert.strictEqual(oracle(s), LONE, 'oracle')
        }
    })

    it('should agree with the independent oracle on 20000 random strings built from surrogates, NUL and ordinary characters', function() {
        let pool = [ch(0xD800), ch(0xDBFF), ch(0xDC00), ch(0xDFFF), ch(0xD83D), ch(0xDE00), '\u0000', 'a', '中', '�', '\u{1F600}', ' ', '_']
        let seed = 12345
        let rnd = () => {
            seed = (seed * 1103515245 + 12345) & 0x7fffffff
            return seed
        }
        for (let i = 0; i < 20000; i++) {
            let n = rnd() % 8
            let s = ''
            for (let j = 0; j < n; j++) {
                s += pool[rnd() % pool.length]
            }
            assert.strictEqual(chkOrmStr(s), oracle(s), JSON.stringify(s))
            assert.strictEqual(chkOrmStr(s, { nul: false }), oracle(s, false), JSON.stringify(s))
        }
    })

    it('should handle a very long string (1e6 code units) without throwing, finding a lone half at the very end', function() {
        let s = 'a'.repeat(1000000)
        assert.strictEqual(chkOrmStr(s), null)
        assert.strictEqual(chkOrmStr(`${s}${ch(0xD800)}`), LONE)
        assert.strictEqual(chkOrmStr(`${ch(0xDC00)}${s}`), LONE)
        assert.strictEqual(chkOrmStr('\u{1F600}'.repeat(500000)), null)
    })

})


describe('chkOrmStr NUL 與 opt.nul(規則2)', function() {

    it('should reject NUL at the start, middle, end and alone by default', function() {
        for (let s of ['\u0000', '\u0000a', 'a\u0000b', 'a\u0000', 'a\u0000\u0000', '中\u0000文']) {
            assert.strictEqual(chkOrmStr(s), NUL, JSON.stringify(s))
            assert.strictEqual(chkOrmStr(s, {}), NUL)
            assert.strictEqual(chkOrmStr(s, { nul: true }), NUL)
        }
    })

    it('should accept NUL only when opt.nul is exactly false, still rejecting lone surrogates', function() {
        assert.strictEqual(chkOrmStr('a\u0000b', { nul: false }), null)
        assert.strictEqual(chkOrmStr('\u0000', { nul: false }), null)
        assert.strictEqual(chkOrmStr(`a\u0000${ch(0xD800)}`, { nul: false }), LONE)
        assert.strictEqual(chkOrmStr(`${ch(0xDC00)}\u0000`, { nul: false }), LONE)
    })

    it('should report NUL before lone surrogate when both are present and NUL is checked', function() {
        assert.strictEqual(chkOrmStr(`a\u0000${ch(0xD800)}`), NUL)
        assert.strictEqual(chkOrmStr(`${ch(0xD800)}\u0000`), NUL)
    })

    it('should treat any opt.nul other than false as the default (NUL is checked)', function() {
        for (let v of [undefined, null, 0, '', 'false', NaN, {}, [], true, 1, Symbol('x'), [false], { valueOf: () => false }]) {
            assert.strictEqual(chkOrmStr('a\u0000', { nul: v }), NUL, String(typeof v))
        }
    })

    it('should accept opt of undefined, null, primitives and objects without options', function() {
        for (let opt of [undefined, null, {}, 0, 1, '', 'x', false, true, [], () => {}, Object.create(null), new Date(0)]) {
            assert.strictEqual(chkOrmStr('a\u0000', opt), NUL)
            assert.strictEqual(chkOrmStr('abc', opt), null)
            assert.strictEqual(chkOrmStr(ch(0xD800), opt), LONE)
        }
    })

    it('should read opt.nul only as an own data property: inherited, polluted and accessor values do not disable the check, and a getter is not invoked', function() {
        let calls = 0
        let acc = Object.defineProperty({}, 'nul', {
            get() {
                calls++
                return false
            },
            enumerable: true
        })
        assert.strictEqual(chkOrmStr('a\u0000', acc), NUL)
        assert.strictEqual(calls, 0)
        assert.strictEqual(chkOrmStr('a\u0000', Object.create({ nul: false })), NUL)
        let p = new Proxy({}, {
            get() {
                calls++
                return false
            }
        })
        assert.strictEqual(chkOrmStr('a\u0000', p), NUL)
        assert.strictEqual(calls, 0)
        Object.prototype.nul = false
        try {
            assert.strictEqual(chkOrmStr('a\u0000'), NUL)
            assert.strictEqual(chkOrmStr('a\u0000', {}), NUL)
            assert.strictEqual(chkOrmStr('a\u0000', { nul: false }), null)
        }
        finally {
            delete Object.prototype.nul
        }
    })

    it('should not modify opt', function() {
        let opt = Object.freeze({ nul: false })
        assert.strictEqual(chkOrmStr('a\u0000', opt), null)
        assert.deepStrictEqual(opt, { nul: false })
    })

})


describe('chkOrmStr 非字串(規則1)', function() {

    it('should return the not-a-string reason for every non-primitive-string value, never throwing', function() {
        let vals = [undefined, null, 0, 1, -0, NaN, Infinity, true, false, {}, [], ['a'], () => {}, Symbol('s'), BigInt(1), new Date(0), /a/, new Map(), new Set(), new Uint8Array(2), new ArrayBuffer(2), new Error('e'), Promise.resolve(1), Object.create(null), { toString: () => 'abc' }, { length: 1, 0: 'a' }, new Proxy({}, {}), new String('abc'), new String(ch(0xD800)), Object(Symbol('w'))]
        for (let v of vals) {
            assert.strictEqual(chkOrmStr(v), NOTSTR, `${typeof v} ${Object.prototype.toString.call(v)}`)
            assert.strictEqual(chkOrmStr(v, { nul: false }), NOTSTR)
        }
    })

    it('should not call any method of a non-string value (toString, valueOf, Symbol.toPrimitive, Proxy traps)', function() {
        let calls = []
        let evil = {
            toString() {
                calls.push('toString')
                return 'x'
            },
            valueOf() {
                calls.push('valueOf')
                return 'x'
            },
            [Symbol.toPrimitive]() {
                calls.push('toPrimitive')
                return 'x'
            },
            get length() {
                calls.push('length')
                return 1
            }
        }
        let px = new Proxy({}, {
            get() {
                calls.push('get')
                return undefined
            },
            has() {
                calls.push('has')
                return false
            },
            getPrototypeOf() {
                calls.push('getPrototypeOf')
                return null
            }
        })
        assert.strictEqual(chkOrmStr(evil), NOTSTR)
        assert.strictEqual(chkOrmStr(px), NOTSTR)
        assert.deepStrictEqual(calls, [])
    })

})


describe('chkOrmStr 內建於載入時取得、不受其後覆寫與汙染影響(規則3)', function() {

    it('should keep the result after String.prototype and RegExp.prototype methods are replaced or removed', function() {
        let sIdx = String.prototype.indexOf
        let sWf = String.prototype.isWellFormed
        let sExec = RegExp.prototype.exec
        let sTest = RegExp.prototype.test
        let sCc = String.prototype.charCodeAt
        let sSl = String.prototype.slice
        let results = []
        let mk = () => ['abc', 'a\u0000b', ch(0xD800), `a${ch(0xDC00)}b`, '\u{1F600}', `x\u0000${ch(0xD800)}`]
        let expected = mk().map((s) => chkOrmStr(s))
        assert.deepStrictEqual(expected, [null, NUL, LONE, LONE, null, NUL])
        try {
            String.prototype.indexOf = function() {
                return -1
            }
            String.prototype.isWellFormed = function() {
                return true
            }
            RegExp.prototype.exec = function() {
                return null
            }
            RegExp.prototype.test = function() {
                return false
            }
            String.prototype.charCodeAt = function() {
                return 0
            }
            String.prototype.slice = function() {
                return ''
            }
            for (let s of mk()) {
                results.push(chkOrmStr(s))
            }
        }
        finally {
            String.prototype.indexOf = sIdx
            String.prototype.isWellFormed = sWf
            RegExp.prototype.exec = sExec
            RegExp.prototype.test = sTest
            String.prototype.charCodeAt = sCc
            String.prototype.slice = sSl
        }
        assert.deepStrictEqual(results, expected)
    })

    it('should not be affected by Object.prototype.isWellFormed or a deleted String.prototype.isWellFormed (fallback regex)', function() {
        let sWf = String.prototype.isWellFormed
        assert.strictEqual(typeof sWf, 'function')
        let before = [ch(0xD800), `a${ch(0xDC00)}`, 'ok', '\u{1F600}'].map((s) => chkOrmStr(s))
        Object.prototype.isWellFormed = () => true
        try {
            let after = [ch(0xD800), `a${ch(0xDC00)}`, 'ok', '\u{1F600}'].map((s) => chkOrmStr(s))
            assert.deepStrictEqual(after, before)
        }
        finally {
            delete Object.prototype.isWellFormed
        }
    })

})


describe('chkOrmStr 純JS與無 isWellFormed 之退路(規則3、4)', function() {

    let src = fs.readFileSync(fpSrc, 'utf8')
    let strip = (t) => t.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '')

    it('should not import any module, nor mention Node APIs or lodash in the source', function() {
        assert.ok(!/^\s*import\s/m.test(src), 'must not import')
        assert.ok(!/\brequire\s*\(/.test(src), 'must not require')
        assert.ok(!/\bBuffer\b/.test(strip(src)), 'must not use Buffer')
        assert.ok(!/\bprocess\b/.test(strip(src)), 'must not use process')
        assert.ok(!/lodash/.test(strip(src)), 'must not use lodash')
        assert.ok(/^export default chkOrmStr\s*$/m.test(src), 'must export default chkOrmStr')
    })

    it('should contain no BigInt literal in code (jsdoc would fail serializing it)', function() {
        assert.ok(!/(^|[^\w$.])(0[xXoObB][\da-fA-F_]+|\d[\d_]*)n\b/.test(strip(src).replace(/'[^']*'|"[^"]*"|`[^`]*`/g, '')), 'BigInt literal in code')
    })

    let lones = [ch(0xD800), ch(0xDBFF), ch(0xDC00), ch(0xDFFF), `a${ch(0xD800)}`, `${ch(0xD800)}a`, `x${ch(0xDC00)}y`, `${ch(0xD83D)}x${ch(0xDE00)}`, `${ch(0xDE00)}${ch(0xD83D)}`, `${ch(0xD83D)}${ch(0xDE00)}${ch(0xDE00)}`, `${ch(0xD83D)}${ch(0xD83D)}${ch(0xDE00)}`]
    let goods = ['', 'abc', '中文', '\u{1F600}', 'a\u{1F600}b', '\u{20BB7}', '�', `${ch(0xD800)}${ch(0xDC00)}`, `${ch(0xDBFF)}${ch(0xDFFF)}`]

    let runVm = (setup) => {
        let code = srcBundle('chkOrmStr', '__f')
        let ctx = vm.createContext({ LONES: lones, GOODS: goods })
        vm.runInContext(setup, ctx)
        vm.runInContext(code, ctx)
        return JSON.parse(vm.runInContext(`(function() {
            let f = globalThis.__f
            let out = { noNode: [typeof process, typeof Buffer, typeof require, typeof module, typeof globalThis.global] }
            out.lones = LONES.map((s) => f(s))
            out.goods = GOODS.map((s) => f(s))
            out.nul = [f('a\\u0000'), f('a\\u0000', { nul: false }), f('a\\u0000' + LONES[0], { nul: false })]
            out.non = [f(1), f(null), f(undefined), f({})]
            return JSON.stringify(out)
        })()`, ctx))
    }
    let expectOut = {
        noNode: ['undefined', 'undefined', 'undefined', 'undefined', 'undefined'],
        lones: lones.map(() => LONE),
        goods: goods.map(() => null),
        nul: [NUL, null, LONE],
        non: [NOTSTR, NOTSTR, NOTSTR, NOTSTR]
    }

    it('should load and work in a context without Node globals', function() {
        assert.deepStrictEqual(runVm(''), expectOut)
    })

    it('should use the fallback regex when String.prototype.isWellFormed is absent, also when Object.prototype has a function of that name', function() {
        assert.deepStrictEqual(runVm('delete String.prototype.isWellFormed'), expectOut)
        assert.deepStrictEqual(runVm('delete String.prototype.isWellFormed; Object.prototype.isWellFormed = () => true'), expectOut)
    })

    it('should keep the fallback regex path working after RegExp.prototype.exec/test and String.prototype methods are replaced following the load', function() {
        let code = srcBundle('chkOrmStr', '__f')
        let ctx = vm.createContext({ LONES: lones, GOODS: goods })
        vm.runInContext('delete String.prototype.isWellFormed', ctx)
        vm.runInContext(code, ctx)
        vm.runInContext(`
            RegExp.prototype.exec = function() { return null }
            RegExp.prototype.test = function() { return false }
            String.prototype.indexOf = function() { return -1 }
            String.prototype.charCodeAt = function() { return 0 }
        `, ctx)
        let out = JSON.parse(vm.runInContext(`JSON.stringify({ lones: LONES.map((s) => globalThis.__f(s)), goods: GOODS.map((s) => globalThis.__f(s)), nul: globalThis.__f('a\\u0000') })`, ctx))
        assert.deepStrictEqual(out, { lones: lones.map(() => LONE), goods: goods.map(() => null), nul: NUL })
    })

    it('should give the same answers with and without isWellFormed for the exhaustive pair sweep (fallback equals native)', function() {
        let code = srcBundle('chkOrmStr', '__f')
        let run = (setup) => {
            let ctx = vm.createContext({})
            vm.runInContext(setup, ctx)
            vm.runInContext(code, ctx)
            return vm.runInContext(`(function() {
                let f = globalThis.__f
                let c = (n) => String.fromCharCode(n)
                let bad = []
                for (let n = 0xD800; n <= 0xDFFF; n++) {
                    for (let s of [c(n), 'a' + c(n), c(n) + 'a', c(n) + c(n)]) {
                        if (f(s) !== 'string contains lone surrogate') { bad.push(n) }
                    }
                }
                for (let h = 0xD800; h <= 0xDBFF; h++) {
                    for (let l = 0xDC00; l <= 0xDFFF; l++) {
                        let p = c(h) + c(l)
                        if (f(p) !== null) { bad.push('pair' + h + ',' + l) }
                        if (f(p + c(l)) === null) { bad.push('pl' + h + ',' + l) }
                        if (f(c(h) + p) === null) { bad.push('hp' + h + ',' + l) }
                    }
                }
                return JSON.stringify(bad)
            })()`, ctx)
        }
        assert.strictEqual(run(''), '[]')
        assert.strictEqual(run('delete String.prototype.isWellFormed'), '[]')
    })

})


describe('chkOrmStr 與 cvOrmFind 單一出處(規則5)', function() {

    it('should be the only module in src that implements the lone-surrogate test: every other src file touching surrogate code units or isWellFormed is a known non-validator (a new one fails here and needs a decision)', function() {
        let dirSrc = path.join(dirTest, '..', 'src')
        let strip = (t) => t.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')
        //凡程式碼(去註解)出現isWellFormed、toWellFormed、codePointAt或代理碼元字面值/十六進位範圍者
        let re = /isWellFormed|toWellFormed|codePointAt|\\u[dD][89a-fA-F][0-9a-fA-F]{2}|0x[dD][89a-fA-F][0-9a-fA-F]{2}/
        let hits = []
        for (let f of fs.readdirSync(dirSrc)) {
            if (f.endsWith('.mjs') && re.test(strip(fs.readFileSync(path.join(dirSrc, f), 'utf8')))) {
                hits.push(f)
            }
        }
        assert.deepStrictEqual(hits.sort(), [
            '_cvOrmFindCases.mjs', //案例資料(含孤立代理字串值)
            '_cvOrmStrCases.mjs', //案例資料
            '_diagKit.mjs', //診斷文字截長時切點避開代理對(cutAt, 僅比對碼元範圍), 非檢核(R-DIAG-01, diag-run02)
            '_ormMsgClean.mjs', //訊息鍵名清除(成對代理不拆開), 非檢核
            '_ormPathCut.mjs', //路徑尾端截斷時切點避開代理對(僅比對碼元範圍, 字串良構判定一律委派chkOrmStr; cvOrmFind與chkOrmData共用)
            'chkOrmStr.mjs', //唯一擁有者
            'str2u8arr.mjs', //UTF-8互轉(R-UTF8-01), 另一用途
        ])
        //擁有者以外之程式模組不得自帶判定: _ormMsgClean只作清除, 不回傳是否良構
        let clean = strip(fs.readFileSync(path.join(dirSrc, '_ormMsgClean.mjs'), 'utf8'))
        assert.ok(!/isWellFormed|toWellFormed/.test(clean))
    })

    it('should make cvOrmFind take its string reasons from chkOrmStr in every scalar position', function() {
        let forms = [['NUL', 'a\u0000b'], ['LONE', ch(0xD800)], ['LONE', `x${ch(0xDC00)}`], ['BOTH', `\u0000${ch(0xD800)}`]]
        let pos = [
            [(s) => ({ a: s }), 'find.a'],
            [(s) => ({ a: { $eq: s } }), 'find.a.$eq'],
            [(s) => ({ a: { $ne: s } }), 'find.a.$ne'],
            [(s) => ({ a: { $gt: s } }), 'find.a.$gt'],
            [(s) => ({ a: { $gte: s } }), 'find.a.$gte'],
            [(s) => ({ a: { $lt: s } }), 'find.a.$lt'],
            [(s) => ({ a: { $lte: s } }), 'find.a.$lte'],
            [(s) => ({ a: { $in: ['x', s] } }), 'find.a.$in[1]'],
            [(s) => ({ a: { $nin: [s] } }), 'find.a.$nin[0]'],
            [(s) => ({ $or: [{ b: 1 }, { a: s }] }), 'find.$or[1].a'],
        ]
        for (let [, s] of forms) {
            let reason = chkOrmStr(s)
            assert.ok(reason === NUL || reason === LONE, reason)
            for (let [mk, at] of pos) {
                let err
                try {
                    cvOrmFind(mk(s))
                }
                catch (e) {
                    err = e
                }
                assert.ok(err, `must throw for ${at}`)
                assert.strictEqual(err.message, `invalid find: ${reason} at [${at}]`)
            }
        }
    })

    it('should keep accepting well-formed strings that chkOrmStr accepts in cvOrmFind', function() {
        for (let s of ['abc', '中文', '\u{1F600}', '\u{20BB7}', '�', 'a�b']) {
            assert.strictEqual(chkOrmStr(s), null)
            assert.strictEqual(cvOrmFind({ a: s }).a, s)
        }
    })

})


describe('chkOrmStr 契約案例表(R-ORMSTR-01)', function() {

    it('should return the expected reason for every string-level case of the case table', function() {
        let cs = ormStrCases.cases.filter((c) => c.fn === 'chkOrmStr')
        assert.ok(cs.length >= 40, `too few cases: ${cs.length}`)
        for (let c of cs) {
            assert.strictEqual(chkOrmStr(c.input, c.opt), c.expect, c.id)
        }
    })

})
