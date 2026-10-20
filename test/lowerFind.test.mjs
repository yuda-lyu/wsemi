/* eslint-disable no-extend-native -- 測試暫時於Array.prototype安裝數字索引setter、於Object.prototype汙染屬性(finally還原), 驗證IR不受影響 */
import assert from 'assert'
import fs from 'fs'
import path from 'path'
import vm from 'vm'
import { execFileSync } from 'child_process'
import { fileURLToPath } from 'url'
import cvOrmFind from '../src/cvOrmFind.mjs'
import cvCases from '../src/_cvOrmFindCases.mjs'
import lowerFind from '../src/lowerFind.mjs'
import lowerCases from '../src/_lowerFindCases.mjs'
import snapshots from '../src/_lowerFindSnapshots.mjs'
import { buildSnapshots, renderFile } from './tools/genIrSnapshots.mjs'
import evalIr from './tools/irEval.mjs'
import ormFindRefIds from './tools/ormFindRef.mjs'
import { srcBundle } from './tools/srcBundle.mjs'


//lowerFind(cvOrmFind複本 -> 方言中立IR)之測試, 規則見CLAUDE_rulebook.md R-LOWER-01(IR-01~IR-10), 契約本文見src/lowerFind.mjs檔頭, 契約案例表見src/_lowerFindCases.mjs.
//純函數測試(不連線、不需資料庫). 規格句:
//  L1  { c: null }與$eq:null -> null節點; $ne:null -> null not
//  L2  布林值 -> bool節點(SQL三值語意)
//  L3  $in:[] -> 恆假in節點, 不產生綁定參數
//  L4  單項and/or展開, 同型巢狀攤平(n元), 不因方言上限限制寬度
//  L5  同欄多運算子與多欄鍵為隱含AND
//  L6  綁定參數計數契約(cmp 1、in每元素1、bool/null/空in 0)與opt.maxParams(必填, 核心不預設任何上限)
//  L7  opt.checkColumn掛鉤(方言專屬欄名檢核由呼叫端注入)
//  L8  零import、不含任何資料庫/建構器專屬名稱、可在vm空領域載入(可整檔抽出為系列共用層)
//  L9  IR為null原型, 陣列元素以defineProperty附加(不受Array.prototype數字索引setter與Object.prototype汙染影響)
//  L10 葉節點帶來源路徑p(供後續映射遍回報invalid find: 原因 at [路徑])

let dirTest = path.dirname(fileURLToPath(import.meta.url))
let fpSrc = path.join(dirTest, '..', 'src', 'lowerFind.mjs')
let { semantics, seed, norm } = lowerCases

let lf = (find, opt = { maxParams: 65535 }) => lowerFind(cvOrmFind(find), opt)
let walk = (ir, fn) => {
    if (ir === null) {
        return
    }
    fn(ir)
    if (ir.t === 'and' || ir.t === 'or') {
        ir.a.forEach((x) => walk(x, fn))
    }
}
let LEAF = new Set(['cmp', 'bool', 'null', 'in'])
let SIX = new Set(['and', 'or', 'cmp', 'bool', 'null', 'in'])
//cost, 依計數契約由IR算出之綁定參數數
let cost = (ir) => {
    let n = 0
    walk(ir, (x) => {
        if (x.t === 'cmp') {
            n += 1
        }
        else if (x.t === 'in') {
            n += x.vs.length
        }
    })
    return n
}
//手工建構之cvOrmFind複本(null原型; 用於超過cvOrmFind上限之規模測試, lowerFind本身不檢核形狀)
let nul = (o) => Object.assign(Object.create(null), o)


describe('lowerFind: 節點語意期望表(手寫期望, 規格句L1~L5 L10)', function() {

    semantics.forEach((s) => {
        it(`should lower [${s.id}] (${s.node}) to the expected IR`, function() {
            assert.deepStrictEqual(norm(lf(s.find())), s.ir)
        })
    })

    it('should lower every case of the table with a literal null for no condition and a node otherwise', function() {
        assert.strictEqual(semantics.filter((s) => s.ir === null).length, 2)
        assert.ok(semantics.length >= 50, String(semantics.length))
    })

})


