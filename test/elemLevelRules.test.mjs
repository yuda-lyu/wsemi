import assert from 'assert'
import fs from 'fs'
import { fileURLToPath } from 'url'
import genClockTZ from '../src/genClockTZ.mjs'
import arrFilterByKeywords from '../src/arrFilterByKeywords.mjs'
import arr2dt from '../src/arr2dt.mjs'
import dtmapping from '../src/dtmapping.mjs'
import ltdtmapping from '../src/ltdtmapping.mjs'
import getltdtkeys from '../src/getltdtkeys.mjs'
import iseobj from '../src/iseobj.mjs'
import ltdtDiff from '../src/ltdtDiff.mjs'
import ltdtDiffByKey from '../src/ltdtDiffByKey.mjs'
import ltdt2vrtsable from '../src/ltdt2vrtsable.mjs'
import filepathToTree from '../src/filepathToTree.mjs'
import composeToTree from '../src/composeToTree.mjs'
import ltdtmerge from '../src/ltdtmerge.mjs'
import dtpick from '../src/dtpick.mjs'
import ltdtpick from '../src/ltdtpick.mjs'
import parseNumOpt from '../src/_numOpt.mjs'


//規格: 排程第430項第二批, 使用者2026-11-14逐函數裁定(主控任務20261114175457之裁定表); dspec〈輸入參數之檢測機制〉§11〈第二批〉、§4(opt.debug)、§6(訊息不帶輸入值)
//每個describe對應裁定表之一節, 每個it對應該節之一列(標題前綴〈節-列〉), 期望值取自裁定表之文字, 不取自實作之輸出


let F = { hasKeyword: false, weight: 0 }


//captureConsole, 執行fn期間攔截console之log、warn、error、info, 回傳{ r, outs }
let captureConsole = (fn) => {
    let names = ['log', 'warn', 'error', 'info']
    let olds = {}
    let outs = []
    for (let n of names) {
        olds[n] = console[n]
        console[n] = (...args) => {
            outs.push({ n, args })
        }
    }
    let r
    try {
        r = fn()
    }
    finally {
        for (let n of names) {
            console[n] = olds[n]
        }
    }
    return { r, outs }
}


//throwsMsg, 斷言fn同步拋出Error且訊息恰為msg
let throwsMsg = (fn, msg) => {
    assert.throws(fn, (err) => {
        assert.ok(err instanceof Error)
        assert.strict.strictEqual(err.message, msg)
        return true
    })
}


//getDoc, 取src檔之JSDoc區塊(第一個/**至*/), 路徑相對於本測試檔
let getDoc = (name) => {
    let c = fs.readFileSync(fileURLToPath(new URL(`../src/${name}.mjs`, import.meta.url)), 'utf8')
    let i = c.indexOf('/**\n * ')
    if (i < 0) {
        i = c.indexOf('/**\r\n * ')
    }
    let j = c.indexOf('*/', i)
    return c.slice(i, j)
}


describe(`裁定表〈一〉genClockTZ().formatTime`, function() {

    it(`〈一-1〉should return '' without throwing when s is not a string of at least 12 digits, including a numeric stamp 20260808214408`, function() {
        let c = genClockTZ('Asia/Taipei')
        assert.strict.strictEqual(c.formatTime(20260808214408), '')
        for (let v of [undefined, null, '', '20260808', 'abc', Object('20260808214408'), {}, [], true]) {
            assert.strict.strictEqual(c.formatTime(v), '')
        }
        assert.strict.strictEqual(c.formatTime('20260808214408'), '2026/08/08 21:44') //有效輸入不變
        let d = getDoc('genClockTZ')
        assert.ok(d.indexOf(`回傳''，不拋錯`) >= 0)
    })

})


