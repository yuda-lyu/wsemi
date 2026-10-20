import assert from 'assert'
import cvOrmFind from '../src/cvOrmFind.mjs'
import lowerCases from '../src/_lowerFindCases.mjs'
import evalIr from './tools/irEval.mjs'


//契約案例表src/_lowerFindCases.mjs之自身測試(規則見CLAUDE_rulebook.md R-LOWER-01 IR-09 層1):
//形狀、種子資料列、期望IR之合法性(六節點、n元、攤平、路徑)、手推命中集合與獨立IR求值器一致、節點x運算子x值型別完整度矩陣、norm/denorm.
//期望IR與命中集合對實作(lowerFind)之核對見test/lowerFind.test.mjs.

let { columns, seed, semantics, norm, denorm } = lowerCases

let SIX = new Set(['and', 'or', 'cmp', 'bool', 'null', 'in'])
let OPS = ['eq', 'ne', 'gt', 'gte', 'lt', 'lte']
let walk = (ir, fn) => {
    if (ir === null) {
        return
    }
    fn(ir)
    if (ir.t === 'and' || ir.t === 'or') {
        ir.a.forEach((x) => walk(x, fn))
    }
}
let isDateObj = (v) => v !== null && typeof v === 'object' && Object.keys(v).length === 1 && typeof v.$date === 'number'
let isNegZero = (v) => v !== null && typeof v === 'object' && Object.keys(v).length === 1 && v.$negZero === true


describe('契約案例表 _lowerFindCases: 種子資料列與形狀(R-LOWER-01)', function() {

    it('should export exactly columns, seed, semantics, norm and denorm', function() {
        assert.deepStrictEqual(Object.keys(lowerCases).sort(), ['columns', 'denorm', 'norm', 'seed', 'semantics'])
        assert.strictEqual(typeof seed, 'function')
        assert.ok(Array.isArray(semantics))
        assert.deepStrictEqual(Object.keys(columns), ['id', 's', 'n', 'b', 'd'])
    })

    it('should give the six documented rows (hand-written): an all-NULL row 3, a boolean NULL in rows 3 and 6, a Date NULL in rows 3 and 5', function() {
        let rows = seed()
        assert.deepStrictEqual(norm(rows), [
            { id: 1, s: 'a', n: 1, b: true, d: { $date: Date.UTC(2020, 0, 1) } },
            { id: 2, s: 'b', n: 2, b: false, d: { $date: Date.UTC(2021, 0, 1) } },
            { id: 3, s: null, n: null, b: null, d: null },
            { id: 4, s: 'a', n: 3, b: true, d: { $date: Date.UTC(2022, 0, 1) } },
            { id: 5, s: '$x$', n: 4, b: false, d: null },
            { id: 6, s: '', n: 0, b: null, d: { $date: Date.UTC(2023, 0, 1) } },
        ])
        assert.deepStrictEqual(rows.map((r) => r.id), [1, 2, 3, 4, 5, 6])
    })

    it('should hand out fresh rows and fresh Dates on every call', function() {
        let a = seed()
        let b = seed()
        assert.notStrictEqual(a, b)
        assert.notStrictEqual(a[0], b[0])
        assert.notStrictEqual(a[0].d, b[0].d)
        a[0].d.setTime(0)
        a[0].s = 'changed'
        assert.strictEqual(seed()[0].s, 'a')
        assert.strictEqual(seed()[0].d.getTime(), Date.UTC(2020, 0, 1))
    })

    it('should have unique kebab-case ids and the documented fields on every entry', function() {
        let ids = new Set()
        for (let s of semantics) {
            assert.deepStrictEqual(Object.keys(s).filter((k) => k !== 'schema'), ['id', 'node', 'find', 'ir', 'hits'], s.id)
            assert.ok(!('schema' in s) || (s.schema === true && Array.isArray(s.hits)), `${s.id}: schema is true only beside a hit list`)
            assert.ok(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s.id), s.id)
            assert.ok(!ids.has(s.id), `duplicate id ${s.id}`)
            ids.add(s.id)
            assert.ok(typeof s.node === 'string' && s.node.length > 0, s.id)
            assert.strictEqual(typeof s.find, 'function', s.id)
        }
        assert.ok(semantics.length >= 50, String(semantics.length))
    })

    it('should return a fresh find on every call and have cvOrmFind accept every find', function() {
        for (let s of semantics) {
            let f1 = s.find()
            let f2 = s.find()
            if (f1 !== null && typeof f1 === 'object') {
                assert.notStrictEqual(f1, f2, s.id)
                assert.deepStrictEqual(f1, f2, s.id)
            }
            assert.doesNotThrow(() => cvOrmFind(s.find()), s.id)
        }
    })

    it('should keep hits ascending, unique and within the seed ids; null only for the collation-dependent case', function() {
        let all = new Set(seed().map((r) => r.id))
        for (let s of semantics) {
            if (s.hits === null) {
                assert.ok(['dollar-gte', 'string-lt-collation'].includes(s.id), s.id) //字串順序比較, 結果依collation
                continue
            }
            assert.deepStrictEqual(s.hits, [...s.hits].sort((x, y) => x - y), s.id)
            assert.strictEqual(new Set(s.hits).size, s.hits.length, s.id)
            s.hits.forEach((h) => assert.ok(all.has(h), `${s.id}: ${h}`))
        }
        assert.strictEqual(semantics.filter((s) => s.hits === null).length, 2)
        assert.deepStrictEqual(semantics.filter((s) => s.schema).map((s) => s.id), ['numeric-string-nonconvertible'])
    })

})