describe('lowerFind: IR形狀不變式(L4 L9 L10)', function() {

    it('should return null (not an empty node) for no condition', function() {
        assert.strictEqual(lf({}), null)
        assert.strictEqual(lf(undefined), null)
        assert.strictEqual(lowerFind(nul({}), { maxParams: 1 }), null)
    })

    it('should never produce an and/or node with fewer than 2 items, and never nest a same-type node directly', function() {
        let finds = [{ $or: [{ a: 1 }] }, { $and: [{ $or: [{ a: 1 }] }] }, { $or: [{ $and: [{ a: 1 }] }, { $and: [{ b: 2 }] }] }, { a: { $gt: 1, $lt: 5 }, $or: [{ b: 1 }] }, { $and: [{ a: 1 }, { $and: [{ b: 2 }] }] }]
        finds.forEach((f) => {
            walk(lf(f), (n) => {
                if (n.t === 'and' || n.t === 'or') {
                    assert.ok(n.a.length >= 2, JSON.stringify(f))
                    n.a.forEach((c) => assert.notStrictEqual(c.t, n.t, JSON.stringify(f)))
                }
            })
        })
    })

    it('should build only null-prototype nodes with plain dense arrays', function() {
        let ir = lf({ $or: [{ a: 1, b: { $in: [1, 2] } }, { c: { $nin: ['x'] } }] })
        walk(ir, (n) => {
            assert.strictEqual(Object.getPrototypeOf(n), null)
            assert.ok(SIX.has(n.t))
            if (n.t === 'and' || n.t === 'or') {
                assert.ok(Array.isArray(n.a))
                assert.deepStrictEqual(Object.keys(n.a), n.a.map((_, i) => String(i)))
            }
            if (n.t === 'in') {
                assert.ok(Array.isArray(n.vs))
                assert.strictEqual(Object.keys(n.vs).length, n.vs.length)
            }
        })
    })

    it('should give every leaf a string source path that starts with find (L10), and give and/or none', function() {
        let ir = lf({ a: 1, b: { $in: [1] }, $or: [{ c: null }, { d: true }, { e: { $ne: null } }] })
        let n = 0
        walk(ir, (x) => {
            if (LEAF.has(x.t)) {
                n += 1
                assert.strictEqual(typeof x.p, 'string')
                assert.ok(x.p.startsWith('find.'), x.p)
            }
            else {
                assert.strictEqual(x.p, undefined)
            }
        })
        assert.strictEqual(n, 5)
    })

    it('should shorten column and operator names to 30 characters and replace control characters inside the path only (the column itself stays whole)', function() {
        let long = 'a'.repeat(40)
        let ir = lowerFind(nul({ [long]: nul({ $gt: 1 }), 'x\ny': 2 }), { maxParams: 10 })
        assert.strictEqual(ir.a[0].c, long)
        assert.strictEqual(ir.a[0].p, `find.${'a'.repeat(30)}....$gt`)
        assert.strictEqual(ir.a[1].c, 'x\ny')
        assert.strictEqual(ir.a[1].p, 'find.x?y')
        let ir2 = lowerFind(nul({ a: nul({ $in: [1, 2] }) }), { maxParams: 10 })
        assert.strictEqual(ir2.p, 'find.a.$in')
    })

    it('should carry the source path of the exact find location in every leaf', function() {
        let ps = []
        walk(lf({ a: 1, $or: [{ b: { $gt: 2, $in: [1] } }, { $and: [{ c: null }, { d: { $ne: null } }] }] }), (x) => {
            if (LEAF.has(x.t)) {
                ps.push(x.p)
            }
        })
        assert.deepStrictEqual(ps, ['find.a', 'find.$or[0].b.$gt', 'find.$or[0].b.$in', 'find.$or[1].$and[0].c', 'find.$or[1].$and[1].d.$ne'])
    })

    it('should lower every case of the shared wsemi table that cvOrmFind accepts into the six node types only, with a path in every leaf', function() {
        let nOk = 0
        cvCases.cases.forEach((c) => {
            let copy = null
            try {
                copy = cvOrmFind(c.find())
            }
            catch (err) {
                return //共用層已拒收者不進lowerFind
            }
            let ir = lowerFind(copy, { maxParams: Infinity })
            nOk += 1
            walk(ir, (x) => {
                assert.ok(SIX.has(x.t), `${c.id}: ${x.t}`)
                if (LEAF.has(x.t)) {
                    assert.strictEqual(typeof x.p, 'string', c.id)
                }
            })
        })
        assert.strictEqual(nOk, cvCases.cases.filter((c) => c.expect !== 'REJ').length)
        assert.ok(nOk >= 70, `accepted cases: ${nOk}`)
    })

})