describe(`裁定表〈二〉arrFilterByKeywords`, function() {

    it(`〈二-1〉should give {false,0} to holes, null, undefined, numbers, NaN, booleans, functions, Symbols, objects and arrays (including ['abc']), and treat a String object as a string`, function() {
        let a = new Array(12)
        a[1] = null
        a[2] = undefined
        a[3] = 5
        a[4] = NaN
        a[5] = true
        a[6] = () => 'abc'
        a[7] = Symbol('abc')
        a[8] = { a: 'abc' }
        a[9] = ['abc']
        a[10] = 'abc'
        a[11] = Object('xabc')
        let r = arrFilterByKeywords(a, 'abc')
        assert.strict.deepStrictEqual(r, [F, F, F, F, F, F, F, F, F, F, { hasKeyword: true, weight: 1 }, { hasKeyword: true, weight: 1 }])
    })

    it(`〈二-2〉should return one {false,0} for [''], [null], [{}], [[]], and [] only for [] (length equals arr's length)`, function() {
        for (let a of [[''], [null], [{}], [[]]]) {
            assert.strict.deepStrictEqual(arrFilterByKeywords(a, 'abc'), [F])
        }
        assert.strict.deepStrictEqual(arrFilterByKeywords([], 'abc'), [])
    })

    it(`〈二-3〉should return all {false,0} with arr's length when keywords is '', null, a number, [], [''], [null] or [{}]`, function() {
        for (let kw of ['', null, 5, [], [''], [null], [{}]]) {
            assert.strict.deepStrictEqual(arrFilterByKeywords(['abc', 'x'], kw), [F, F])
        }
    })

    it(`〈二-4〉should remove blank keywords before weighting (['', 'abc'] gives 'abc' weight 1)`, function() {
        assert.strict.deepStrictEqual(arrFilterByKeywords(['abc'], ['', 'abc']), [{ hasKeyword: true, weight: 1 }])
        assert.strict.deepStrictEqual(arrFilterByKeywords(['abc'], ['', '  ', 'abc']), [{ hasKeyword: true, weight: 1 }])
    })

    it(`〈二-5〉should deduplicate keywords ('abc abc'; 'abc def abc' has n=2 so def weighs (1-1/2)**2)`, function() {
        assert.strict.deepStrictEqual(arrFilterByKeywords(['abc'], 'abc abc'), [{ hasKeyword: true, weight: 1 }])
        assert.strict.deepStrictEqual(arrFilterByKeywords(['def'], 'abc def abc'), [{ hasKeyword: true, weight: (1 - 1 / 2) ** 2 }])
    })

    it(`〈二-6〉should split keywords by a full-width space as well`, function() {
        let fw = String.fromCharCode(0x3000) //全形空白
        assert.strict.strictEqual(('abc' + fw + 'def').length, 7)
        assert.strict.deepStrictEqual(arrFilterByKeywords(['def', 'abc def'], 'abc' + fw + 'def'), [{ hasKeyword: true, weight: (1 - 1 / 2) ** 2 }, { hasKeyword: true, weight: 1 + (1 - 1 / 2) ** 2 }])
    })

    it(`〈二-7〉should exclude only items containing x for -x and judge the others by general keywords; with only exclusions, items not containing them hit with weight 1`, function() {
        assert.strict.deepStrictEqual(arrFilterByKeywords(['xa', 'b', 'xb', 'c'], '-x b'), [F, { hasKeyword: true, weight: 1 }, F, F])
        assert.strict.deepStrictEqual(arrFilterByKeywords(['xa', 'b', 'c'], '-x'), [F, { hasKeyword: true, weight: 1 }, { hasKeyword: true, weight: 1 }])
        assert.strict.deepStrictEqual(arrFilterByKeywords(['xa', 'b', 'c'], '-x -c'), [F, { hasKeyword: true, weight: 1 }, F])
    })

    it(`〈二-8〉should require all required keywords for +a +b`, function() {
        assert.strict.deepStrictEqual(arrFilterByKeywords(['a', 'b', 'ab', 'c'], '+a +b'), [F, F, { hasKeyword: true, weight: 1 }, F])
    })

    it(`〈二-9〉should hit items containing all required keywords for +a b, weighting by general keywords only (n, k count general keywords), weight 1 without general keywords`, function() {
        //一般關鍵字b(k=0)、c(k=1), n=2
        let r = arrFilterByKeywords(['a', 'ab', 'ac', 'abc', 'bc'], '+a b c')
        assert.strict.deepStrictEqual(r, [
            { hasKeyword: true, weight: 0 },
            { hasKeyword: true, weight: 1 },
            { hasKeyword: true, weight: (1 - 1 / 2) ** 2 },
            { hasKeyword: true, weight: 1 + (1 - 1 / 2) ** 2 },
            F,
        ])
        assert.strict.deepStrictEqual(arrFilterByKeywords(['a', 'b'], '+a'), [{ hasKeyword: true, weight: 1 }, F])
    })

    it(`〈二-10〉JSDoc: case sensitive, numeric keywords as strings, null keywords skipped (behavior)`, function() {
        assert.strict.deepStrictEqual(arrFilterByKeywords(['abc'], 'ABC'), [F]) //區分大小寫
        assert.strict.deepStrictEqual(arrFilterByKeywords(['a5', 'b'], [5]), [{ hasKeyword: true, weight: 1 }, F]) //數字關鍵字當字串
        assert.strict.deepStrictEqual(arrFilterByKeywords(['abc'], [null, 'abc']), [{ hasKeyword: true, weight: 1 }]) //null略過, n=1
    })

    it(`〈二-10〉JSDoc should state case sensitivity, numeric keywords, skipped null keywords and the rewritten 'def of module -yet' example`, function() {
        let d = getDoc('arrFilterByKeywords')
        assert.ok(d.indexOf('區分大小寫') >= 0)
        assert.ok(d.indexOf('數字') >= 0)
        assert.ok(d.indexOf('null') >= 0 && d.indexOf('略過') >= 0)
        assert.ok(d.indexOf(`kws = 'def of module -yet'`) >= 0)
    })

})


describe(`裁定表〈三〉arr2dt`, function() {

    it(`〈三-1〉should skip a key that is '', null, undefined, a hole, an object or an array together with its value, keeping the other pairs`, function() {
        let ks = ['a', '', null, undefined]
        ks[5] = {}
        ks[6] = []
        ks[7] = 'b'
        assert.strict.strictEqual(ks.length, 8)
        assert.ok(!(4 in ks))
        assert.strict.deepStrictEqual(arr2dt(ks, [1, 2, 3, 4, 5, 6, 7, 8]), { a: 1, b: 8 })
        assert.strict.deepStrictEqual(arr2dt(['', 'x'], 'v'), { x: 'v' })
    })

    it(`〈三-2〉should treat a finite number key as a string`, function() {
        assert.strict.deepStrictEqual(arr2dt([1, 2.5, 'c'], ['x', 'y', 'z']), { '1': 'x', '2.5': 'y', 'c': 'z' })
    })

    it(`〈三-3〉should let a later duplicate key overwrite the former`, function() {
        assert.strict.deepStrictEqual(arr2dt(['a', 'b', 'a'], [1, 2, 3]), { a: 3, b: 2 })
    })

    it(`〈三-4〉should treat a function values as null (not executed, not copied)`, function() {
        let called = 0
        let f = () => {
            called++
            return 'x'
        }
        assert.strict.deepStrictEqual(arr2dt(['a', 'b'], f), { a: null, b: null })
        assert.strict.strictEqual(called, 0)
    })

    it(`〈三-5〉should always pair an array values (including [''], [null], [{}], []) and return {} on a length mismatch`, function() {
        assert.strict.deepStrictEqual(arr2dt(['a'], ['']), { a: '' })
        assert.strict.deepStrictEqual(arr2dt(['a'], [null]), { a: null })
        assert.strict.deepStrictEqual(arr2dt(['a'], [{}]), { a: {} })
        assert.strict.deepStrictEqual(arr2dt(['a'], []), {})
        assert.strict.deepStrictEqual(arr2dt(['a', 'b'], []), {})
        assert.strict.deepStrictEqual(arr2dt(['a', 'b'], ['']), {})
    })

    it(`〈三-6〉should warn the two lengths (no values) once per process only when opt.debug === true on a length mismatch`, function() {
        parseNumOpt.resetWarned()
        let c0 = captureConsole(() => arr2dt(['a', 'b'], ['SECRETV']))
        assert.strict.deepStrictEqual(c0.r, {})
        assert.strict.deepStrictEqual(c0.outs, []) //未給debug不提示
        let c1 = captureConsole(() => arr2dt(['a', 'b'], ['SECRETV'], { debug: 'true' }))
        assert.strict.deepStrictEqual(c1.outs, []) //非布林視為false
        let c2 = captureConsole(() => arr2dt(['a', 'b'], ['SECRETV'], { debug: true }))
        assert.strict.deepStrictEqual(c2.r, {})
        assert.strict.strictEqual(c2.outs.length, 1)
        assert.strict.strictEqual(c2.outs[0].n, 'warn')
        let msg = c2.outs[0].args[0]
        assert.strict.strictEqual(msg, '[wsemi arr2dt] invalid values: must have the same length as keys (values 1, keys 2), returning {}')
        assert.ok(msg.indexOf('SECRETV') < 0)
        let c3 = captureConsole(() => arr2dt(['a', 'b', 'c'], ['SECRETV'], { debug: true }))
        assert.strict.deepStrictEqual(c3.outs, []) //同原因每行程一次
        parseNumOpt.resetWarned()
        let got = []
        let c4 = captureConsole(() => arr2dt(['a'], [1, 2], { debug: true, funLog: (m, info) => got.push([m, info]) }))
        assert.strict.deepStrictEqual(c4.outs, [])
        assert.strict.strictEqual(got.length, 1)
        assert.strict.deepStrictEqual(got[0][1], { fn: 'arr2dt', reason: 'length', key: 'values' })
        parseNumOpt.resetWarned()
    })

    it(`〈三-1〉〈三-2〉JSDoc should state number keys as strings and later duplicates overwrite`, function() {
        let d = getDoc('arr2dt')
        assert.ok(d.indexOf('有限數字視同字串') >= 0)
        assert.ok(d.indexOf('後者覆蓋前者') >= 0)
        assert.ok(d.indexOf('opt.debug') >= 0)
    })

})


