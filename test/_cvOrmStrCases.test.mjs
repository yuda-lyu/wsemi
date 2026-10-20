import assert from 'assert'
import ormStrCases from '../src/_cvOrmStrCases.mjs'
import chkOrmStr from '../src/chkOrmStr.mjs'
import { createRefModel, runApiCase } from './tools/ormStrRefModel.mjs'


//契約案例表src/_cvOrmStrCases.mjs之自身測試(規則見CLAUDE_rulebook.md R-ORMSTR-01):
//形狀、形態旗標(獨立預言機)、輸入空間完整度矩陣(形態 x 位置 x API)、訊息詞彙、全新值、對參考後端逐案執行、對參考後端之變異(各接線點拿掉須轉紅)

let { reasons, forms, cases } = ormStrCases

let API_KINDS = {
    insert: ['ok', 'rejectAll', 'free'],
    insertBulk: ['ok', 'rejectAll', 'free'],
    insertGfs: ['ok', 'rejectAll'],
    save: ['itemErr', 'free'],
    del: ['itemErr'],
    delGfs: ['itemErr'],
    selectByPk: ['ok', 'null'],
    selectByPkGfs: ['ok', 'null'],
    new: ['throw'],
}

//獨立預言機: 逐碼點(不用isWellFormed與正規式)
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

let apiCases = cases.filter((c) => ['id', 'single', 'val', 'free', 'type', 'toctou', 'order', 'opt', 'gfs'].includes(c.group))
let mkA = (id, extra) => ({ id, name: 'n', ...extra })
let mkB = (id, extra) => ({ ...extra, ...(extra && 'name' in extra ? {} : { name: 'n' }), id }) //鍵序不同: extra先、主鍵最後
//GridFS用之文件工廠: 另補該API必要之欄位(模擬mongodb insertGfs須有Uint8Array之u8a)
let mkGfsA = (id, extra) => ({ ...mkA(id, extra), u8a: new Uint8Array(2) })
let mkGfsB = (id, extra) => ({ ...mkB(id, extra), u8a: new Uint8Array(2) })
let base = { url: 'x://y/', db: 'd', cl: 'c' }

let runAll = async (mk, cfg, filter = () => true) => {
    let out = []
    for (let c of apiCases.filter(filter)) {
        let probs = await runApiCase(c, { create: () => createRefModel(base, cfg), ctor: (opt) => createRefModel(opt, cfg), mk, mkGfs: mk === mkB ? mkGfsB : mkGfsA, base })
        if (probs.length > 0) {
            out.push({ id: c.id, probs })
        }
    }
    return out
}