describe('lowerFind: 攤平不受方言上限限制、寬度與深度(L4, IR-02)', function() {

    it('should keep an or of 1000 items as one n-ary node (no regrouping)', function() {
        let items = Array.from({ length: 1000 }, (_, i) => ({ a: i }))
        let ir = lf({ $or: items }, { maxParams: Infinity })
        assert.strictEqual(ir.t, 'or')
        assert.strictEqual(ir.a.length, 1000)
        assert.ok(ir.a.every((x) => x.t === 'cmp'))
        assert.strictEqual(ir.a[999].p, 'find.$or[999].a')
    })

    it('should flatten two nested ors of 600 items each into one n-ary or of 1200 items, in order', function() {
        let mk = (base) => ({ $or: Array.from({ length: 600 }, (_, i) => ({ a: base + i })) })
        let ir = lf({ $or: [mk(0), mk(600)] }, { maxParams: Infinity })
        assert.strictEqual(ir.t, 'or')
        assert.strictEqual(ir.a.length, 1200)
        assert.deepStrictEqual(ir.a.map((x) => x.v), Array.from({ length: 1200 }, (_, i) => i))
        assert.strictEqual(ir.a[600].p, 'find.$or[1].$or[0].a')
    })

    it('should flatten and unwrap a chain of 32 single-item $and levels (the cvOrmFind depth limit) down to the leaf', function() {
        let o = { g: 'A' }
        for (let i = 0; i < 32; i++) {
            o = { $and: [o] }
        }
        let ir = lf(o)
        assert.strictEqual(ir.t, 'cmp')
        assert.strictEqual(ir.p, `find${'.$and[0]'.repeat(32)}.g`)
    })

    it('should keep alternating and/or levels nested (only the same type is flattened)', function() {
        let ir = lf({ $or: [{ $and: [{ $or: [{ a: 1 }, { a: 2 }] }, { b: 1 }] }, { c: 1 }] })
        assert.strictEqual(ir.t, 'or')
        assert.strictEqual(ir.a[0].t, 'and')
        assert.strictEqual(ir.a[0].a[0].t, 'or')
        assert.strictEqual(ir.a[0].a[0].a.length, 2)
    })

})


describe('lowerFind: 綁定參數計數與opt.maxParams(L6, IR-03)', function() {

    it('should require opt.maxParams and never default it to any dialect limit', function() {
        let copy = cvOrmFind({ a: 1 })
        let bad = [undefined, null, 5, 'x', {}, { maxParams: 0 }, { maxParams: -1 }, { maxParams: NaN }, { maxParams: '5' }, { maxParams: null }, { maxParams: true }, { maxParams: [5] }, { checkColumn: () => '' }]
        bad.forEach((opt) => {
            assert.throws(() => lowerFind(copy, opt), (err) => err.message === 'lowerFind: opt.maxParams is required (use Infinity for no limit)', String(JSON.stringify(opt)))
        })
    })

    it('should accept Infinity (no limit) and fractional positive numbers, and an inherited maxParams must not count', function() {
        let copy = cvOrmFind({ a: { $in: Array.from({ length: 5000 }, (_, i) => i) } })
        assert.strictEqual(lowerFind(copy, { maxParams: Infinity }).vs.length, 5000)
        assert.doesNotThrow(() => lowerFind(cvOrmFind({ a: 1 }), { maxParams: 1.5 }))
        Object.prototype.maxParams = 99999
        try {
            assert.throws(() => lowerFind(copy, {}), /maxParams is required/)
            assert.throws(() => lowerFind(copy, undefined), /maxParams is required/)
        }
        finally {
            delete Object.prototype.maxParams
        }
    })

    it('should count 1 per cmp and 1 per in element, 0 per bool / null / empty in', function() {
        let count = (find) => {
            for (let m = 1; m < 200; m++) {
                try {
                    lf(find, { maxParams: m })
                    return m
                }
                catch (err) {
                    //繼續
                }
            }
            return -1
        }
        assert.strictEqual(count({ a: 1 }), 1)
        assert.strictEqual(count({ a: 1, b: 'x', c: { $gt: 5 } }), 3)
        assert.strictEqual(count({ a: { $in: [1, 2, 3, 4] } }), 4)
        assert.strictEqual(count({ a: { $nin: [true, false] } }), 2) //in內布林為綁定參數
        assert.strictEqual(count({ a: true, b: { $ne: false }, c: null, d: { $ne: null }, e: { $in: [] } }), 1) //全為0個參數: maxParams最小值1即通過
        assert.strictEqual(count({ a: true, b: 1, c: null, d: { $in: [1, 2] }, e: { $in: [] } }), 3) //b 1 + d 2
        assert.strictEqual(count({ a: new Date(5) }), 1) //Date為綁定參數
    })

    it('should reject exactly one parameter over the limit, with a path that points at the offending element', function() {
        assert.doesNotThrow(() => lf({ a: 1, b: { $in: [1, 2, 3] } }, { maxParams: 4 }))
        assert.throws(() => lf({ a: 1, b: { $in: [1, 2, 3] } }, { maxParams: 3 }), (err) => {
            assert.strictEqual(err.message, 'invalid find: too many bound parameters (> 3) at [find.b.$in[2]]')
            return true
        })
        assert.throws(() => lf({ a: 1, b: 2 }, { maxParams: 1 }), /^Error: invalid find: too many bound parameters \(> 1\) at \[find\.b\]$/)
        assert.throws(() => lf({ $or: [{ a: 1 }, { b: { $gt: 2 } }] }, { maxParams: 1 }), /at \[find\.\$or\[1\]\.b\.\$gt\]$/)
    })

    it('should count the same at scale: 65535 in elements pass at maxParams 65535, 65536 fail at the last element', function() {
        let mk = (n) => nul({ a: nul({ $in: Array.from({ length: n }, (_, i) => i) }) })
        assert.strictEqual(lowerFind(mk(65535), { maxParams: 65535 }).vs.length, 65535)
        assert.throws(() => lowerFind(mk(65536), { maxParams: 65535 }), (err) => {
            assert.strictEqual(err.message, 'invalid find: too many bound parameters (> 65535) at [find.a.$in[65535]]')
            return true
        })
    })

    it('should agree with the documented cost (cmp 1, in per element) for 400 seeded random conditions: maxParams = cost passes, cost - 1 fails', function() {
        let rnd = mkRandom(20261021)
        for (let i = 0; i < 400; i++) {
            let f = genFind(rnd, 3)
            let n = cost(lowerFind(cvOrmFind(f), { maxParams: Infinity }))
            assert.doesNotThrow(() => lowerFind(cvOrmFind(f), { maxParams: Math.max(n, 1) }), JSON.stringify(f))
            if (n > 0) {
                assert.throws(() => lowerFind(cvOrmFind(f), { maxParams: n - 0.5 }), /too many bound parameters/, JSON.stringify(f))
            }
        }
    })

})