describe(`裁定表〈四〉dtmapping`, function() {

    it(`〈四-1〉should skip keys '', null, undefined, holes, objects and arrays, treat finite numbers as strings and count duplicates once`, function() {
        let ks = ['a', '', null, undefined]
        ks[5] = {}
        ks[6] = []
        ks[7] = 1
        ks[8] = 'a'
        let r = dtmapping({ a: 1, 1: 2 }, ks)
        assert.strict.deepStrictEqual(r, { a: 1, 1: 2 })
        assert.strict.deepStrictEqual(Object.keys(r), ['1', 'a'])
    })

    it(`〈四-2〉should take only dt's own field without lodash get paths ('d.e', 'd[0]' are field names) and not inherited ones (toString, constructor give def)`, function() {
        let dt = { 'd': { e: 1, 0: 'z' }, 'd.e': 2 }
        assert.strict.deepStrictEqual(dtmapping(dt, ['d.e', 'd[0]', 'toString', 'constructor']), { 'd.e': 2, 'd[0]': '', 'toString': '', 'constructor': '' })
        assert.strict.deepStrictEqual(dtmapping(Object.create({ x: 1 }), ['x'], 'D'), { x: 'D' })
    })

    it(`〈四-3〉should write the key '__proto__' as an own field (value from dt's own field, else def) without changing the prototype`, function() {
        let r1 = dtmapping(JSON.parse('{"__proto__": 5}'), ['__proto__'])
        assert.ok(Object.prototype.hasOwnProperty.call(r1, '__proto__'))
        assert.strict.strictEqual(Object.getOwnPropertyDescriptor(r1, '__proto__').value, 5)
        assert.strict.strictEqual(Object.getPrototypeOf(r1), Object.prototype)
        let r2 = dtmapping({}, ['__proto__'], 'D')
        assert.strict.strictEqual(Object.getOwnPropertyDescriptor(r2, '__proto__').value, 'D')
        assert.strict.strictEqual(Object.getPrototypeOf(r2), Object.prototype)
    })

    it(`〈四-4〉should give each field its own copy of an object def`, function() {
        let def = { x: { y: 1 } }
        let r = dtmapping({}, ['a', 'b'], def)
        assert.strict.deepStrictEqual(r, { a: { x: { y: 1 } }, b: { x: { y: 1 } } })
        assert.ok(r.a !== r.b && r.a !== def && r.a.x !== def.x)
    })

    it(`〈四-5〉should treat a function def as null`, function() {
        let called = 0
        let r = dtmapping({}, ['a'], () => {
            called++
        })
        assert.strict.deepStrictEqual(r, { a: null })
        assert.strict.strictEqual(called, 0)
    })

    it(`〈四-6〉JSDoc: undefined value means no field, values are shared not copied, Map is not supported (behavior)`, function() {
        assert.strict.deepStrictEqual(dtmapping({ a: undefined }, ['a'], 'D'), { a: 'D' })
        let v = { z: 1 }
        assert.ok(dtmapping({ a: v }, ['a']).a === v)
        assert.strict.deepStrictEqual(dtmapping(new Map([['a', 1]]), ['a']), {})
    })

    it(`〈四-6〉JSDoc should state undefined as no field, shared values and no Map support`, function() {
        let d = getDoc('dtmapping')
        assert.ok(d.indexOf('undefined視同無此欄位') >= 0)
        assert.ok(d.indexOf('與輸入共用') >= 0)
        assert.ok(d.indexOf('不支援Map') >= 0)
    })

})


describe(`裁定表〈五〉ltdtmapping`, function() {

    it(`〈五-1〉should map each row by the new dtmapping rules`, function() {
        let r = ltdtmapping([{ 'd.e': 2, 'd': { e: 1 } }, Object.create({ x: 1 })], ['d.e', 'x'])
        assert.strict.deepStrictEqual(r, [{ 'd.e': 2, 'x': '' }, { 'd.e': '', 'x': '' }])
    })

    it(`〈五-2〉should keep the row count: [{}] -> [{a:''}], [null] -> [{}] (non-object rows as {})`, function() {
        assert.strict.deepStrictEqual(ltdtmapping([{}], ['a']), [{ a: '' }])
        assert.strict.deepStrictEqual(ltdtmapping([null], ['a']), [{}])
        assert.strict.deepStrictEqual(ltdtmapping([''], ['a']), [{}])
        assert.strict.deepStrictEqual(ltdtmapping([{ a: 1 }, null, 'x', [1]], ['a']), [{ a: 1 }, {}, {}, {}])
    })

    it(`〈五-3〉should return [] when every element of keys is skipped (like [''])`, function() {
        assert.strict.deepStrictEqual(ltdtmapping([{ a: 1 }], ['']), [])
        assert.strict.deepStrictEqual(ltdtmapping([{ a: 1 }], ['', null, {}]), [])
    })

    it(`〈五-4〉should give each field of each row its own copy of an object def`, function() {
        let def = { x: 1 }
        let r = ltdtmapping([{}, {}], ['a', 'b'], def)
        let all = [r[0].a, r[0].b, r[1].a, r[1].b]
        assert.strict.strictEqual(new Set([...all, def]).size, 5)
        for (let v of all) {
            assert.strict.deepStrictEqual(v, { x: 1 })
        }
    })

})


