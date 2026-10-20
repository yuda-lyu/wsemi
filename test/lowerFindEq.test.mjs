import assert from 'assert'
import fs from 'fs'
import path from 'path'
import vm from 'vm'
import { fileURLToPath } from 'url'
import lowerFind from '../src/lowerFind.mjs'
import lowerFindEq from '../src/lowerFindEq.mjs'
import lowerCases from '../src/_lowerFindCases.mjs'
import { srcBundle } from './tools/srcBundle.mjs'


//lowerFindEq(單欄等值IR, 主鍵條件用)之測試, 規則見CLAUDE_rulebook.md R-LOWER-01 IR-08; 契約本文見src/lowerFind.mjs檔頭.

let dirTest = path.dirname(fileURLToPath(import.meta.url))
let { norm } = lowerCases
let nul = (o) => Object.assign(Object.create(null), o)


describe('lowerFindEq: 單欄等值IR(IR-08)', function() {

    it('should build cmp eq for string / number / Date and bool eq for boolean, with the path find.<column>', function() {
        let d = new Date(5)
        assert.deepStrictEqual(norm(lowerFindEq('time', 'k1')), { t: 'cmp', c: 'time', op: 'eq', v: 'k1', p: 'find.time' })
        assert.deepStrictEqual(norm(lowerFindEq('time', 7)), { t: 'cmp', c: 'time', op: 'eq', v: 7, p: 'find.time' })
        assert.deepStrictEqual(norm(lowerFindEq('time', 0)), { t: 'cmp', c: 'time', op: 'eq', v: 0, p: 'find.time' })
        assert.deepStrictEqual(norm(lowerFindEq('time', '')), { t: 'cmp', c: 'time', op: 'eq', v: '', p: 'find.time' })
        assert.deepStrictEqual(norm(lowerFindEq('time', d)), { t: 'cmp', c: 'time', op: 'eq', v: { $date: 5 }, p: 'find.time' })
        assert.deepStrictEqual(norm(lowerFindEq('flag', true)), { t: 'bool', c: 'flag', op: 'eq', v: true, p: 'find.flag' })
        assert.deepStrictEqual(norm(lowerFindEq('flag', false)), { t: 'bool', c: 'flag', op: 'eq', v: false, p: 'find.flag' })
    })

    it('should keep the Date value itself (same instance) and not check the value: +-Infinity stay (float8 primary keys)', function() {
        let d = new Date(5)
        assert.strictEqual(lowerFindEq('time', d).v, d)
        assert.strictEqual(lowerFindEq('time', Infinity).v, Infinity)
        assert.strictEqual(lowerFindEq('time', -Infinity).v, -Infinity)
        assert.strictEqual(lowerFindEq('time', Infinity).t, 'cmp')
    })

    it('should build a null-prototype node with the keys t, c, op, v, p in this order', function() {
        for (let v of ['a', 1, true, new Date(0)]) {
            let n = lowerFindEq('k', v)
            assert.strictEqual(Object.getPrototypeOf(n), null)
            assert.deepStrictEqual(Object.keys(n), ['t', 'c', 'op', 'v', 'p'])
            assert.strictEqual(n.op, 'eq')
        }
    })

    it('should equal the IR that lowerFind gives for the same single-column equality (selectByPk shares its cache key with select)', function() {
        let values = ['a', '', 'x y', 0, -1, 1.5, 7, true, false, new Date(0), new Date(Date.UTC(2020, 0, 1))]
        let names = ['s', 'time', 'id', '中文欄', 'a'.repeat(40), 'a\nb', 'x\u0000y', 'a'.repeat(30), 'a'.repeat(31), '\u007f']
        for (let c of names) {
            for (let v of values) {
                let got = norm(lowerFindEq(c, v))
                let want = norm(lowerFind(nul({ [c]: v }), { maxParams: Infinity }))
                assert.deepStrictEqual(got, want, `${JSON.stringify(c)} ${String(v)}`)
            }
        }
    })

    it('should shorten long column names to 30 characters and replace control characters in the path only (the column itself stays)', function() {
        let n = lowerFindEq('a'.repeat(40), 1)
        assert.strictEqual(n.c, 'a'.repeat(40))
        assert.strictEqual(n.p, `find.${'a'.repeat(30)}...`)
        let m = lowerFindEq('a\nb', 1)
        assert.strictEqual(m.c, 'a\nb')
        assert.strictEqual(m.p, 'find.a?b')
    })

    it('should not throw and should not touch the inputs', function() {
        let d = new Date(5)
        assert.doesNotThrow(() => lowerFindEq('k', d))
        assert.strictEqual(d.getTime(), 5)
        assert.strictEqual(lowerFindEq.length, 2)
    })

})


describe('lowerFindEq.mjs為可抽出之方言中立共用層(IR-06)', function() {

    let src = fs.readFileSync(path.join(dirTest, '..', 'src', 'lowerFindEq.mjs'), 'utf8')

    it('should import nothing and export only the default function', function() {
        assert.ok(!/^\s*import\s/m.test(src), 'no import statements')
        assert.ok(!/\brequire\s*\(/.test(src), 'no require')
        assert.ok(!/\bimport\s*\(/.test(src), 'no dynamic import')
        let exported = [...src.matchAll(/^export (?:default |async )?(?:function |let |const )?(\w+)/gm)].map((m) => m[1])
        assert.deepStrictEqual(exported, ['lowerFindEq'])
        assert.strictEqual(lowerFindEq.name, 'lowerFindEq')
    })

    it('should not mention any database, query builder or driver by name', function() {
        assert.ok(!/\b(pg|knex|postgres|postgresql|pgsql|sequelize|sqlite|mssql|mysql|tedious|jet|access|mongo|mongodb)\b/i.test(src), 'dialect-neutral wording only')
    })

    it('should load and run in an empty vm realm without any Node global and give the same node', function() {
        let ctx = vm.createContext({})
        vm.runInContext(srcBundle('lowerFindEq', 'lowerFindEq'), ctx)
        for (let v of ['a', 1, true, new Date(5)]) {
            assert.deepStrictEqual(norm(ctx.lowerFindEq('c', v)), norm(lowerFindEq('c', v)))
        }
    })

    it('should be exported from the package index', function() {
        let idx = fs.readFileSync(path.join(dirTest, '..', 'src', 'index.mjs'), 'utf8')
        assert.ok(/export \{ default as lowerFindEq \} from '\.\/lowerFindEq\.mjs'/.test(idx))
    })

})