describe('lowerFind: opt.checkColumn掛鉤(L7)', function() {

    it('should call the hook for every column key (not for $and/$or) and let it reject with its own reason', function() {
        let seen = []
        let hook = (c) => {
            seen.push(c)
            return c === 'bad' ? 'unsupported column name [bad]' : ''
        }
        lf({ a: 1, $or: [{ b: 2 }, { $and: [{ c: { $gt: 1 } }] }] }, { maxParams: 10, checkColumn: hook })
        assert.deepStrictEqual(seen.sort(), ['a', 'b', 'c'])
        assert.throws(() => lf({ a: 1, $or: [{ b: 2 }, { bad: 3 }] }, { maxParams: 10, checkColumn: hook }), (err) => {
            assert.strictEqual(err.message, 'invalid find: unsupported column name [bad] at [find.$or[1].bad]')
            return true
        })
    })

    it('should pass all columns when no hook is given or the hook is not a function; an inherited hook must not count', function() {
        assert.doesNotThrow(() => lf({ ctid: 1 }, { maxParams: 5 }))
        assert.doesNotThrow(() => lf({ ctid: 1 }, { maxParams: 5, checkColumn: 'nope' }))
        Object.prototype.checkColumn = () => 'rejected by pollution'
        try {
            assert.doesNotThrow(() => lf({ a: 1 }, { maxParams: 5 }))
        }
        finally {
            delete Object.prototype.checkColumn
        }
    })

    it('should not echo the value in any error', function() {
        assert.throws(() => lf({ a: { $in: ['SECRET-VALUE-1', 'SECRET-VALUE-2'] } }, { maxParams: 1 }), (err) => !/SECRET/.test(err.message))
    })

    it('should word every error as invalid find with a bracketed path, with control characters replaced and long paths shortened', function() {
        let hook = () => 'column is not allowed'
        assert.throws(() => lowerFind(nul({ 'a\nb\u0000c': 1 }), { maxParams: 5, checkColumn: hook }), (err) => {
            assert.strictEqual(err.message, 'invalid find: column is not allowed at [find.a?b?c]')
            return true
        })
        let deep = nul({ x: 1 })
        for (let i = 0; i < 40; i++) {
            deep = nul({ $and: [deep, nul({ y: 1 })] })
        }
        assert.throws(() => lowerFind(deep, { maxParams: 5, checkColumn: (c) => (c === 'x' ? 'nope' : '') }), (err) => {
            let m = /^invalid find: nope at \[(.*)\]$/s.exec(err.message)
            assert.ok(m, err.message)
            assert.ok(m[1].startsWith('...') && m[1].endsWith('.$and[0].x'), m[1])
            assert.strictEqual(m[1].length, 103) //'...'加路徑末100字元
            return true
        })
    })

    it('should reject an operator outside the whitelist even though cvOrmFind already refused it (defense in depth)', function() {
        assert.throws(() => lowerFind(nul({ a: nul({ $regex: 'x' }) }), { maxParams: 5 }), (err) => {
            assert.strictEqual(err.message, 'invalid find: unsupported operator [$regex] at [find.a.$regex]')
            return true
        })
    })

})