describe(`裁定表〈六〉getltdtkeys`, function() {

    it(`〈六-1〉should take no keys from rows that are strings, arrays, TypedArrays or functions`, function() {
        let fn = () => 1
        fn.k = 1
        assert.strict.deepStrictEqual(getltdtkeys(['ab', [1, 2], new Uint8Array(3), fn, { a: 1 }]), ['a'])
        assert.strict.deepStrictEqual(getltdtkeys([Object('ab'), { b: 1 }]), ['b']) //String包裝物件亦為字串列
    })

    it(`〈六-2〉should take only own enumerable string keys`, function() {
        let row = Object.create({ p: 1 })
        row.q = 2
        row[Symbol('s')] = 3
        Object.defineProperty(row, 'h', { value: 1, enumerable: false })
        assert.strict.deepStrictEqual(getltdtkeys([row]), ['q'])
    })

    it(`〈六-3〉should accumulate keys with a Set: 20000 distinct keys keep their order and finish far below the former ~12 s (CPU time < 3 s)`, function() {
        let rows = []
        let expected = []
        for (let i = 0; i < 20000; i++) {
            let k = `k${i}`
            rows.push({ [k]: i, common: 1 })
            expected.push(k)
            if (i === 0) {
                expected.push('common')
            }
        }
        let c0 = process.cpuUsage()
        let r = getltdtkeys(rows)
        let c1 = process.cpuUsage(c0)
        assert.strict.deepStrictEqual(r, expected)
        assert.ok((c1.user + c1.system) / 1000 < 3000, `cpu ms ${(c1.user + c1.system) / 1000}`)
    })

})


describe(`裁定表〈七〉iseobj`, function() {

    it(`〈七-1〉should be true only for an object with at least one own enumerable string key; only inherited keys give false`, function() {
        assert.strict.strictEqual(iseobj(Object.create({ a: 1 })), false)
        assert.strict.strictEqual(iseobj({ a: 1 }), true)
        assert.strict.strictEqual(iseobj({}), false)
        let o = Object.create({ a: 1 })
        o.b = 2
        assert.strict.strictEqual(iseobj(o), true)
        function F0() {}
        F0.prototype.method = function() {}
        assert.strict.strictEqual(iseobj(new F0()), false) //建構函數之prototype上有可列舉屬性而實例無自有欄位
    })

    it(`〈七-2〉should keep isobj's type tag judgment for others (class instances with own fields, null prototype, arrays, Symbol-only and non-enumerable-only)`, function() {
        class Foo {
            constructor() {
                this.a = 1
            }

            m() {}
        }
        class Bar {
            m() {}
        }
        let np = Object.create(null)
        np.k = 1
        assert.strict.strictEqual(iseobj(new Foo()), true)
        assert.strict.strictEqual(iseobj(new Bar()), false)
        assert.strict.strictEqual(iseobj(np), true)
        assert.strict.strictEqual(iseobj(Object.create(null)), false)
        assert.strict.strictEqual(iseobj([1]), false)
        assert.strict.strictEqual(iseobj({ [Symbol('s')]: 1 }), false)
        assert.strict.strictEqual(iseobj(Object.defineProperty({}, 'h', { value: 1, enumerable: false })), false)
        assert.strict.strictEqual(iseobj(new Map([['a', 1]])), false)
        assert.strict.strictEqual(iseobj(null), false)
        assert.strict.strictEqual(iseobj('a'), false)
    })

    it(`〈七-3〉should close the ltdtDiff/getltdtkeys mismatch: a row with only inherited keys is no longer a valid element of ltdtDiff`, function() {
        throwsMsg(() => ltdtDiff([Object.create({ a: 1 })], [Object.create({ a: 1 })]), 'invalid ltdtOld: every element must be a non-empty object')
    })

    it(`〈七-2〉JSDoc should state own enumerable keys`, function() {
        let d = getDoc('iseobj')
        assert.ok(d.indexOf('自有可列舉字串鍵') >= 0)
        assert.ok(d.indexOf('Object.create({ a: 123 })') >= 0)
    })

})