describe('契約案例表 形態與形狀(R-ORMSTR-01)', function() {

    it('should flag every form correctly (lone surrogate / NUL) according to an independent oracle, and keep reasons equal to chkOrmStr vocabulary', function() {
        assert.deepStrictEqual(reasons, { notStr: chkOrmStr(1), nul: chkOrmStr('\u0000'), lone: chkOrmStr('\uD800') })
        let keys = Object.keys(forms)
        assert.ok(keys.length >= 24, `forms: ${keys.length}`)
        for (let k of keys) {
            let f = forms[k]
            assert.strictEqual(f.lone, hasLone(f.str), `${k} lone`)
            assert.strictEqual(f.nul, hasNul(f.str), `${k} nul`)
            assert.strictEqual(typeof f.label, 'string')
            assert.strictEqual(typeof f.unit, 'boolean')
        }
    })

    it('should cover the required forms: ASCII, CJK, emoji, CJK extension B, U+FFFD, lone high/low at every place, reversed pair, NUL at start/middle/end', function() {
        let need = ['ASCII', 'CJK', 'EMOJI', 'EXTB', 'FFFD', 'HI_END', 'HI_MID', 'HI_LEAD', 'HI_ONLY', 'LO_END', 'LO_MID', 'LO_LEAD', 'LO_ONLY', 'REV', 'NUL_LEAD', 'NUL_MID', 'NUL_END']
        for (let k of need) {
            assert.ok(forms[k], k)
        }
        assert.ok(forms.EMOJI.str.codePointAt(1) === 0x1F600 && !forms.EMOJI.lone)
        assert.ok(forms.EXTB.str.codePointAt(0) === 0x20BB7 && !forms.EXTB.lone)
        assert.ok(forms.FFFD.str.includes('\uFFFD') && !forms.FFFD.lone)
        assert.ok(forms.REV.str.endsWith('\uD800') && forms.REV.str.includes('\uDC00\uD800'))
    })

    it('should give every case a unique id, a group, a label and a well-formed shape', function() {
        let ids = new Set()
        for (let c of cases) {
            assert.ok(!ids.has(c.id), `duplicate id ${c.id}`)
            ids.add(c.id)
            assert.ok(['str', 'data', 'id', 'single', 'val', 'free', 'type', 'toctou', 'order', 'opt', 'gfs'].includes(c.group), c.id)
            assert.strictEqual(typeof c.label, 'string', c.id)
            assert.ok('expect' in c, c.id)
        }
        for (let c of apiCases) {
            assert.ok(API_KINDS[c.api], `${c.id}: api ${c.api}`)
            assert.ok(API_KINDS[c.api].includes(c.expect.kind), `${c.id}: kind ${c.expect.kind} for ${c.api}`)
            assert.ok(['id', 'name', 'nested', 'array', 'arrayObj', 'key', 'nestedKey', 'map', 'mapKey', 'set', 'strobj', 'error', 'regexp', 'inherit', 'arrObjKey', 'opt.db', 'opt.cl', 'opt.url'].includes(c.pos), c.id)
            assert.ok(forms[c.form], c.id)
            assert.strictEqual(c.str, forms[c.form].str, c.id)
            assert.ok(Array.isArray(c.need) && c.need.every((v) => ['doc', 'gfs'].includes(v)), c.id)
            assert.strictEqual(typeof c.pre, 'function', c.id)
            assert.strictEqual(typeof c.args, 'function', c.id)
            assert.ok(c.variant === null || ['insert', 'update'].includes(c.variant), c.id)
            let e = c.expect
            if (e.kind === 'ok' || e.kind === 'null') {
                assert.ok(!('msg' in e && e.kind === 'ok'), c.id)
            }
            if (e.kind === 'free') {
                assert.strictEqual(typeof e.notMsg, 'string', c.id)
                assert.ok(c.group === 'free' && forms[c.form].nul && !forms[c.form].lone, `${c.id}: free is for NUL-only forms`)
            }
            if (e.kind === 'itemErr' && e.bad.length > 1) {
                assert.ok(Array.isArray(e.msgs) && e.msgs.length === e.bad.length && !('msg' in e), `${c.id}: msgs aligned with bad`)
                assert.ok(e.msgs.every((m) => m.includes(e.why)), `${c.id}: every msg must hold the reason`)
            }
            else if (e.kind === 'rejectAll' || e.kind === 'throw' || (e.kind === 'itemErr' && e.bad.length > 0)) {
                assert.strictEqual(typeof e.msg, 'string', c.id)
                assert.ok(e.msg.includes(e.why), `${c.id}: msg must hold the reason`)
            }
            for (let list of [e.ids, e.gfsIds]) {
                if (list) {
                    assert.deepStrictEqual(list, [...list].sort(), `${c.id}: ids must be sorted`)
                    assert.strictEqual(new Set(list).size, list.length, `${c.id}: ids unique`)
                }
            }
            if (e.unchanged) {
                assert.ok(Array.isArray(e.unchanged) && e.unchanged.every((v) => typeof v === 'string'), `${c.id}: unchanged`)
            }
            if (c.afterCall) {
                assert.strictEqual(c.group, 'toctou', c.id)
            }
        }
    })

    it('should word every expected message in the fixed vocabulary, never echoing the string, and with a path of the dspec form', function() {
        let reId = /^invalid id: (string contains lone surrogate|string contains NUL) at \[data\[\d\]\.id\]$/
        let reData = /^invalid data: string contains lone surrogate at \[data\[\d\]\.(?:[A-Za-z]+|<invalid key>|<key>)(?:\.(?:[A-Za-z]+|<invalid key>|<key>)|\[\d\])*\]$/
        let reOpt = /^invalid opt\.(db|cl|url): string contains lone surrogate$/
        let all = []
        for (let c of apiCases) {
            for (let m of c.expect.msgs ? c.expect.msgs : c.expect.msg === undefined ? [] : [c.expect.msg]) {
                all.push([c, m])
            }
        }
        for (let [c, m] of all) {
            if (c.group === 'opt') {
                assert.ok(reOpt.test(m), m)
            }
            else if (m.startsWith('invalid id')) {
                assert.ok(reId.test(m), m)
            }
            else {
                assert.ok(reData.test(m), m)
            }
            assert.ok(m.isWellFormed() && !m.includes('\u0000'), `message must not echo a lone surrogate or NUL (${c.id})`)
        }
    })

    it('should hand out fresh values on every call of pre() and args(): no object (at any depth, including Map/Set contents) is shared between two calls, and mutating one result leaves the next unchanged', function() {
        //可達物件集合(不呼叫存取器: 只取資料屬性)
        let reach = (v, out) => {
            if (v === null || typeof v !== 'object' || out.has(v)) {
                return out
            }
            out.add(v)
            if (v instanceof Map) {
                for (let [k, x] of v) {
                    reach(k, out)
                    reach(x, out)
                }
            }
            else if (v instanceof Set) {
                for (let x of v) {
                    reach(x, out)
                }
            }
            for (let k of Reflect.ownKeys(v)) {
                let d = Object.getOwnPropertyDescriptor(v, k)
                if (d && 'value' in d) {
                    reach(d.value, out)
                }
            }
            return out
        }
        let shared = (x, y) => {
            let sx = reach(x, new Set())
            for (let o of reach(y, new Set())) {
                if (sx.has(o)) {
                    return true
                }
            }
            return false
        }
        for (let c of apiCases) {
            let a1 = c.args(mkA, base)
            let a2 = c.args(mkA, base)
            let stateful = c.group === 'toctou' //docs帶讀取計數之存取器, 深度比較會推進計數, 只驗不共用物件
            if (!stateful) {
                assert.deepStrictEqual(a1, a2, c.id)
            }
            assert.ok(!shared(a1, a2), `${c.id}: args() results share an object`)
            let p1 = c.pre(mkA)
            let p2 = c.pre(mkA)
            assert.deepStrictEqual(p1, p2, c.id)
            assert.ok(!shared(p1, p2), `${c.id}: pre() results share an object`)
            for (let o of [...reach(p1, new Set()), ...reach(a1, new Set())]) {
                if (!(o instanceof Map) && !(o instanceof Set) && Object.isExtensible(o)) {
                    Object.defineProperty(o, '__mutated', { value: true, enumerable: true, configurable: true })
                }
            }
            assert.deepStrictEqual(c.pre(mkA), p2, c.id)
            if (!stateful) {
                assert.deepStrictEqual(c.args(mkA, base), a2, c.id)
            }
        }
    })

    it('should use only well-formed strings in pre() rows (preloading must always be possible)', function() {
        for (let c of apiCases) {
            for (let d of c.pre(mkA)) {
                assert.strictEqual(chkOrmStr(d.id), null, c.id)
            }
        }
    })

})