describe('lowerFind: 不受原型汙染與陣列索引setter影響(L9, IR-05)', function() {

    it('should produce the same IR while an Array.prototype numeric-index setter swallows index assignment', function() {
        let find = { a: 1, b: { $in: [1, 2, 3] }, $or: [{ c: 'x' }, { $and: [{ d: true }, { e: { $ne: null } }] }, { f: { $nin: [4, 5] } }] }
        let want = norm(lf(find))
        let copy = cvOrmFind(find) //複本先於汙染建立: 只驗lowerFind自身不以索引指派/push建陣列
        let hits = 0
        for (let i = 0; i < 12; i++) {
            Object.defineProperty(Array.prototype, String(i), {
                configurable: true,
                get() {
                    return undefined
                },
                set() {
                    hits += 1 //被呼叫即代表有程式碼以索引指派寫入陣列
                },
            })
        }
        let got = null
        try {
            got = norm(lowerFind(copy, { maxParams: 65535 }))
        }
        finally {
            for (let i = 0; i < 12; i++) {
                delete Array.prototype[String(i)]
            }
        }
        assert.strictEqual(hits, 0, 'lowerFind must not assign array elements by index')
        assert.deepStrictEqual(got, want)
    })

    it('should ignore Object.prototype pollution of IR field names', function() {
        let want = norm(lf({ a: 1, b: { $in: [1, 2] } }))
        let names = ['t', 'c', 'op', 'v', 'vs', 'not', 'a', 'p']
        names.forEach((k) => {
            Object.prototype[k] = 'POLLUTED'
        })
        let got = null
        try {
            got = norm(lf({ a: 1, b: { $in: [1, 2] } }))
        }
        finally {
            names.forEach((k) => {
                delete Object.prototype[k]
            })
        }
        assert.deepStrictEqual(got, want)
    })

})