describe(`裁定表〈八〉ltdtDiffByKey`, function() {

    it(`〈八-1〉should throw for a row that is not an object, is an array, or lacks an own primary key (including a single object argument)`, function() {
        throwsMsg(() => ltdtDiffByKey([null], [], 'id'), 'invalid ltdtOld[0]: must be an object')
        throwsMsg(() => ltdtDiffByKey([{ id: 1 }, 5], [], 'id'), 'invalid ltdtOld[1]: must be an object')
        throwsMsg(() => ltdtDiffByKey([], ['s'], 'id'), 'invalid ltdtNew[0]: must be an object')
        throwsMsg(() => ltdtDiffByKey([], [[1]], 'id'), 'invalid ltdtNew[0]: must be an object')
        throwsMsg(() => ltdtDiffByKey([{ a: 1 }], [], 'id'), 'invalid ltdtOld[0]: must have the primary key as an own field')
        throwsMsg(() => ltdtDiffByKey([Object.create({ id: 1 })], [], 'id'), 'invalid ltdtOld[0]: must have the primary key as an own field')
        throwsMsg(() => ltdtDiffByKey([Object.defineProperty({}, 'id', { value: 1, enumerable: false })], [], 'id'), 'invalid ltdtOld[0]: must have the primary key as an own field')
        throwsMsg(() => ltdtDiffByKey({ a: 1 }, [], 'id'), 'invalid ltdtOld: must have the primary key as an own field')
        throwsMsg(() => ltdtDiffByKey([], { a: 1 }, 'id'), 'invalid ltdtNew: must have the primary key as an own field')
    })

    it(`〈八-2〉should throw when the primary key value is not a non-empty string or a finite number`, function() {
        for (let v of [undefined, null, '', NaN, {}, [], Infinity, true]) {
            throwsMsg(() => ltdtDiffByKey([{ id: v }], [], 'id'), 'invalid ltdtOld[0]: primary key must be a non-empty string or a finite number')
        }
        let r = ltdtDiffByKey([{ id: 'x' }, { id: 0 }, { id: -1.5 }], [], 'id')
        assert.strict.strictEqual(r.del.length, 3)
    })

    it(`〈八-3〉should throw for duplicated primary keys on the same side (old or new)`, function() {
        throwsMsg(() => ltdtDiffByKey([{ id: 'SECRETK' }, { id: 'SECRETK' }], [], 'id'), 'invalid ltdtOld[1]: primary key must be unique, duplicated with ltdtOld[0]')
        throwsMsg(() => ltdtDiffByKey([{ id: 1 }], [{ id: 2 }, { id: 3 }, { id: 2 }], 'id'), 'invalid ltdtNew[2]: primary key must be unique, duplicated with ltdtNew[0]')
    })

    it(`〈八-4〉should throw when key values have the same string but different types (1 and '1')`, function() {
        throwsMsg(() => ltdtDiffByKey([{ id: 1 }], [{ id: '1' }], 'id'), 'invalid ltdtNew[0]: primary key must not mix a number and a string of the same text, conflicts with ltdtOld[0]')
        throwsMsg(() => ltdtDiffByKey([{ id: '1' }, { id: 1 }], [], 'id'), 'invalid ltdtOld[1]: primary key must not mix a number and a string of the same text, conflicts with ltdtOld[0]')
    })

    it(`〈八-5〉should compare the content by key-sorted JSON (field order ignored, recursively), keeping JSON semantics for undefined, NaN/null and Date/ISO string`, function() {
        let r1 = ltdtDiffByKey([{ id: 1, a: 1, b: { y: 1, x: [{ q: 1, p: 2 }] } }], [{ b: { x: [{ p: 2, q: 1 }], y: 1 }, a: 1, id: 1 }], 'id')
        assert.strict.strictEqual(r1.same.length, 1)
        assert.strict.deepStrictEqual(r1.infor, { 1: 'same' })
        let r2 = ltdtDiffByKey([{ id: 1, a: undefined }], [{ id: 1 }], 'id')
        assert.strict.strictEqual(r2.same.length, 1)
        let r3 = ltdtDiffByKey([{ id: 1, v: NaN }], [{ id: 1, v: null }], 'id')
        assert.strict.strictEqual(r3.same.length, 1)
        let r4 = ltdtDiffByKey([{ id: 1, t: new Date(0) }], [{ id: 1, t: '1970-01-01T00:00:00.000Z' }], 'id')
        assert.strict.strictEqual(r4.same.length, 1)
        let r5 = ltdtDiffByKey([{ id: 1, x: [1, 2] }], [{ id: 1, x: [2, 1] }], 'id') //陣列依原順序
        assert.strict.strictEqual(r5.diff.length, 1)
    })

    it(`〈八-6〉should write the primary key value '__proto__' as an ordinary field of infor`, function() {
        let r = ltdtDiffByKey(JSON.parse('[{"id":"__proto__","a":1}]'), [], 'id')
        assert.ok(Object.prototype.hasOwnProperty.call(r.infor, '__proto__'))
        assert.strict.strictEqual(Object.getOwnPropertyDescriptor(r.infor, '__proto__').value, 'del')
        assert.strict.strictEqual(Object.getPrototypeOf(r.infor), Object.prototype)
    })

    it(`〈八〉should not echo the input values in messages (dspec §6)`, function() {
        assert.throws(() => ltdtDiffByKey([{ id: 'SECRETK' }, { id: 'SECRETK' }], [], 'id'), (err) => err.message.indexOf('SECRETK') < 0)
        assert.throws(() => ltdtDiffByKey([{ SECRETCOL: 1 }], [], 'id'), (err) => err.message.indexOf('SECRETCOL') < 0)
    })

    it(`〈八-5〉JSDoc should state the JSON semantics of undefined, NaN and Date`, function() {
        let d = getDoc('ltdtDiffByKey')
        assert.ok(d.indexOf('欄位順序不同視為相同') >= 0)
        assert.ok(d.indexOf('undefined') >= 0 && d.indexOf('NaN') >= 0 && d.indexOf('Date') >= 0)
    })

})


describe(`裁定表〈九〉ltdt2vrtsable`, function() {

    let MSG = 'invalid ltdt, every row must have a cell {value, style} for every column'

    it(`〈九-1〉should accept a cell without style and give it {} (value is required)`, function() {
        assert.strict.deepStrictEqual(ltdt2vrtsable([{ a: { value: 1 } }], []), [{ a: { value: 1, style: {}, rowspan: 1 } }])
        //style亦只看自有可列舉欄位(裁定表〈〇〉鍵之原則; 外審agy-hydrogen T5): 繼承或不可列舉之style視為省略
        let c1 = Object.create({ style: { color: 'red' } })
        c1.value = 1
        let c2 = Object.defineProperty({ value: 2 }, 'style', { value: { color: 'blue' }, enumerable: false })
        assert.strict.deepStrictEqual(ltdt2vrtsable([{ a: c1 }, { a: c2 }], []), [{ a: { value: 1, style: {}, rowspan: 1 } }, { a: { value: 2, style: {}, rowspan: 1 } }])
    })

    it(`〈九-2〉should treat a missing column, a non-object cell (plain value, string), a null cell or a cell without value as invalid input: [] or { state: 'error', msg } without crashing`, function() {
        let bads = [
            [{ a: { value: 1, style: {} }, b: { value: 2, style: {} } }, { a: { value: 1, style: {} } }], //缺欄
            [{ a: 1 }],
            [{ a: 'str' }],
            [{ a: null }],
            [{ a: { style: {} } }],
            [{ a: [1] }],
        ]
        //欄只看自有鍵(裁定表〈〇〉鍵之原則): 第2列之a為繼承而來, 視為缺欄
        let inh = Object.create({ a: { value: 1, style: {} } })
        inh.b = { value: 2, style: {} }
        bads.push([{ a: { value: 1, style: {} }, b: { value: 2, style: {} } }, inh])
        for (let ltdt of bads) {
            assert.strict.deepStrictEqual(ltdt2vrtsable(ltdt, ['a']), [])
            assert.strict.deepStrictEqual(ltdt2vrtsable(ltdt, ['a'], { returnWithStateAndMsg: true }), { state: 'error', msg: MSG })
        }
    })

    it(`〈九-3〉JSDoc behavior: blank cells merge, columns merge independently, output cells are exactly value, style, rowspan with style shared`, function() {
        let r1 = ltdt2vrtsable([{ a: { value: '' } }, { a: { value: '' } }], ['a'])
        assert.strict.deepStrictEqual(r1.map((v) => v.a.rowspan), [2, null])
        let st = { color: 'red' }
        let ltdt = [
            { a: { value: 'x', style: st }, b: { value: 1, style: {} } },
            { a: { value: 'x', style: {} }, b: { value: 2, style: {} } },
            { a: { value: 'y', style: {} }, b: { value: 2, style: {} } },
        ]
        let r2 = ltdt2vrtsable(ltdt, ['a', 'b'])
        assert.strict.deepStrictEqual(r2.map((v) => v.a.rowspan), [2, null, 1])
        assert.strict.deepStrictEqual(r2.map((v) => v.b.rowspan), [1, 2, null]) //b之第2、3列合併, 不受a之分組限制
        assert.strict.deepStrictEqual(Object.keys(r2[0].a), ['value', 'style', 'rowspan'])
        assert.ok(r2[0].a.style === st)
    })

    it(`〈九-3〉JSDoc should describe the input and output formats`, function() {
        let d = getDoc('ltdt2vrtsable')
        assert.ok(d.indexOf('style可省略') >= 0)
        assert.ok(d.indexOf('空白值') >= 0 && d.indexOf('各欄獨立合併') >= 0)
        assert.ok(d.indexOf('{ value, style, rowspan }') >= 0 && d.indexOf('style與輸入共用') >= 0)
    })

})