describe('契約案例表 輸入空間完整度矩陣(形態 x 位置 x API; R-ORMSTR-01)', function() {

    let formKeys = Object.keys(forms)
    let idForms = formKeys.filter((k) => !forms[k].unit && !forms[k].long) //主鍵/單一物件/GridFS/opt不含長字串形態(鍵長度上限)
    let allApiForms = formKeys.filter((k) => !forms[k].unit)
    let valForms = allApiForms.filter((k) => !forms[k].nul || forms[k].lone) //僅含NUL者(無孤立代理)改見group='free'; 值與鍵名含長字串形態
    let nulOnly = allApiForms.filter((k) => forms[k].nul && !forms[k].lone)
    let loneOnly = idForms.filter((k) => forms[k].lone && !forms[k].nul) //opt不產生含NUL或長字串之形態
    let byId = new Map(cases.map((c) => [c.id, c]))

    it('should have exactly one case for every (form, id-position API) cell, for forms usable at the API layer', function() {
        let n = 0
        for (let api of ['insert', 'insertBulk', 'save', 'del', 'selectByPk']) {
            for (let k of idForms) {
                let c = byId.get(`id:${api}:${k}`)
                assert.ok(c, `missing id:${api}:${k}`)
                assert.strictEqual(c.pos, 'id')
                n++
            }
        }
        for (let api of ['insertGfs', 'selectByPkGfs', 'delGfs']) {
            for (let k of idForms) {
                assert.ok(byId.get(`gfs:${api}:${k}`), `missing gfs:${api}:${k}`)
                n++
            }
        }
        //save(autoInsert:false): 每個不合格主鍵形態一案
        let rejForms = idForms.filter((k) => forms[k].lone || forms[k].nul)
        for (let k of rejForms) {
            let c = byId.get(`id:save-noinsert:${k}`)
            assert.ok(c, `missing id:save-noinsert:${k}`)
            assert.deepStrictEqual(c.args(mkA, base)[1], { autoInsert: false })
            assert.deepStrictEqual(c.expect.bad, [1])
            n++
        }
        assert.strictEqual(cases.filter((c) => c.group === 'id').length + cases.filter((c) => c.group === 'gfs').length, n)
        assert.strictEqual(cases.filter((c) => c.id.startsWith('id:save-noinsert:')).length, rejForms.length)
    })

    it('should cover every rejecting form with the extra boundary forms: DBFF, DFFF, two low halves, U+FFFD next to a lone half, a long string ending in a lone half; and accept combining marks, ZWJ sequences, a single character and a long clean string', function() {
        for (let k of ['HI_MAX', 'LO_MAX', 'LO_LO', 'FFFD_HI', 'LONG_LONE']) {
            assert.ok(forms[k].lone, k)
        }
        for (let k of ['COMB', 'ZWJ', 'SINGLE', 'LONG_OK']) {
            assert.ok(!forms[k].lone && !forms[k].nul, k)
        }
        assert.strictEqual(forms.LONG_OK.str.length, 1000)
        assert.strictEqual(forms.LONG_LONE.str.length, 1001)
        assert.ok(forms.LONG_OK.long && forms.LONG_LONE.long && !forms.ASCII.long)
        assert.ok(byId.get('val:insert:name:LONG_LONE') && byId.get('val:insert:key:LONG_LONE') && !byId.get('id:insert:LONG_LONE') && !byId.get('opt:db:LONG_LONE'))
        assert.ok(byId.get('id:insert:COMB') && byId.get('id:insert:ZWJ') && byId.get('id:insert:SINGLE'))
    })

    it('should have exactly one case for every (form, value-position, write API) cell, NUL forms excluded (values and keys may hold NUL)', function() {
        let n = 0
        for (let p of ['name', 'nested', 'array', 'arrayObj', 'key', 'nestedKey']) {
            for (let k of valForms) {
                for (let api of ['insert', 'insertBulk']) {
                    assert.ok(byId.get(`val:${api}:${p}:${k}`), `missing val:${api}:${p}:${k}`)
                    n++
                }
                for (let v of ['insert', 'update']) {
                    let c = byId.get(`val:save:${v}:${p}:${k}`)
                    assert.ok(c, `missing val:save:${v}:${p}:${k}`)
                    assert.strictEqual(c.variant, v)
                    n++
                }
            }
        }
        assert.strictEqual(cases.filter((c) => c.group === 'val').length, n)
        assert.ok(!cases.some((c) => c.group === 'val' && forms[c.form].nul && !forms[c.form].lone), 'NUL-only value/key cases belong to group free')
        assert.ok(byId.get('val:insert:name:NUL_LONE').expect.why === reasons.lone, 'NUL plus lone surrogate in a value is rejected for the lone surrogate')
    })

    it('should have exactly one case for every (type, form, write API) cell of the stored types: Map value, Map key, Set, String wrapper, Error, RegExp, inherited property, key inside an array element', function() {
        let types = ['map', 'mapKey', 'set', 'strobj', 'error', 'regexp', 'inherit', 'arrObjKey']
        for (let tp of types) {
            for (let k of ['HI_END', 'LO_MID', 'REV']) {
                for (let api of ['insert', 'save']) {
                    let c = byId.get(`type:${api}:${tp}:${k}`)
                    assert.ok(c, `missing type:${api}:${tp}:${k}`)
                    assert.deepStrictEqual(c.need, [])
                }
            }
        }
        assert.strictEqual(cases.filter((c) => c.group === 'type').length, types.length * 3 * 2)
    })

    it('should have the read-consistency cases (accessor first read, mutation right after the call) for insert, insertBulk and save', function() {
        for (let api of ['insert', 'insertBulk', 'save']) {
            for (let v of ['bad-first', 'good-first', 'mutate-after-call']) {
                assert.ok(byId.get(`toctou:${api}:${v}`), `${api} ${v}`)
            }
        }
        assert.strictEqual(typeof byId.get('toctou:insert:mutate-after-call').afterCall, 'function')
        assert.strictEqual(cases.filter((c) => c.group === 'toctou').length, 9)
    })

    it('should not require the doc capability for any rejecting case (the check runs before field filtering), only for accepting cases that read back nested structure or arbitrary keys', function() {
        for (let c of apiCases) {
            let rejecting = ['rejectAll', 'null', 'throw'].includes(c.expect.kind) || (c.expect.kind === 'itemErr' && c.expect.bad.length > 0)
            if (rejecting || c.expect.kind === 'free') {
                assert.ok(!c.need.includes('doc'), c.id)
            }
        }
        assert.ok(byId.get('val:insert:nested:EMOJI').need.includes('doc'))
        assert.deepStrictEqual(byId.get('val:insert:nested:HI_END').need, [])
    })

    it('should have exactly one case for every (NUL-only form, value-position, write API) cell in group free (a NUL in a value or key is not rejected by the shared check)', function() {
        let n = 0
        for (let p of ['name', 'nested', 'array', 'arrayObj', 'key', 'nestedKey']) {
            for (let k of nulOnly) {
                for (let api of ['insert', 'insertBulk', 'save']) {
                    let c = byId.get(`free:${api}:${p}:${k}`)
                    assert.ok(c, `missing free:${api}:${p}:${k}`)
                    assert.strictEqual(c.expect.kind, 'free')
                    n++
                }
            }
        }
        assert.strictEqual(cases.filter((c) => c.group === 'free').length, n)
        assert.strictEqual(nulOnly.length, 4)
    })

    it('should have one single-object call case for every (form, write API) cell: insert, insertBulk, save, del, insertGfs and delGfs (batch index data[0])', function() {
        let n = 0
        for (let api of ['insert', 'insertBulk', 'save', 'del', 'insertGfs', 'delGfs']) {
            for (let k of idForms) {
                let c = byId.get(`single:${api}:${k}`)
                assert.ok(c, `missing single:${api}:${k}`)
                let a = c.args(mkGfsA, base)
                assert.ok(a.length === 1 && !Array.isArray(a[0]), `${c.id}: the argument must be one object`)
                if (c.expect.msg !== undefined) {
                    assert.ok(c.expect.msg.endsWith('at [data[0].id]'), c.id)
                }
                n++
            }
        }
        assert.strictEqual(cases.filter((c) => c.group === 'single').length, n)
    })

    it('should have one construction case for every lone form at opt.db, opt.cl and opt.url (every position of the lone string: leading, middle, trailing, alone, reversed)', function() {
        for (let p of ['db', 'cl', 'url']) {
            for (let k of loneOnly) {
                let c = byId.get(`opt:${p}:${k}`)
                assert.ok(c, `missing opt:${p}:${k}`)
                assert.strictEqual(c.expect.kind, 'throw')
            }
        }
        assert.strictEqual(cases.filter((c) => c.group === 'opt').length, 3 * loneOnly.length)
    })

    it('should require every lone form to be rejected and every well-formed form to be accepted at every position (expect kind follows the oracle)', function() {
        for (let c of apiCases.filter((v) => v.group === 'id' || v.group === 'single' || v.group === 'val' || v.group === 'gfs')) {
            let f = forms[c.form]
            let reject = c.pos === 'id' ? f.lone || f.nul : f.lone
            let kinds = reject ? ['rejectAll', 'itemErr', 'null'] : ['ok', 'itemErr']
            assert.ok(kinds.includes(c.expect.kind), `${c.id}: ${c.expect.kind}`)
            if (reject) {
                assert.ok(c.expect.why, c.id)
                if (c.expect.kind === 'itemErr' || c.expect.kind === 'rejectAll') {
                    assert.deepStrictEqual(c.expect.bad, c.group === 'single' ? [0] : [1], c.id)
                }
            }
            else {
                assert.ok(!c.expect.why, c.id)
                if (c.expect.kind === 'itemErr') {
                    assert.deepStrictEqual(c.expect.bad, [], c.id)
                }
            }
        }
    })

    it('should expect NUL before lone surrogate for primary keys that hold both (NUL_LONE)', function() {
        assert.strictEqual(byId.get('id:insert:NUL_LONE').expect.why, reasons.nul)
        assert.strictEqual(byId.get('str:NUL_LONE').expect, reasons.nul)
        assert.strictEqual(byId.get('str:NUL_LONE:nul-off').expect, reasons.lone)
    })

    it('should preload a neighbour row for every rejected primary key whose neighbour is a non-empty string, so a wrongly accepted string would hit it (U+FFFD sibling, NUL prefix sibling)', function() {
        //獨立重算鄰近列: 孤立碼元改U+FFFD、NUL之後截斷; NUL_LEAD與NUL_ONLY截斷後為空字串, 無鄰近列可預存
        let none = []
        for (let k of idForms) {
            let f = forms[k]
            if (!f.lone && !f.nul) {
                continue
            }
            let want = ''
            for (let ch of f.str) {
                want += ch.length === 1 && ch.charCodeAt(0) >= 0xD800 && ch.charCodeAt(0) <= 0xDFFF ? String.fromCharCode(0xFFFD) : ch
            }
            let cut = want.indexOf(String.fromCharCode(0))
            want = cut === -1 ? want : want.slice(0, cut)
            let got = byId.get(`id:insert:${k}`).pre(mkA).map((d) => d.id)
            if (want === '' || want === f.str) {
                none.push(k)
                assert.deepStrictEqual(got, ['k0'], k)
            }
            else {
                assert.deepStrictEqual(got, ['k0', want], k)
            }
        }
        assert.deepStrictEqual(none, ['NUL_LEAD', 'NUL_ONLY'])
        let c = byId.get('id:del:HI_END')
        assert.deepStrictEqual(c.pre(mkA).map((d) => d.id), ['k0', 'a\uFFFD', 'k1', 'k2'])
        let c2 = byId.get('id:insert:NUL_MID')
        assert.deepStrictEqual(c2.pre(mkA).map((d) => d.id), ['k0', 'a'])
        let c3 = byId.get('id:insert:REV')
        assert.deepStrictEqual(c3.pre(mkA).map((d) => d.id), ['k0', 'a\uFFFD\uFFFD'])
    })

    it('should pin the size of the table (statistics reported in the ledger)', function() {
        let g = {}
        for (let c of cases) {
            g[c.group] = (g[c.group] || 0) + 1
        }
        assert.deepStrictEqual(g, { str: 74, data: 174, id: 171, gfs: 90, single: 180, val: 672, free: 72, type: 48, toctou: 9, order: 15, opt: 48 })
        assert.strictEqual(cases.length, 1553)
    })

})