describe('契約案例表 _lowerFindCases: 期望IR之合法性(契約本文 IR-01)', function() {

    it('should use only the six node types, with and/or n-ary (>= 2 items) and flattened, and a source path on every leaf and none on and/or', function() {
        for (let s of semantics) {
            walk(s.ir, (n) => {
                assert.ok(SIX.has(n.t), `${s.id}: ${n.t}`)
                if (n.t === 'and' || n.t === 'or') {
                    assert.deepStrictEqual(Object.keys(n), ['t', 'a'], s.id)
                    assert.ok(n.a.length >= 2, `${s.id}: ${n.t} with ${n.a.length} items`)
                    n.a.forEach((c) => assert.notStrictEqual(c.t, n.t, `${s.id}: same-type nesting`))
                }
                else {
                    assert.strictEqual(typeof n.p, 'string', s.id)
                    assert.ok(n.p.startsWith('find.'), `${s.id}: ${n.p}`)
                }
            })
        }
    })

    it('should shape every leaf by its node type: cmp (string / number / Date, op of six), bool (boolean, op of six), null (not boolean), in (vs array without null, not boolean)', function() {
        for (let s of semantics) {
            walk(s.ir, (n) => {
                if (n.t === 'cmp') {
                    assert.deepStrictEqual(Object.keys(n), ['t', 'c', 'op', 'v', 'p'], s.id)
                    assert.ok(OPS.includes(n.op), s.id)
                    assert.ok(typeof n.v === 'string' || typeof n.v === 'number' || isDateObj(n.v) || isNegZero(n.v), `${s.id}: cmp value`)
                }
                else if (n.t === 'bool') {
                    assert.deepStrictEqual(Object.keys(n), ['t', 'c', 'op', 'v', 'p'], s.id)
                    assert.ok(OPS.includes(n.op), s.id)
                    assert.strictEqual(typeof n.v, 'boolean', s.id)
                }
                else if (n.t === 'null') {
                    assert.deepStrictEqual(Object.keys(n), ['t', 'c', 'not', 'p'], s.id)
                    assert.strictEqual(typeof n.not, 'boolean', s.id)
                }
                else if (n.t === 'in') {
                    assert.deepStrictEqual(Object.keys(n), ['t', 'c', 'vs', 'not', 'p'], s.id)
                    assert.ok(Array.isArray(n.vs), s.id)
                    assert.strictEqual(typeof n.not, 'boolean', s.id)
                    n.vs.forEach((v) => assert.ok(v !== null && v !== undefined, `${s.id}: in element`))
                    if (n.vs.length === 0) {
                        assert.strictEqual(n.not, false, `${s.id}: not in [] is never produced`)
                    }
                }
            })
        }
    })

    it('should name only the columns of the seed in every leaf', function() {
        let cols = new Set(Object.keys(columns))
        for (let s of semantics) {
            walk(s.ir, (n) => {
                if (n.t !== 'and' && n.t !== 'or') {
                    assert.ok(cols.has(n.c) && n.c !== 'id', `${s.id}: ${n.c}`)
                }
            })
        }
    })

})