describe(`裁定表〈十〉filepathToTree`, function() {

    let EMPTY = { treeItems: [], treeItemsFolder: [], kpPath: {}, fpsNormalize: [] }

    it(`〈十-1〉should return the same-shaped empty result when fps is not an array or is []`, function() {
        for (let v of [[], '', {}, null, undefined, NaN, 5]) {
            assert.strict.deepStrictEqual(filepathToTree(v), EMPTY)
        }
    })

    it(`〈十-2〉should throw with the item index (no path) for a non-object item, a missing, non-string or empty path, and a missing or invalid type (including [{}])`, function() {
        throwsMsg(() => filepathToTree([{}]), 'invalid fps[0].path: must be a non-empty string')
        throwsMsg(() => filepathToTree([null]), 'invalid fps[0]: must be an object')
        throwsMsg(() => filepathToTree([{ type: 'file', path: '/a' }, 'x']), 'invalid fps[1]: must be an object')
        throwsMsg(() => filepathToTree([{ type: 'file' }]), 'invalid fps[0].path: must be a non-empty string')
        throwsMsg(() => filepathToTree([{ type: 'file', path: '' }]), 'invalid fps[0].path: must be a non-empty string')
        throwsMsg(() => filepathToTree([{ type: 'file', path: 5 }]), 'invalid fps[0].path: must be a non-empty string')
        throwsMsg(() => filepathToTree([Object.assign(Object.create({ path: '/a' }), { type: 'file' })]), 'invalid fps[0].path: must be a non-empty string')
        throwsMsg(() => filepathToTree([{ path: '/SECRETP/a' }]), `invalid fps[0].type: must be 'folder' or 'file'`)
        throwsMsg(() => filepathToTree([{ type: 'folder', path: '/a' }, { type: 'File', path: '/SECRETP/b' }]), `invalid fps[1].type: must be 'folder' or 'file'`)
    })

    //規格: 主控2026-11-14裁定(ws430b報告〈九〉②乙): path分段後無任何段者('/'、'///'、'   '等)比照空字串拋錯, 不再靜默略過該項目(裁定表〈十〉之依據「輸入之項目不見了、也沒有提示」)
    it(`〈十-2〉should throw like an empty path when a path has no segment after splitting ('/', '///', '   ', backslashes)`, function() {
        for (let p of ['/', '///', '   ', ' / / ', '\\', '\\\\', '/\t/']) {
            throwsMsg(() => filepathToTree([{ type: 'file', path: p }]), 'invalid fps[0].path: must be a non-empty string')
            throwsMsg(() => filepathToTree([{ type: 'folder', path: p }]), 'invalid fps[0].path: must be a non-empty string')
        }
        throwsMsg(() => filepathToTree([{ type: 'folder', path: '/a' }, { type: 'file', path: '/' }]), 'invalid fps[1].path: must be a non-empty string')
        //path先於type檢查(同空字串)
        throwsMsg(() => filepathToTree([{ type: 'xyz', path: '/' }]), 'invalid fps[0].path: must be a non-empty string')
        //至少一段者照常
        assert.strict.deepStrictEqual(filepathToTree([{ type: 'file', path: '/ a.txt /' }]).fpsNormalize, [{ type: 'file', path: '/root/a.txt' }])
    })

    it(`〈十-3〉should not modify the caller's items`, function() {
        let items = [{ type: 'xyz', path: '/a' }]
        assert.throws(() => filepathToTree(items))
        assert.strict.deepStrictEqual(items, [{ type: 'xyz', path: '/a' }])
        let ok = [{ type: 'folder', path: '/a', ext: { n: 1 } }, { type: 'file', path: '/a/b.txt' }]
        let ok0 = structuredClone(ok)
        filepathToTree(ok)
        assert.strict.deepStrictEqual(ok, ok0)
    })

    it(`〈十-4〉should still throw for duplicated paths and a path being both a folder and a file, without console output and with the item index instead of the path`, function() {
        let cases = [
            [[{ type: 'file', path: '/SECRETP/a.txt' }, { type: 'file', path: '/SECRETP/a.txt' }], 'invalid fps[1].path: duplicate file path of fps[0]'],
            [[{ type: 'folder', path: '/SECRETP', x: 1 }, { type: 'folder', path: '/SECRETP', x: 2 }], 'invalid fps[1].path: duplicate folder path of fps[0]'],
            [[{ type: 'file', path: '/SECRETP' }, { type: 'folder', path: '/SECRETP' }], 'invalid fps[1].path: conflicts with fps[0], the same path is both a file and a folder'],
            [[{ type: 'folder', path: '/SECRETP' }, { type: 'file', path: '/SECRETP' }], 'invalid fps[1].path: conflicts with fps[0], the same path is both a folder and a file'],
        ]
        for (let [fps, msg] of cases) {
            let c = captureConsole(() => {
                let e = null
                try {
                    filepathToTree(fps)
                }
                catch (err) {
                    e = err
                }
                return e
            })
            assert.ok(c.r instanceof Error)
            assert.strict.strictEqual(c.r.message, msg)
            assert.ok(c.r.message.indexOf('SECRETP') < 0)
            assert.strict.deepStrictEqual(c.outs, [])
        }
    })

    it(`〈十-5〉should throw when a path segment contains the delimiter, suggesting opt.delimiter`, function() {
        throwsMsg(() => filepathToTree([{ type: 'file', path: '/a❯b.txt' }]), 'invalid fps[0].path: a path segment must not contain the delimiter, set opt.delimiter to another string')
        let r = filepathToTree([{ type: 'file', path: '/a❯b.txt' }], { delimiter: '|' })
        assert.strict.deepStrictEqual(r.fpsNormalize, [{ type: 'file', path: '/root/a❯b.txt' }])
        throwsMsg(() => filepathToTree([{ type: 'file', path: '/a|b.txt' }], { delimiter: '|' }), 'invalid fps[0].path: a path segment must not contain the delimiter, set opt.delimiter to another string')
    })

    it(`〈十-6〉JSDoc behavior: '.' and '..' are ordinary names without path resolution`, function() {
        let r = filepathToTree([{ type: 'file', path: '/a/../b.txt' }, { type: 'file', path: '/./c.txt' }])
        assert.strict.deepStrictEqual(r.fpsNormalize.map((v) => v.path), ['/root/a', '/root/a/..', '/root/a/../b.txt', '/root/.', '/root/./c.txt'])
        let d = getDoc('filepathToTree')
        assert.ok(d.indexOf(`'.'與'..'視為一般名稱`) >= 0)
    })

})