describe('lowerFind.mjs為可抽出之方言中立共用層(L8, IR-06)', function() {

    let src = fs.readFileSync(fpSrc, 'utf8')

    it('should import nothing (no import / require / dynamic import / re-export) and export only the default function', function() {
        assert.ok(!/^\s*import\s/m.test(src), 'no import statements')
        assert.ok(!/\brequire\s*\(/.test(src), 'no require')
        assert.ok(!/\bimport\s*\(/.test(src), 'no dynamic import')
        assert.ok(!/^\s*export\s+.*\bfrom\b/m.test(src), 'no re-export from other modules')
        let exported = [...src.matchAll(/^export (?:default |async )?(?:function |let |const )?(\w+)/gm)].map((m) => m[1])
        assert.deepStrictEqual(exported, ['lowerFind'])
        assert.strictEqual(typeof lowerFind, 'function')
        assert.strictEqual(lowerFind.name, 'lowerFind')
    })

    it('should not mention any database, query builder or driver by name', function() {
        assert.ok(!/\b(pg|knex|postgres|postgresql|pgsql|sequelize|sqlite|mssql|mysql|tedious|jet|access|mongo|mongodb)\b/i.test(src), 'dialect-neutral wording only')
    })

    it('should state the contract (six node types, maxParams, checkColumn, constant false, three-valued, source path p) in the header', function() {
        let head = src.slice(0, src.indexOf('let isDate'))
        for (let w of ['and', 'or', 'cmp', 'bool', 'null', 'in', 'maxParams', 'checkColumn', '恆假', '三值', 'Infinity']) {
            assert.ok(head.includes(w), `header must mention ${w}`)
        }
        assert.ok(/不得影響結果集/.test(head), 'empty in must not affect the result set')
        assert.ok(/p:\s*來源路徑/.test(head), 'leaf source path p')
        assert.ok(/R-LOWER-01/.test(head), 'header points at the ledger rule')
    })

    it('should load and run in an empty vm realm without any Node global (no Buffer / process / require) and give the same IR', function() {
        let script = srcBundle('lowerFind', 'lowerFind')
        let ctx = vm.createContext({})
        vm.runInContext(script, ctx)
        assert.strictEqual(typeof ctx.Buffer, 'undefined')
        assert.strictEqual(typeof ctx.process, 'undefined')
        assert.strictEqual(typeof ctx.require, 'undefined')
        let finds = semantics.map((s) => s.find()).concat([{ a: 1, $or: [{ b: { $in: [1, 2] } }, { c: null }] }])
        for (let f of finds) {
            let copy = cvOrmFind(f)
            let got = ctx.lowerFind(copy, { maxParams: 1000 })
            assert.strictEqual(JSON.stringify(norm(got)), JSON.stringify(norm(lowerFind(copy, { maxParams: 1000 }))))
        }
    })

    it('should be exported from the package index next to lowerFindEq', function() {
        let idx = fs.readFileSync(path.join(dirTest, '..', 'src', 'index.mjs'), 'utf8')
        assert.ok(/export \{ default as lowerFind \} from '\.\/lowerFind\.mjs'/.test(idx))
        assert.ok(/export \{ default as lowerFindEq \} from '\.\/lowerFindEq\.mjs'/.test(idx))
    })

})


describe('lowerFind: IR契約快照(跨後端契約資料, IR-09 層2)', function() {

    let accepted = cvCases.cases.filter((c) => c.expect !== 'REJ')

    it('should hold unique ids with only the six node types, a path in every leaf and plain JSON values', function() {
        assert.ok(snapshots.length >= 60, `snapshots: ${snapshots.length}`)
        assert.strictEqual(new Set(snapshots.map((x) => x.id)).size, snapshots.length)
        snapshots.forEach((x) => {
            assert.ok(/^wsemi:[TECILNFXVH]\d{2}$/.test(x.id), x.id)
            assert.deepStrictEqual(Object.keys(x), ['id', 'ir'])
            walk(x.ir, (n) => {
                assert.ok(SIX.has(n.t), `${x.id}: ${n.t}`)
                if (LEAF.has(n.t)) {
                    assert.strictEqual(typeof n.p, 'string', x.id)
                }
            })
        })
        assert.strictEqual(JSON.stringify(snapshots), JSON.stringify(JSON.parse(JSON.stringify(snapshots))))
    })

    it('should cover every accepted case of the shared table whose IR is at most 20000 characters, and nothing else', function() {
        //獨立重算: 接受案之IR序列化字元數(norm後JSON)<=20000者入快照
        let want = accepted.filter((c) => JSON.stringify(norm(lowerFind(cvOrmFind(c.find()), { maxParams: Infinity }))).length <= 20000).map((c) => `wsemi:${c.id}`)
        assert.deepStrictEqual(snapshots.map((x) => x.id), want)
        let skipped = accepted.length - snapshots.length
        assert.ok(skipped >= 1 && skipped <= 12, `skipped (large) cases: ${skipped}`)
    })

    it('should equal the IR that the current lowerFind produces (a difference is a contract change: regenerate with node test/tools/genIrSnapshots.mjs and review the diff)', function() {
        assert.deepStrictEqual(buildSnapshots(), snapshots)
    })

    it('should be exactly the file that the generator writes (the generated file must not be edited by hand)', function() {
        let fp = path.join(dirTest, '..', 'src', '_lowerFindSnapshots.mjs')
        assert.strictEqual(fs.readFileSync(fp, 'utf8'), renderFile(buildSnapshots()))
    })

    it('should hold the IR of the representative shared cases that the plan names (null, bool, in, nin, empty in, or, nested)', function() {
        let byId = new Map(snapshots.map((x) => [x.id, x.ir]))
        let types = new Set()
        for (let ir of byId.values()) {
            walk(ir, (n) => types.add(n.t))
        }
        assert.deepStrictEqual([...types].sort(), ['and', 'bool', 'cmp', 'in', 'null', 'or'])
        assert.strictEqual(byId.get('wsemi:T01'), null) //未給條件
        assert.strictEqual(byId.get('wsemi:T02'), null) //{}
        assert.ok([...byId.values()].some((ir) => ir !== null && ir.t === 'in' && ir.vs.length === 0 && ir.not === false), 'an empty $in case')
    })

    it('should evaluate the IR of every accepted shared case to the ids.sql of the case, by an evaluator that shares no code with lowerFind (semantic check independent of the snapshot)', function() {
        let n = 0
        for (let c of accepted) {
            let ir = lowerFind(cvOrmFind(c.find()), { maxParams: Infinity })
            assert.deepStrictEqual(evalIr(ir, cvCases.seed()), c.ids.sql, c.id)
            n += 1
        }
        assert.ok(n >= 70, String(n))
    })

})


//mkRandom, 種子化亂數(mulberry32), 供隨機條件可重現
let mkRandom = (seedNum) => {
    let a = seedNum | 0
    return () => {
        a = (a + 0x6D2B79F5) | 0
        let t = Math.imul(a ^ (a >>> 15), 1 | a)
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
}
let pick = (rnd, arr) => arr[Math.floor(rnd() * arr.length)]
let VALUES = {
    s: ['a', 'b', '$x$', '', 'c'],
    n: [0, 1, 2, 3, 4, 5],
    b: [true, false],
    d: ['2020-01-01T00:00:00Z', '2021-01-01T00:00:00Z', '2022-01-01T00:00:00Z', '2023-01-01T00:00:00Z', '2024-06-01T00:00:00Z'],
}
let OFF = { s: [1, true], n: ['2', 'x', true], b: [1, 'a'], d: [1, 'a'] } //欄型不符之值(依案例表約定: 數值格式字串對數字依欄型轉換, 其餘不可比較而不命中)
let genValue = (rnd, col) => {
    let r = rnd()
    if (r < 0.12) {
        return pick(rnd, OFF[col])
    }
    let v = pick(rnd, VALUES[col])
    return col === 'd' ? new Date(v) : v
}
let genOps = (rnd, col) => {
    let ops = {}
    let k = 1 + Math.floor(rnd() * 3)
    for (let i = 0; i < k; i++) {
        let op = pick(rnd, ['$eq', '$ne', '$gt', '$gte', '$lt', '$lte', '$in', '$nin'])
        if (op === '$eq' || op === '$ne') {
            ops[op] = rnd() < 0.25 ? null : genValue(rnd, col)
        }
        else if (op === '$in' || op === '$nin') {
            let m = Math.floor(rnd() * 4) + (op === '$nin' ? 1 : 0)
            ops[op] = Array.from({ length: m }, () => genValue(rnd, col))
        }
        else {
            ops[op] = genValue(rnd, col)
        }
    }
    return ops
}
//genFind, 隨機合法條件(欄: s n b d; 深度depth之$and/$or巢狀); 皆為cvOrmFind接受之形狀
let genFind = (rnd, depth) => {
    let doc = {}
    let nKeys = 1 + Math.floor(rnd() * 3)
    for (let i = 0; i < nKeys; i++) {
        let r = rnd()
        if (depth > 0 && r < 0.3) {
            let key = rnd() < 0.5 ? '$and' : '$or'
            let m = 1 + Math.floor(rnd() * 3)
            doc[key] = Array.from({ length: m }, () => genFind(rnd, depth - 1))
        }
        else {
            let col = pick(rnd, ['s', 'n', 'b', 'd'])
            doc[col] = rnd() < 0.35 ? (rnd() < 0.2 ? null : genValue(rnd, col)) : genOps(rnd, col)
        }
    }
    return doc
}


describe('lowerFind: 隨機條件之語意差分(IR求值器對find層參考比對器, IR-09 層2)', function() {

    it('should agree with the independent find-level reference matcher on 400 seeded random conditions (NULL three-valued logic, ne / nin, empty in, nesting, off-type values)', function() {
        let rnd = mkRandom(94)
        let rows = seed()
        let stat = { and: 0, or: 0, cmp: 0, bool: 0, null: 0, in: 0, nullNot: 0, inNot: 0, inEmpty: 0, none: 0 }
        for (let i = 0; i < 400; i++) {
            let f = genFind(rnd, 3)
            let ir = lowerFind(cvOrmFind(f), { maxParams: Infinity })
            assert.deepStrictEqual(evalIr(ir, rows), ormFindRefIds('sql', f, rows), JSON.stringify(f))
            if (ir === null) {
                stat.none += 1
            }
            walk(ir, (n) => {
                stat[n.t] += 1
                if (n.t === 'null' && n.not) {
                    stat.nullNot += 1
                }
                if (n.t === 'in' && n.not) {
                    stat.inNot += 1
                }
                if (n.t === 'in' && n.vs.length === 0) {
                    stat.inEmpty += 1
                }
            })
        }
        //隨機條件確實涵蓋各節點與三值情形(避免產生器退化為只測簡單形狀)
        for (let k of ['and', 'or', 'cmp', 'bool', 'null', 'in', 'nullNot', 'inNot', 'inEmpty']) {
            assert.ok(stat[k] >= 20, `${k}: ${stat[k]}`)
        }
    })

    it('should still agree after the rows are widened to every NULL / value combination of the columns (all-NULL row, boolean NULL, Date NULL)', function() {
        let rnd = mkRandom(2026)
        let rows = []
        for (let s of [null, 'a', '$x$']) {
            for (let n of [null, 0, 3]) {
                for (let b of [null, true, false]) {
                    for (let d of [null, new Date('2021-01-01T00:00:00Z')]) {
                        rows.push({ id: rows.length + 1, s, n, b, d })
                    }
                }
            }
        }
        assert.strictEqual(rows.length, 54)
        for (let i = 0; i < 300; i++) {
            let f = genFind(rnd, 3)
            let ir = lowerFind(cvOrmFind(f), { maxParams: Infinity })
            assert.deepStrictEqual(evalIr(ir, rows), ormFindRefIds('sql', f, rows), JSON.stringify(f))
        }
    })

    it('should keep the node invariants (n-ary >= 2, no same-type nesting, leaf paths) on the random conditions', function() {
        let rnd = mkRandom(7)
        for (let i = 0; i < 300; i++) {
            let f = genFind(rnd, 4)
            walk(lowerFind(cvOrmFind(f), { maxParams: Infinity }), (n) => {
                if (n.t === 'and' || n.t === 'or') {
                    assert.ok(n.a.length >= 2, JSON.stringify(f))
                    n.a.forEach((c) => assert.notStrictEqual(c.t, n.t, JSON.stringify(f)))
                }
                else {
                    assert.ok(typeof n.p === 'string' && n.p.startsWith('find.'), JSON.stringify(f))
                }
            })
        }
    })

})


describe('lowerFind: opt 之讀取、輸入前提與值之保真(外審補強)', function() {

    it('should read opt by property access on its own enumerable properties only: a non-enumerable own data property and an inherited value do not count, an own enumerable accessor is called (documented behaviour of the moved code)', function() {
        let copy = cvOrmFind({ a: 1 })
        let hidden = {}
        Object.defineProperty(hidden, 'maxParams', { value: 5, enumerable: false })
        assert.throws(() => lowerFind(copy, hidden), /maxParams is required/)
        let n = 0
        let withGetter = {}
        Object.defineProperty(withGetter, 'maxParams', {
            get() {
                n += 1
                return 5
            },
            enumerable: true,
        })
        assert.doesNotThrow(() => lowerFind(copy, withGetter))
        assert.strictEqual(n, 1)
        let proto = { maxParams: 5 }
        assert.throws(() => lowerFind(copy, Object.create(proto)), /maxParams is required/)
    })

    it('should keep a real negative zero in the IR (the sign survives; norm marks it, JSON alone would not)', function() {
        let ir = lf({ n: -0, m: { $in: [-0, 0] } })
        assert.ok(Object.is(ir.a[0].v, -0))
        assert.ok(Object.is(ir.a[1].vs[0], -0))
        assert.ok(Object.is(ir.a[1].vs[1], 0))
        assert.deepStrictEqual(norm(ir).a[0].v, { $negZero: true })
    })

    it('should keep the element order and duplicates of large in lists that are too long for the snapshot (the shared cases H07 and H28)', function() {
        for (let id of ['H07', 'H28']) {
            let c = cvCases.cases.find((v) => v.id === id)
            let find = c.find()
            let want = Object.values(find)[0].$in
            let ir = lowerFind(cvOrmFind(c.find()), { maxParams: Infinity })
            assert.strictEqual(ir.t, 'in', id)
            assert.deepStrictEqual(ir.vs, want, id)
            assert.ok(want.length >= 5000, `${id}: ${want.length}`)
            assert.ok(!snapshots.some((x) => x.id === `wsemi:${id}`), `${id} is not in the snapshot (too large)`)
        }
        let order = [3, 1, 3, 2, 0, 5000, 4, 4]
        assert.deepStrictEqual(lf({ a: { $in: order } }).vs, order)
    })

    it('should not be reachable with the shapes that lowerFind alone would mishandle: cvOrmFind refuses an empty $and / $or, an empty operator object and a non-array logic value, so the documented precondition holds', function() {
        for (let f of [{ $and: [] }, { $or: [] }, { a: {} }, { $and: 1 }, { $or: [1] }, { $and: [{}] }]) {
            assert.throws(() => cvOrmFind(f), /^Error: invalid find: /, JSON.stringify(f))
        }
        let head = fs.readFileSync(fpSrc, 'utf8').slice(0, fs.readFileSync(fpSrc, 'utf8').indexOf('let isDate'))
        assert.ok(/前提: 輸入須為cvOrmFind之複本/.test(head))
        assert.ok(/opt讀取: 以屬性存取讀opt自有可列舉之maxParams、checkColumn/.test(head))
    })

    it('should be told by the generator whether the snapshot file is current (--check exits 0 and does not rewrite the file)', function() {
        let gen = path.join(dirTest, 'tools', 'genIrSnapshots.mjs')
        let fp = path.join(dirTest, '..', 'src', '_lowerFindSnapshots.mjs')
        let before = fs.readFileSync(fp, 'utf8')
        let out = execFileSync(process.execPath, [gen, '--check'], { encoding: 'utf8' })
        assert.ok(/up to date/.test(out), out)
        assert.strictEqual(fs.readFileSync(fp, 'utf8'), before)
    })

})