describe('契約案例表 對參考後端逐案執行(R-ORMSTR-01)', function() {

    it('should pass every API case on the reference model (mk with defaults first)', async function() {
        let bad = await runAll(mkA)
        assert.deepStrictEqual(bad.slice(0, 5), [])
    })

    it('should pass every API case on the reference model when the document factory orders keys differently (expectations do not depend on key order)', async function() {
        let bad = await runAll(mkB)
        assert.deepStrictEqual(bad.slice(0, 5), [])
    })

})


describe('契約案例表 對參考後端之變異(各接線點拿掉須轉紅)', function() {

    let group = (g) => (c) => c.group === g
    let idCases = apiCases.filter((c) => c.pos === 'id' && c.group === 'id')
    let sorted = (a) => [...a].sort()

    it('should turn red when the primary-key check is removed (every rejected id case of the write APIs fails, accepted forms still pass)', async function() {
        let bad = await runAll(mkA, { checkId: false }, (c) => c.pos === 'id' && c.group === 'id')
        //selectByPk回null本不需檢核即成立(參考後端無改寫), 由下方改寫模型之變異涵蓋
        let want = idCases.filter((c) => c.expect.why && c.api !== 'selectByPk').map((c) => c.id)
        assert.strictEqual(want.length, 105) //21個不合格形態 x (insert、insertBulk、save、del、save-noinsert)
        assert.deepStrictEqual(sorted(bad.map((v) => v.id)), sorted(want))
    })

    it('should turn red when the NUL part of the primary-key check is removed (the NUL forms of the write APIs fail, NUL_LONE too since the NUL reason must come first)', async function() {
        let bad = await runAll(mkA, { idNul: false }, (c) => c.pos === 'id' && c.group === 'id')
        let want = idCases.filter((c) => forms[c.form].nul && c.api !== 'selectByPk').map((c) => c.id)
        assert.strictEqual(want.length, 25) //5個NUL形態 x 5個寫入案(insert、insertBulk、save、del、save-noinsert)
        assert.deepStrictEqual(sorted(bad.map((v) => v.id)), sorted(want))
    })

    it('should turn red when the data check is removed (every rejected value/key case fails)', async function() {
        let bad = await runAll(mkA, { checkData: false }, group('val'))
        let rej = apiCases.filter((c) => c.group === 'val' && c.expect.why).map((c) => c.id)
        assert.ok(rej.length >= 250, `${rej.length}`)
        assert.deepStrictEqual(sorted(bad.map((v) => v.id)), sorted(rej))
        let bad2 = await runAll(mkA, { checkData: false }, group('order'))
        assert.ok(bad2.length >= 5)
    })

    it('should turn red when the opt check is removed (every construction case fails)', async function() {
        let bad = await runAll(mkA, { checkOpt: false }, group('opt'))
        assert.strictEqual(bad.length, apiCases.filter(group('opt')).length)
    })

    it('should turn red for the order cases when the primary-key check is missing (the data message would surface instead of the id message)', async function() {
        let bad = await runAll(mkA, { checkId: false }, (c) => c.group === 'order')
        assert.ok(bad.some((v) => v.id.includes('id-before-data')))
    })

    it('should turn red for the free cases when the data check also rejects NUL in values and keys (a wrong wiring of opt.nul)', async function() {
        let bad = await runAll(mkA, { dataNul: true }, group('free'))
        assert.strictEqual(bad.length, apiCases.filter(group('free')).length)
        assert.ok((await runAll(mkA, {}, group('free'))).length === 0)
    })

    it('should turn red when a failing call alters an existing row (a rewritten key appears): every rejecting case with an unchanged list fails', async function() {
        let onFail = (store) => {
            for (let [k, d] of store) {
                store.set(k, { ...d, _rewritten: 1 })
            }
        }
        let bad = await runAll(mkA, { onFail })
        //selectByPk/selectByPkGfs(kind null)不寫入, 無失敗路徑可改動既有列; 其unchanged只防多餘副作用
        let want = apiCases.filter((c) => c.expect.unchanged && c.expect.unchanged.length > 0 && c.expect.kind !== 'null').map((c) => c.id)
        assert.ok(want.length >= 300, `${want.length}`)
        assert.deepStrictEqual(sorted(bad.map((v) => v.id)), sorted(want))
    })

    it('should turn red when a batch reject has already written (insert, insertBulk, insertGfs leak): every rejectAll case fails through ids or gfsIds', async function() {
        let bad = await runAll(mkA, { leakOnFail: true })
        let want = apiCases.filter((c) => c.expect.kind === 'rejectAll').map((c) => c.id)
        assert.ok(want.length >= 150, `${want.length}`)
        assert.deepStrictEqual(sorted(bad.map((v) => v.id)), sorted(want))
    })

    it('should turn red when a successful insert does not report ok:1, and when selectByPkGfs never finds the file', async function() {
        let create = () => {
            let wo = createRefModel(base, {})
            let ins = wo.insert
            wo.insert = async (d) => {
                await ins(d)
                return { ok: 0 }
            }
            wo.insertBulk = wo.insert
            wo.selectByPkGfs = async () => null
            return wo
        }
        let bad = []
        for (let c of apiCases) {
            let probs = await runApiCase(c, { create, ctor: (opt) => createRefModel(opt, {}), mk: mkA, mkGfs: mkGfsA, base })
            if (probs.length > 0) {
                bad.push(c.id)
            }
        }
        let want = apiCases.filter((c) => c.expect.kind === 'ok' && (/^insert(Bulk)?$/.test(c.api) || c.api === 'selectByPkGfs')).map((c) => c.id)
        //selectByPkGfs恆回null: 拒收案(kind null)仍通過, 其unchanged快照亦同為null; 故只有成功案轉紅
        assert.ok(want.length >= 100, `${want.length}`)
        assert.deepStrictEqual(sorted(bad), sorted(want))
    })

    it('should need the GridFS document factory: with the plain factory (no u8a) the GridFS cases fail to preload or insert', async function() {
        let c = apiCases.find((v) => v.id === 'gfs:insertGfs:ASCII')
        await assert.rejects(() => runApiCase(c, { create: () => createRefModel(base, {}), ctor: null, mk: mkA, mkGfs: undefined, base }), /u8a/)
        assert.deepStrictEqual(await runApiCase(c, { create: () => createRefModel(base, {}), ctor: null, mk: mkA, mkGfs: mkGfsA, base }), [])
    })

    it('should pass the whole table for a model that stores through UTF-8 (lone surrogate -> U+FFFD, NUL truncates) as long as the checks are on', async function() {
        assert.deepStrictEqual((await runAll(mkA, { mangle: true })).slice(0, 5), [])
    })

    it('should turn red for a UTF-8 style model without the checks: every rejected case fails, except selectByPk of a NUL key with no neighbour to hit', async function() {
        let bad = await runAll(mkA, { mangle: true, checkId: false, checkData: false }, (c) => c.group !== 'opt')
        let rej = apiCases.filter((c) => c.group !== 'opt' && (c.expect.kind === 'rejectAll' || c.expect.kind === 'null' || (c.expect.kind === 'itemErr' && c.expect.bad.length > 0)))
        //語意上無法證偽者: 主鍵截斷後為空字串(NUL_LEAD、NUL_ONLY)之selectByPk/selectByPkGfs, 無鄰近列可命中
        let exempt = new Set(['id:selectByPk:NUL_LEAD', 'id:selectByPk:NUL_ONLY', 'gfs:selectByPkGfs:NUL_LEAD', 'gfs:selectByPkGfs:NUL_ONLY'])
        let want = rej.map((c) => c.id).filter((id) => !exempt.has(id))
        assert.ok(want.length >= 400, `${want.length}`)
        assert.deepStrictEqual(sorted(bad.map((v) => v.id)), sorted(want))
    })

})