describe(`裁定表〈十一〉composeToTree`, function() {

    it(`〈十一-1〉should return [] when items is not an array or is []`, function() {
        for (let v of [[], '', {}, null, undefined, 5]) {
            assert.strict.deepStrictEqual(composeToTree(v), [])
        }
    })

    it(`〈十一-2〉should throw with the index for an element that is not an object or is an empty object (including [{}], [null])`, function() {
        throwsMsg(() => composeToTree([{}]), 'invalid items[0]: must be a non-empty object')
        throwsMsg(() => composeToTree([null]), 'invalid items[0]: must be a non-empty object')
        throwsMsg(() => composeToTree([{ id: 1 }, 5]), 'invalid items[1]: must be a non-empty object')
        throwsMsg(() => composeToTree([{ id: 1 }, Object.create({ id: 2 })]), 'invalid items[1]: must be a non-empty object')
    })

    it(`〈十一-3〉should treat id and parentId 0 as valid, and only undefined, null, '' as no value`, function() {
        assert.strict.deepStrictEqual(composeToTree([{ id: 0, t: 'z' }, { id: 1, parentId: 0 }]), [{ id: 0, t: 'z', children: [{ id: 1, parentId: 0 }] }])
        let r = composeToTree([{ id: 1, parentId: '' }, { id: 2, parentId: null }, { id: 3, parentId: undefined }, { id: 4 }])
        assert.strict.deepStrictEqual(r.map((v) => v.id), [1, 2, 3, 4])
        //id為''者無值, parentId為''者亦無值, 兩者不得相配
        assert.strict.deepStrictEqual(composeToTree([{ id: '', t: 'x' }, { id: 1, parentId: '' }]), [{ id: '', t: 'x' }, { id: 1, parentId: '' }])
        assert.strict.deepStrictEqual(composeToTree([{ id: null, t: 'x' }, { id: 1, parentId: null }]), [{ id: null, t: 'x' }, { id: 1, parentId: null }])
    })

    it(`〈十一-4〉should put orphans, cycles and self-parents at the top level keeping their parentId, with children under them; a cycle breaks at its first-appearing item`, function() {
        assert.strict.deepStrictEqual(composeToTree([{ id: 1 }, { id: 2, parentId: 99 }, { id: 3, parentId: 2 }]), [
            { id: 1 },
            { id: 2, parentId: 99, children: [{ id: 3, parentId: 2 }] },
        ])
        assert.strict.deepStrictEqual(composeToTree([{ id: 1, parentId: 1 }, { id: 2, parentId: 1 }]), [{ id: 1, parentId: 1, children: [{ id: 2, parentId: 1 }] }])
        //循環1->2->1, 最先出現者為id 1(第2個項目); id 9掛在1下
        assert.strict.deepStrictEqual(composeToTree([{ id: 9, parentId: 1 }, { id: 1, parentId: 2 }, { id: 2, parentId: 1 }]), [
            { id: 1, parentId: 2, children: [{ id: 9, parentId: 1 }, { id: 2, parentId: 1 }] },
        ])
        //三元循環(b之父為c、a之父為b、c之父為a), 最先出現者為b(第1個項目), 於b斷開: b下為a、a下為c
        assert.strict.deepStrictEqual(composeToTree([{ id: 'b', parentId: 'c' }, { id: 'a', parentId: 'b' }, { id: 'c', parentId: 'a' }]), [
            { id: 'b', parentId: 'c', children: [{ id: 'a', parentId: 'b', children: [{ id: 'c', parentId: 'a' }] }] },
        ])
        //循環之後代先出現: d(父為x)、x與y互為父, x先於y, 於x斷開
        assert.strict.deepStrictEqual(composeToTree([{ id: 'd', parentId: 'y' }, { id: 'x', parentId: 'y' }, { id: 'y', parentId: 'x' }]), [
            { id: 'x', parentId: 'y', children: [{ id: 'y', parentId: 'x', children: [{ id: 'd', parentId: 'y' }] }] },
        ])
    })

    it(`〈十一-5〉should not print to the console (the unreachable console.log is removed)`, function() {
        let c = captureConsole(() => composeToTree([{ id: 1 }, { id: 2, parentId: 99 }, { id: 3, parentId: 3 }]))
        assert.strict.strictEqual(c.r.length, 3)
        assert.strict.deepStrictEqual(c.outs, [])
        assert.ok(fs.readFileSync(fileURLToPath(new URL('../src/composeToTree.mjs', import.meta.url)), 'utf8').indexOf(`console.log(\`can not find parent`) < 0)
    })

    it(`〈十一-6〉JSDoc behavior: strict ids, children under the last duplicated id, existing children merged (opt.bindChildren), items without id only as leaves`, function() {
        assert.strict.deepStrictEqual(composeToTree([{ id: 1 }, { id: '1' }, { id: 3, parentId: 1 }]), [{ id: 1, children: [{ id: 3, parentId: 1 }] }, { id: '1' }])
        assert.strict.deepStrictEqual(composeToTree([{ id: 1, a: 'f' }, { id: 1, a: 'l' }, { id: 2, parentId: 1 }]), [{ id: 1, a: 'f' }, { id: 1, a: 'l', children: [{ id: 2, parentId: 1 }] }])
        assert.strict.deepStrictEqual(composeToTree([{ id: 1, children: [{ x: 1 }] }, { id: 2, parentId: 1 }]), [{ id: 1, children: [{ x: 1 }, { id: 2, parentId: 1 }] }])
        assert.strict.deepStrictEqual(composeToTree([{ id: 1, kids: [{ x: 1 }] }, { id: 2, parentId: 1 }], { bindChildren: 'kids' }), [{ id: 1, kids: [{ x: 1 }, { id: 2, parentId: 1 }] }])
        assert.strict.deepStrictEqual(composeToTree([{ t: 'noid', parentId: 1 }, { id: 1 }]), [{ id: 1, children: [{ t: 'noid', parentId: 1 }] }])
        let d = getDoc('composeToTree')
        assert.ok(d.indexOf('嚴格相等') >= 0 && d.indexOf('最後一個') >= 0 && d.indexOf('合併') >= 0 && d.indexOf('葉節點') >= 0)
    })

})