describe('契約案例表 _lowerFindCases: 手推命中集合與獨立IR求值器一致', function() {

    it('should evaluate every expected IR to its hand-derived hits on the seed rows (the table is internally consistent)', function() {
        let n = 0
        for (let s of semantics) {
            let got = evalIr(denorm(s.ir), seed())
            if (s.hits === null) {
                assert.ok(Array.isArray(got), s.id) //排序規則相依: 只驗可求值
                continue
            }
            assert.deepStrictEqual(got, s.hits, s.id)
            n += 1
        }
        assert.strictEqual(n, semantics.length - 2)
    })

    it('should evaluate the hand-written hits independently of the evaluator: three-valued cases spelled out row by row', function() {
        let hits = (id) => semantics.find((s) => s.id === id).hits
        //NULL列(3)不命中任何比較與not in; 只被null節點與or中的null分支命中
        assert.ok(semantics.every((s) => s.hits === null || !s.hits.includes(3) || s.ir === null || JSON.stringify(s.ir).includes('"t":"null"')), 'row 3 is all NULL: only a null node (or no condition) can hit it')
        assert.deepStrictEqual(hits('ne-string'), [2, 5, 6]) //s != 'a': 非NULL且不等於a
        assert.deepStrictEqual(hits('bool-ne-true'), [2, 5]) //b != true: 只有b為false之列, b為NULL之列(3、6)不命中
        assert.deepStrictEqual(hits('nin'), [2, 5, 6]) //n not in (1,3): 非NULL且不在其內
        assert.deepStrictEqual(hits('in-empty'), []) //恆假
        assert.deepStrictEqual(hits('null-ne'), [1, 2, 4, 5, 6]) //s is not null
        assert.deepStrictEqual(hits('or-ne-null'), [1, 2, 3, 4, 5, 6]) //s is not null or n is null: 全部
    })

    it('should disagree with a deliberately wrong expected IR (the evaluator discriminates): ne treated as eq, not in treated as in, null not flipped', function() {
        let s = (id) => semantics.find((v) => v.id === id)
        let bad = [
            [s('ne-string'), (ir) => ({ ...ir, op: 'eq' })],
            [s('nin'), (ir) => ({ ...ir, not: false })],
            [s('null-ne'), (ir) => ({ ...ir, not: false })],
            [s('bool-ne-true'), (ir) => ({ ...ir, op: 'eq' })],
            [s('or'), (ir) => ({ ...ir, t: 'and' })],
            [s('and'), (ir) => ({ ...ir, t: 'or' })],
        ]
        for (let [c, mut] of bad) {
            assert.notDeepStrictEqual(evalIr(denorm(mut(c.ir)), seed()), c.hits, c.id)
        }
    })

})


