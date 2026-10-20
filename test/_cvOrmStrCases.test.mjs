import assert from 'assert'
import ormStrCases from '../src/_cvOrmStrCases.mjs'
import chkOrmStr from '../src/chkOrmStr.mjs'
import { createRefModel, runApiCase } from './tools/ormStrRefModel.mjs'
import { digestCases } from './tools/ormStrCaseDigest.mjs'


//契約案例表src/_cvOrmStrCases.mjs之自身測試(規則見CLAUDE_rulebook.md R-ORMSTR-01):
//形狀、形態旗標(獨立預言機)、輸入空間完整度矩陣(形態 x 位置 x API)、訊息詞彙、全新值、對參考後端逐案執行、對參考後端之變異(各接線點拿掉須轉紅)

let { reasons, forms, cases, next } = ormStrCases

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

//runAll, 對參考後端逐案執行(預設cases之API層; list給next則跑增補案例)並回傳有問題者
let runAll = async (mk, cfg, filter = () => true, list = apiCases) => {
    let out = []
    for (let c of list.filter(filter)) {
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
        let nextIds = new Set(next.map((c) => c.id))
        assert.strictEqual(nextIds.size, next.length, 'next: unique ids')
        assert.ok(next.every((c) => !ids.has(c.id)), 'next: ids disjoint from cases')
        for (let c of [...apiCases, ...next]) {
            let isNext = nextIds.has(c.id)
            assert.ok(API_KINDS[c.api], `${c.id}: api ${c.api}`)
            assert.ok(API_KINDS[c.api].includes(c.expect.kind), `${c.id}: kind ${c.expect.kind} for ${c.api}`)
            assert.ok(['id', 'name', 'nested', 'array', 'arrayObj', 'key', 'nestedKey', 'map', 'mapKey', 'set', 'strobj', 'error', 'regexp', 'inherit', 'arrObjKey', 'opt.db', 'opt.cl', 'opt.url'].includes(c.pos), c.id)
            assert.ok(forms[c.form], c.id)
            assert.strictEqual(c.str, forms[c.form].str, c.id)
            //need: cases只用doc、gfs(已發布後端之harness只認此二旗標); inh、event只出現在next
            assert.ok(Array.isArray(c.need) && c.need.every((v) => (isNext ? ['doc', 'gfs', 'inh', 'event'] : ['doc', 'gfs']).includes(v)), c.id)
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
            if (c.listen) {
                assert.ok(isNext, `${c.id}: listen only in next`)
                assert.strictEqual(c.group, 'toctou', c.id)
                assert.ok(c.need.includes('event'), `${c.id}: listen needs the event capability`)
                assert.deepStrictEqual(Object.keys(c.listen), ['event', 'fn', 'minCalls'], c.id)
                assert.ok(['change', 'error'].includes(c.listen.event), c.id)
                assert.strictEqual(typeof c.listen.fn, 'function', c.id)
                assert.ok(Number.isInteger(c.listen.minCalls) && c.listen.minCalls >= 1, `${c.id}: minCalls`)
            }
            assert.ok(!c.need.includes('event') || c.listen, `${c.id}: the event capability needs a listen`)
        }
    })

    it('should word every expected message in the fixed vocabulary, never echoing the string, and with a path of the dspec form', function() {
        let reId = /^invalid id: (string contains lone surrogate|string contains NUL) at \[data\[\d\]\.id\]$/
        let reData = /^invalid data: string contains lone surrogate at \[data\[\d\]\.(?:[A-Za-z]+|<invalid key>|<key>)(?:\.(?:[A-Za-z]+|<invalid key>|<key>)|\[\d\])*\]$/
        let reOpt = /^invalid opt\.(db|cl|url): string contains lone surrogate$/
        let all = []
        for (let c of [...apiCases, ...next]) {
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
        for (let c of [...apiCases, ...next]) {
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
        for (let c of [...apiCases, ...next]) {
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


describe('契約案例表 既有案例逐案不變(只增不改; R-ORMSTR-01 規則17)', function() {

    //git 340647815 版(第94項併入前)之 1553 案之摘要: 已發布之七個w-orm-*後端以deep import逐案執行案例表, 既有案例不得被悄悄改動.
    //摘要涵蓋靜態欄位、pre/args/make之產出、toctou組之動態行為(讀取計數存取器連讀三次、afterCall之原始碼與作用後狀態)與listen.
    //有意改動既有案例時須重算此常數(node tmp腳本以 digestCases 對舊版〔git show 340647815:src/_cvOrmStrCases.mjs〕與新版各算一次須相同)並於帳本說明
    let OLD_DIGEST = '6d2fc1796e3408cee3c712084e543f20eddfaccbb293d8c1d92d6061dc51b30d'

    it('should keep the 1553 cases unchanged in every field and in what pre(), args(), afterCall and the read-counting accessors produce', function() {
        assert.strictEqual(cases.length, 1553)
        assert.strictEqual(digestCases(cases), OLD_DIGEST)
    })

    it('should notice a change of any case (digest discriminates): a changed expectation, a changed argument, a dropped case, a changed need', function() {
        let at = (id) => cases.findIndex((c) => c.id === id)
        let i = at('val:insert:name:HI_END')
        let alt = [...cases]
        alt[i] = { ...cases[i], expect: { ...cases[i].expect, ids: ['k0', 'zz'] } }
        assert.notStrictEqual(digestCases(alt), OLD_DIGEST)
        let alt2 = [...cases]
        alt2[i] = { ...cases[i], args: (mk, b) => [[mk('g0'), mk('g1', { name: 'changed' }), mk('g2')]] }
        assert.notStrictEqual(digestCases(alt2), OLD_DIGEST)
        assert.notStrictEqual(digestCases(cases.filter((c) => c.id !== 'val:insert:name:HI_END')), OLD_DIGEST)
        let alt3 = [...cases]
        alt3[at('toctou:insert:bad-first')] = { ...cases[at('toctou:insert:bad-first')], need: ['doc'] }
        assert.notStrictEqual(digestCases(alt3), OLD_DIGEST)
    })

    it('should notice a change of the stress that the toctou cases apply: the second value of a read-counting accessor, the afterCall mutation, and an args that no longer stresses', function() {
        let at = (id) => cases.findIndex((c) => c.id === id)
        let b = at('toctou:insert:bad-first')
        let g = at('toctou:insert:good-first')
        let m = at('toctou:insert:mutate-after-call')
        //第二次讀取之值改變(第一次不變)
        let flip = (mk, first, later) => {
            let n = 0
            let d = mk('g1')
            Object.defineProperty(d, 'name', {
                get() {
                    n++
                    return n === 1 ? first : later
                },
                enumerable: true,
                configurable: true
            })
            return d
        }
        let alt = [...cases]
        alt[b] = { ...cases[b], args: (mk) => [[mk('g0'), flip(mk, 'a\uD800', 'bad'), mk('g2')]] }
        assert.notStrictEqual(digestCases(alt), OLD_DIGEST)
        //afterCall改成不作為
        let alt2 = [...cases]
        alt2[m] = { ...cases[m], afterCall: () => {} }
        assert.notStrictEqual(digestCases(alt2), OLD_DIGEST)
        //args改成全良構資料(不再施壓)
        let alt3 = [...cases]
        alt3[g] = { ...cases[g], args: (mk) => [[mk('g0'), mk('g1', { name: 'ok' }), mk('g2')]] }
        assert.notStrictEqual(digestCases(alt3), OLD_DIGEST)
    })

    it('should be unaffected by the increment cases: next is a separate export', function() {
        assert.strictEqual(next.length, 9)
        assert.strictEqual(digestCases(cases), OLD_DIGEST)
        assert.notStrictEqual(digestCases([...cases, ...next]), OLD_DIGEST)
    })

})


describe('契約案例表 增補案例next(2026-10-21, R-ORMSTR-01 規則17): 不在cases內', function() {

    let byIdN = new Map(next.map((c) => [c.id, c]))
    let IDS = ['toctou:insert:inh-getter-name', 'toctou:insertBulk:inh-getter-name', 'toctou:save:inh-getter-name', 'toctou:save:inh-getter-id', 'toctou:del:inh-getter-id', 'toctou:save:event-shared:insert', 'toctou:save:event-shared:update', 'toctou:save:event-shared-error', 'toctou:save:listener-throws']

    it('should export exactly the nine increment cases, all of group toctou, in a fixed order, and none of them inside cases', function() {
        assert.deepStrictEqual(next.map((c) => c.id), IDS)
        assert.ok(next.every((c) => c.group === 'toctou'))
        assert.ok(IDS.every((id) => !cases.some((c) => c.id === id)))
        assert.ok(!cases.some((c) => c.need && (c.need.includes('inh') || c.need.includes('event') || c.listen)), 'cases carry neither the inh / event flags nor listen (the published harnesses never see them)')
    })

    it('should have the inherited-accessor cases (checked value is the written value): name made unwell-formed for insert, insertBulk and save; id redirected to an existing row for save and del', function() {
        for (let api of ['insert', 'insertBulk', 'save']) {
            let c = byIdN.get(`toctou:${api}:inh-getter-name`)
            assert.ok(c, api)
            assert.deepStrictEqual(c.need, ['inh'])
            assert.strictEqual(c.pos, 'name')
            assert.strictEqual(c.expect.kind, api === 'save' ? 'itemErr' : 'ok')
            assert.deepStrictEqual(c.expect.rows, { g1: { name: 'ok' } }) //寫入值為被檢查之值, 不是存取器副作用改成之不合格值
        }
        for (let api of ['save', 'del']) {
            let c = byIdN.get(`toctou:${api}:inh-getter-id`)
            assert.ok(c, api)
            assert.deepStrictEqual(c.need, ['inh'])
            assert.deepStrictEqual(c.expect.unchanged, ['k0']) //被改指向之既有列不得被動到
            assert.deepStrictEqual(c.expect.rows.k0, { name: 'pre' })
        }
        assert.strictEqual(byIdN.get('toctou:save:inh-getter-id').variant, 'update')
        assert.deepStrictEqual(byIdN.get('toctou:del:inh-getter-id').expect.ids, ['k0']) //只刪g1
        assert.strictEqual(next.filter((c) => c.need.includes('inh')).length, 5)
    })

    it('should have the event cases: change listener on save (insert and update variants), error listener on a failing record with a following good record, and a listener that throws', function() {
        for (let v of ['insert', 'update']) {
            let c = byIdN.get(`toctou:save:event-shared:${v}`)
            assert.ok(c, v)
            assert.deepStrictEqual(c.need, ['doc', 'event'])
            assert.strictEqual(c.variant, v)
            assert.deepStrictEqual(Object.keys(c.listen), ['event', 'fn', 'minCalls'])
            assert.strictEqual(c.listen.event, 'change')
            //update變體須先預存三份文件(save為更新); insert變體只有k0(save為插入)
            assert.deepStrictEqual(c.pre(mkA).map((d) => d.id), v === 'update' ? ['k0', 'g0', 'g1', 'g2'] : ['k0'])
            for (let id of ['g0', 'g1', 'g2']) {
                assert.deepStrictEqual(c.expect.rows[id], { meta: { s: 'good' } })
            }
            //三份文件共用同一個meta; 每次呼叫args皆為全新之共享物件
            let [docs] = c.args(mkA, base)
            assert.strictEqual(docs.length, 3)
            assert.ok(docs[0].meta === docs[1].meta && docs[1].meta === docs[2].meta)
            assert.ok(c.args(mkA, base)[0][0].meta !== docs[0].meta)
        }
        let ce = byIdN.get('toctou:save:event-shared-error')
        assert.deepStrictEqual(ce.need, ['doc', 'event'])
        assert.strictEqual(ce.listen.event, 'error')
        let [de] = ce.args(mkA, base)
        assert.strictEqual(de.length, 2)
        assert.ok(de[0].meta === de[1].meta, 'the failing record shares the meta with the good one')
        assert.strictEqual(chkOrmStr(de[0].name), 'string contains lone surrogate') //第一筆因name不合格而失敗
        assert.strictEqual(ce.expect.kind, 'itemErr')
        assert.deepStrictEqual(ce.expect.bad, [0])
        assert.deepStrictEqual(ce.expect.rows.g1, { meta: { s: 'good' } })
        let ct = byIdN.get('toctou:save:listener-throws')
        assert.deepStrictEqual(ct.need, ['event'])
        assert.throws(() => ct.listen.fn('save', []), /listener failure/)
        assert.strictEqual(next.filter((c) => c.need.includes('event')).length, 4)
    })

    it('should apply the poison function of the event cases to both array payloads and single-document payloads, touching only a nested meta object', function() {
        let c = byIdN.get('toctou:save:event-shared:insert')
        let a = { meta: { s: 'good' } }
        let b = { meta: { s: 'good' } }
        c.listen.fn('save', [a])
        assert.strictEqual(a.meta.s, 'a\uD800')
        c.listen.fn('save', b)
        assert.strictEqual(b.meta.s, 'a\uD800')
        let plain = { name: 'x', meta: null }
        c.listen.fn('save', [plain, null, 5, { meta: 5 }])
        assert.deepStrictEqual(plain, { name: 'x', meta: null })
    })

    it('should attach the inherited accessor to the prototype of the document (enumerable, not an own property) so that cloneDeep keeps it and the clone does not read it, and run its side effect on the receiver', function() {
        for (let id of ['toctou:insert:inh-getter-name', 'toctou:save:inh-getter-id', 'toctou:del:inh-getter-id']) {
            let [docs] = byIdN.get(id).args(mkA, base)
            let d = docs.find((x) => Object.getPrototypeOf(x) !== Object.prototype)
            assert.ok(d, id)
            assert.ok(!Object.prototype.hasOwnProperty.call(d, 'inhSide'), id)
            let desc = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(d), 'inhSide')
            assert.ok(desc && typeof desc.get === 'function' && desc.enumerable === true, id)
            let other = { id: 'z', name: 'n' }
            let before = { ...d }
            assert.strictEqual(desc.get.call(other), 'x') //副作用作用於呼叫者(this), 不是文件本身
            assert.deepStrictEqual({ ...d }, before, `${id}: the side effect must act on the receiver only`)
            assert.notDeepStrictEqual(other, { id: 'z', name: 'n' }, `${id}: the side effect changes the receiver`)
        }
    })

    it('should pass every increment case on the reference model (both document factories)', async function() {
        assert.deepStrictEqual(await runAll(mkA, {}, () => true, next), [])
        assert.deepStrictEqual(await runAll(mkB, {}, () => true, next), [])
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
        //成功之呼叫(如繼承存取器把主鍵改指向既有列之防護案, 成功且unchanged為被改指向之列)不走失敗路徑, 不在此列
        let failing = (c) => c.expect.kind === 'rejectAll' || (c.expect.kind === 'itemErr' && c.expect.bad.length > 0)
        let want = apiCases.filter((c) => c.expect.unchanged && c.expect.unchanged.length > 0 && c.expect.kind !== 'null' && failing(c)).map((c) => c.id)
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

    it('should turn red for exactly the five inherited-accessor cases of next when the model walks the very copy that it then writes (the earlier wiring: check and write share one copy)', async function() {
        let want = ['toctou:insert:inh-getter-name', 'toctou:insertBulk:inh-getter-name', 'toctou:save:inh-getter-name', 'toctou:save:inh-getter-id', 'toctou:del:inh-getter-id']
        assert.deepStrictEqual(sorted((await runAll(mkA, { checkSame: true }, () => true, next)).map((v) => v.id)), sorted(want))
        assert.deepStrictEqual(sorted((await runAll(mkB, { checkSame: true }, () => true, next)).map((v) => v.id)), sorted(want))
        //每案的失敗形狀: 寫入了存取器副作用改成之值, 或動到被改指向之既有列
        let bad = await runAll(mkA, { checkSame: true }, (c) => c.id === 'toctou:del:inh-getter-id' || c.id === 'toctou:insert:inh-getter-name', next)
        assert.ok(bad.find((v) => v.id === 'toctou:del:inh-getter-id').probs.some((p) => p.startsWith('ids:')))
        assert.ok(bad.find((v) => v.id === 'toctou:insert:inh-getter-name').probs.some((p) => p.startsWith('row "g1"')))
        //既有cases不受此旗標影響(沒有一案依賴走訪哪一份複本)
        assert.deepStrictEqual(await runAll(mkA, { checkSame: true }), [])
    })

    it('should turn red for exactly the three shared-reference event cases of next when the model hands the listener the pending copy itself, and degrade to a plain pass when the harness ignores listen', async function() {
        let want = ['toctou:save:event-shared:insert', 'toctou:save:event-shared:update', 'toctou:save:event-shared-error']
        assert.deepStrictEqual(sorted((await runAll(mkA, { eventShared: true }, () => true, next)).map((v) => v.id)), sorted(want))
        assert.deepStrictEqual(sorted((await runAll(mkB, { eventShared: true }, () => true, next)).map((v) => v.id)), sorted(want))
        //失敗之形狀: 其後各筆(g1、g2)被汙染, 第一筆自己(g0)已寫入而不受影響——案例隔離的是[其後各筆], 不是[儲存與事件共享參照]
        let bad = await runAll(mkA, { eventShared: true }, (c) => c.id === 'toctou:save:event-shared:insert', next)
        let probs = bad[0].probs.join('\n')
        assert.ok(probs.includes('row "g1"') && probs.includes('row "g2"') && !probs.includes('row "g0"'), probs)
        for (let id of want) {
            let c = next.find((v) => v.id === id)
            let probs = await runApiCase({ ...c, listen: undefined }, { create: () => createRefModel(base, { eventShared: true }), ctor: null, mk: mkA, mkGfs: mkGfsA, base })
            assert.deepStrictEqual(probs, [], id) //舊版harness不認得listen: 退化為一般成功案, 不誤報
        }
    })

    it('should turn red for exactly the listener-throws case of next when the model lets a throwing listener break the operation', async function() {
        assert.deepStrictEqual((await runAll(mkA, { emitThrows: true }, () => true, next)).map((v) => v.id), ['toctou:save:listener-throws'])
        assert.deepStrictEqual((await runAll(mkB, { emitThrows: true }, () => true, next)).map((v) => v.id), ['toctou:save:listener-throws'])
    })

    it('should turn red for exactly the four event cases of next when the model never emits the event (minCalls proves the listener was really exercised), but not when the harness ignores listen', async function() {
        let want = ['toctou:save:event-shared:insert', 'toctou:save:event-shared:update', 'toctou:save:event-shared-error', 'toctou:save:listener-throws']
        let bad = await runAll(mkA, { noEvents: true }, () => true, next)
        assert.deepStrictEqual(sorted(bad.map((v) => v.id)), sorted(want))
        assert.ok(bad.every((v) => v.probs.length === 1 && /listener was called 0 time\(s\), expected at least 1/.test(v.probs[0])), JSON.stringify(bad))
        for (let id of want) {
            let c = next.find((v) => v.id === id)
            assert.deepStrictEqual(await runApiCase({ ...c, listen: undefined }, { create: () => createRefModel(base, { noEvents: true }), ctor: null, mk: mkA, mkGfs: mkGfsA, base }), [], id)
        }
    })

    it('should keep every increment case green on the reference model with all the defect switches off, and turn red for exactly the eight defective ones with both sharing switches on', async function() {
        assert.deepStrictEqual(await runAll(mkA, { checkSame: false, eventShared: false, emitThrows: false, noEvents: false }, () => true, next), [])
        let bad = await runAll(mkA, { checkSame: true, eventShared: true }, () => true, next)
        assert.strictEqual(bad.length, 8)
        assert.ok(!bad.some((v) => v.id === 'toctou:save:listener-throws'))
    })

    it('should register the listener of an event case on the model and refuse a backend without on() (the harness cannot silently skip the subscriber)', async function() {
        let c = next.find((v) => v.id === 'toctou:save:event-shared:insert')
        let create = () => {
            let wo = createRefModel(base, {})
            wo.on = undefined
            return wo
        }
        await assert.rejects(() => runApiCase(c, { create, ctor: null, mk: mkA, mkGfs: mkGfsA, base }), /on is not a function|on\(\)/)
    })

})