describe(`裁定表〈十二〉ltdtmerge`, function() {

    it(`〈十二-1〉should return [] on a length mismatch and warn the two lengths (no values) once only when opt.debug === true`, function() {
        parseNumOpt.resetWarned()
        let c0 = captureConsole(() => ltdtmerge([{ a: 'SECRETV' }], []))
        assert.strict.deepStrictEqual(c0.r, [])
        assert.strict.deepStrictEqual(c0.outs, [])
        let c1 = captureConsole(() => ltdtmerge([{ a: 'SECRETV' }], [], { debug: true }))
        assert.strict.deepStrictEqual(c1.r, [])
        assert.strict.strictEqual(c1.outs.length, 1)
        assert.strict.strictEqual(c1.outs[0].args[0], '[wsemi ltdtmerge] invalid ltdt2: must have the same length as ltdt1 (ltdt2 0, ltdt1 1), returning []')
        let c2 = captureConsole(() => ltdtmerge([], [{}], { debug: true }))
        assert.strict.deepStrictEqual(c2.outs, [])
        parseNumOpt.resetWarned()
    })

    it(`〈十二-2〉should ignore an ltdt2 row that is an array (like other non-object rows) and keep ltdt1's row`, function() {
        assert.strict.deepStrictEqual(ltdtmerge([{ a: 1 }], [['x']]), [{ a: 1 }])
        assert.strict.deepStrictEqual(ltdtmerge([[1, 2, 3]], [[9]]), [[1, 2, 3]])
        assert.strict.deepStrictEqual(ltdtmerge([{ a: 1 }, { b: 2 }], [[], { c: 3 }]), [{ a: 1 }, { b: 2, c: 3 }])
    })

    it(`〈十二-3〉should merge only the own keys of the source`, function() {
        let s = Object.create({ inh: 1 })
        s.own = 2
        assert.strict.deepStrictEqual(ltdtmerge([{ a: 0 }], [s]), [{ a: 0, own: 2 }])
    })

    it(`〈十二-4〉JSDoc behavior and example: arrays merged by index`, function() {
        assert.strict.deepStrictEqual(ltdtmerge([{ x: [1, 2, 3] }], [{ x: [9] }]), [{ x: [9, 2, 3] }])
        let d = getDoc('ltdtmerge')
        assert.ok(d.indexOf('陣列依索引合併') >= 0)
    })

})


describe(`裁定表〈十三〉dtpick`, function() {

    it(`〈十三-1〉should take only own fields (inherited toString and data not taken)`, function() {
        assert.strict.deepStrictEqual(dtpick(Object.create({ d: 1 }), ['d', 'toString']), {})
        assert.strict.deepStrictEqual(dtpick({ a: 1 }, ['toString', 'hasOwnProperty', 'a']), { a: 1 })
    })

    it(`〈十三-2〉should write an own key '__proto__' as an ordinary field`, function() {
        let r = dtpick(JSON.parse('{"__proto__":{"x":1},"a":2}'), ['__proto__', 'a'])
        assert.ok(Object.prototype.hasOwnProperty.call(r, '__proto__'))
        assert.strict.deepStrictEqual(Object.getOwnPropertyDescriptor(r, '__proto__').value, { x: 1 })
        assert.strict.strictEqual(Object.getPrototypeOf(r), Object.prototype)
        assert.strict.strictEqual(r.x, undefined)
    })

    it(`〈十三-3〉JSDoc behavior: a field whose value is undefined is kept`, function() {
        let r = dtpick({ a: undefined, b: 1 }, ['a'])
        assert.ok(Object.prototype.hasOwnProperty.call(r, 'a'))
        assert.strict.strictEqual(r.a, undefined)
        let d = getDoc('dtpick')
        assert.ok(d.indexOf('值為undefined者保留') >= 0)
    })

})


describe(`裁定表〈十四〉ltdtpick`, function() {

    it(`〈十四-1〉should return [{}] for [{}] and [null] (row count unchanged)`, function() {
        assert.strict.deepStrictEqual(ltdtpick([{}], ['a']), [{}])
        assert.strict.deepStrictEqual(ltdtpick([null], ['a']), [{}])
    })

    it(`〈十四-2〉should keep {} placeholders for non-object rows`, function() {
        assert.strict.deepStrictEqual(ltdtpick([{ a: 1 }, null, 'x', 5, [1]], ['a']), [{ a: 1 }, {}, {}, {}, {}])
    })

})