describe('契約案例表 _lowerFindCases: 完整度矩陣(節點 x 運算子 x 值型別)', function() {

    let leaves = []
    semantics.forEach((s) => walk(s.ir, (n) => leaves.push([s.id, n])))

    it('should cover every operator of cmp and of bool at least once, and cmp for string, number and Date values', function() {
        for (let op of OPS) {
            assert.ok(leaves.some(([, n]) => n.t === 'cmp' && n.op === op), `cmp ${op}`)
            assert.ok(leaves.some(([, n]) => n.t === 'bool' && n.op === op), `bool ${op}`)
        }
        assert.ok(leaves.some(([, n]) => n.t === 'cmp' && typeof n.v === 'string'))
        assert.ok(leaves.some(([, n]) => n.t === 'cmp' && typeof n.v === 'number'))
        assert.ok(leaves.some(([, n]) => n.t === 'cmp' && isDateObj(n.v)))
        assert.ok(leaves.some(([, n]) => n.t === 'bool' && n.v === true))
        assert.ok(leaves.some(([, n]) => n.t === 'bool' && n.v === false))
    })

    it('should cover null / not null, in / not in, empty in, and in elements of string, number, boolean and Date', function() {
        assert.ok(leaves.some(([, n]) => n.t === 'null' && n.not === false))
        assert.ok(leaves.some(([, n]) => n.t === 'null' && n.not === true))
        assert.ok(leaves.some(([, n]) => n.t === 'in' && n.not === false && n.vs.length > 0))
        assert.ok(leaves.some(([, n]) => n.t === 'in' && n.not === true))
        assert.ok(leaves.some(([, n]) => n.t === 'in' && n.vs.length === 0))
        let isKind = { string: (v) => typeof v === 'string', number: (v) => typeof v === 'number', boolean: (v) => typeof v === 'boolean' }
        for (let kind of Object.keys(isKind)) {
            assert.ok(leaves.some(([, n]) => n.t === 'in' && n.vs.some(isKind[kind])), `in ${kind}`)
        }
        assert.ok(leaves.some(([, n]) => n.t === 'in' && n.vs.some(isDateObj)))
    })

    it('should cover every node type, the implicit AND (columns, operators), flattening, single-item unwrapping, nesting both ways, and no condition', function() {
        let types = new Set()
        semantics.forEach((s) => walk(s.ir, (n) => types.add(n.t)))
        assert.deepStrictEqual([...types].sort(), ['and', 'bool', 'cmp', 'in', 'null', 'or'])
        let ids = new Set(semantics.map((s) => s.id))
        for (let id of ['multi-column-and', 'same-column-ops', 'or-flatten', 'and-flatten', 'and-flatten-implicit', 'or-single-item', 'and-single-item', 'single-item-chain', 'nested-and-in-or', 'nested-or-in-and', 'column-beside-or', 'empty-object', 'undefined']) {
            assert.ok(ids.has(id), id)
        }
        assert.strictEqual(semantics.filter((s) => s.ir === null).length, 2)
    })

    it('should include at least one case for every three-valued trap: ne on a NULL row, bool ne, not in, ne null, empty in, an or that would hit the NULL row only through a null node', function() {
        let ids = new Set(semantics.map((s) => s.id))
        for (let id of ['ne-string', 'bool-ne-true', 'bool-ne-false', 'nin', 'nin-bool-elements', 'null-ne', 'in-empty', 'multi-op-in-empty', 'or-null', 'or-ne-null', 'and-ne-null']) {
            assert.ok(ids.has(id), id)
        }
    })

})


describe('契約案例表 _lowerFindCases: 完整度矩陣之交叉格(節點 x 運算子 x 值型別)', function() {

    let kind = (v) => (isDateObj(v) ? 'date' : isNegZero(v) ? 'number' : typeof v)
    let cells = new Set()
    semantics.forEach((s) => walk(s.ir, (n) => {
        if (n.t === 'cmp') {
            cells.add(`cmp:${n.op}:${kind(n.v)}`)
        }
        else if (n.t === 'bool') {
            cells.add(`bool:${n.op}:${n.v}`)
        }
        else if (n.t === 'null') {
            cells.add(`null:${n.not ? 'not' : 'is'}`)
        }
        else if (n.t === 'in') {
            for (let v of n.vs) {
                cells.add(`${n.not ? 'nin' : 'in'}:${kind(v) === 'boolean' ? String(v) : kind(v)}`)
            }
            if (n.vs.length === 0) {
                cells.add('in:empty')
            }
        }
    }))

    it('should cover every (op x value type) cell of cmp: six operators x string, number and Date', function() {
        let missing = []
        for (let op of OPS) {
            for (let k of ['string', 'number', 'date']) {
                if (!cells.has(`cmp:${op}:${k}`)) {
                    missing.push(`cmp:${op}:${k}`)
                }
            }
        }
        assert.deepStrictEqual(missing, [])
    })

    it('should cover every (op x value) cell of bool: six operators x true and false', function() {
        let missing = []
        for (let op of OPS) {
            for (let v of [true, false]) {
                if (!cells.has(`bool:${op}:${v}`)) {
                    missing.push(`bool:${op}:${v}`)
                }
            }
        }
        assert.deepStrictEqual(missing, [])
    })

    it('should cover every (not x element type) cell of in: in and not in with string, number, true, false and Date elements, the empty in, and null / not null', function() {
        let missing = []
        for (let t of ['in', 'nin']) {
            for (let k of ['string', 'number', 'true', 'false', 'date']) {
                if (!cells.has(`${t}:${k}`)) {
                    missing.push(`${t}:${k}`)
                }
            }
        }
        for (let c of ['in:empty', 'null:is', 'null:not']) {
            if (!cells.has(c)) {
                missing.push(c)
            }
        }
        assert.deepStrictEqual(missing, [])
    })

    it('should include the always-false branch in every position: alone, inside and, inside or, and inside or beside a null node', function() {
        let ids = new Set(semantics.map((s) => s.id))
        for (let id of ['in-empty', 'multi-op-in-empty', 'or-empty-in', 'or-empty-in-null']) {
            assert.ok(ids.has(id), id)
        }
    })

    it('should pin the value-comparison conventions as cases: millisecond precision of Date, negative zero, numeric-format strings on an integer column, element order and duplicates of in', function() {
        let sem = (id) => semantics.find((s) => s.id === id)
        for (let id of ['date-ms-eq', 'date-ms-gt', 'date-ms-lt', 'date-nonmidnight', 'eq-negative-zero', 'numeric-string-eq', 'numeric-string-in', 'numeric-string-nonconvertible', 'in-unsorted-duplicates']) {
            assert.ok(sem(id), id)
        }
        assert.ok(Object.is(denorm(sem('eq-negative-zero').ir).v, -0), 'the expected IR holds a real negative zero')
        assert.deepStrictEqual(sem('in-unsorted-duplicates').ir.vs, [3, 1, 3, 2])
        //毫秒精度: 同一瞬間之整日/整秒截斷會使這三案之命中集合與預期不同
        assert.notDeepStrictEqual(sem('date-ms-eq').hits, sem('date-eq').hits)
    })

})


describe('契約案例表 _lowerFindCases: norm 與 denorm', function() {

    it('should turn Dates into { $date: ms } and null-prototype objects into plain objects, and leave everything else equal', function() {
        let d = new Date(Date.UTC(2020, 0, 1))
        let o = Object.assign(Object.create(null), { t: 'cmp', v: d, vs: [d, 'x', 1, true, null], nested: Object.assign(Object.create(null), { z: 1 }) })
        let n = norm(o)
        assert.strictEqual(Object.getPrototypeOf(n), Object.prototype)
        assert.deepStrictEqual(n, { t: 'cmp', v: { $date: d.getTime() }, vs: [{ $date: d.getTime() }, 'x', 1, true, null], nested: { z: 1 } })
        assert.strictEqual(norm(null), null)
    })

    it('should keep the sign of negative zero through norm and denorm (JSON alone would turn -0 into 0), and leave 0 and other numbers alone', function() {
        assert.deepStrictEqual(norm({ v: -0 }), { v: { $negZero: true } })
        assert.deepStrictEqual(norm({ v: 0 }), { v: 0 })
        assert.deepStrictEqual(norm({ vs: [-0, 0, 1, -1, 9007199254740992] }), { vs: [{ $negZero: true }, 0, 1, -1, 9007199254740992] })
        assert.ok(Object.is(denorm({ v: { $negZero: true } }).v, -0))
        assert.ok(Object.is(denorm({ v: 0 }).v, 0))
        assert.deepStrictEqual(denorm({ v: { $negZero: false } }), { v: { $negZero: false } })
        assert.deepStrictEqual(denorm({ v: { $negZero: true, other: 1 } }), { v: { $negZero: true, other: 1 } })
    })

    it('should invert norm on every expected IR and on the seed rows (Date restored as a real Date)', function() {
        for (let s of semantics) {
            assert.deepStrictEqual(norm(denorm(s.ir)), s.ir, s.id)
        }
        let rows = seed()
        assert.deepStrictEqual(denorm(norm(rows)), rows)
        let r = denorm({ v: { $date: 5 }, w: [{ $date: 6 }] })
        assert.ok(r.v instanceof Date && r.v.getTime() === 5)
        assert.ok(r.w[0] instanceof Date && r.w[0].getTime() === 6)
        assert.deepStrictEqual(denorm({ v: { $date: 5, other: 1 }, w: { $date: 'x' } }), { v: { $date: 5, other: 1 }, w: { $date: 'x' } }) //只還原恰含數值$date一鍵者
    })

})
